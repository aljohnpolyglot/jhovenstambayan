// js/ai.js
import { CONFIG, STATE } from './config.js';
import { displayMessageInChat } from './ui.js';
import { logError, logWarn, logInfo } from './utils.js';
import { handleNewChatMessage } from './main.js'; // Import from main.js

export async function askParengAiWithGemini(userPrompt) {
    if (STATE.isAIThinking) {
        displayMessageInChat("Pareng AI", "Kalma lang, Paps! Nag-iisip pa ako...", { isAI: true, iconClass: 'fas fa-pause-circle' });
        return;
    }
    STATE.isAIThinking = true;
    logInfo('[AI Frontend] Sending user prompt to backend:', userPrompt);
    const thinkingMessageEl = displayMessageInChat("Pareng AI", "Nag-iisip si Pareng AI... (Kinakausap ang server...)", { isAI: true, iconClass: 'fas fa-spinner fa-spin', isThinking: true });

    try {
        const response = await fetch(CONFIG.AI_BACKEND_API_URL, { // Uses specific AI URL
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userPrompt })
        });

        if (thinkingMessageEl) thinkingMessageEl.remove();
        logInfo('[AI Frontend] Backend response status for Pareng AI:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Server responded with ${response.status}, but error details are not JSON.` }));
            logError("[AI Frontend] Backend API Error for Pareng AI:", errorData.error || response.statusText);
            const errorMessageToDisplay = errorData.error || `Server error: ${response.statusText}`;
            displayMessageInChat("Pareng AI", `Naku, Paps! May problema sa server: ${errorMessageToDisplay}`, { isAI: true, iconClass: 'fas fa-robot' });
            handleNewChatMessage("Pareng AI", `Naku, Paps! May problema sa server: ${errorMessageToDisplay}`); // Add error to history
            return;
        }

        const data = await response.json();
        if (data.reply) {
            logInfo('[AI Frontend] Received reply from Pareng AI (backend):', data.reply);
            displayMessageInChat("Pareng AI", data.reply, { isAI: true, iconClass: 'fas fa-robot' });
            handleNewChatMessage("Pareng AI", data.reply); // Add Pareng AI's reply to history
        } else {
            logWarn("[AI Frontend] Backend response for Pareng AI format unexpected (no reply field):", data);
            displayMessageInChat("Pareng AI", "Hmm, medyo weird ang sagot galing sa server. Sabihin mo kay Jhoven.", { isAI: true, iconClass: 'fas fa-robot' });
            handleNewChatMessage("Pareng AI", "Hmm, medyo weird ang sagot galing sa server. Sabihin mo kay Jhoven.");
        }

    } catch (error) {
        logError("[AI Frontend] Network or other error calling Pareng AI Backend API:", error);
        if (thinkingMessageEl && thinkingMessageEl.parentElement) thinkingMessageEl.remove();
        displayMessageInChat("Pareng AI", "Ay, di maka-connect sa server para kay Pareng AI! Check mo network or baka offline si Jhoven.", { isAI: true, iconClass: 'fas fa-robot' });
        handleNewChatMessage("Pareng AI", "Ay, di maka-connect sa server para kay Pareng AI! Offline ata.");
    } finally {
        STATE.isAIThinking = false;
    }
}

// This function for "Pareng AI (Random Thought)" is for the OLD predefined random interjections.
// You might want to disable it if the new Gemini Ka-Tambay bots are active.
export function triggerRandomAiInterjection() {
    if (CONFIG.RANDOM_AI_INTERJECTION_CHANCE <= 0) return; // Allow disabling via config

    if (DOMElements.chatMessagesContainer && Math.random() < CONFIG.RANDOM_AI_INTERJECTION_CHANCE && !STATE.isAIThinking && !STATE.isBotGeneratingComment) {
        const randomCategory = Object.keys(parengAiPredefinedResponses)[Math.floor(Math.random() * Object.keys(parengAiPredefinedResponses).length)];
        if (parengAiPredefinedResponses[randomCategory] && parengAiPredefinedResponses[randomCategory].length > 0) {
            const randomMessage = parengAiPredefinedResponses[randomCategory][Math.floor(Math.random() * parengAiPredefinedResponses[randomCategory].length)];
            displayMessageInChat("Pareng AI (Random Thought)", randomMessage, { isAI: true, iconClass: 'fas fa-brain' });
            handleNewChatMessage("Pareng AI (Random Thought)", randomMessage);
        }
    }
}