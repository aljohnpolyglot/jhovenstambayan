// js/page_interactions.js
import { logInfo } from './utils.js';
import { displayMessageInChat } from './ui.js';
import { handleNewChatMessage } from './main.js'; // Import from main.js

export function placeBet(betChoiceTeamName) { // Renamed for clarity
    const betConfirmations = [
        `Taya mo sa ${betChoiceTeamName}!\nGood luck, Paps! For fun lang 'to. Ang matalo, sagot ang chichirya! 😉`,
        `Sure ka na ba sa ${betChoiceTeamName}? Sige, go for the gold (chichirya)!`,
        `${betChoiceTeamName} ang bet mo! Sana manalo ka para may pang-videoke tayo!`,
        `Okay, ${betChoiceTeamName} locked in! May the odds be ever in your favor (sa chichirya world)!`
    ];
    alert(betConfirmations[Math.floor(Math.random() * betConfirmations.length)]);
    // In a real app, this would interact with a bet slip or backend
}

export function handleLeakedScriptClick() {
    const secretMessages = ["HOY! Bawal i-zoom 'yan, sikreto ni Jhoven 'yan!", "Nakita mo ba? Wag mo sabihin kay Adam Silver!", "Ang script ay... MANANALO ANG PUSO!", "TOP SECRET! Baka ma-ban tayo ni Commissioner Jhoven!"];
    alert(secretMessages[Math.floor(Math.random() * secretMessages.length)]);
}

export function handleCurryMouthpieceHover() {
    logInfo("Hovered on Curry's Mouthpiece!");
}

export function handleIronmanVideoEnd() {
    const msg = "Astig ng transformation ni Boss Jhoven! Parang NBA player na nag-superhero! 💪";
    displayMessageInChat("Pareng AI", msg, { isAI: true, iconClass: 'fas fa-robot' });
    handleNewChatMessage("Pareng AI", msg); // Add to history
}

export function handleChannelButtonClick(message) {
    alert(message);
}