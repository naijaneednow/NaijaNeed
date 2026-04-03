"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlatformConfig = exports.getPlatformConfig = void 0;
const db_1 = require("../config/db");
const config_1 = require("../utils/config");
const getPlatformConfig = async (req, res) => {
    try {
        const result = await db_1.db.query('SELECT key, value FROM config');
        const configs = result.rows;
        const configMap = configs.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});
        return res.status(200).json(configMap);
    }
    catch (error) {
        console.error('Fetch config error:', error);
        return res.status(500).json({ error: 'Failed to fetch platform configuration.' });
    }
};
exports.getPlatformConfig = getPlatformConfig;
const updatePlatformConfig = async (req, res) => {
    const updates = req.body; // e.g. { PLATFORM_NAME: 'NaijaNeed V2' }
    const isAdmin = req.user.is_admin;
    if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can update configuration.' });
    }
    try {
        for (const [key, value] of Object.entries(updates)) {
            const upsertQuery = `
        INSERT INTO config (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `;
            await db_1.db.query(upsertQuery, [key, value]);
        }
        (0, config_1.clearConfigCache)();
        return res.status(200).json({ message: 'Configuration updated successfully.' });
    }
    catch (error) {
        console.error('Update config error:', error);
        return res.status(500).json({ error: 'Failed to update configuration.' });
    }
};
exports.updatePlatformConfig = updatePlatformConfig;
