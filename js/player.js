document.addEventListener('DOMContentLoaded', function() {
    // Check if Clappr library is loaded
    if (typeof Clappr === 'undefined') {
        console.error('Clappr library not loaded. Make sure the script tag for Clappr.min.js is in your HTML.');
        return;
    }

    // Check if the player container element exists
    var playerElement = document.getElementById('player');
    if (!playerElement) {
        console.error('Player element #player not found in the HTML.');
        return;
    }

    // Initialize Clappr Player
    var player = new Clappr.Player({
        source: 'https://live.webcastserver.online/hdstream/embed/151.m3u8', // IMPORTANT: Replace with your actual M3U8 stream URL
        parentId: '#player',    // Links the player to the <div id="player"></div>
        height: '100%',         // Player will take 100% height of its parent container
        width: '100%',          // Player will take 100% width of its parent container
        autoPlay: true,         // Autoplay the video (browser policies might prevent this)
        playInline: true,       // Recommended for mobile browsers
        // poster: 'images/stream_poster.jpg', // Optional: Add a poster image URL
        // mute: false, // Set to true if you want it to start muted (often required for autoplay)

        // ShakaPlayer configuration (Clappr uses HLS.js by default for HLS, Shaka for DASH)
        // This section might be more relevant if you were playing DASH streams,
        // but Clappr might use some global settings.
        shakaConfiguration: {
            preferredAudioLanguage: 'en-US', // Example: 'pt-BR', 'en-US'
            streaming: {
                rebufferingGoal: 15 // (in seconds)
            }
        },

        // You can add more Clappr plugins here if needed
        // plugins: [ Clappr.MediaControl ], // MediaControl is built-in
        // For debugging, you can enable Clappr Nerd Stats
        // clapprNerdStats: {
        //  shortcut: ['command+shift+s', 'ctrl+shift+s'],
        //  iconPosition: 'top-right'
        // }
    });

    // Optional: Add event listeners if needed
    // player.on(Clappr.Events.PLAYER_PLAY, function() {
    //   console.log('Player is playing');
    // });
    // player.on(Clappr.Events.PLAYER_ERROR, function(error) {
    //   console.error('Player error:', error);
    // });
});