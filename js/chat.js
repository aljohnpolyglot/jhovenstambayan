// js/chat.js
import { DOMElements } from './config.js';
import { displayMessageInChat } from './ui.js';
import { askParengAiWithGemini } from './ai.js'; // User-invoked AI
import { handleNewChatMessage } from './main.js'; // Import from main.js to update shared history

export function processChatMessage() {
    if (!DOMElements.chatInput) return;
    const messageText = DOMElements.chatInput.value.trim();
    if (messageText === "") return;

    if (messageText.toLowerCase().startsWith("/askparengai ")) {
        const userPromptForAI = messageText.substring("/askparengai ".length).trim();
        if (userPromptForAI) {
            displayMessageInChat("Ikaw", userPromptForAI, { iconClass: 'fas fa-user-ninja' });
            handleNewChatMessage("Ikaw", userPromptForAI, true); // Add user's question to history
            askParengAiWithGemini(userPromptForAI);
        } else {
            const sysMsg = "Paki-type yung tanong mo kay Pareng AI after ng /askparengai command.";
            displayMessageInChat("System", sysMsg, { iconClass: 'fas fa-info-circle' });
            // handleNewChatMessage("System", sysMsg); // Optional: add system messages to history
        }
    } else {
        // Regular user message
        const userIconClass = Math.random() > 0.5 ? 'fas fa-basketball-ball' : 'fas fa-gamepad-alt';
        const userNameText = Math.random() > 0.5 ? 'Ka-Tambay' + Math.floor(Math.random() * 100) : 'BallerBoi' + Math.floor(Math.random() * 100);
        displayMessageInChat(userNameText, messageText, { iconClass: userIconClass });
        handleNewChatMessage(userNameText, messageText, true); // Add regular user message to history
    }
    DOMElements.chatInput.value = "";
    DOMElements.chatInput.focus();
}

export function processShoutOut() {
    if (!DOMElements.chatInput) return;
    const messageText = DOMElements.chatInput.value.trim();
    if (messageText !== "") {
        const shoutOutUser = "SHOUTOUT NI JHOKER"; // Or make dynamic
        displayMessageInChat(shoutOutUser, messageText.toUpperCase(), { isShoutout: true, iconClass: 'fas fa-bullhorn' });
        handleNewChatMessage(shoutOutUser, messageText.toUpperCase()); // Add shoutout to history
        DOMElements.chatInput.value = "";
        DOMElements.chatInput.focus();
    } else {
        alert("Type ka muna ng ishi-shout out, bossing!");
    }
}