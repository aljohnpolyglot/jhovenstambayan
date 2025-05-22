import { DOMElements, djComments, gameClocks } from './config.js';
// --- CORRECTED IMPORTS ---
import { STATE } from './config.js'; // Get STATE directly from config.js
import { handleNewChatMessage } from './main.js'; // Get handleNewChatMessage from main.js

// Function to add messages to chat and history
// This is a central place to manage how messages are added.
// The `displayMessageAndAddToHistory` function seems a bit redundant now if main.js
// is going to call displayMessageInChat and then handleNewChatMessage.
// I'll keep it for now, but you might simplify this later.
export function displayMessageAndAddToHistory(senderName, messageText, options = {}) {
    const messageElement = displayMessageInChat(senderName, messageText, options);

    // If the intention is for this function to also update the chat history
    // for bots, then it should call handleNewChatMessage.
    // Let's assume it should.
    if (typeof handleNewChatMessage === 'function') {
        handleNewChatMessage(senderName, messageText, options.isUser || false);
    } else {
        console.warn("ui.js: handleNewChatMessage is not available to add message to history.");
    }

    return messageElement;
}


export function displayMessageInChat(senderName, messageText, options = {}) {
    const { isAI = false, isShoutout = false, iconClass = 'fas fa-user', isThinking = false } = options;
    if (!DOMElements.chatMessagesContainer) {
        console.error("DOMElements.chatMessagesContainer not found in ui.js");
        return null;
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    if (isAI) messageDiv.classList.add('ai-message');
    if (isShoutout) messageDiv.classList.add('shoutout');
    if (isThinking) messageDiv.classList.add('thinking-message');

    // Basic sanitization for messageText if it's not trusted (e.g., user input)
    // For now, we assume it's handled or from trusted sources
    const mappedIconClass = isAI ? (options.iconClass || 'fas fa-robot') : iconClass; // Renamed to avoid conflict with outer scope 'iconClass'

    // Ensure senderName and messageText are treated as text to prevent XSS if they ever come from untrusted input
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('user');
    senderSpan.innerHTML = `<i class="${mappedIconClass} ${isAI ? 'neon-icon-cyan' : (isShoutout ? 'neon-icon-alt' : 'neon-icon')}"></i> `;
    senderSpan.appendChild(document.createTextNode(`${senderName}:`)); // Safer way to add text

    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(document.createTextNode(` ${messageText}`)); // Safer way to add text

    DOMElements.chatMessagesContainer.appendChild(messageDiv);
    DOMElements.chatMessagesContainer.scrollTop = DOMElements.chatMessagesContainer.scrollHeight;
    return messageDiv;
}

export function updateGameStatus() { // For conceptual Jumbotron
    if (DOMElements.homeScoreEl && DOMElements.guestScoreEl) {
        DOMElements.homeScoreEl.innerText = Math.floor(Math.random() * 20) + 80;
        DOMElements.guestScoreEl.innerText = Math.floor(Math.random() * 20) + 80;
    }
    if (DOMElements.djCommentaryEl && djComments.length > 0) {
        DOMElements.djCommentaryEl.innerText = `" ${djComments[Math.floor(Math.random() * djComments.length)]} "`;
    }
    if (DOMElements.gameClockDisplayEl && gameClocks.length > 0) {
        DOMElements.gameClockDisplayEl.innerText = gameClocks[Math.floor(Math.random() * gameClocks.length)];
    }
}

export function toggleTambayRules(event) {
    if (event) event.preventDefault();
    if (DOMElements.rulesSign) {
        const isHidden = DOMElements.rulesSign.style.display === "none" || DOMElements.rulesSign.style.display === "";
        DOMElements.rulesSign.style.display = isHidden ? "block" : "none";
        if (isHidden) {
            DOMElements.rulesSign.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

export function closeTambayRules() {
    if (DOMElements.rulesSign) DOMElements.rulesSign.style.display = 'none';
}