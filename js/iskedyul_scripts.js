// js/iskedyul_scripts.js
import { CONFIG } from './config.js'; // Assuming you want to use base URL from config
import { logInfo, logError } from './utils.js'; // For logging

document.addEventListener('DOMContentLoaded', () => {
    const scheduleGrid = document.getElementById('scheduleGrid');
    const dateRangeStartInput = document.getElementById('dateRangeStart');
    const dateRangeEndInput = document.getElementById('dateRangeEnd');
    const filterDateRangeBtn = document.getElementById('filterDateRangeBtn');

    // Function to construct NBA.com logo URL (may be unreliable, use with caution)
    // You might want to map abbreviations to your own local image files for reliability.
    const getTeamLogoUrl = (teamAbbreviation) => {
        if (!teamAbbreviation) return 'images/teams/tbd.png'; // Default TBD logo
        // This is a common pattern, but verify it or use your own local logos
        return `https://cdn.nba.com/logos/nba/teams/ disputa /${teamAbbreviation.toLowerCase()}.svg`;
        // Alternative if the above doesn't work or if you prefer nba.com/stats:
        // return `https://www.nba.com/stats/media/img/logos/teams-seo/${teamAbbreviation.toUpperCase()}.svg`;
    };
    
    // Function to get arena (simplistic: home team city if arena not available)
    const getArenaInfo = (game) => {
        // BallDontLie /games doesn't provide arena. We'll use home city for now.
        // A better approach would be to fetch /teams data once, cache it, and look up city.
        return game.homeTeam.name.split(' ').slice(0, -1).join(' ') || 'TBD Venue'; // Extracts city from "Los Angeles Lakers" -> "Los Angeles"
    }


    async function fetchAndDisplaySchedule(startDate, endDate) {
        if (!scheduleGrid) {
            logError("[Iskedyul] scheduleGrid element not found!");
            return;
        }
        scheduleGrid.innerHTML = `
            <div class="loading-message-iskedyul">
                <p><i class="fas fa-spinner fa-spin"></i> Naglo-load ng iskedyul para sa piniling petsa...</p>
            </div>`;

        let sportsApiBaseUrl = CONFIG.SPORTS_DATA_BACKEND_BASE_URL || '';
        if (!sportsApiBaseUrl && CONFIG.AI_BACKEND_API_URL) {
            try {
                const urlObject = new URL(CONFIG.AI_BACKEND_API_URL);
                sportsApiBaseUrl = `${urlObject.protocol}//${urlObject.host}`;
            } catch (e) { logError("[Iskedyul] Invalid AI_BACKEND_API_URL."); return; }
        }
        if (!sportsApiBaseUrl) { logError("[Iskedyul] Backend URL not configured."); return; }

        let scheduleApiUrl = `${sportsApiBaseUrl}/api/nba/schedule-detailed`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) scheduleApiUrl += `?${params.toString()}`;

        logInfo(`[Iskedyul] Fetching schedule from: ${scheduleApiUrl}`);

        try {
            const response = await fetch(scheduleApiUrl);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || 'Failed to fetch schedule'}`);
            }
            const scheduleData = await response.json(); // Expects { games: [], meta: {} }

            if (scheduleData.games && scheduleData.games.length > 0) {
                renderSchedule(scheduleData.games);
            } else {
                scheduleGrid.innerHTML = '<div class="no-games-found"><p><i class="fas fa-ghost"></i> Walang laro sa piniling petsa, Paps! Try mo ibang date.</p></div>';
            }
        } catch (error) {
            logError("[Iskedyul] Error fetching or displaying schedule:", error);
            scheduleGrid.innerHTML = `<div class="error-message-iskedyul"><p><i class="fas fa-exclamation-triangle"></i> Oops! Nagka-aberya: ${error.message}. Try mo ulit maya-maya.</p></div>`;
        }
    }

    function renderSchedule(games) {
        scheduleGrid.innerHTML = ''; // Clear previous content or loading message
        const gamesByDate = {};

        games.forEach(game => {
            const gameDateKey = game.date; // YYYY-MM-DD from BallDontLie
            if (!gamesByDate[gameDateKey]) {
                gamesByDate[gameDateKey] = [];
            }
            gamesByDate[gameDateKey].push(game);
        });

        Object.keys(gamesByDate).sort().forEach(dateKey => {
            const gamesOnDate = gamesByDate[dateKey];
            const dateObj = new Date(dateKey + "T00:00:00"); // Ensure correct date parsing for formatting
            
            const datePanel = document.createElement('div');
            datePanel.classList.add('schedule-date-panel');
            datePanel.dataset.dateGroup = dateKey;

            const dateHeader = document.createElement('h3');
            dateHeader.classList.add('date-header');
            const dayOfWeek = dateObj.toLocaleDateString('en-PH', { weekday: 'long', timeZone: 'Asia/Manila' });
            dateHeader.innerHTML = `${dateObj.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })} 
                                <span class="day-of-week">(${dayOfWeek} sa Pinas!)</span>`;
            datePanel.appendChild(dateHeader);

            gamesOnDate.sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).forEach(game => {
                const gameItem = document.createElement('div');
                gameItem.classList.add('game-schedule-item');
                if (game.status.toLowerCase().includes("live") || (game.period > 0 && !game.status.toLowerCase().includes("final"))) {
                    gameItem.classList.add('featured-match'); // Highlight live games
                }
                gameItem.dataset.datetime = game.datetime;

                const gameTimePHT = new Date(game.datetime).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
                
                let statusText = game.status;
                let statusClass = 'upcoming'; // Default
                if (statusText === "Final" || (game.period >= 4 && game.time && game.time.trim() === "")) {
                    statusText = `Final: ${game.awayTeam.score} - ${game.homeTeam.score}`;
                    statusClass = 'past';
                } else if (game.period > 0) {
                    statusText = `LIVE: Q${game.period} ${game.time.trim() || ''} (${game.awayTeam.score} - ${game.homeTeam.score})`;
                    statusClass = 'live blink-live';
                } else { // Scheduled
                    statusText = `Scheduled ${gameTimePHT}`;
                }

                // Construct logo URLs (EXAMPLE - verify pattern or use local mapping)
                const homeLogo = getTeamLogoUrl(game.homeTeam.abbreviation);
                const awayLogo = getTeamLogoUrl(game.awayTeam.abbreviation);

                gameItem.innerHTML = `
                    <div class="team-info team-a">
                        <img src="${awayLogo}" alt="${game.awayTeam.name} Logo" class="team-logo-sched" onerror="this.src='images/teams/tbd.png'; this.onerror=null;">
                        <span class="team-name">${game.awayTeam.name}</span>
                    </div>
                    <div class="game-details">
                        <span class="game-time">${gameTimePHT}</span>
                        <span class="vs-neon">VS</span>
                        <span class="game-arena">@ ${getArenaInfo(game)}</span>
                    </div>
                    <div class="team-info team-b">
                        <img src="${homeLogo}" alt="${game.homeTeam.name} Logo" class="team-logo-sched" onerror="this.src='images/teams/tbd.png'; this.onerror=null;">
                        <span class="team-name">${game.homeTeam.name}</span>
                    </div>
                    <div class="game-status-indicator">
                        <span class="status-text ${statusClass}">${statusText}</span>
                        ${(statusClass.includes('live')) ? `<a href="index.html#nba-stream-section" class="watch-now-btn neon-button-alt">Watch Now!</a>` : ''}
                        ${(statusClass === 'past') ? `<a href="zapisi.html#${game.awayTeam.abbreviation}vs${game.homeTeam.abbreviation}_${game.date.replace(/-/g,'')}" class="replay-link">Replay?</a>` : ''}
                    </div>
                `;
                datePanel.appendChild(gameItem);
            });
            scheduleGrid.appendChild(datePanel);
        });
    }

    function handleFilterButtonClick() {
        const startDate = dateRangeStartInput.value; // YYYY-MM-DD
        const endDate = dateRangeEndInput.value;   // YYYY-MM-DD

        if (!startDate && !endDate) {
            // Fetch default range (e.g., next 7 days, handled by backend if no params)
            fetchAndDisplaySchedule();
        } else if (startDate && !endDate) {
            // Fetch from startDate to a week from startDate
            const start = new Date(startDate + "T00:00:00");
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            fetchAndDisplaySchedule(startDate, end.toISOString().split('T')[0]);
        } else if (!startDate && endDate) {
            // Fetch from a week before endDate up to endDate
            const end = new Date(endDate + "T00:00:00");
            const start = new Date(end);
            start.setDate(end.getDate() - 7);
            fetchAndDisplaySchedule(start.toISOString().split('T')[0], endDate);
        } else { // Both startDate and endDate are provided
            fetchAndDisplaySchedule(startDate, endDate);
        }
    }
    
    // Set default date range for inputs (e.g., today to 7 days from now)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const formatDateForInput = (date) => date.toISOString().split('T')[0];

    if (dateRangeStartInput) dateRangeStartInput.value = formatDateForInput(today);
    if (dateRangeEndInput) dateRangeEndInput.value = formatDateForInput(nextWeek);


    // Event Listeners
    if (filterDateRangeBtn) {
        filterDateRangeBtn.addEventListener('click', handleFilterButtonClick);
    }

    // Initial load
    handleFilterButtonClick(); // Load with default date range
     // Auto-refresh schedule (be mindful of API limits)
    // setInterval(handleFilterButtonClick, 60000 * 10); // Refresh every 10 minutes for example
});