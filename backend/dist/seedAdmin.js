"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
async function seedAdmin() {
    const name = 'Super Admin';
    const email = 'admin@naijaneed.com';
    const phone = '08000000000';
    const plainPassword = 'securepassword123'; // CHANGE THIS
    const hashedPassword = await bcryptjs_1.default.hash(plainPassword, 10);
    const deviceToken = (0, uuid_1.v4)();
    try {
        const query = `
      INSERT INTO users (name, email, phone, password, is_admin, is_super_admin, device_token)
      VALUES ($1, $2, $3, $4, true, true, $5)
      ON CONFLICT (phone) DO UPDATE 
      SET is_admin = true, is_super_admin = true, password = $4
      RETURNING *;
    `;
        const result = await db_1.db.query(query, [name, email, phone, hashedPassword, deviceToken]);
        console.log('Admin created successfully:', result.rows[0].email);
        process.exit(0);
    }
    catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}
seedAdmin();
