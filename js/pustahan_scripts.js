// js/pustahan_scripts.js
import { CONFIG } from './config.js'; // For backend URL
import { logInfo, logError, logWarn } from './utils.js'; // For logging

document.addEventListener('DOMContentLoaded', () => {
    const nbaBettingBoardsContainer = document.getElementById('nbaBettingBoardsContainer');
    const betSlipModal = document.getElementById('betSlipModal');
    const closeBetModalBtn = document.querySelector('.close-bet-modal'); // Assuming this class is unique
    const betDescModalElement = document.getElementById('betDescModal');
    const betOddsModalElement = document.getElementById('betOddsModal');
    const betAmountInput = document.getElementById('betAmount');
    const potentialWinDisplay = document.getElementById('potentialWinDisplay');
    const confirmBetBtn = document.getElementById('confirmBetBtn');
    const currentBetsList = document.getElementById('currentBetsList');

    let currentSelectedBetDescription = null;
    let currentSelectedOddsValue = 0;
    let currentSelectedGameId = null; // To store game ID for the bet slip

    // --- Logo URL Construction (same as iskedyul_scripts.js) ---
    const getTeamLogoUrl = (teamAbbreviation) => {
        if (!teamAbbreviation) return 'images/teams/tbd.png';
        return `https://cdn.nba.com/logos/nba/teams/ disputa /${teamAbbreviation.toLowerCase()}.svg`; // Verify this pattern
    };

    // --- Bet Slip Modal Functions (Keep and adapt your existing ones) ---
    function openBetSlipModal(betDescription, odds, gameId, teamBettingOnName) {
        currentSelectedBetDescription = betDescription; // e.g., "LAL to Win"
        currentSelectedOddsValue = parseFloat(odds);
        currentSelectedGameId = gameId; // Store for context if needed

        if (betDescModalElement) betDescModalElement.textContent = betDescription;
        if (betOddsModalElement) betOddsModalElement.textContent = odds;
        calculatePotentialWin();
        if (betSlipModal) betSlipModal.style.display = "flex";
    }

    function closeBetSlipModal() {
        if (betSlipModal) betSlipModal.style.display = "none";
    }

    function calculatePotentialWin() {
        if (!betAmountInput || !potentialWinDisplay || !currentSelectedOddsValue) return;
        const amount = parseFloat(betAmountInput.value);
        if (!isNaN(amount) && amount >= 10 && currentSelectedOddsValue > 0) {
            const potential = (amount * currentSelectedOddsValue).toFixed(0);
            potentialWinDisplay.textContent = potential;
        } else {
            potentialWinDisplay.textContent = "--";
        }
    }

    function confirmBet() {
        if (!betAmountInput || !currentSelectedBetDescription) return;
        const amount = parseFloat(betAmountInput.value);
        if (isNaN(amount) || amount < 10) {
            alert("Minimum taya ay 10 Chichirya Points, Paps!");
            return;
        }

        const tambayBetMessages = [ /* ... your existing messages ... */ ];
        alert(tambayBetMessages[Math.floor(Math.random() * tambayBetMessages.length)]
            .replace('${amount}', amount)
            .replace('${betDescription}', currentSelectedBetDescription)
        );
        
        if (currentBetsList) {
            const noBetsLi = currentBetsList.querySelector('.no-bets');
            if (noBetsLi) noBetsLi.remove();
            const betLi = document.createElement('li');
            betLi.innerHTML = `<strong>${currentSelectedBetDescription}</strong> - Taya: ${amount}pts @ ${currentSelectedOddsValue} (Win: ${(amount * currentSelectedOddsValue).toFixed(0)}pts)`;
            currentBetsList.appendChild(betLi);
        }
        closeBetSlipModal();
    }

    // Add event listeners for existing modal elements
    if (closeBetModalBtn) closeBetModalBtn.addEventListener('click', closeBetSlipModal);
    if (confirmBetBtn) confirmBetBtn.addEventListener('click', confirmBet);
    if (betAmountInput) betAmountInput.addEventListener('input', calculatePotentialWin);
    window.addEventListener('click', (event) => {
        if (betSlipModal && event.target == betSlipModal) {
            closeBetSlipModal();
        }
    });


    // --- NEW: Fetch Games and Odds, then Render Betting Boards ---
    async function loadBettableGamesAndOdds() {
        if (!nbaBettingBoardsContainer) {
            logError("[Pustahan] nbaBettingBoardsContainer element not found!");
            return;
        }
        nbaBettingBoardsContainer.innerHTML = `
            <div class="loading-message-pustahan">
                <p><i class="fas fa-spinner fa-spin"></i> Naghahanap ng bakbakan para tayaan...</p>
            </div>`;

        let sportsApiBaseUrl = CONFIG.SPORTS_DATA_BACKEND_BASE_URL || '';
        if (!sportsApiBaseUrl && CONFIG.AI_BACKEND_API_URL) {
            try {
                const urlObject = new URL(CONFIG.AI_BACKEND_API_URL);
                sportsApiBaseUrl = `${urlObject.protocol}//${urlObject.host}`;
            } catch (e) { logError("[Pustahan] Invalid AI_BACKEND_API_URL."); return; }
        }
        if (!sportsApiBaseUrl) { logError("[Pustahan] Backend URL not configured."); return; }

        // Fetch games (e.g., today and tomorrow)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        const gamesApiUrl = `${sportsApiBaseUrl}/api/nba/schedule-detailed?startDate=${formatDate(today)}&endDate=${formatDate(tomorrow)}`;
        logInfo(`[Pustahan] Fetching games from: ${gamesApiUrl}`);

        try {
            const gamesResponse = await fetch(gamesApiUrl);
            if (!gamesResponse.ok) throw new Error(`Failed to fetch games: ${gamesResponse.status}`);
            const scheduleData = await gamesResponse.json();

            if (scheduleData.games && scheduleData.games.length > 0) {
                nbaBettingBoardsContainer.innerHTML = ''; // Clear loading

                for (const game of scheduleData.games) {
                    // Filter out games that are already final
                    if (game.status && (game.status.toLowerCase().includes("final") || game.status.toLowerCase().includes("finished"))) {
                        continue; // Skip to next game
                    }

                    const gameBoard = document.createElement('div');
                    gameBoard.classList.add('betting-board');
                    gameBoard.dataset.gameId = game.id;

                    const gameDateForOdds = (game.datetime || game.date).split('T')[0];
                    const oddsApiUrl = `${sportsApiBaseUrl}/api/nba/game-odds/${game.id}?date=${gameDateForOdds}`;
                    let gameOdds = { homeWin: 1.90, awayWin: 1.90, vendor: "Tambayan Default" }; // Default
                    try {
                        const oddsResponse = await fetch(oddsApiUrl);
                        if (oddsResponse.ok) {
                            gameOdds = await oddsResponse.json();
                        } else {
                            logWarn(`[Pustahan] No/failed odds for game ${game.id}. Using default/simulated.`);
                        }
                    } catch (err) {
                        logError(`[Pustahan] Error fetching odds for game ${game.id}`, err);
                    }
                    
                    const homeLogo = getTeamLogoUrl(game.homeTeam.abbreviation);
                    const awayLogo = getTeamLogoUrl(game.awayTeam.abbreviation);
                    const gameTimePHT = new Date(game.datetime).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });

                    gameBoard.innerHTML = `
                        <div class="game-matchup">
                            <div class="team-info-bet">
                                <img src="${awayLogo}" alt="${game.awayTeam.name} Logo" class="team-logo-pustahan" onerror="this.src='images/teams/tbd.png'; this.onerror=null;">
                                ${game.awayTeam.name}
                            </div>
                            <div class="vs-indicator-bet">VS <span class="game-datetime-bet">${game.date} - ${gameTimePHT}</span></div>
                            <div class="team-info-bet">
                                <img src="${homeLogo}" alt="${game.homeTeam.name} Logo" class="team-logo-pustahan" onerror="this.src='images/teams/tbd.png'; this.onerror=null;">
                                ${game.homeTeam.name}
                            </div>
                        </div>
                        <div class="bet-options-grid">
                            <div class="bet-type-block">
                                <h4>Mananalo? (Moneyline)</h4>
                                <button class="bet-option moneyline-bet" 
                                        data-bet-desc="${game.awayTeam.name} to Win" 
                                        data-odds="${gameOdds.awayWin?.toFixed(2) || '1.90'}" 
                                        data-game-id="${game.id}" 
                                        data-team-name="${game.awayTeam.name}">
                                    ${game.awayTeam.abbreviation || game.awayTeam.name} 
                                    <span class="odds">(Odds: ${gameOdds.awayWin?.toFixed(2) || '1.90'})</span>
                                </button>
                                <button class="bet-option moneyline-bet" 
                                        data-bet-desc="${game.homeTeam.name} to Win" 
                                        data-odds="${gameOdds.homeWin?.toFixed(2) || '1.90'}" 
                                        data-game-id="${game.id}" 
                                        data-team-name="${game.homeTeam.name}">
                                    ${game.homeTeam.abbreviation || game.homeTeam.name} 
                                    <span class="odds">(Odds: ${gameOdds.homeWin?.toFixed(2) || '1.90'})</span>
                                </button>
                            </div>
                            <!-- Add Spread and Over/Under later if odds API supports them and you upgrade tier -->
                        </div>
                        <div class="game-betting-status" id="status-game-${game.id}">
                            <!-- Betting lock status will be updated here -->
                        </div>
                    `;
                    nbaBettingBoardsContainer.appendChild(gameBoard);

                    // Betting Lock Logic
                    const statusDisplay = gameBoard.querySelector(`#status-game-${game.id}`);
                    const betButtons = gameBoard.querySelectorAll('.bet-option');
                    const gameStatusLower = game.status.toLowerCase();
                    const isLiveOrAboutToStartSoon = game.period > 0 ||
                                     (!gameStatusLower.includes("et") &&
                                     !gameStatusLower.includes("pm") &&
                                     !gameStatusLower.includes("am") &&
                                     gameStatusLower !== "scheduled"); // More checks for BallDontLie specific statuses needed

                    if (isLiveOrAboutToStartSoon) {
                        betButtons.forEach(btn => btn.disabled = true);
                        if(statusDisplay) statusDisplay.innerHTML = `<p class="bets-locked"><i class="fas fa-lock"></i> Betting Locked for this game!</p>`;
                    } else {
                         if(statusDisplay) statusDisplay.innerHTML = `<p class="bets-open"><i class="fas fa-unlock"></i> Bets Open!</p>`;
                    }
                }

                // Add event listeners to all newly created bet-option buttons
                document.querySelectorAll('#nbaBettingBoardsContainer .bet-option').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const btn = event.currentTarget;
                        openBetSlipModal(
                            btn.dataset.betDesc,
                            btn.dataset.odds,
                            btn.dataset.gameId,
                            btn.dataset.teamName // Pass team name for context if needed
                        );
                    });
                });

            } else {
                nbaBettingBoardsContainer.innerHTML = '<div class="no-games-found"><p><i class="fas fa-search-dollar"></i> Walang mahanap na laban para tayaan ngayon, Paps! Check mo ulit mamaya.</p></div>';
            }
        } catch (error) {
            logError("[Pustahan] Error loading bettable games:", error);
            nbaBettingBoardsContainer.innerHTML = `<div class="error-message-pustahan"><p><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</p></div>`;
        }
    }

    // Initial Load
    loadBettableGamesAndOdds();
    // Optional: Auto-refresh (VERY CAREFUL WITH API LIMITS on free tier)
    // setInterval(loadBettableGamesAndOdds, 60000 * 5); // e.g., every 5 minutes
});