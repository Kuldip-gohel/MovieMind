const movieRequest = document.getElementById("movieRequest");
const findMovieBtn = document.getElementById("findMovieBtn");
const locationBtn = document.getElementById("locationBtn");
const savedRequest = document.getElementById("savedRequest");
const aiResult = document.getElementById("aiResult");

const heroVideo = document.getElementById("heroVideo");
const movieScreen = document.getElementById("movieScreen");
const fullscreenBtn = document.getElementById("fullscreenBtn");


// =========================================================
// 1. LOCAL STORAGE API
// =========================================================

const STORAGE_KEY = "moviemind_search_history";

const searchSuggestions = document.getElementById("searchSuggestions");

let searchHistory = JSON.parse( localStorage.getItem(STORAGE_KEY)) || [];


// Save a new search request
function saveMovieRequest(request) {
    // Remove duplicate requests
    searchHistory = searchHistory.filter(
        item => item.toLowerCase() !== request.toLowerCase()
    );

    // Add new request at the beginning
    searchHistory.unshift(request);

    // Keep only latest 5 searches
    searchHistory = searchHistory.slice(0, 5);

    // Save history in Local Storage
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(searchHistory)
    );

    displaySuggestions();
}


// Display previous searches
function displaySuggestions() {
    searchSuggestions.innerHTML = "";
    if (searchHistory.length === 0) {
        searchSuggestions.style.display = "none";
        return;
    }

    searchHistory.forEach(request => {
        const suggestion =document.createElement("div");

        suggestion.className ="suggestion-item";

        suggestion.textContent =request;


        // Click event for previous search
        suggestion.addEventListener("click", () => {
            movieRequest.value = request;
            searchSuggestions.style.display = "none";
        });
        searchSuggestions.appendChild(suggestion);
    });
}


// =========================================================
// LAB 3 EVENT: FOCUS
// =========================================================

// Show previous searches when input gets focus

movieRequest.addEventListener("focus", () => {
    displaySuggestions();
    if (searchHistory.length > 0) {
        searchSuggestions.style.display = "block";
    }
});

// =========================================================
// LAB 3 EVENT: INPUT
// =========================================================

// Runs whenever the user types something

movieRequest.addEventListener("input", () => {
    if (movieRequest.value.trim().length > 0) {
        aiResult.style.display = "block";
        aiResult.textContent = "🎬 Keep describing your movie preferences...";
    } else {
        aiResult.style.display = "none";
    }
});


// =========================================================
// CLICK EVENT
// =========================================================

// Hide suggestions when clicking outside search box

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper")) {
        searchSuggestions.style.display = "none";
    }
});

// Load previous searches when page opens
displaySuggestions();


// =========================================================
// 2. GEOLOCATION API
// =========================================================

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        locationBtn.textContent = "Geolocation is not supported";
        return;
    }

    locationBtn.textContent = "📍 Getting location...";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude =
                position.coords.latitude.toFixed(4);
            const longitude =
                position.coords.longitude.toFixed(4);
            locationBtn.textContent =
                `📍 Location detected (${latitude}, ${longitude})`;
        },


        (error) => {
            console.error(
                "Geolocation error:",
                error
            );

            locationBtn.textContent =
                "📍 Location permission denied";
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
});


// =========================================================
// 3. HTML5 VIDEO API
// =========================================================


// Video loaded event

heroVideo.addEventListener(
    "loadedmetadata",
    () => {
        // Keep video muted for autoplay
        heroVideo.muted = true;

    }
);


// Video error event

heroVideo.addEventListener(
    "error",
    () => {
        console.warn(
            "MovieMind background video could not be loaded."
        );

    }
);


// =========================================================
// LAB 3 EVENT: DOUBLE CLICK
// =========================================================

// Double-click video to play or pause

heroVideo.addEventListener(
    "dblclick",
    () => {
        if (heroVideo.paused) {
          heroVideo.play();
        } else {
            heroVideo.pause();
        }
    }
);


// =========================================================
// 4. FULLSCREEN API
// =========================================================

fullscreenBtn.addEventListener(
    "click",
    async () => {
        try {
            if (!document.fullscreenElement) {
                await movieScreen.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error(
                "Fullscreen error:",
                error
            );
        }
    }
);


// =========================================================
// LAB 3 EVENT: FULLSCREENCHANGE
// =========================================================

// Runs whenever fullscreen mode changes

document.addEventListener(
    "fullscreenchange",
    () => {
        fullscreenBtn.textContent =
            document.fullscreenElement
                ? "✕"
                : "⛶";
    }
);


// =========================================================
// 5. GEMINI API
// =========================================================

// IMPORTANT:
// Do not upload your API key to GitHub.
// For a real production project, API calls should
// be handled through a backend.

const GEMINI_API_KEY = "";
const GEMINI_MODEL = "gemini-3.6-flash";

async function askGemini(userRequest) {

    // Check whether API key is configured

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY === ""
    ) {

        return "Demo mode: Gemini API key is not configured yet. Your request has been saved and the other APIs are active.";

    }

    const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `

You are MovieMind, an AI movie decision assistant.

User request:
"${userRequest}"

Understand the user's requirements such as:

- Genre
- Mood
- Available time
- Audience
- Story type
- Preferences

Then give a short and useful movie recommendation.

Explain:
1. What the user is looking for.
2. What type of movie would suit them.
3. Give 2 or 3 suitable movie suggestions.
4. Briefly explain why they are suitable.

Keep the response under 150 words.

`;

    const response = await fetch(
        endpoint,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        }
    );


    if (!response.ok) {
        const errorData = await response.text();

        console.error("Gemini API Error:",errorData);

        throw new Error(
            `Gemini API error: ${response.status}`
        );

    }

    const data =await response.json();

    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Gemini did not return a response."
    );
}

// =========================================================
// LAB 3 EVENTS: MOUSEENTER & MOUSELEAVE
// =========================================================


// Mouse enters Find My Movie button

findMovieBtn.addEventListener(
    "mouseenter",
    () => {
        findMovieBtn.title ="Click to find a movie based on your request";
    }
);


// Mouse leaves Find My Movie button

findMovieBtn.addEventListener(
    "mouseleave",
    () => {
        findMovieBtn.title = "";
    }
);


// =========================================================
// FIND MY MOVIE
// =========================================================

findMovieBtn.addEventListener(
    "click",
    async () => {
        const request =
            movieRequest.value.trim();

        // Check empty input
        if (!request) {
            movieRequest.focus();
            aiResult.style.display ="block";
            aiResult.textContent ="Please tell MovieMind what you want to watch.";
            return;
        }


        // Save request using Local Storage

        saveMovieRequest(request);

        // Show loading message
        aiResult.style.display ="block";
        aiResult.textContent ="🎬 MovieMind is understanding your request...";


        // Disable button
        findMovieBtn.disabled =true;

        findMovieBtn.textContent ="Thinking...";

        try {
            // Send request to Groq
            const result =await askGemini(request);

            // Display AI response
            aiResult.textContent = result;
        }


        catch (error) {
            console.error(error);
            aiResult.textContent ="MovieMind could not connect to Gemini right now. Please check your API key and internet connection.";
        }

        finally {
            // Enable button again
            findMovieBtn.disabled =
                false;
            findMovieBtn.textContent =
                "Find My Movie";

        }

    }
);


// =========================================================
// LAB 3 EVENT: KEYDOWN
// =========================================================

// Press Enter to search

movieRequest.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            findMovieBtn.click();
        }
    }
);