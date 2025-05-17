console.log("Jhoven's Cue Masters' Corner JS - Rack 'em up!");

document.addEventListener('DOMContentLoaded', () => {
    const tableStatusIndicator = document.getElementById('tableStatusIndicator');
    const iWonBtn = document.getElementById('iWonBtn');
    const leaderboardList = document.getElementById('leaderboardList');

    // Conceptual: Change table status (could be random or based on time)
    if (tableStatusIndicator) {
        setInterval(() => {
            const statuses = ["TABLE IS OPEN!", "GAME IN PROGRESS...", "JHOVEN'S TURN!", "WAITING FOR CHALLENGER..."];
            const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
            tableStatusIndicator.textContent = currentStatus;

            if (currentStatus.includes("OPEN") || currentStatus.includes("WAITING")) {
                tableStatusIndicator.style.backgroundColor = "#39ff14"; // Neon Green
                tableStatusIndicator.style.boxShadow = "0 0 10px #39ff14, 0 0 20px #39ff14";
            } else {
                tableStatusIndicator.style.backgroundColor = "#ff007f"; // Neon Pink
                tableStatusIndicator.style.boxShadow = "0 0 10px #ff007f, 0 0 20px #ff007f";
            }
        }, 7000); // Change status every 7 seconds
    }

    // Conceptual "I Won" button
    if (iWonBtn) {
        iWonBtn.addEventListener('click', () => {
            const playerName = prompt("Astig! Sino ang nanalo, Paps? (Enter your name):", "Bilyar Master");
            if (playerName) {
                alert(`Congrats, ${playerName}! Your victory is (conceptually) noted! \nJhoven: "Nice game! Next round, ako naman babawi! Libre mo chichirya ha?"`);
                
                // Add to conceptual leaderboard
                if (leaderboardList) {
                    const newItem = document.createElement('li');
                    newItem.innerHTML = `<i class="fas fa-medal neon-icon-cyan"></i> ${playerName} - Wins: 1 (Bagito pa lang!)`;
                    // Insert before "Your Name Here?" if it exists
                    const placeholderItem = Array.from(leaderboardList.children).find(child => child.textContent.includes("Ikaw Na Susunod?"));
                    if(placeholderItem){
                        leaderboardList.insertBefore(newItem, placeholderItem);
                    } else {
                        leaderboardList.appendChild(newItem);
                    }
                }
            }
        });
    }
});

// Conceptual sound effect player
function playSoundEffect(type) {
    let soundMessage = "";
    switch(type) {
        case 'chalk':
            soundMessage = "*Squeak... Squeak...* (Nag-chalk ng tako!) Ready na sumapol!";
            break;
        case 'break':
            soundMessage = "*KABOOM!* Malakas na break shot 'yan, Paps!";
            break;
        case 'pocket':
            soundMessage = "*Plok!* Pasok ang bola! Galing!";
            break;
        default:
            soundMessage = "Ayos ang tira!";
    }
    alert(soundMessage);
    // In a real app:
    // const audio = new Audio(`sounds/${type}_sound.mp3`);
    // audio.play();
}

// Conceptual Lingo explanation
function showLingo(definition) {
    alert(`Tambay Bilyar Lingo:\n${definition}`);
}