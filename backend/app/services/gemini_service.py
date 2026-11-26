from __future__ import annotations

import json
import os
import requests

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiUnavailable(RuntimeError):
    """Raised when Gemini cannot be reached or is temporarily overloaded."""


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model = os.getenv("GEMINI_MODEL", "").strip().removeprefix("models/")

    @property
    def is_configured(self) -> bool:
        return self.api_key.lower() not in {"", "your_gemini_api_key"}

    def available_model(self):
        if self.model:
            return self.model
        try:
            res = requests.get(
                GEMINI_BASE,
                headers={"x-goog-api-key": self.api_key},
                params={"pageSize": 1000},
                timeout=10,
            )
            res.raise_for_status()
            available = [
                m["name"].removeprefix("models/")
                for m in res.json().get("models", [])
                if "generateContent" in m.get("supportedGenerationMethods", [])
            ]
        except (requests.RequestException, ValueError):
            raise GeminiUnavailable(
                "Gemini model discovery failed. Check the API key or set GEMINI_MODEL in backend/.env."
            ) from None
        import re

        flash = [m for m in available if re.fullmatch(r"gemini-\d+(?:\.\d+)*-flash", m)]
        if not flash:
            raise GeminiUnavailable(
                "Set GEMINI_MODEL to a text generation model available to your key."
            )
        self.model = max(
            flash, key=lambda name: tuple(map(int, re.findall(r"\d+", name)))
        )
        return self.model

    def _generate_json(self, prompt: str, retry_model: bool = True) -> dict:
        if not self.is_configured:
            raise RuntimeError(
                "Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env."
            )
        url = f"{GEMINI_BASE}/{self.available_model()}:generateContent"
        try:
            response = requests.post(
                url,
                headers={"x-goog-api-key": self.api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.35,
                        "responseMimeType": "application/json",
                        "responseSchema": {
                            "type": "OBJECT",
                            "properties": {
                                "title": {"type": "STRING"},
                                "year": {"type": "STRING"},
                                "reason": {"type": "STRING"},
                                "interpretation": {"type": "STRING"},
                            },
                            "required": ["title", "reason", "interpretation"],
                        },
                    },
                },
                timeout=45,
            )
        except requests.RequestException as exc:
            raise GeminiUnavailable("Gemini is temporarily unreachable.") from exc
        if response.status_code == 404 and retry_model:
            self.model = ""
            return self._generate_json(prompt, retry_model=False)
        if not response.ok:
            raise GeminiUnavailable(
                f"Gemini returned HTTP {response.status_code}. Check the key, model and quota in backend/.env."
            )
        try:
            value = json.loads(
                response.json()["candidates"][0]["content"]["parts"][0]["text"]
            )
            if (
                isinstance(value, dict)
                and isinstance(value.get("title"), str)
                and value["title"].strip()
            ):
                return value
        except (ValueError, TypeError, KeyError, IndexError):
            pass
        raise GeminiUnavailable("Gemini returned no usable film selection.")

    def choose_movie(self, user_prompt: str) -> dict:
        prompt = f"""You are MovieMind, a careful movie discovery assistant.
The user describes the kind of film they want:
{user_prompt!r}

Choose ONE real feature film that best matches the user's request. Return only JSON
matching the requested schema. Do not list alternatives. The title should be the
canonical release title, and include its release year when known. Explain briefly
why it matches. Do not invent a film."""
        return self._generate_json(prompt)

    def choose_from_candidates(self, user_prompt: str, candidates: list[str]) -> dict:
        titles = "\n".join(f"- {title}" for title in candidates)
        prompt = f"""You are MovieMind. Choose exactly ONE best matching movie from the
provided dataset titles. You MUST select one title exactly as written in the list.
Do not invent or modify a title.

User request: {user_prompt!r}

Available movie titles:
{titles}

Return JSON with title, year if known, a concise reason, and a one-sentence
interpretation of the user's taste."""
        return self._generate_json(prompt)
