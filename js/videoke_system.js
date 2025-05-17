console.log("Jhoven's Sing-Galing Videoke System JS Loaded - Birit Na!");

// --- DOM Elements ---
const creditsDisplay = document.getElementById('credits');
const insertCoinBtn = document.getElementById('insertCoinBtn');
const songSearchInput = document.getElementById('songSearch');
const songListDisplay = document.getElementById('songList');
const songQueueDisplay = document.getElementById('songQueue');
const youtubePlayer = document.getElementById('youtubePlayer');
const currentSingerDisplay = document.getElementById('currentSingerDisplay').querySelector('.singer-name');
const nextSongDisplay = document.getElementById('nextSongDisplay').querySelector('.next-song-title');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreMessage = document.getElementById('scoreMessage');
const passMicBtn = document.getElementById('passMicBtn');
const pulutanBreakBtn = document.getElementById('pulutanBreakBtn');
const pulutanModal = document.getElementById('pulutanModal');

// --- State Variables (Conceptual) ---
let currentCredits = 0;
const songCost = 1; // Each song costs 1 credit (5 pesos)
let songQueue = [];
let songbook = {
    opm: [
        { code: "00101", title: "Pusong Bato", artist: "Alon", videoId: "w2Kz25t0JI8" },
        { code: "00102", title: "Narda", artist: "Kamikazee", videoId: "uJV0avAF_FU" }, // Example playlist link
        { code: "00103", title: "Halik", artist: "Aegis", videoId: "AN5_Zi0nLGU" },
        { code: "00104", title: "Beer", artist: "Itchyworms", videoId: "C8twukz-0g0" },
        { code: "00105", title: "Huling El Bimbo", artist: "Eraserheads", videoId: "1hAmBPNhaFs" }
    ],
    english: [
        { code: "00201", title: "Bohemian Rhapsody", artist: "Queen", videoId: "9Lxm0iSnKNc" },
        { code: "00202", title: "Hotel California", artist: "Eagles", videoId: "_ig_f00hp-M" },
        { code: "00203", title: "My Heart Will Go On", artist: "Celine Dion", videoId: "cdgU8YmD3Kc" },
        { code: "00204", title: "I Will Always Love You", artist: "Whitney Houston", videoId: "8kotNQ07ZEw" }
    ],
    new: [
        { code: "00301", title: "Paubaya", artist: "Moira Dela Torre", videoId: "aesl1tKqxUE" },
        { code: "00302", title: "Kathang Isip", artist: "Ben&Ben", videoId: "4RTKcnMQUtA" },
        { code: "00303", title: "Come What May", artist: "Air Supply", videoId: "2PG44qyJeRA"}
    ],
    jhovens: [
        { code: "00901", title: "Never Gonna Give You Up", artist: "Rick Astley", videoId: "8leAAwMIigI" },
        { code: "00902", title: "Chandelier (Karaoke Version)", artist: "Sia", videoId: "H3SLTzySlCU" },
        { code: "00903", title: "My Way", artist: "Frank Sinatra", videoId: "ec7qAHxBt-z4" }
    ]
};

// --- Functions ---

// Simulates inserting a coin
function insertCoin() {
    currentCredits += 1; // Each click adds 1 credit (representing 5 pesos)
    updateCreditsDisplay();
    playCoinSound(); // Conceptual sound
    alert("₱5 Hulog! Salamat, Suki! Credits: " + currentCredits);
}

function updateCreditsDisplay() {
    creditsDisplay.textContent = currentCredits;
}

function playCoinSound() {
    // In a real app, you'd use <audio> element or Web Audio API
    console.log("*Ka-ching!*"); // Placeholder
}

// Displays songs for a category
function showSongCategory(category) {
    const songs = songbook[category] || [];
    songListDisplay.innerHTML = ''; // Clear previous list

    if (songs.length === 0) {
        songListDisplay.innerHTML = '<p class="no-songs">Walang kanta dito, paps! Try mo ibang category.</p>';
        return;
    }

    songs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.classList.add('song-list-item');
        songItem.innerHTML = `
            <div class="song-info">
                <span class="code">[${song.code}]</span>
                <span class="title">${song.title}</span>
                <span class="artist">${song.artist}</span>
            </div>
            <button class="select-song-btn neon-button-alt" onclick="selectSong('${song.code}', '${song.title}', '${song.artist}', '${song.videoId}')">RESERBA!</button>
        `;
        songListDisplay.appendChild(songItem);
    });

    // Active tab styling
    document.querySelectorAll('.songbook-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.songbook-tab-btn[onclick="showSongCategory('${category}')"]`).classList.add('active');
}

