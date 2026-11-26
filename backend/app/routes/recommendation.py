from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from app.services.gemini_service import GeminiUnavailable
from app.services.prompt_search import normal

router = APIRouter(prefix="/api", tags=["recommendations"])


class RecommendRequest(BaseModel):
    prompt: str = Field(min_length=5, max_length=1000)


@router.post("/recommend")
def recommend_movies(payload: RecommendRequest, request: Request):
    recommender = request.app.state.recommender
    gemini = request.app.state.gemini
    tmdb = request.app.state.tmdb
    text = payload.prompt.strip()
    search = recommender.search
    intent, clean = search.interpret(text)
    ranked = search.rank(text, intent, clean)
    selected = None
    external = None
    warning = None
    mode = "local"
    # An exact title and "like X" have explicit, different meanings.
    if gemini.is_configured and intent.reference is None:
        try:
            choice = gemini.choose_movie(text)
            movie_id = search.by_title.get(normal(choice["title"]))
            year = str(choice.get("year") or "")
            if (
                movie_id in search.catalog
                and intent.accepts(search.catalog[movie_id])
                and (
                    not year.isdigit()
                    or search.catalog[movie_id]["release_date"].startswith(year)
                )
            ):
                selected = movie_id
            elif tmdb.is_configured:
                params = {"query": choice["title"]}
                if year.isdigit():
                    params["primary_release_year"] = year
                data, warning = tmdb.request("/search/movie", **params)
                for hit in data.get("results", []):
                    if normal(choice["title"]) not in (
                        normal(hit.get("title", "")),
                        normal(hit.get("original_title", "")),
                    ):
                        continue
                    if year.isdigit() and not (
                        hit.get("release_date") or ""
                    ).startswith(year):
                        continue
                    if hit["id"] in search.catalog:
                        continue
                    candidate = tmdb.get_movie(
                        hit["id"], {"movie_id": hit["id"], "title": hit["title"]}
                    )
                    if intent.people:
                        credits, credit_warning = tmdb.request(
                            f"/movie/{hit['id']}/credits"
                        )
                        warning = warning or credit_warning
                        candidate["cast"] = [
                            p["name"] for p in credits.get("cast", []) if p.get("name")
                        ]
                        candidate["directors"] = [
                            p["name"]
                            for p in credits.get("crew", [])
                            if p.get("job") == "Director" and p.get("name")
                        ]
                    if candidate.get("tmdb_available") and intent.accepts(candidate):
                        selected, external = hit["id"], candidate
                        break
            if selected is None and ranked:
                shortlist = ranked[:35]
                choice = gemini.choose_from_candidates(
                    text, [search.catalog[id]["title"] for id in shortlist]
                )
                selected = next(
                    (
                        id
                        for id in shortlist
                        if normal(search.catalog[id]["title"])
                        == normal(choice["title"])
                    ),
                    None,
                )
            if selected is not None:
                mode = "gemini"
        except GeminiUnavailable as exc:
            warning = str(exc)
    if selected is None:
        if not ranked and intent.unknown_reference:
            raise HTTPException(
                422,
                detail="That reference title could not be verified in the local catalog. Try describing its plot or genre."
                + (" " + warning if warning else ""),
            )
        if not ranked:
            raise HTTPException(
                422,
                detail="No supported match for those preferences in the local catalog. Try a different language, date range or plot detail."
                + (" " + warning if warning else ""),
            )
        selected = ranked[0]
    details = external or tmdb.get_movie(selected, search.catalog[selected])
    if mode == "gemini":
        reason = choice.get("reason") or "Selected for your description."
    elif intent.similar and intent.reference is not None:
        reason = (
            "Shares plot themes with "
            + search.catalog[intent.reference]["title"]
            + ". "
            + (details.get("overview") or "")
        )
    else:
        reason = details.get("overview") or "Selected using your preferences."
    seed = selected if selected in recommender.row_by_id else next(iter(ranked), None)
    related = (
        []
        if seed is None
        else recommender.recommend(
            recommender.row_by_id[seed],
            5,
            intent.accepts,
            exclude=[selected, intent.reference],
        )
    )
    if external and seed is not None:
        related = ([{"movie_id": seed, "similarity_score": None}] + related)[:5]

    def enrich(row):
        id = row["movie_id"]
        return {**tmdb.get_movie(id, search.catalog[id]), **row, "role": "similar"}

    with ThreadPoolExecutor(max_workers=5) as pool:
        similar = list(pool.map(enrich, related))
    notes = list(
        dict.fromkeys(
            n
            for n in [
                warning,
                details.get("tmdb_warning"),
                *(m.get("tmdb_warning") for m in similar),
            ]
            if n
        )
    )
    return {
        "success": True,
        "selection_mode": mode,
        "primary_movie": {
            **details,
            "reason": reason,
            "role": "primary",
            "similarity_score": None,
        },
        "similar_movies": similar,
        "interpretation": " ".join(notes)
        or (
            "Your pick was selected by Gemini."
            if mode == "gemini"
            else "Matched against the local movie catalog."
        ),
        "recommendation_method": "Prompt matching and content-based cosine similarity",
        "dataset_size": len(search.catalog),
    }
