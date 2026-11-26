from contextlib import asynccontextmanager
from pathlib import Path
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routes.recommendation import router as recommendation_router
from app.services.gemini_service import GeminiService
from app.services.recommender import MovieRecommender
from app.services.tmdb_service import TMDBService

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR.parent / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    recommender = MovieRecommender()
    recommender.load()
    app.state.recommender = recommender
    app.state.gemini = GeminiService()
    app.state.tmdb = TMDBService()
    yield


app = FastAPI(
    title="MovieMind API",
    description="Natural-language movie discovery and content-based recommendations.",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins
    + ["http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation_router)


@app.get("/")
def root():
    return {"status": "ok", "service": "MovieMind API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "service": "MovieMind API"}


@app.get("/api/status")
def status(request: Request, check_tmdb: bool = False):
    gemini_configured = request.app.state.gemini.is_configured
    result = {
        "status": "ready",
        "gemini_configured": gemini_configured,
        "recommendation_mode": "gemini" if gemini_configured else "local",
        "tmdb_configured": request.app.state.tmdb.is_configured,
    }
    if check_tmdb:
        service = request.app.state.tmdb
        if service.is_configured:
            data, warning = service.request("/movie/27205")
            result["tmdb_check"] = warning or (
                "Authenticated; poster metadata received."
                if data.get("poster_path")
                else "Authenticated; no poster returned."
            )
        else:
            result["tmdb_check"] = (
                "Add a TMDB credential to backend/.env and restart FastAPI."
            )
    return result
