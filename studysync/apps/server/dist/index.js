"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const antigravity_1 = require("./antigravity");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/api/generate-pod', async (req, res) => {
    const { topic } = req.body;
    try {
        const aiData = await (0, antigravity_1.queryAntigravity)(topic);
        // Here we would normally save to Firebase
        res.json({ success: true, data: aiData });
    }
    catch (error) {
        res.status(500).json({ error: "Antigravity Link Failed" });
    }
});
app.post('/api/verify-rentits', (req, res) => {
    const { userId, itemId } = req.body;
    // Simulated RentIts Logic
    const receipt = {
        receiptId: `RENT-${Math.floor(Math.random() * 10000)}`,
        status: 'VERIFIED',
        bonusPoints: 50,
        timestamp: new Date().toISOString()
    };
    res.json(receipt);
});
app.listen(3001, () => console.log("StudySync Server running on port 3001"));
