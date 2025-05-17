console.log("Jhoven's Tambayan Iskedyul Scripts - Ready na sa Bakbakan!");

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.schedule-filters .filter-btn');
    const scheduleGrid = document.getElementById('scheduleGrid');
    const gameDayPanels = scheduleGrid ? Array.from(scheduleGrid.querySelectorAll('.schedule-date-panel')) : [];

    // Function to get today's date in YYYY-MM-DD format for comparison
    function getFormattedDate(date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        return year + '-' + month + '-' + day;
    }
    const todayFormatted = getFormattedDate(new Date());

    function filterSchedule(filterType) {
        console.log("Filtering by:", filterType); // Debug log

        // Active button state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filter-btn[onclick="filterSchedule('${filterType}')"]`).classList.add('active');

        gameDayPanels.forEach(panel => {
            let panelVisible = false;
            const panelDate = panel.dataset.dateGroup;
            const gamesInPanel = panel.querySelectorAll('.game-schedule-item');
            let visibleGamesInPanel = 0;

            gamesInPanel.forEach(game => {
                const gameDateTimeStr = game.dataset.datetime; // e.g., "2025-05-17T03:00:00"
                const gameDateStr = gameDateTimeStr.substring(0, 10);
                const statusIndicator = game.querySelector('.status-text');
                let showGame = false;

                if (filterType === 'all') {
                    showGame = true;
                } else if (filterType === 'today') {
                    if (gameDateStr === todayFormatted) {
                        showGame = true;
                    }
                } else if (filterType === 'upcoming') {
                    if (gameDateStr >= todayFormatted && (!statusIndicator || !statusIndicator.classList.contains('past'))) {
                        // Show if game date is today or future, AND it's not marked as 'past'
                        // (Assuming 'live' games on 'today' should still be shown as upcoming if not explicitly 'past')
                        showGame = true;
                    }
                }
                // Add more filters like 'past' or by team later if needed

                if (showGame) {
                    game.style.display = 'grid'; // Or your default display for game items
                    panelVisible = true;
                    visibleGamesInPanel++;
                } else {
                    game.style.display = 'none';
                }
            });

            if (panelVisible && visibleGamesInPanel > 0) {
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });
         // Check if any panels are visible at all
        const anyPanelVisible = gameDayPanels.some(panel => panel.style.display === 'block');
        if (!anyPanelVisible && scheduleGrid.querySelector('.no-games-message')) {
            scheduleGrid.querySelector('.no-games-message').remove(); // Remove old message if any
        }

        if (!anyPanelVisible) {
            let noGamesMsg = scheduleGrid.querySelector('.no-games-message');
            if (!noGamesMsg) {
                noGamesMsg = document.createElement('p');
                noGamesMsg.classList.add('no-games-message', 'neon-text-effect');
                scheduleGrid.appendChild(noGamesMsg);
            }
            noGamesMsg.textContent = `Wala pang laro para sa filter na "${filterType}", Paps! Try mo 'Lahat ng Laro'.`;
        }

    }
    window.filterSchedule = filterSchedule; // Make it globally accessible for inline onclick

    // Initial filter (e.g., show 'all' or 'today')
    filterSchedule('all');

});