// Simulates selecting a song
function selectSong(code, title, artist, videoId) {
    if (currentCredits >= songCost) {
        currentCredits -= songCost;
        updateCreditsDisplay();

        const singerName = prompt("Ilagay ang pangalan ng Singer (o pangalan ng tropa mo):", "Tambay Idol") || "Mystery Singer";

        songQueue.push({ code, title, artist, videoId, singer: singerName });
        updateSongQueueDisplay();
        playNextSongIfIdle();
        alert(`"${title}" by ${artist} ni-reserve mo na! Credits left: ${currentCredits}`);
    } else {
        alert("Kulang ang credits, boss! Hulog ka muna ng ₱" + (songCost * 5) + "!");
    }
}

// Updates the "Reserved Songs" display
function updateSongQueueDisplay() {
    songQueueDisplay.innerHTML = '';
    if (songQueue.length === 0) {
        songQueueDisplay.innerHTML = '<li class="empty-queue">Wala pang naka-reserve. Mauna ka na!</li>';
        nextSongDisplay.textContent = "Wala pa... Pili na!";
        return;
    }
    songQueue.forEach((song, index) => {
        const queueItem = document.createElement('li');
        queueItem.innerHTML = `
            <span class="queued-title">${index + 1}. ${song.title}</span>
            <span class="queued-singer"> - ${song.singer} (${song.artist})</span>
        `;
        songQueueDisplay.appendChild(queueItem);
    });
    if(songQueue.length > 0 && !youtubePlayer.src.includes(songQueue[0].videoId)){ // if not currently playing the first in queue
        nextSongDisplay.textContent = songQueue[0].title + " by " + songQueue[0].singer;
    } else if (songQueue.length > 1) {
        nextSongDisplay.textContent = songQueue[1].title + " by " + songQueue[1].singer;
    } else {
         nextSongDisplay.textContent = "Wala nang kasunod... Reserve pa!";
    }
}


// Simulates playing the next song
function playNextSongIfIdle() {
    // This is highly conceptual. A real player would have events for "ended".
    // We're checking if the current player source is the default one.
    if (songQueue.length > 0 && (youtubePlayer.src.includes("2PG44qyJeRA") || !youtubePlayer.src.includes("youtube.com/embed/"))) {
        playSongFromQueue();
    }
}

function playSongFromQueue() {
    if (songQueue.length > 0) {
        const nextSong = songQueue[0]; // Get the first song, don't remove yet
        youtubePlayer.src = `https://www.youtube.com/embed/${nextSong.videoId}?autoplay=1&enablejsapi=1`;
        currentSingerDisplay.textContent = nextSong.singer;
        // Don't shift from queue until "song end" or "pass mic"
        updateSongQueueDisplay(); // Update next song display
    } else {
        youtubePlayer.src = "https://www.youtube.com/embed/2PG44qyJeRA?autoplay=0&enablejsapi=1"; // Default standby
        currentSingerDisplay.textContent = "Tambayan Standby";
        nextSongDisplay.textContent = "Wala pa... Pili na!";
        scoreDisplay.textContent = "--";
        scoreMessage.textContent = "Pili na ng kanta!";
    }
}

// Conceptual: Call this when a song "ends"
// For a real YouTube embed, you'd use the YouTube Iframe Player API to detect song end.
function handleSongEnd() {
    console.log("Song conceptually ended.");
    displayRandomScore();
    if (songQueue.length > 0) {
        songQueue.shift(); // Now remove the song that just played
    }
    updateSongQueueDisplay();
    playSongFromQueue(); // Play next, or reset to default
}

