// js/tambay_bots.js
import { displayMessageInChat } from './ui.js';
import { DOMElements, CONFIG, STATE } from './config.js'; // Import STATE
import { logInfo, logError, logWarn } from './utils.js';
import { handleNewChatMessage } from './main.js'; // Import from main.js

const kaTambayBots = [
    {
        name: "PapsChito",
        icon: "fas fa-beer",
        description: "You are Paps Chito, an old-school Pinoy tito who loves food (especially 'pulutan'), reminiscing about 90s PBA, making dad jokes, and occasionally asking about PBA scores. You're generally jovial, a bit loud, and use phrases like 'Nung panahon namin!' or 'Order pa ng isa!'. Your comments are short and punchy.",
        activityLevel: 0.33,
    },
    {
        name: "SkepticalSixto",
        icon: "fas fa-user-secret",
        description: "You are Skeptical Sixto, a contrarian who always suspects games are 'scripted' or 'may lutuan' (fixed). You make short, cynical comments about referee calls and player performances, often muttering about 'daya' (cheating) or saying 'Hmm, parang may mali.' You're not mean, just very suspicious.",
        activityLevel: 0.28,
    },
    {
        name: "HypeGirlHailey",
        icon: "fas fa-star",
        description: "You are HypeGirl Hailey, super energetic, loves using modern NBA slang (sheesh, lowkey, G.O.A.T., dagger, anulo), gets extremely excited about highlight plays, and is always optimistic. You often use emojis like 🔥, 👀, 🐐, SHEESH!. Your comments are short and full of energy.",
        activityLevel: 0.40,
    }
];

let lastBotMessageTime = 0;
const BOT_COOLDOWN = 30000; // Minimum 30 seconds between any bot messages

export async function triggerGeminiBotComment() { // Removed parameters, will use global STATE
    if (!DOMElements.chatMessagesContainer) return;
    if (STATE.isBotGeneratingComment) { // Use STATE for global lock
        // logInfo("[Bot System] Bot comment generation already in progress.");
        return;
    }
    if (Date.now() - lastBotMessageTime < BOT_COOLDOWN) {
        return;
    }

    const randomBotPersona = kaTambayBots[Math.floor(Math.random() * kaTambayBots.length)];

    if (Math.random() > randomBotPersona.activityLevel) {
        return; 
    }
    
    STATE.isBotGeneratingComment = true; // Set global lock
    logInfo(`[Bot System] Attempting to generate comment for ${randomBotPersona.name}...`);

    let backendBaseUrl = CONFIG.SPORTS_DATA_BACKEND_BASE_URL || ''; 
    if (!backendBaseUrl && CONFIG.AI_BACKEND_API_URL) {
        try {
            const urlObject = new URL(CONFIG.AI_BACKEND_API_URL);
            backendBaseUrl = `${urlObject.protocol}//${urlObject.host}`;
        } catch (e) { 
            logError("[Bot System] Invalid AI_BACKEND_API_URL for deriving base URL.");
            STATE.isBotGeneratingComment = false; 
            return; 
        }
    }
    if (!backendBaseUrl) { 
        logError("[Bot System] Backend URL for bot comments not configured.");
        STATE.isBotGeneratingComment = false; 
        return; 
    }

    const botApiUrl = `${backendBaseUrl}/api/bots/generate-comment`;

    // Use game data and chat history from global STATE (populated by main.js)
    const gameContextForPrompt = STATE.latestGamesDataForBots.slice(0, 3); // First 3 relevant games
    const chatContextForPrompt = STATE.chatHistoryForBots.slice(-3); // Last 3 messages

    let thinkingMessageEl = null; // Define outside try
    try {
        thinkingMessageEl = displayMessageInChat(randomBotPersona.name, "Nag-iisip... 🤔", { isAI: true, iconClass: `${randomBotPersona.icon} fa-spinner fa-spin`, isThinking: true });

        const response = await fetch(botApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                botPersona: { name: randomBotPersona.name, description: randomBotPersona.description },
                gameContext: gameContextForPrompt,
                chatContext: chatContextForPrompt 
            })
        });

        if (thinkingMessageEl) thinkingMessageEl.remove();

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({error: "Failed to parse bot error from backend."}));
            logError(`[Bot System] Error from backend for ${randomBotPersona.name} comment:`, errorData.error || response.statusText);
            return;
        }

        const data = await response.json();
        if (data.comment) {
            logInfo(`[Bot System] ${randomBotPersona.name} says: "${data.comment}"`);
            displayMessageInChat(randomBotPersona.name, data.comment, { isAI: true, iconClass: randomBotPersona.icon });
            handleNewChatMessage(randomBotPersona.name, data.comment); // Add bot's own comment to history
            lastBotMessageTime = Date.now();
        } else {
            logWarn(`[Bot System] Backend returned no comment for ${randomBotPersona.name}:`, data);
        }

    } catch (error) {
        logError(`[Bot System] Network/fetch error for ${randomBotPersona.name} comment:`, error);
        if (thinkingMessageEl && thinkingMessageEl.parentElement) { // Check if parent exists before removing
             thinkingMessageEl.remove();
        }
    } finally {
        STATE.isBotGeneratingComment = false; // Release global lock
    }
}