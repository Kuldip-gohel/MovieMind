"""Match plot terms to descriptions, and explicit preferences to catalog metadata."""

from dataclasses import dataclass, field
from functools import lru_cache
import re
import unicodedata

import numpy as np
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

GENRES = {
    "science fiction": r"sci[ -]?fi|science fiction",
    "animation": r"animat(?:ed|ion)|anime",
    "romance": r"romance|romantic|rom[ -]?com",
    "comedy": r"comedy|comedies|comic|rom[ -]?com",
    "thriller": r"thrillers?",
    "horror": r"horror",
    "action": r"action",
    "adventure": r"adventures?",
    "mystery": r"myster(?:y|ies)",
    "family": r"family[ -]friendly|kids.? (?:film|movie)",
    "fantasy": r"fantasy",
    "drama": r"dramas?",
    "documentary": r"documentar(?:y|ies)",
    "crime": r"crime",
    "western": r"westerns?",
    "war": r"war(?: movies?| films?)",
    "music": r"musicals?",
}
LANGUAGES = {
    "hindi": "hi",
    "bollywood": "hi",
    "tamil": "ta",
    "telugu": "te",
    "malayalam": "ml",
    "kannada": "kn",
    "bengali": "bn",
    "marathi": "mr",
    "punjabi": "pa",
    "english": "en",
    "korean": "ko",
    "japanese": "ja",
    "french": "fr",
    "spanish": "es",
    "italian": "it",
    "german": "de",
    "mandarin": "zh",
    "cantonese": "cn",
    "russian": "ru",
    "portuguese": "pt",
    "arabic": "ar",
}
FILLER = set(ENGLISH_STOP_WORDS) | set(
    "want watch looking show suggest recommend recommendation recommendations movies movie films film please something similar genre genres mood story about kind preferably give need really good great best avoid exclude excluding directed directed starring released sequel before after without include featuring unexpected clever please new newer".split()
)
MOODS = {
    "feel good": "friendship uplifting happy reunion",
    "mind bending": "mind reality illusion twist",
    "true story": "biography based true events",
    "scary": "horror haunted fear",
    "funny": "comedy humor",
    "heartwarming": "friendship kindness family",
    "psychological": "mind suspense psychological thriller",
}
stem = lru_cache(maxsize=40000)(PorterStemmer().stem)


def normal(text):
    text = (
        unicodedata.normalize("NFKD", str(text))
        .encode("ascii", "ignore")
        .decode()
        .lower()
    )
    return " ".join(re.findall(r"[a-z0-9]+", text))


def terms(text):
    return [stem(w) for w in normal(text).split() if w not in FILLER and len(w) > 1]


@dataclass
class Intent:
    genres: set = field(default_factory=set)
    excluded: set = field(default_factory=set)
    languages: set = field(default_factory=set)
    excluded_languages: set = field(default_factory=set)
    earliest: int = 0
    latest: int = 9999
    any_genre: bool = False
    people: set = field(default_factory=set)
    reference: int | None = None
    similar: bool = False
    unknown_reference: bool = False
    directors: set = field(default_factory=set)
    actors: set = field(default_factory=set)

    def accepts(self, movie):
        genres = {g.lower() for g in movie.get("genres", [])}
        if (
            self.excluded & genres
            or movie.get("language") in self.excluded_languages
            or (self.languages and movie.get("language") not in self.languages)
        ):
            return False
        if self.genres and not (
            bool(self.genres & genres) if self.any_genre else self.genres <= genres
        ):
            return False
        date = movie.get("release_date") or ""
        if self.earliest or self.latest != 9999:
            if (
                not date[:4].isdigit()
                or not self.earliest <= int(date[:4]) <= self.latest
            ):
                return False
        people = {normal(n) for n in movie.get("cast", []) + movie.get("directors", [])}
        return (
            self.people <= people
            and self.directors <= {normal(n) for n in movie.get("directors", [])}
            and self.actors <= {normal(n) for n in movie.get("cast", [])}
        )


