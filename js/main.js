import { CONFIG, DOMElements, STATE, parengAiPredefinedResponses } from './config.js';
import { logInfo, logError, logWarn } from './utils.js';
import { displayMessageInChat, updateGameStatus, toggleTambayRules, closeTambayRules } from './ui.js';
import { triggerRandomAiInterjection, askParengAiWithGemini } from './ai.js'; // triggerRandomAiInterjection is old, askParengAiWithGemini is user-invoked
import { processChatMessage, processShoutOut } from './chat.js';
import {
    placeBet,
    handleLeakedScriptClick,
    handleCurryMouthpieceHover,
    handleIronmanVideoEnd,
    handleChannelButtonClick
} from './page_interactions.js';
import { triggerGeminiBotComment } from './tambay_bots.js';

// --- Function to add messages to chat history for bot context ---
// This is exported so other modules (chat.js, ai.js, tambay_bots.js) can call it.
export function handleNewChatMessage(sender, text, isUser = false) {
    STATE.chatHistoryForBots.push({ sender, text });
    if (STATE.chatHistoryForBots.length > STATE.MAX_CHAT_HISTORY_FOR_BOTS) {
        STATE.chatHistoryForBots.shift();
    }
    // logInfo("Chat history updated:", STATE.chatHistoryForBots); // Can be noisy, enable for debug
}