// Simulates a random score
function displayRandomScore() {
    const score = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // Score between 50 and 100
    scoreDisplay.textContent = score;
    let feedback = "";
    if (score >= 95) feedback = "Ayos! Pang-Tawag ng Tanghalan! 🎤🌟";
    else if (score >= 85) feedback = "Pwede na! May potential ka, idol!";
    else if (score >= 70) feedback = "Okay lang, effort counts! Bawi next time!";
    else feedback = "Sintunado, pre/sis! Practice pa more! Next! 🤣";
    scoreMessage.textContent = feedback;
}

// Searches songs (very basic)
function searchSongs() {
    const searchTerm = songSearchInput.value.toLowerCase();
    songListDisplay.innerHTML = '';
    let found = false;
    for (const category in songbook) {
        songbook[category].forEach(song => {
            if (song.title.toLowerCase().includes(searchTerm) || song.artist.toLowerCase().includes(searchTerm) || song.code.includes(searchTerm)) {
                const songItem = document.createElement('div');
                songItem.classList.add('song-list-item');
                songItem.innerHTML = `
                    <div class="song-info">
                        <span class="code">[${song.code}]</span>
                        <span class="title">${song.title}</span>
                        <span class="artist">${song.artist}</span>
                    </div>
                    <button class="select-song-btn neon-button-alt" onclick="selectSong('${song.code}', '${song.title}', '${song.artist}', '${song.videoId}')">RESERBA!</button>
                `;
                songListDisplay.appendChild(songItem);
                found = true;
            }
        });
    }
    if (!found) {
        songListDisplay.innerHTML = '<p class="no-songs">Sorry, wala sa listahan ni Jhoven yan. Try mo iba.</p>';
    }
}

// "Pass the Mic" functionality
function passTheMic() {
    if (songQueue.length > 0) {
        const passedSong = songQueue.shift(); // Remove current song from queue
        alert(`MIC PASSED! Next na si ${songQueue.length > 0 ? songQueue[0].singer : 'Mystery Singer'}!`);
        updateSongQueueDisplay();
        playSongFromQueue(); // Play the new "next" song
    } else {
        alert("Walang naka-reserve para i-pass ang mic!");
    }
    scoreDisplay.textContent = "--";
    scoreMessage.textContent = "Pili na ng kanta!";
}

// "Pulutan Break"
function showPulutanBreak() {
    pulutanModal.style.display = "flex";
}

function closePulutanModal() {
    pulutanModal.style.display = "none";
}

// Audience Reactions
function showReaction(emoji) {
    const reactionPopup = document.createElement('div');
    reactionPopup.classList.add('reaction-popup');
    reactionPopup.textContent = emoji;
    document.body.appendChild(reactionPopup);

    // Random position near player
    const playerRect = youtubePlayer.getBoundingClientRect();
    reactionPopup.style.left = Math.random() * (playerRect.width - 50) + playerRect.left + 'px';
    reactionPopup.style.top = Math.random() * (playerRect.height - 50) + playerRect.top + 'px';


    setTimeout(() => {
        reactionPopup.remove();
    }, 2000); // Remove after 2 seconds
     alert(`Audience reaction: ${emoji} - Galing! (or not! LOL)`);
}


// --- Event Listeners ---
if (insertCoinBtn) {
    insertCoinBtn.addEventListener('click', insertCoin);
}
if (passMicBtn) {
    passMicBtn.addEventListener('click', passTheMic);
}
if (pulutanBreakBtn) {
    pulutanBreakBtn.addEventListener('click', showPulutanBreak);
}


// --- Initial Setup ---
updateCreditsDisplay();
showSongCategory('opm'); // Show OPM hits by default
updateSongQueueDisplay();

// Conceptual: Listen for YouTube player state changes to call handleSongEnd()
// This requires YouTube Iframe API integration for real functionality.
// For now, we can add a manual "Next Song" button for demo if needed.
// OR, we can assume a song ends after a fixed time for this conceptual demo.
// Let's add a button for now to simulate song ending.
const manualNextSongBtn = document.createElement('button');
manualNextSongBtn.textContent = "Tapos na Kanta (Next!)";
manualNextSongBtn.classList.add('neon-button');
manualNextSongBtn.style.marginTop = "10px";
manualNextSongBtn.onclick = handleSongEnd; // Call conceptual song end
if(document.querySelector('.now-playing-display')) {
    document.querySelector('.now-playing-display').appendChild(manualNextSongBtn);
}