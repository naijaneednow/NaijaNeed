"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const configController_1 = require("../controllers/configController");
const needsController_1 = require("../controllers/needsController");
const adminController_1 = require("../controllers/adminController");
const partnerController_1 = require("../controllers/partnerController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// Public Routes
router.post('/auth/register', authController_1.registerOrLoginCandidate);
router.get('/config', configController_1.getPlatformConfig);
router.get('/needs/map', needsController_1.getPublicMapData);
router.post('/admin/auth/login', adminController_1.adminLogin);
router.post('/partner/auth/login', partnerController_1.partnerLogin);
// Candidate Authenticated Routes
router.get('/auth/me', auth_1.authenticateUser, authController_1.getCurrentUser);
router.post('/needs', auth_1.optionalAuthenticateUser, upload_1.uploadMedia.single('media'), needsController_1.submitNeed);
router.post('/needs/:id/media', auth_1.authenticateUser, upload_1.uploadMedia.single('media'), needsController_1.reuploadMedia);
router.get('/needs/mine', auth_1.authenticateUser, needsController_1.getMyNeeds);
// Admin Routes
router.get('/admin/needs', auth_1.authenticateAdmin, adminController_1.getAllNeedsAdmin);
router.patch('/admin/needs/:id', auth_1.authenticateAdmin, adminController_1.updateNeedStatus);
router.patch('/admin/config', auth_1.authenticateAdmin, configController_1.updatePlatformConfig);
router.get('/admin/partners', auth_1.authenticateAdmin, adminController_1.getPartners);
router.post('/admin/partners', auth_1.authenticateAdmin, adminController_1.createPartner);
router.get('/admin/users', auth_1.authenticateAdmin, adminController_1.getUsers);
router.get('/admin/analytics', auth_1.authenticateAdmin, adminController_1.getAnalytics);
router.get('/admin/reports/needs/csv', auth_1.authenticateAdmin, adminController_1.exportNeedsCSV);
router.patch('/admin/profile/password', auth_1.authenticateAdmin, adminController_1.updateAdminPassword);
// Partner Routes
router.get('/partner/needs', auth_1.authenticatePartner, partnerController_1.getPartnerNeeds);
router.patch('/partner/needs/:id', auth_1.authenticatePartner, partnerController_1.updatePartnerNeedStatus);
router.patch('/partner/profile/password', auth_1.authenticatePartner, partnerController_1.updatePartnerPassword);
exports.default = router;
