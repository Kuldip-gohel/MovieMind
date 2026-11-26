import os
import unittest
from unittest.mock import Mock, patch
from types import SimpleNamespace
from fastapi import HTTPException
from app.services.recommender import MovieRecommender
from app.services.tmdb_service import TMDBService
from app.services.gemini_service import GeminiService
from app.routes.recommendation import recommend_movies, RecommendRequest


class DiscoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.recommender = MovieRecommender()
        cls.recommender.load()

    def setUp(self):
        self.env = patch.dict(
            os.environ,
            {
                "TMDB_API_KEY": "",
                "TMDB_READ_ACCESS_TOKEN": "",
                "TMDB_API_READ_ACCESS_TOKEN": "",
                "TMDB_ACCESS_TOKEN": "",
                "GEMINI_API_KEY": "",
            },
        )
        self.env.start()
        self.addCleanup(self.env.stop)
        self.services = SimpleNamespace(
            recommender=self.recommender, tmdb=TMDBService(), gemini=GeminiService()
        )
        self.request = SimpleNamespace(app=SimpleNamespace(state=self.services))

    def ask(self, prompt):
        return recommend_movies(RecommendRequest(prompt=prompt), self.request)

    def test_plot(self):
        film = self.ask(
            "a science fiction movie about stealing secrets by entering dreams"
        )["primary_movie"]
        self.assertEqual(film["title"], "Inception")
        self.assertTrue(film["poster_url"].startswith("https://image.tmdb.org/"))

    def test_language_and_genres(self):
        response = self.ask("Hindi romantic comedy")
        for movie in [response["primary_movie"], *response["similar_movies"]]:
            self.assertEqual(movie["language"], "hi")
            self.assertTrue({"Romance", "Comedy"} <= set(movie["genres"]))

    def test_anchor_and_exclusions(self):
        response = self.ask("films like Inception but no horror")
        movies = [response["primary_movie"], *response["similar_movies"]]
        self.assertNotIn("Inception", [m["title"] for m in movies])
        self.assertTrue(all("Horror" not in m["genres"] for m in movies))
        self.assertEqual(len(movies), len({m["movie_id"] for m in movies}))

    def test_unknown_reference(self):
        with self.assertRaises(HTTPException):
            self.ask("films like Unknown Example Title XYZ")

    def test_gemini_failure_uses_local_model(self):
        from app.services.gemini_service import GeminiUnavailable

        self.services.gemini = Mock(is_configured=True)
        self.services.gemini.choose_movie.side_effect = GeminiUnavailable(
            "Gemini quota exceeded."
        )
        result = self.ask("English space movie directed by Christopher Nolan")
        self.assertEqual(result["primary_movie"]["title"], "Interstellar")
        self.assertEqual(result["selection_mode"], "local")
        self.assertIn("quota", result["interpretation"])

    def test_director_date_and_no_match(self):
        self.assertEqual(
            self.ask("English space movie directed by Christopher Nolan")[
                "primary_movie"
            ]["title"],
            "Interstellar",
        )
        film = self.ask("a sci-fi film from 1990 to 1999 without horror")[
            "primary_movie"
        ]
        self.assertTrue(1990 <= film["release_year"] <= 1999)
        with self.assertRaises(HTTPException) as err:
            self.ask("Tamil romance released after 2022")
        self.assertEqual(err.exception.status_code, 422)

    @patch("app.services.tmdb_service.requests.get")
    def test_tmdb_credentials_and_live_poster(self, get):
        get.return_value.json.return_value = {
            "title": "Inception",
            "poster_path": "/live.jpg",
            "release_date": "2010-07-16",
        }
        get.return_value.status_code = 200
        for cfg in [
            {"TMDB_API_KEY": "fake-v3"},
            {"TMDB_READ_ACCESS_TOKEN": "fake.token.value"},
        ]:
            with patch.dict(os.environ, cfg):
                result = TMDBService().get_movie(27205, {"title": "Inception"})
                self.assertEqual(
                    result["poster_url"], "https://image.tmdb.org/t/p/w500/live.jpg"
                )
                call = get.call_args.kwargs
                if "TMDB_API_KEY" in cfg:
                    self.assertEqual(call["params"]["api_key"], "fake-v3")
                else:
                    self.assertEqual(
                        call["headers"]["Authorization"], "Bearer fake.token.value"
                    )

    @patch("app.services.tmdb_service.requests.get")
    def test_bad_tmdb_key_reports_rejection_with_cache(self, get):
        get.return_value.status_code = 401
        with patch.dict(os.environ, {"TMDB_API_KEY": "fake-v3"}):
            self.services.tmdb = TMDBService()
            data = self.ask("Inception")
            self.assertIn("rejected", data["interpretation"])
            self.assertTrue(data["primary_movie"]["poster_url"])

    def test_out_of_catalog_selection(self):
        self.services.gemini = Mock(is_configured=True)
        self.services.gemini.choose_movie.return_value = {
            "title": "Dune: Part Two",
            "year": "2024",
            "reason": "A desert epic.",
        }
        self.services.tmdb = Mock(is_configured=True)
        self.services.tmdb.request.return_value = (
            {
                "results": [
                    {
                        "id": 693134,
                        "title": "Dune: Part Two",
                        "release_date": "2024-02-27",
                    }
                ]
            },
            None,
        )
        self.services.tmdb.get_movie.side_effect = lambda id, m: {
            **m,
            "tmdb_available": True,
            "genres": ["Science Fiction"],
            "release_date": "2024-02-27",
        }
        film = self.ask("a desert epic from 2024")["primary_movie"]
        self.assertEqual(film["movie_id"], 693134)
