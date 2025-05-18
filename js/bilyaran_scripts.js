console.log("Jhoven's Cue Masters' Corner JS - Rack 'em up!");

document.addEventListener('DOMContentLoaded', () => {
    const tableStatusIndicator = document.getElementById('tableStatusIndicator');
    const iWonBtn = document.getElementById('iWonBtn');
    const leaderboardList = document.getElementById('leaderboardList');
    const fullscreenBilliardsBtn = document.getElementById('fullscreenBilliardsBtn');
    const gameIframe = document.getElementById('jsbilliards-game-iframe');

    if (fullscreenBilliardsBtn && gameIframe) {
        fullscreenBilliardsBtn.addEventListener('click', () => {
            if (gameIframe.requestFullscreen) {
                gameIframe.requestFullscreen();
            } else if (gameIframe.mozRequestFullScreen) { /* Firefox */
                gameIframe.mozRequestFullScreen();
            } else if (gameIframe.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                gameIframe.webkitRequestFullscreen();
            } else if (gameIframe.msRequestFullscreen) { /* IE/Edge */
                gameIframe.msRequestFullscreen();
            } else {
                alert("Sorry, Paps! 'Di kaya ng browser mo 'tong Fullscreen magic ni Jhoven. Try mo ibang browser!");
            }
        });
    }
    if (tableStatusIndicator) {
        const statuses = [
            "TABLE IS OPEN! TARA!", 
            "GAME IN PROGRESS... Wag maingay!", 
            "JHOVEN'S TURN! (Wag guluhin, baka ma-scratch!)", 
            "WAITING FOR CHALLENGER... Sino matapang?",
            "CLEANING THE TABLE... Saglit lang, Paps!",
            "8-BALL SHOT! KAKABA!"
        ];
        let currentStatusIndex = 0;
        
        function updateTableStatus() {
            currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
            tableStatusIndicator.textContent = statuses[currentStatusIndex];
            tableStatusIndicator.classList.remove('status-open', 'status-progress');

            if (statuses[currentStatusIndex].includes("OPEN") || statuses[currentStatusIndex].includes("WAITING")) {
                tableStatusIndicator.style.backgroundColor = "#39ff14"; // Neon Green
                tableStatusIndicator.style.boxShadow = "0 0 10px #39ff14, 0 0 20px #39ff14";
                tableStatusIndicator.classList.add('status-open');
            } else {
                tableStatusIndicator.style.backgroundColor = "#ff007f"; // Neon Pink
                tableStatusIndicator.style.boxShadow = "0 0 10px #ff007f, 0 0 20px #ff007f";
                 tableStatusIndicator.classList.add('status-progress');
            }
        }
        setInterval(updateTableStatus, 6000); // Change status every 6 seconds
        updateTableStatus(); // Initial call
    }

    if (iWonBtn) {
        iWonBtn.addEventListener('click', () => {
            const playerName = prompt("Astig! Sino ang nanalo, Paps? (Enter your Tambayan Name):", "Bilyarista Ng Taon");
            if (playerName && playerName.trim() !== "") {
                const winMessages = [
                    `Congrats, ${playerName}! Your victory is (conceptually) noted! \nJhoven: "Nice game! Next round, ako naman babawi! Libre mo chichirya ha?"`,
                    `Woot woot! Panalo si ${playerName}! Galing! Baka ikaw na ang bagong Efren "Bata" ng Tambayan!`,
                    `${playerName} for the win! Ang tindi ng tira mo, Paps! Pang-world class!`
                ];
                alert(winMessages[Math.floor(Math.random() * winMessages.length)]);
                
                if (leaderboardList) {
                    const newItem = document.createElement('li');
                    const randomWins = Math.floor(Math.random() * 20) + 1; // Random wins for fun
                    newItem.innerHTML = `<i class="fas fa-medal neon-icon-cyan"></i> ${playerName.trim()} - Wins: ${randomWins} (New Challenger!)`;
                    
                    const placeholderItem = Array.from(leaderboardList.children).find(child => child.textContent.includes("Ikaw Na Susunod?"));
                    if(placeholderItem){
                        leaderboardList.insertBefore(newItem, placeholderItem);
                    } else {
                        leaderboardList.appendChild(newItem);
                    }
                    // Limit leaderboard items for display
                    while(leaderboardList.children.length > 6 && placeholderItem){ // Keep placeholder and 5 others
                        leaderboardList.removeChild(leaderboardList.children[leaderboardList.children.length - 2]); // Remove second to last if placeholder exists
                    }
                }
            } else {
                alert("Lagay mo pangalan mo, Paps, para ma-recognize ang galing mo!");
            }
        });
    }
});

function playSoundEffect(type) {
    let soundMessage = "";
    const tambaySounds = {
        chalk: [
            "*Squeak... Squeak...* (Nag-chalk ng tako!) Ready na sumapol!",
            "Chalk muna, para sure ball ang tira!",
            "Pampagaling ng tira: Konting chalk, maraming dasal!"
        ],
        break: [
            "*KABOOM!* Malakas na break shot 'yan, Paps! Sabog ang mga bola!",
            "BREAK IT DOWN! Parang dance floor lang!",
            "AYAN NA! Opening salvo! Good luck sa lahat!"
        ],
        pocket: [
            "*Plok!* Pasok ang bola! Galing! Isa pa!",
            "Nice shot! Parang si Efren Bata Reyes!",
            "Boom, Panes! Ball in the pocket!"
        ]
    };

    if (tambaySounds[type]) {
        soundMessage = tambaySounds[type][Math.floor(Math.random() * tambaySounds[type].length)];
    } else {
        soundMessage = "Ayos ang tira!";
    }
    alert(soundMessage);
}

function showLingo(definition) {
    // Could replace this with a styled tooltip or small modal in the future
    alert(`Tambayan Bilyar Lingo:\n\n${definition}`);
}