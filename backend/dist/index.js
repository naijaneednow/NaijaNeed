"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use('/uploads', express_1.default.static('uploads'));
// Security Middleware
app.use((0, helmet_1.default)());
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://192.168.56.1:3000',
    'http://192.168.56.1:3001',
    'http://localhost:3001'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per window
    message: { error: 'Too many registration attempts. Please try again after 15 minutes.' }
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// Rate Limit sensitive routes
app.use('/api/auth/register', authLimiter);
app.use('/api/admin/auth/login', authLimiter);
app.use('/api/partner/auth/login', authLimiter);
// Use Routes
app.use('/api', routes_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'NaijaNeed API Running' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
