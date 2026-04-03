"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const axios_1 = __importDefault(require("axios"));
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const SENDER_ID = process.env.TERMII_SENDER_ID || 'NaijaNeed';
const sendSMS = async (to, message) => {
    if (!TERMII_API_KEY) {
        console.warn('TERMII_API_KEY missing. SMS skipped.');
        return;
    }
    try {
        const res = await axios_1.default.post('https://api.ng.termii.com/api/sms/send', {
            to: to.startsWith('0') ? '234' + to.slice(1) : to,
            from: SENDER_ID,
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: TERMII_API_KEY
        });
        return res.data;
    }
    catch (error) {
        console.error('Failed to send SMS via Termii:', error);
    }
};
exports.sendSMS = sendSMS;
