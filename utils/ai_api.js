import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();
export const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const messages = req.body.messages;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages
      })
    });

    const data = await response.json();
    res.json({ response: data.choices?.[0]?.message?.content || 'No response from AI' });
  } catch (err) {
    console.error('AI API error:', err);
    res.status(500).json({ error: 'Something went wrong with AI request' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
