"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reuploadMedia = exports.getMyNeeds = exports.submitNeed = exports.getPublicMapData = void 0;
const db_1 = require("../config/db");
const config_1 = require("../utils/config");
const uuid_1 = require("uuid");
const sms_1 = require("../utils/sms");
const getPublicMapData = async (req, res) => {
    try {
        const query = `
      SELECT u.state_id as state, COUNT(n.id) as needs
      FROM needs n
      JOIN users u ON n.user_id = u.id
      WHERE u.state_id IS NOT NULL AND u.state_id != ''
      GROUP BY u.state_id
    `;
        const result = await db_1.db.query(query);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Get map data error:', error);
        return res.status(500).json({ error: 'Failed to fetch map data.', details: error instanceof Error ? error.message : String(error) });
    }
};
exports.getPublicMapData = getPublicMapData;
const submitNeed = async (req, res) => {
    const { category_id, description, name, phone, email, stateId, lgaId, area } = req.body;
    let user_id = req.user?.id;
    if (!description) {
        return res.status(400).json({ error: 'Please describe your need.' });
    }
    try {
        // 0. Handle registration/login if not authenticated
        if (!user_id) {
            if (!phone) {
                return res.status(401).json({ error: 'Authentication required.' });
            }
            // Check if user already exists
            const findResult = await db_1.db.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
            let user = findResult.rows[0];
            let deviceToken;
            if (user) {
                deviceToken = user.device_token || (0, uuid_1.v4)();
                // Update existing user profile with new info if provided
                await db_1.db.query(`UPDATE users 
             SET name = COALESCE($1, name), 
                 email = COALESCE($2, email), 
                 state_id = COALESCE($3, state_id), 
                 lga_id = COALESCE($4, lga_id), 
                 area = COALESCE($5, area),
                 device_token = $6,
                 last_active = NOW()
             WHERE id = $7`, [name, email, stateId, lgaId, area, deviceToken, user.id]);
            }
            else {
                deviceToken = (0, uuid_1.v4)();
                const insertUserQuery = `
           INSERT INTO users (phone, name, email, state_id, lga_id, area, device_token)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *
         `;
                const insertUserResult = await db_1.db.query(insertUserQuery, [phone, name, email, stateId, lgaId, area, deviceToken]);
                user = insertUserResult.rows[0];
            }
            user_id = user.id;
            // Set cookie for atomic session creation
            res.cookie('nn_device', deviceToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
            });
        }
        else {
            // Update User Profile if provided and already authenticated
            if (name || stateId || lgaId) {
                await db_1.db.query(`UPDATE users 
           SET name = COALESCE($1, name), 
               email = COALESCE($2, email), 
               state_id = COALESCE($3, state_id), 
               lga_id = COALESCE($4, lga_id), 
               area = COALESCE($5, area),
               last_active = NOW()
           WHERE id = $6`, [name, email, stateId, lgaId, area, user_id]);
            }
        }
        // 1. Weekly Lock Logic
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        const weeklyLimitStr = await (0, config_1.getConfig)('WEEKLY_LIMIT', '1');
        const weeklyLimit = parseInt(weeklyLimitStr) || 1;
        const checkResult = await db_1.db.query('SELECT COUNT(*) FROM needs WHERE user_id = $1 AND created_at >= $2', [user_id, startOfWeek.toISOString()]);
        const count = parseInt(checkResult.rows[0].count);
        if (count >= weeklyLimit) {
            const nextMonday = new Date(startOfWeek);
            nextMonday.setDate(nextMonday.getDate() + 7);
            return res.status(403).json({
                locked: true,
                message: `You have reached your weekly limit of ${weeklyLimit} need(s).`,
                nextDate: nextMonday.toDateString()
            });
        }
        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
        // 2. Submit need
        const insertQuery = `
      INSERT INTO needs (user_id, category_id, description, status, media_url)
      VALUES ($1, $2, $3, 'Submitted', $4)
      RETURNING *
    `;
        const insertResult = await db_1.db.query(insertQuery, [user_id, category_id, description, mediaUrl]);
        const newNeed = insertResult.rows[0];
        // 3. SMS Confirmation (Fire and forget to keep latency low)
        const userPhone = phone || req.user?.phone;
        if (userPhone) {
            (0, sms_1.sendSMS)(userPhone, `Hello! Your need has been successfully submitted to NaijaNeed. We will review it shortly. Status: ${newNeed.status}`).catch(err => console.error('SMS notification failed:', err));
        }
        return res.status(201).json(newNeed);
    }
    catch (error) {
        console.error('Submit need error:', error);
        return res.status(500).json({ error: 'Failed to submit need.' });
    }
};
exports.submitNeed = submitNeed;
const getMyNeeds = async (req, res) => {
    const user_id = req.user.id;
    try {
        const query = `
      SELECT n.*, to_json(c.*) as categories
      FROM needs n
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
    `;
        const result = await db_1.db.query(query, [user_id]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Get needs error:', error);
        return res.status(500).json({ error: 'Failed to fetch your needs.' });
    }
};
exports.getMyNeeds = getMyNeeds;
const reuploadMedia = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No media file provided.' });
        }
        const mediaUrl = `/uploads/${req.file.filename}`;
        // update media_url
        const query = `
      UPDATE needs SET media_url = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
        const result = await db_1.db.query(query, [mediaUrl, id, user_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Need not found or unauthorized.' });
        }
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Reupload media error:', error);
        return res.status(500).json({ error: 'Failed to reupload media.' });
    }
};
exports.reuploadMedia = reuploadMedia;