// --- NBA Ticker Specific Function ---
async function loadNbaTicker() {
    if (STATE.isTickerLoading) {
        // logInfo("[Ticker] Already loading, skipping ticker call.");
        return;
    }
    STATE.isTickerLoading = true;
    logInfo("[Ticker] Attempting to load ticker data...");

    const tickerContentEl = DOMElements.nbaTickerContentElement; // Use from DOMElements
    if (!tickerContentEl) {
        logError("[Ticker] Ticker content element not found via DOMElements.");
        STATE.isTickerLoading = false;
        return;
    }

    let sportsApiBaseUrl = CONFIG.SPORTS_DATA_BACKEND_BASE_URL || '';
    if (!sportsApiBaseUrl && CONFIG.AI_BACKEND_API_URL) {
        try {
            const urlObject = new URL(CONFIG.AI_BACKEND_API_URL);
            sportsApiBaseUrl = `${urlObject.protocol}//${urlObject.host}`;
        } catch (e) {
            logError("[Ticker] Invalid AI_BACKEND_API_URL for deriving base URL:", CONFIG.AI_BACKEND_API_URL);
            tickerContentEl.innerHTML = '<div class="ticker-item">Error: Ticker Backend URL misconfiguration.</div>';
            STATE.isTickerLoading = false;
            return;
        }
    }
    if (!sportsApiBaseUrl) {
        logError("[Ticker] Backend URL for sports data not configured in config.js.");
        tickerContentEl.innerHTML = '<div class="ticker-item">Error: Ticker Sports API URL not configured.</div>';
        STATE.isTickerLoading = false;
        return;
    }

    const tickerApiUrl = `${sportsApiBaseUrl}/api/nba/ticker-games`;
    // logInfo(`[Ticker] Fetching from: ${tickerApiUrl}`); // Can be noisy

    try {
        const response = await fetch(tickerApiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const games = await response.json();
        // logInfo("[Ticker] Received games data:", games ? `${games.length} games` : "No games data");

        STATE.latestGamesDataForBots = games || []; // Update global state

        if (games && games.length > 0) {
            tickerContentEl.innerHTML = '';
            games.forEach(game => {
                const gameDate = new Date(game.datetime || game.date);
                const gameTimePHT = gameDate.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
                let statusText = game.status;
                let scoreLine = "";

                if (statusText === "Final" || (game.period >= 4 && game.time && game.time.trim() === "")) {
                    statusText = "Final";
                    scoreLine = `${game.awayTeam.score !== null ? game.awayTeam.score : '-'} - ${game.homeTeam.score !== null ? game.homeTeam.score : '-'}`;
                } else if (game.period > 0) {
                    statusText = `Q${game.period} ${game.time ? game.time.trim() : 'Live'}`;
                    scoreLine = `${game.awayTeam.score !== null ? game.awayTeam.score : '-'} @ ${game.homeTeam.score !== null ? game.homeTeam.score : '-'}`;
                } else { // Scheduled
                    statusText = gameTimePHT;
                    scoreLine = `@`;
                }

                const itemDiv = document.createElement('div');
                itemDiv.classList.add('ticker-item');
                itemDiv.innerHTML = `
                    <span class="team-name">${game.awayTeam.abbreviation || game.awayTeam.name}</span>
                    ${(game.period > 0 || statusText === "Final") ? `<span class="score-details">${game.awayTeam.score !== null ? game.awayTeam.score : ''}</span>` : ''}
                    <span class="vs-ticker"> ${scoreLine.includes('@') && game.period === 0 ? '@' : (game.period > 0 || statusText === "Final" ? '-' : 'vs')} </span>
                    <span class="team-name">${game.homeTeam.abbreviation || game.homeTeam.name}</span>
                    ${(game.period > 0 || statusText === "Final") ? `<span class="score-details">${game.homeTeam.score !== null ? game.homeTeam.score : ''}</span>` : ''}
                    <span class="game-status-ticker">(${statusText})</span>
                `;
                tickerContentEl.appendChild(itemDiv);
            });

            if (tickerContentEl.children.length > 0 && tickerContentEl.children.length < 5) {
                tickerContentEl.innerHTML += tickerContentEl.innerHTML;
            }
            if (tickerContentEl.children.length === 0) {
                tickerContentEl.innerHTML = '<div class="ticker-item">No NBA games for the ticker right now, Paps!</div>';
            }
        } else {
            tickerContentEl.innerHTML = '<div class="ticker-item">No NBA games data received for the ticker.</div>';
        }
        // After successfully loading ticker, maybe trigger a bot comment
        if (Math.random() < 0.15) { // Lower chance on data refresh
             triggerGeminiBotComment(); // Uses global STATE.latestGamesDataForBots and STATE.chatHistoryForBots
        }
    } catch (error) {
        logError("[Ticker] Failed to load NBA ticker data:", error);
        if (tickerContentEl) tickerContentEl.innerHTML = `<div class="ticker-item">Error loading scores. Refresh or try later.</div>`;
    } finally {
        STATE.isTickerLoading = false;
    }
}

// --- Dynamic Pustahan Widget Function ---
async function loadFeaturedPustahanGame() {
    if (STATE.isPustahanWidgetLoading) {
        return;
    }
    STATE.isPustahanWidgetLoading = true;
    // logInfo("[Pustahan Widget] Attempting to load featured game...");

    if (!DOMElements.featuredGameBetItem || !DOMElements.pustahanGameMatchup ||
        !DOMElements.pustahanTeamAOdds || !DOMElements.pustahanTeamBOdds ||
        !DOMElements.pustahanBetTeamAButton || !DOMElements.pustahanBetTeamBButton) {
        logInfo("[Pustahan Widget] Required HTML elements for Pustahan Widget not found.");
        STATE.isPustahanWidgetLoading = false;
        return;
    }
    DOMElements.featuredGameBetItem.style.display = 'none';

    let sportsApiBaseUrl = CONFIG.SPORTS_DATA_BACKEND_BASE_URL || '';
    if (!sportsApiBaseUrl && CONFIG.AI_BACKEND_API_URL) {
        try {
            const urlObject = new URL(CONFIG.AI_BACKEND_API_URL);
            sportsApiBaseUrl = `${urlObject.protocol}//${urlObject.host}`;
        } catch (e) { logError("[Pustahan Widget] Invalid AI_BACKEND_API_URL."); STATE.isPustahanWidgetLoading = false; return; }
    }
    if (!sportsApiBaseUrl) { logError("[Pustahan Widget] Backend URL not configured."); STATE.isPustahanWidgetLoading = false; return; }

    const gamesApiUrl = `${sportsApiBaseUrl}/api/nba/ticker-games`; // Reuse ticker data

    try {
        const gamesResponse = await fetch(gamesApiUrl);
        if (!gamesResponse.ok) throw new Error(`Failed to fetch games for pustahan: ${gamesResponse.status}`);
        const allGames = await gamesResponse.json();
        // logInfo("[Pustahan Widget] Received games for selection:", allGames ? `${allGames.length} games` : "No games data");

        STATE.latestGamesDataForBots = allGames || []; // Update global state

        const upcomingGame = allGames.find(game =>
            game.status && !game.status.toLowerCase().includes("final") &&
            !game.status.toLowerCase().includes("finished") &&
            !game.status.toLowerCase().includes("postponed") &&
            game.period === 0
        );

        if (!upcomingGame) {
            DOMElements.pustahanGameMatchup.textContent = "No upcoming games for betting now.";
            DOMElements.featuredGameBetItem.style.display = 'block';
            DOMElements.pustahanBetTeamAButton.style.display = 'none';
            DOMElements.pustahanBetTeamBButton.style.display = 'none';
            DOMElements.pustahanTeamAOdds.textContent = '';
            DOMElements.pustahanTeamBOdds.textContent = '';
            STATE.isPustahanWidgetLoading = false;
            return;
        }
        // logInfo("[Pustahan Widget] Selected upcoming game:", upcomingGame);

        DOMElements.pustahanGameMatchup.textContent = `${upcomingGame.awayTeam.abbreviation || upcomingGame.awayTeam.name} @ ${upcomingGame.homeTeam.abbreviation || upcomingGame.homeTeam.name}`;

        const gameDateForOdds = (upcomingGame.datetime || upcomingGame.date).split('T')[0];
        const oddsApiUrl = `${sportsApiBaseUrl}/api/nba/game-odds/${upcomingGame.id}?date=${gameDateForOdds}`;
        // logInfo(`[Pustahan Widget] Fetching odds from: ${oddsApiUrl}`);

        let oddsData = { homeWin: 1.90, awayWin: 1.90, vendor: "Tambayan Default Odds" };
        try {
            const oddsResponse = await fetch(oddsApiUrl);
            // logInfo(`[Pustahan Widget] Odds response status for game ${upcomingGame.id}: ${oddsResponse.status}`);
            if (oddsResponse.ok) {
                oddsData = await oddsResponse.json();
                // logInfo("[Pustahan Widget] Received odds data:", oddsData);
            } else {
                const errorText = await oddsResponse.text();
                logWarn(`[Pustahan Widget] Failed to fetch live odds for game ${upcomingGame.id} (Status: ${oddsResponse.status} - ${errorText}). Using default/simulated.`);
            }
        } catch (oddsError) {
            logError(`[Pustahan Widget] Network error fetching odds for game ${upcomingGame.id}. Using default/simulated.`, oddsError);
        }

        DOMElements.pustahanTeamAOdds.textContent = `${upcomingGame.awayTeam.abbreviation || upcomingGame.awayTeam.name} (Odds: ${oddsData.awayWin?.toFixed(2) || '1.90'})`;
        DOMElements.pustahanTeamBOdds.textContent = `${upcomingGame.homeTeam.abbreviation || upcomingGame.homeTeam.name} (Odds: ${oddsData.homeWin?.toFixed(2) || '1.90'})`;

        DOMElements.pustahanBetTeamAButton.textContent = `Taya sa ${upcomingGame.awayTeam.abbreviation || upcomingGame.awayTeam.name}!`;
        DOMElements.pustahanBetTeamAButton.dataset.betTeamAbbrev = upcomingGame.awayTeam.abbreviation || upcomingGame.awayTeam.name;
        DOMElements.pustahanBetTeamAButton.style.display = 'inline-block';

        DOMElements.pustahanBetTeamBButton.textContent = `Taya sa ${upcomingGame.homeTeam.abbreviation || upcomingGame.homeTeam.name}!`;
        DOMElements.pustahanBetTeamBButton.dataset.betTeamAbbrev = upcomingGame.homeTeam.abbreviation || upcomingGame.homeTeam.name;
        DOMElements.pustahanBetTeamBButton.style.display = 'inline-block';

        DOMElements.featuredGameBetItem.style.display = 'block';

        const gameStatusLower = upcomingGame.status.toLowerCase();
        const isLiveOrFinished = upcomingGame.period > 0 ||
                                 (!gameStatusLower.includes("et") &&
                                 !gameStatusLower.includes("pm") &&
                                 !gameStatusLower.includes("am") &&
                                 gameStatusLower !== "scheduled" && gameStatusLower.trim() !== "");

        if (isLiveOrFinished) {
            // logInfo(`[Pustahan Widget] Game ${upcomingGame.id} is live or finished. Locking bets.`);
            DOMElements.pustahanBetTeamAButton.disabled = true;
            DOMElements.pustahanBetTeamBButton.disabled = true;
            if(DOMElements.pustahanLastCall) {
                DOMElements.pustahanLastCall.textContent = "BETTING CLOSED!";
                DOMElements.pustahanLastCall.style.display = 'block';
            }
        } else {
            // logInfo(`[Pustahan Widget] Game ${upcomingGame.id} is scheduled. Bets open.`);
            DOMElements.pustahanBetTeamAButton.disabled = false;
            DOMElements.pustahanBetTeamBButton.disabled = false;
            if(DOMElements.pustahanLastCall) DOMElements.pustahanLastCall.style.display = 'none';
        }
         // After successfully loading pustahan game, maybe trigger a bot comment
        if (Math.random() < 0.15) { // Lower chance
             triggerGeminiBotComment();
        }
    } catch (error) {
        logError("[Pustahan Widget] Error loading featured game:", error);
        if (DOMElements.pustahanGameMatchup) DOMElements.pustahanGameMatchup.textContent = "Error loading game.";
        DOMElements.featuredGameBetItem.style.display = 'block';
    } finally {
        STATE.isPustahanWidgetLoading = false;
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    logInfo("[Setup] Attaching event listeners...");
    DOMElements.sendChatButton?.addEventListener('click', processChatMessage);
    DOMElements.chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processChatMessage(); }
    });
    DOMElements.shoutOutButton?.addEventListener('click', processShoutOut);
    DOMElements.showRulesLink?.addEventListener('click', toggleTambayRules);
    DOMElements.closeRulesButton?.addEventListener('click', closeTambayRules);
    DOMElements.pustahanBetTeamAButton?.addEventListener('click', (e) => {
        const teamName = e.currentTarget.dataset.betTeamAbbrev || "Team A"; placeBet(teamName);
    });
    DOMElements.pustahanBetTeamBButton?.addEventListener('click', (e) => {
        const teamName = e.currentTarget.dataset.betTeamAbbrev || "Team B"; placeBet(teamName);
    });
    DOMElements.leakedScriptImage?.addEventListener('click', handleLeakedScriptClick);
    DOMElements.curryMouthpieceFrame?.addEventListener('mouseenter', handleCurryMouthpieceHover);
    DOMElements.ironmanVideo?.addEventListener('ended', handleIronmanVideoEnd);
    document.querySelectorAll('.channel-surfing-buttons .channel-btn[data-channel-msg]').forEach(button => {
        const message = button.getAttribute('data-channel-msg');
        button.addEventListener('click', () => handleChannelButtonClick(message));
    });
    logInfo("[Setup] Event listeners attached.");
}

