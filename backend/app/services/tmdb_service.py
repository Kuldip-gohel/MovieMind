from __future__ import annotations

import os
import requests

TMDB_API = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p/w500"


def credential(name):
    value = os.getenv(name, "").strip()
    if value.lower().startswith(("your_", "replace_")):
        return ""
    return value


class TMDBService:
    def __init__(self):
        self.api_key = credential("TMDB_API_KEY")
        self.token = (
            credential("TMDB_READ_ACCESS_TOKEN")
            or credential("TMDB_API_READ_ACCESS_TOKEN")
            or credential("TMDB_ACCESS_TOKEN")
        )
        if not self.token and self.api_key.count(".") == 2:
            self.token, self.api_key = self.api_key, ""
        self.token = self.token.removeprefix("Bearer ").strip()

    @property
    def is_configured(self):
        return bool(self.api_key or self.token)

    def request(self, path, **params):
        headers = {"Accept": "application/json"}
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        else:
            params["api_key"] = self.api_key
        try:
            response = requests.get(
                TMDB_API + path, params=params, headers=headers, timeout=(3, 6)
            )
            if response.status_code in (401, 403):
                return (
                    {},
                    "TMDB rejected the credential. Check backend/.env and restart FastAPI.",
                )
            if response.status_code == 429:
                return {}, "TMDB rate limit reached. Please try again later."
            response.raise_for_status()
            return response.json(), None
        except (requests.RequestException, ValueError):
            return (
                {},
                "TMDB could not provide live details. Cached details are shown where available.",
            )

    def get_movie(self, movie_id, fallback):
        details = dict(fallback)
        if self.is_configured:
            data, warning = self.request(f"/movie/{movie_id}")
            if warning:
                details["tmdb_warning"] = warning
            if data:
                for key, src in [
                    ("title", "title"),
                    ("overview", "overview"),
                    ("language", "original_language"),
                    ("release_date", "release_date"),
                    ("poster_path", "poster_path"),
                ]:
                    if data.get(src):
                        details[key] = data[src]
                if data.get("genres"):
                    details["genres"] = [g["name"] for g in data["genres"]]
                if data.get("vote_average") is not None:
                    details["rating"] = round(float(data["vote_average"]), 1)
                details["tmdb_available"] = True
        details["poster_url"] = (
            IMAGE_BASE + details["poster_path"] if details.get("poster_path") else None
        )
        date = details.get("release_date") or ""
        details["release_year"] = int(date[:4]) if date[:4].isdigit() else None
        for field in ("cast", "directors", "keywords", "votes", "poster_path"):
            details.pop(field, None)
        return details
