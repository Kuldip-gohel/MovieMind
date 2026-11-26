from __future__ import annotations

from pathlib import Path
import gzip
import json
import numpy as np
import pandas as pd
from scipy.sparse import load_npz
from sklearn.metrics.pairwise import cosine_similarity
from app.services.prompt_search import PromptSearch

BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BACKEND_DIR / "model"


class MovieRecommender:
    def __init__(self):
        self.movies: pd.DataFrame | None = None
        self.vectors = None

    def load(self):
        movies_path = MODEL_DIR / "movies_processed.pkl"
        vectors_path = MODEL_DIR / "movie_vectors.npz"
        missing = [p.name for p in (movies_path, vectors_path) if not p.exists()]
        if missing:
            raise RuntimeError(
                "Recommendation model files are missing: "
                + ", ".join(missing)
                + ". Run: python scripts/build_model.py"
            )
        self.movies = pd.read_pickle(movies_path).reset_index(drop=True)
        self.vectors = load_npz(vectors_path).tocsr()
        if self.vectors.shape[0] != len(self.movies):
            raise RuntimeError(
                "Movie dataframe and sparse vector matrix have different row counts."
            )

        with gzip.open(
            BACKEND_DIR / "data" / "catalog.json.gz", "rt", encoding="utf-8"
        ) as source:
            self.catalog = {m["movie_id"]: m for m in json.load(source)}
        self.search = PromptSearch(self.catalog)
        self.row_by_id = {
            int(row.movie_id): i for i, row in enumerate(self.movies.itertuples())
        }

    def recommend(
        self, movie_index: int, limit: int = 5, eligible=None, exclude=()
    ) -> list[dict]:
        if self.movies is None or self.vectors is None:
            raise RuntimeError("Recommendation model is not loaded.")
        # Calculate similarity for ONE selected movie only; never build the full matrix.
        scores = cosine_similarity(self.vectors[movie_index], self.vectors).ravel()
        excluded = set(exclude) | {int(self.movies.iloc[movie_index]["movie_id"])}
        results = []
        for idx in np.argsort(-scores, kind="stable"):
            row = self.movies.iloc[int(idx)]
            movie_id = int(row["movie_id"])
            if movie_id in excluded or (
                eligible is not None and not eligible(self.catalog[movie_id])
            ):
                continue
            if scores[idx] <= 0 or len(results) == limit:
                break
            excluded.add(movie_id)
            results.append(
                {
                    "movie_id": int(row["movie_id"]),
                    "title": str(row["title"]),
                    "similarity_score": round(float(scores[idx]), 4),
                }
            )
        return results
