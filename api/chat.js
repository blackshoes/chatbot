// api/chat.js
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Lưu tạm trong bộ nhớ (chỉ dùng cho test/demo)
const conversationStore = {};
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function saveConversation(conversation_id, messages) {
    console.log("saveConversation message", messages)
    const { data, error } = await supabase
        .from('conversations')
        .upsert([{ conversation_id, messages }]); // Use upsert
    if (error) {
        console.error('Error saving conversation:', error);
    }
    console.log("saveConversation data", data)
    return data;
}

export default async function handler(req, res) {
    console.log("📩 handler:", req);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, conversation_id } = req.body;
    console.log("📩 message:", message);

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    let convId = conversation_id || randomUUID();

    if (!conversationStore[convId]) {
        conversationStore[convId] = [];
    }

    const conversation = conversationStore[convId];
    conversation.push({ role: 'user', content: message });
    console.log("🧠 Conversation so far:", conversation);

    try {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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

        const data = await openaiRes.json();

        if (!openaiRes.ok) {
            console.error("❌ OpenAI API error:", data);
            return res.status(500).json({ error: data });
        }

        const botReply = data.choices[0].message.content.trim();
        conversation.push({ role: 'assistant', content: botReply });

        // Bạn có thể thêm save vào Supabase nếu muốn, ví dụ:
        await saveConversation(convId, conversation);

        res.status(200).json({ reply: botReply, conversation_id: convId });
    } catch (err) {
        console.error("❌ Lỗi khi gọi OpenAI:", err);
        res.status(500).json({ error: 'Failed to contact OpenAI' });
    }
}