// --- Initialization ---
function init() {
    logInfo("Jhoven's Tambayan Initializing (Modular with Gemini Bots)...");
    setupEventListeners();

    updateGameStatus(); // Conceptual Jumbotron scoreboard
    // setInterval(updateGameStatus, CONFIG.GAME_STATUS_UPDATE_INTERVAL); // Keep commented if not actively using

    loadNbaTicker();
    // setInterval(loadNbaTicker, 60000 * 3); // Keep commented for now

    loadFeaturedPustahanGame();
    // setInterval(loadFeaturedPustahanGame, 60000 * 7); // Keep commented for now

    // If you want the old Pareng AI random thoughts:
    if (CONFIG.RANDOM_AI_INTERJECTION_CHANCE > 0) {
        setInterval(triggerRandomAiInterjection, CONFIG.RANDOM_AI_INTERJECTION_INTERVAL);
    }

    // Periodic trigger for Ka-Tambay Gemini Bots
    setInterval(() => {
        triggerGeminiBotComment(); // Uses global STATE for game and chat context
    }, 45000); // e.g., every 45 seconds

    const welcomeText = "Oy mga Paps! Welcome sa Tambayan! Mas astig na ang usapan, may mga bagong Ka-Tambay AI na makikichismis!";
    displayMessageInChat("Pareng AI", welcomeText, {isAI: true, iconClass: 'fas fa-comments'});
    handleNewChatMessage("Pareng AI", welcomeText); // Add welcome to history

    logInfo("Jhoven's Tambayan Chat Ready! Gemini Ka-Tambay bots are online!");
}

document.addEventListener('DOMContentLoaded', init);