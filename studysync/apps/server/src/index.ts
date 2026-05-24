import express from 'express';
import cors from 'cors';
import { queryAntigravity, chatWithAntigravity } from './antigravity';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h1>StudySync Server is running</h1><p>Available endpoints:</p><ul><li>POST /api/generate-pod</li><li>POST /api/verify-rentits</li></ul>');
});

app.post('/api/generate-pod', async (req, res) => {
  const { topic } = req.body;
  try {
    const aiData = await queryAntigravity(topic);
    // Here we would normally save to Firebase
    res.json({ success: true, data: aiData });
  } catch (error) {
    console.error("Error generating pod:", error);
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

app.post('/api/chat', async (req, res) => {
  const { message, topic, history } = req.body;
  try {
    const reply = await chatWithAntigravity(message, topic, history);
    res.json({ success: true, reply });
  } catch (error) {
    console.error("Error in chat assistant:", error);
    res.status(500).json({ error: "Chat Assistant Failed" });
  }
});

app.listen(3001, () => console.log("StudySync Server running on port 3001"));
