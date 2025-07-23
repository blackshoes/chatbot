import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const conversation = []; // In-memory conversation array

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function saveConversation(conversation_id, messages) {
    console.log('📩 Nhận request từ frontend');
    const { data, error } = await supabase
        .from('conversations')
        .insert([
            { conversation_id, messages }
        ]);
    if (error) {
        console.error('Error saving conversation:', error);
    }
    return data;
}

async function getConversations() {
    const { data, error } = await supabase
        .from('conversations')
        .select('*');
    if (error) {
        console.error('Error fetching conversations:', error);
    }
    return data;
}

app.post('/chat', async (req, res) => {
    console.log('📩 Nhận request từ frontend');
    console.log(`${process.env.OPENAI_API_KEY}`);

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    // Add user message to conversation
    conversation.push({ role: 'user', content: message });
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: conversation
            })
        });
        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API error:', data);
            return res.status(500).json({ error: data });
        }

        const botReply = data.choices[0].message.content.trim();

        // Add bot reply to conversation
        conversation.push({ role: 'assistant', content: botReply });

        // Save conversation to Supabase
        await saveConversation('conversation_id', conversation);

        res.json({ reply: botReply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to contact OpenAI' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
