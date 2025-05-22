// tambayan-backend/server.js
// (Assume existing express, fetch, dotenv, cors imports and app setup are present)
// (Assume GEMINI_API_KEY, SPORTS_API_KEY, BALLDONTLIE_API_BASE_URL are defined)
// (Assume existing /api/ask-pareng-ai, /api/nba/* routes are present)

// --- HELPER: Gemini API Call (This might already exist or be similar for Pareng AI) ---
async function callGemini(promptText) {
    if (!GEMINI_API_KEY) { // GEMINI_API_KEY should be process.env.GEMINI_API_KEY_BACKEND
        console.error("[Helper:Gemini] Gemini API Key is not configured.");
        throw { status: 500, message: "Gemini AI service (key) not configured on server." };
    }
    const API_URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(API_URL_GEMINI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({error: {message: `Gemini API HTTP Error ${response.status}`}}));
        console.error("[Helper:Gemini] Gemini API Error:", errorData.error?.message || response.statusText);
        throw { status: response.status, message: `Gemini API error: ${errorData.error?.message || response.statusText}` };
    }
    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
    } else {
        console.warn("[Helper:Gemini] Gemini response format unexpected:", data);
        throw { status: 500, message: "Unexpected response format from Gemini AI." };
    }
}


// --- NEW: Endpoint for Gemini-Powered Bot Comments ---
app.post('/api/bots/generate-comment', async (req, res) => {
    const { botPersona, gameContext, chatContext } = req.body;

    console.log(`[Bot Service] Request to generate comment for bot: ${botPersona?.name || 'Unknown Bot'}`);

    if (!botPersona || !botPersona.name || !botPersona.description) {
        return res.status(400).json({ error: "Valid botPersona (with name and description) is required." });
    }

    let promptForGemini = `You are embodying a Filipino chat bot persona for an online sports hangout called "Jhoven's Tambayan".
Your persona is:
Name: ${botPersona.name}
Description: ${botPersona.description}
Your responses should be short (1-2 sentences), witty, in conversational Taglish (Tagalog-English mix), and fit the vibe of a fun, sometimes rowdy, online hangout of Pinoy NBA fans.
You are aware of the current NBA game situation.

Current NBA Game Situation (if any relevant games):`;

    if (gameContext && gameContext.length > 0) {
        const relevantGames = gameContext.slice(0, 2); // Limit for prompt brevity
        relevantGames.forEach(game => {
            let gameSummary = `${game.awayTeam.abbreviation || game.awayTeam.name} vs ${game.homeTeam.abbreviation || game.homeTeam.name}.`;
            if (game.status === "Final" || (game.period >= 4 && game.time && game.time.trim() === "")) {
                gameSummary += ` Final Score: ${game.awayTeam.score}-${game.homeTeam.score}.`;
            } else if (game.period > 0) {
                gameSummary += ` Live: Q${game.period} ${game.time ? game.time.trim() : ''}, Score: ${game.awayTeam.score}-${game.homeTeam.score}.`;
            } else {
                const gameTimePHT = new Date(game.datetime || game.date).toLocaleTimeString('en-PH', {timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit'});
                gameSummary += ` Scheduled: ${gameTimePHT}.`;
            }
            promptForGemini += `\n- ${gameSummary}`;
        });
    } else {
        promptForGemini += "\nNo specific live game data at the moment, just general Tambayan chat.";
    }

    // For now, we are keeping chatContext minimal or empty from the frontend to simplify
    if (chatContext && chatContext.length > 0) {
        promptForGemini += "\n\nRecent chat messages from users for context (you don't have to directly reply unless it fits your persona's spontaneous thought):";
        chatContext.slice(-2).forEach(msg => { // Last 2 messages
            promptForGemini += `\n- ${msg.sender}: ${msg.text}`;
        });
    }

    promptForGemini += `\n\nBased on this, what's a short, fun, in-character comment you (as ${botPersona.name}) would spontaneously say? Be creative and true to your persona. Do not act like a generic assistant. Be one of the "Paps" in the Tambayan. Ensure your response is just the chat message itself.`;
    
    console.log(`[Bot Service] Sending prompt to Gemini for ${botPersona.name}. Length: ${promptForGemini.length}`);

    try {
        const botComment = await callGemini(promptForGemini);
        console.log(`[Bot Service] Gemini generated comment for ${botPersona.name}: "${botComment}"`);
        res.json({ comment: botComment });
    } catch (error) {
        console.error(`[Bot Service] Error processing Gemini request for ${botPersona.name}:`, error);
        res.status(error.status || 500).json({ error: error.message || 'Failed to generate bot comment.' });
    }
});

// --- BallDontLie Sports Data Endpoints ---
async function fetchBallDontLieData(endpointPath, params = {}) {
    if (!SPORTS_API_KEY) {
        console.error("[Sports Service] SPORTS_API_KEY (BallDontLie) is not set.");
        throw { status: 500, message: "Sports API service (key) not configured." };
    }
    const queryParams = new URLSearchParams(params);
    const url = `${BALLDONTLIE_API_BASE_URL}${endpointPath}?${queryParams.toString()}`;
    console.log(`[Sports Service] Fetching from: ${url}`);
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': SPORTS_API_KEY }
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP ${response.status} - ${response.statusText}` }));
        console.error(`[Sports Service] BallDontLie API Error (${response.status}):`, errorBody.message || errorBody);
        throw { status: response.status, message: errorBody.message || `BallDontLie API request failed.` };
    }
    return response.json();
}

app.get('/api/nba/ticker-games', async (req, res) => {
    console.log('[Sports Service] Request received for /api/nba/ticker-games');
    try {
        const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const formatDate = (date) => date.toISOString().split('T')[0];

        const apiResponse = await fetchBallDontLieData('/games', {
            start_date: formatDate(yesterday),
            end_date: formatDate(tomorrow),
            per_page: 25
        });

        if (apiResponse && apiResponse.data) {
            const processedGames = apiResponse.data.map(game => ({
                id: game.id,
                datetime: game.datetime || `${game.date}T${game.status.includes(":") ? game.status.split(" ")[0]+":00Z" : "12:00:00Z"}`,
                date: game.date, status: game.status, time: game.time, period: game.period,
                homeTeam: { name: game.home_team.full_name, abbreviation: game.home_team.abbreviation, score: game.home_team_score },
                awayTeam: { name: game.visitor_team.full_name, abbreviation: game.visitor_team.abbreviation, score: game.visitor_team_score }
            })).sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
            res.json(processedGames);
        } else {
            console.warn("[Sports Service] No 'data' in BallDontLie response for ticker.", apiResponse);
            res.json([]);
        }
    } catch (error) {
        console.error('[Sports Service] Error in /ticker-games:', error.message || error);
        res.status(error.status || 500).json({ error: `Failed to fetch ticker games. ${error.message || ''}`});
    }
});

app.get('/api/nba/schedule-detailed', async (req, res) => {
    console.log('[Sports Service] Request received for /api/nba/schedule-detailed with query:', req.query);
    try {
        const { startDate, endDate } = req.query;
        let params = { per_page: 50 };
        if (startDate && endDate) {
            params.start_date = startDate; params.end_date = endDate;
        } else {
            const today = new Date(); const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
            const formatDate = (d) => d.toISOString().split('T')[0];
            params.start_date = formatDate(today); params.end_date = formatDate(nextWeek);
        }
        const apiResponse = await fetchBallDontLieData('/games', params);
        if (apiResponse && apiResponse.data) {
            const processedGames = apiResponse.data.map(game => ({
                id: game.id,
                datetime: game.datetime || `${game.date}T${game.status.includes(":") ? game.status.split(" ")[0]+":00Z" : "12:00:00Z"}`,
                date: game.date, status: game.status, timeInPeriod: game.time, period: game.period,
                homeTeam: { id: game.home_team.id, name: game.home_team.full_name, abbreviation: game.home_team.abbreviation, score: game.home_team_score },
                awayTeam: { id: game.visitor_team.id, name: game.visitor_team.full_name, abbreviation: game.visitor_team.abbreviation, score: game.visitor_team_score }
            })).sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
            res.json({ games: processedGames, meta: apiResponse.meta });
        } else {
            console.warn("[Sports Service] No 'data' in BallDontLie response for schedule-detailed.", apiResponse);
            res.json({ games: [], meta: null });
        }
    } catch (error) {
        console.error('[Sports Service] Error in /schedule-detailed:', error.message || error);
        res.status(error.status || 500).json({ error: `Failed to fetch detailed schedule. ${error.message || ''}`});
    }
});

app.get('/api/nba/game-odds/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const dateForOdds = req.query.date;
    console.log(`[Sports Service] Request for odds: gameId=${gameId}, date=${dateForOdds}`);

    if (!dateForOdds) {
        return res.status(400).json({ error: 'Date query parameter (YYYY-MM-DD) is required for odds.' });
    }
    const simulateAndSendOdds = (vendorSuffix = "") => {
        const homeSim = (Math.random() * (2.5 - 1.5) + 1.5).toFixed(2);
        const awaySim = (Math.random() * (3.0 - 1.3) + 1.3).toFixed(2);
        console.log(`[Sports Service] Simulating odds for game ${gameId}. ${vendorSuffix}`);
        res.json({ homeWin: parseFloat(homeSim), awayWin: parseFloat(awaySim), vendor: `Tambayan Simulated Odds ${vendorSuffix}`.trim() });
    };
    try {
        const apiResponse = await fetchBallDontLieData('/odds', { game_ids: [gameId], date: dateForOdds });
        let moneylineOdds = null;
        if (apiResponse && apiResponse.data && apiResponse.data.length > 0) {
            const gameOddsData = apiResponse.data.find(entry => entry.game_id == gameId && entry.type === "2way");
            if (gameOddsData && gameOddsData.odds_decimal_home && gameOddsData.odds_decimal_visitor) {
                moneylineOdds = {
                    homeWin: parseFloat(gameOddsData.odds_decimal_home),
                    awayWin: parseFloat(gameOddsData.odds_decimal_visitor),
                    vendor: gameOddsData.vendor || "Unknown Vendor"
                };
            }
        }
        if (moneylineOdds) {
            res.json(moneylineOdds);
        } else {
            simulateAndSendOdds("(No live odds found)");
        }
    } catch (error) {
        console.error(`[Sports Service] Error fetching/simulating odds for game ${gameId} on ${dateForOdds}:`, error.message || error);
        if (error.status === 401) { // Specifically handle 401 (Unauthorized, likely tier issue)
            simulateAndSendOdds("(API Unauthorized 401)");
        } else { // Other errors
            simulateAndSendOdds("(API Error Fallback)");
        }
    }
});
app.post('/api/bots/generate-comment', async (req, res) => {
    const { botPersona, gameContext, chatContext } = req.body;
    // botPersona: object defining the bot (name, personality description)
    // gameContext: array of game objects (like what ticker-games returns)
    // chatContext: array of recent user chat messages (optional)

    console.log(`[Bot Service] Request to generate comment for bot: ${botPersona.name}`);

    if (!botPersona || !botPersona.name || !botPersona.description) {
        return res.status(400).json({ error: "Valid botPersona (name, description) is required." });
    }
    if (!GEMINI_API_KEY) {
        console.error("[Bot Service] FATAL: GEMINI_API_KEY_BACKEND is not set.");
        return res.status(500).json({ error: 'AI service (Gemini) not configured.' });
    }

    // --- Construct a Detailed Prompt for Gemini ---
    let promptForGemini = `You are embodying a Filipino chat bot persona for an online sports hangout called "Jhoven's Tambayan".
Your persona is:
Name: ${botPersona.name}
Description: ${botPersona.description}
Your responses should be short, witty, in conversational Taglish (Tagalog-English mix), and fit the vibe of a fun, sometimes rowdy, online hangout of Pinoy NBA fans.
You are aware of the current NBA game situation.

Current NBA Game Situation (if any relevant games):`;

    if (gameContext && gameContext.length > 0) {
        // Summarize game context for Gemini (pick 1-2 most relevant games)
        const relevantGames = gameContext.slice(0, 2); // Take first two for brevity
        relevantGames.forEach(game => {
            let gameStatusSummary = `${game.awayTeam.abbreviation || game.awayTeam.name} vs ${game.homeTeam.abbreviation || game.homeTeam.name}.`;
            if (game.status === "Final" || (game.period >= 4 && game.time && game.time.trim() === "")) {
                gameStatusSummary += ` Final Score: ${game.awayTeam.score}-${game.homeTeam.score}.`;
            } else if (game.period > 0) {
                gameStatusSummary += ` Currently Q${game.period} ${game.time ? game.time.trim() : 'Live'}, Score: ${game.awayTeam.score}-${game.homeTeam.score}.`;
            } else {
                gameStatusSummary += ` Scheduled for ${new Date(game.datetime || game.date).toLocaleTimeString('en-PH', {timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit'})}.`;
            }
            promptForGemini += `\n- ${gameStatusSummary}`;
        });
    } else {
        promptForGemini += "\nNo specific live game data at the moment, just general Tambayan chat.";
    }

    if (chatContext && chatContext.length > 0) {
        promptForGemini += "\n\nRecent chat messages from users for context (you don't have to directly reply unless it fits your persona's spontaneous thought):";
        chatContext.slice(-3).forEach(msg => { // Last 3 messages
            promptForGemini += `\n- ${msg.sender}: ${msg.text}`;
        });
    }

    promptForGemini += `\n\nBased on this, what's a short, fun, in-character comment you (as ${botPersona.name}) would spontaneously say in the chat? Keep it to 1-2 sentences. Be creative and true to your persona. Do not act like a generic assistant. Be one of the "Paps" in the Tambayan.`;
    
    console.log(`[Bot Service] Prompt for Gemini for ${botPersona.name}:\n---START---\n${promptForGemini}\n---END---`);

    const API_URL_GEMINI = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const geminiResponse = await fetch(API_URL_GEMINI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptForGemini }] }] }),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json().catch(() => ({error: {message: "Failed to parse Gemini error response."}}));
            console.error(`[Bot Service] Gemini API Error for ${botPersona.name}:`, errorData.error?.message || geminiResponse.statusText);
            return res.status(geminiResponse.status).json({ error: `Gemini API error for bot comment: ${errorData.error?.message || geminiResponse.statusText}` });
        }

        const data = await geminiResponse.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const botComment = data.candidates[0].content.parts[0].text.trim();
            console.log(`[Bot Service] Gemini generated comment for ${botPersona.name}: "${botComment}"`);
            res.json({ comment: botComment });
        } else {
            console.warn(`[Bot Service] Gemini response format unexpected for ${botPersona.name}:`, data);
            res.status(500).json({ error: 'Unexpected response format from AI service for bot comment.' });
        }
    } catch (error) {
        console.error(`[Bot Service] Error calling Gemini API for ${botPersona.name}:`, error);
        res.status(500).json({ error: 'Internal server error when contacting AI for bot comment.' });
    }
});
// --- Start Server ---
app.listen(port, () => {
    console.log(`Tambayan backend server listening at http://localhost:${port}`);
    if (!GEMINI_API_KEY) console.warn("WARNING: GEMINI_API_KEY_BACKEND is NOT SET in .env!");
    if (!SPORTS_API_KEY) console.warn("WARNING: SPORTS_API_KEY (BallDontLie) is NOT SET in .env!");
});