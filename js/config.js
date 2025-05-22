export const CONFIG = {
    AI_BACKEND_API_URL: "http://localhost:3001/api/ask-pareng-ai",
    SPORTS_DATA_BACKEND_BASE_URL: "http://localhost:3001", // Base URL for your backend server
    RANDOM_AI_INTERJECTION_CHANCE: 0.0, // Lowered chance for now, or set to 0 to disable old Pareng AI random thoughts
    RANDOM_AI_INTERJECTION_INTERVAL: 35000,
    GAME_STATUS_UPDATE_INTERVAL: 15000, // For the conceptual Jumbotron scores
    DEBUG_MODE: true
};

export const DOMElements = {
    // For index.html
    chatMessagesContainer: document.getElementById('chatMessagesContainer'),
    chatInput: document.getElementById('chatInput'),
    sendChatButton: document.getElementById('sendChatMsgBtn'), // Make sure this ID is on your send button
    shoutOutButton: document.getElementById('shoutOutBtn'),
    rulesSign: document.getElementById('tambayRules'),
    showRulesLink: document.getElementById('showRulesLink'),    // Make sure this ID is on your "Rules" link
    closeRulesButton: document.getElementById('closeRulesBtn'), // Make sure this ID is on the close button in rules div
    homeScoreEl: document.getElementById('homeScore'),
    guestScoreEl: document.getElementById('guestScore'),
    djCommentaryEl: document.getElementById('djJhovenCommentary'),
    gameClockDisplayEl: document.getElementById('gameClockDisplay'),
    leakedScriptImage: document.querySelector('.leaked-script img'),
    curryMouthpieceFrame: document.querySelector('.special-collectible .image-frame'),
    ironmanVideo: document.querySelector('.video-item video'),
    nbaTickerContentElement: document.getElementById('nbaTickerContent'), // For the ticker

    // Pustahan Widget on index.html
    pustahanGameMatchup: document.getElementById('pustahanGameMatchup'),
    pustahanTeamAOdds: document.getElementById('pustahanTeamAOdds'),
    pustahanTeamBOdds: document.getElementById('pustahanTeamBOdds'),
    pustahanBetTeamAButton: document.getElementById('pustahanBetTeamA'),
    pustahanBetTeamBButton: document.getElementById('pustahanBetTeamB'),
    pustahanLastCall: document.getElementById('pustahanLastCall'),
    featuredGameBetItem: document.getElementById('featuredGameBetItem'),

    // For iskedyul.html (if you create a separate config or main.js for it)
    // scheduleGridElement: document.getElementById('scheduleGrid'),
    // dateRangeStartInputEl: document.getElementById('dateRangeStart'),
    // dateRangeEndInputEl: document.getElementById('dateRangeEnd'),
    // filterDateRangeBtnEl: document.getElementById('filterDateRangeBtn'),

    // For pustahan.html (if you create a separate config or main.js for it)
    // nbaBettingBoardsContainerElement: document.getElementById('nbaBettingBoardsContainer'),
    // betSlipModalElement: document.getElementById('betSlipModal'),
    // etc. for pustahan modal elements
};

// Global-like state (scoped to modules that import it)
export let STATE = {
    isAIThinking: false, // For user-invoked Pareng AI
    isBotGeneratingComment: false, // For Gemini Ka-Tambay bots
    isTickerLoading: false,
    isPustahanWidgetLoading: false,
    latestGamesDataForBots: [], // Stores games for bot context
    chatHistoryForBots: [],     // Stores recent chat messages for bot context
    MAX_CHAT_HISTORY_FOR_BOTS: 5
};

// Predefined responses for old Pareng AI random thoughts (if still used)
export const parengAiPredefinedResponses = {
    lebron: ["The GOAT! Sabi ko sa inyo eh! 🐐", "King James taking over! Walang makakapigil!"],
    curry: ["BANG! Steph Curry from downtown! 🔥", "Chef Curry cooking!"],
    sisig: ["Uy, sisig! Order na kayo!", "Nag-crave tuloy ako ng sisig!"],
    pustahan: ["May taya na ba kayo mga Paps?", "Sino kaya mananalo?"],
    general_nba: ["Ganda ng laban ngayon! Intense!", "Sino MVP candidate?"],
    random_tambay: ["Ang ingay dito sa Tambayan!", "Jhoven, pa-order ng extra rice!"]
};

// For conceptual Jumbotron scoreboard
export const djComments = ["GRABE ANG LABAN!", "ANO NANGYARI DUN?!", "DEFENSE!", "TIMEOUT MUNA! KAIN SISIG!", "LAST TWO MINUTES!"];
export const gameClocks = ["4Q 02:07", "4Q 00:58", "4Q 00:12 (CLUTCH!)", "OT 02:30"];