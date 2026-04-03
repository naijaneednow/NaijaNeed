"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearConfigCache = exports.getConfig = void 0;
const db_1 = require("../config/db");
let configCache = {};
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const getConfig = async (key, defaultValue = '') => {
    const now = Date.now();
    if (configCache[key] && (now - lastFetch < CACHE_TTL)) {
        return configCache[key];
    }
    try {
        const result = await db_1.db.query('SELECT value FROM config WHERE key = $1 LIMIT 1', [key]);
        if (result.rows.length === 0) {
            return defaultValue;
        }
        const value = result.rows[0].value;
        configCache[key] = value;
        lastFetch = now;
        return value;
    }
    catch (error) {
        console.error('Error fetching config:', error);
        return defaultValue;
    }
};
exports.getConfig = getConfig;
const clearConfigCache = () => {
    configCache = {};
    lastFetch = 0;
};
exports.clearConfigCache = clearConfigCache;
