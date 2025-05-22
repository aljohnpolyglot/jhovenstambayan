import { CONFIG } from './config.js';

export function logError(message, error) {
    console.error(message, error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack && CONFIG.DEBUG_MODE) {
        console.error("Stack:", error.stack);
    }
}

export function logWarn(message, data) {
    if (CONFIG.DEBUG_MODE) {
        if (data !== undefined) console.warn(message, data);
        else console.warn(message);
    }
}

export function logInfo(message, data) {
    if (CONFIG.DEBUG_MODE) {
        if (data !== undefined) console.log(message, data);
        else console.log(message);
    }
}