"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePartnerPassword = exports.updatePartnerNeedStatus = exports.getPartnerNeeds = exports.partnerLogin = void 0;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const partnerLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const result = await db_1.db.query('SELECT * FROM partners WHERE contact_email = $1 LIMIT 1', [email]);
        const partner = result.rows[0];
        if (!partner) {
            return res.status(401).json({ error: 'Invalid partner credentials.' });
        }
        if (!partner.password) {
            return res.status(401).json({ error: 'Partner account not activated for portal access.' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, partner.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: partner.id, email: partner.contact_email, is_partner: true }, JWT_SECRET, { expiresIn: '12h' });
        return res.status(200).json({
            message: 'Partner login successful.',
            token,
            partner: {
                id: partner.id,
                name: partner.name,
                type: partner.type
            }
        });
    }
    catch (error) {
        console.error('Partner login error:', error);
        return res.status(500).json({ error: 'Failed to authenticate.' });
    }
};
exports.partnerLogin = partnerLogin;
const getPartnerNeeds = async (req, res) => {
    const partnerId = req.user.id;
    try {
        const query = `
      SELECT n.*, 
             to_json(u.*) as users, 
             to_json(c.*) as categories
      FROM needs n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.assigned_partner_id = $1
      ORDER BY n.created_at DESC
    `;
        const result = await db_1.db.query(query, [partnerId]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Get partner needs error:', error);
        return res.status(500).json({ error: 'Failed to fetch assigned needs.' });
    }
};
exports.getPartnerNeeds = getPartnerNeeds;
const updatePartnerNeedStatus = async (req, res) => {
    const { id } = req.params;
    const { status, partner_comment } = req.body;
    const partnerId = req.user.id;
    try {
        // First verify the need is assigned to this partner
        const checkResult = await db_1.db.query('SELECT id FROM needs WHERE id = $1 AND assigned_partner_id = $2 LIMIT 1', [id, partnerId]);
        const currentNeed = checkResult.rows[0];
        if (!currentNeed)
            return res.status(403).json({ error: 'Access denied to this need.' });
        const updateQuery = `
      UPDATE needs
      SET status = $1, user_comments = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
        const result = await db_1.db.query(updateQuery, [status, partner_comment, id]);
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Update partner need status error:', error);
        return res.status(500).json({ error: 'Failed to update need status.' });
    }
};
exports.updatePartnerNeedStatus = updatePartnerNeedStatus;
const updatePartnerPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const partnerId = req.user.id;
    try {
        const result = await db_1.db.query('SELECT password FROM partners WHERE id = $1 LIMIT 1', [partnerId]);
        const partner = result.rows[0];
        if (!partner)
            return res.status(404).json({ error: 'Partner not found.' });
        if (partner.password) {
            const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, partner.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid current password.' });
            }
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await db_1.db.query('UPDATE partners SET password = $1 WHERE id = $2', [hashedPassword, partnerId]);
        return res.status(200).json({ message: 'Password updated successfully.' });
    }
    catch (error) {
        console.error('Update partner password error:', error);
        return res.status(500).json({ error: 'Failed to update password.' });
    }
};
exports.updatePartnerPassword = updatePartnerPassword;