class PromptSearch:
    def __init__(self, catalog):
        self.catalog = catalog
        self.ids = list(catalog)
        self.pos = {id: i for i, id in enumerate(self.ids)}
        self.by_title = {normal(m["title"]): id for id, m in catalog.items()}
        self.people = {
            normal(n)
            for m in catalog.values()
            for n in m["cast"] + m["directors"]
            if len(normal(n).split()) >= 2
        }

        def document(m):
            return " ".join(
                [
                    m["title"],
                    m["overview"],
                    *m["genres"],
                    *m["keywords"],
                    *m["keywords"],
                ]
            )

        self.vectorizer = TfidfVectorizer(
            tokenizer=terms,
            token_pattern=None,
            lowercase=False,
            ngram_range=(1, 2),
            sublinear_tf=True,
        )
        self.matrix = self.vectorizer.fit_transform(
            document(catalog[i]) for i in self.ids
        )

    def interpret(self, text):
        clean = normal(text)
        intent = Intent()
        ref = re.search(
            r"\b(?:similar to|something like|movies? like|films? like|in the style of|reminds? me of|like) (.+)",
            clean,
        )
        title = (
            ref[1]
            if ref
            else re.sub(
                r"^(?:i want to watch|tell me about|show me|find the movie|find the film) ",
                "",
                clean,
            )
        )
        title = (
            re.split(r" (?:but|except|without|with|from|after|before) ", title)[0]
            if ref
            else title
        )
        if title in self.by_title:
            intent.reference = self.by_title[title]
            intent.similar = bool(ref)
            clean = (" " + clean + " ").replace(" " + title + " ", " ").strip()
        elif ref:
            intent.unknown_reference = True
        intent.people = {
            " ".join(parts)
            for parts in self._phrases(clean)
            if " ".join(parts) in self.people
        }
        for name in intent.people:
            if re.search(
                r"\b(?:directed by|director) " + re.escape(name) + r"\b", clean
            ):
                intent.directors.add(name)
            if re.search(
                r"\b(?:starring|stars|featuring) " + re.escape(name) + r"\b", clean
            ):
                intent.actors.add(name)
        for name, pattern in GENRES.items():
            for match in re.finditer(r"\b(?:" + pattern + r")\b", clean):
                negated = re.search(
                    r"\b(no|not|without|avoid|excluding)(?: any)?(?: \w+ or)? $",
                    clean[: match.start()],
                )
                (intent.excluded if negated else intent.genres).add(name)
        intent.any_genre = " or " in clean
        for name, code in LANGUAGES.items():
            match = re.search(r"\b" + name + r"\b", clean)
            if match:
                negative = re.search(
                    r"\b(?:no|not|without|except|excluding) $", clean[: match.start()]
                )
                (intent.excluded_languages if negative else intent.languages).add(code)
        for lo, hi in re.findall(
            r"\b((?:19|20)\d{2}) (?:to|through|and) ((?:19|20)\d{2})\b", clean
        ):
            intent.earliest, intent.latest = int(lo), int(hi)
            clean = (
                clean.replace(lo + " to " + hi, " ")
                .replace(lo + " through " + hi, " ")
                .replace(lo + " and " + hi, " ")
            )
        decade_match = re.search(r"\b(\d{2})s\b", clean)
        if decade_match:
            year = int(decade_match[1])
            intent.earliest = (1900 if year >= 30 else 2000) + year
            intent.latest = intent.earliest + 9
            clean = clean.replace(decade_match[0], " ")
        for m in re.finditer(
            r"\b(?:(after|before|since|from|until|through|between|to) )?((?:19|20)\d{2})(s?)\b",
            clean,
        ):
            op, value, decade = m.groups()
            year = int(value)
            if op == "after":
                intent.earliest = max(intent.earliest, year + 1)
            elif op in ("before", "until", "through", "to"):
                intent.latest = min(intent.latest, year - int(op == "before"))
            elif op in ("since", "between") or (
                op == "from" and re.search(r"\bto \d{4}", clean)
            ):
                intent.earliest = max(intent.earliest, year)
            elif re.search(r"between \d{4} and $", clean[: m.start()]):
                intent.latest = min(intent.latest, year)
            else:
                intent.earliest = max(intent.earliest, year)
                intent.latest = min(intent.latest, year + (9 if decade else 0))
        for name in intent.people:
            clean = clean.replace(name, " ")
        clean = re.sub(r"\b(?:" + "|".join(GENRES.values()) + r")\b", " ", clean)
        clean = re.sub(
            r"\b(?:" + "|".join(LANGUAGES) + r"|(?:19|20)\d{2}s?)\b", " ", clean
        )
        return intent, clean

    @staticmethod
    def _phrases(text):
        words = text.split()
        return (words[i : i + n] for n in (2, 3, 4) for i in range(len(words) - n + 1))

    def rank(self, text, intent, clean):
        if intent.unknown_reference:
            return []
        if intent.reference is not None and not intent.similar:
            return (
                [intent.reference]
                if intent.accepts(self.catalog[intent.reference])
                else []
            )
        extra = " ".join(value for key, value in MOODS.items() if key in clean)
        if "dream" in clean and any(
            w in clean for w in ("enter", "inside", "steal", "subconscious")
        ):
            extra += " dream heist subconscious sleep"
        vector = self.vectorizer.transform([clean + " " + extra])
        scores = cosine_similarity(vector, self.matrix).ravel()
        if intent.similar and intent.reference is not None:
            reference = cosine_similarity(
                self.matrix[self.pos[intent.reference]], self.matrix
            ).ravel()
            scores = reference * 0.72 + scores * 0.28
        restricted = bool(
            intent.genres
            or intent.excluded
            or intent.people
            or intent.languages
            or intent.excluded_languages
            or intent.earliest
            or intent.latest != 9999
        )
        have_terms = vector.nnz > 0
        ranked = []
        for i, id in enumerate(self.ids):
            m = self.catalog[id]
            if id == intent.reference or not intent.accepts(m):
                continue
            if scores[i] <= 0 and (have_terms or not restricted):
                continue
            confidence = min(1, np.log1p(m["votes"]) / 8)
            quality = confidence * m["rating"] / 10
            score = float(scores[i])
            if intent.similar and intent.reference is not None:
                anchor = set(self.catalog[intent.reference]["genres"])
                score *= 0.3 + 0.7 * len(anchor & set(m["genres"])) / max(
                    1, len(anchor)
                )
            ranked.append((score * (0.7 + 0.55 * quality) + 0.065 * quality, id))
        ranked.sort(reverse=True)
        return [id for _, id in ranked]
