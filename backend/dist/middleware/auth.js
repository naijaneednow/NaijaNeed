"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePartner = exports.authenticateAdmin = exports.optionalAuthenticateUser = exports.authenticateUser = void 0;
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateUser = async (req, res, next) => {
    const token = req.cookies.nn_device;
    console.log("token", token, req.cookies);
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated. Proceed to homepage.' });
    }
    try {
        const query = `
      SELECT *
      FROM users
      WHERE device_token = $1 
      LIMIT 1
    `;
        const result = await db_1.db.query(query, [token]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid device session.' });
        }
        await db_1.db.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Authentication failed.' });
    }
};
exports.authenticateUser = authenticateUser;
const optionalAuthenticateUser = async (req, res, next) => {
    const token = req.cookies.nn_device;
    if (!token) {
        return next();
    }
    try {
        const query = `SELECT * FROM users WHERE device_token = $1 LIMIT 1`;
        const result = await db_1.db.query(query, [token]);
        const user = result.rows[0];
        if (user) {
            await db_1.db.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);
            req.user = user;
        }
        next();
    }
    catch (error) {
        next(); // Silently continue even if auth fails
    }
};
exports.optionalAuthenticateUser = optionalAuthenticateUser;
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Admin access required. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const result = await db_1.db.query('SELECT * FROM users WHERE id = $1 AND is_admin = true LIMIT 1', [decoded.id]);
        const user = result.rows[0];
        if (!user) {
            return res.status(403).json({ error: 'Access denied. You are not an authorized admin.' });
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Admin Auth error:', err);
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const authenticatePartner = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Partner access required. No token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const result = await db_1.db.query('SELECT * FROM partners WHERE id = $1 LIMIT 1', [decoded.id]);
        const partner = result.rows[0];
        if (!partner) {
            return res.status(403).json({ error: 'Access denied. You are not an authorized partner.' });
        }
        req.user = partner;
        next();
    }
    catch (err) {
        console.error('Partner Auth error:', err);
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
};
exports.authenticatePartner = authenticatePartner;
