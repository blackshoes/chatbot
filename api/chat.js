import config from './config.js';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import serverless from 'serverless-http';
import { randomUUID } from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const conversationStore = {};

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

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

app.post('/chat', async (req, res) => {
    let { message, conversation_id } = req.body;
    console.log("message", message)

    if (!message) return res.status(400).json({ error: 'No message provided' });

    // Generate a new conversation_id if not provided
    if (!conversation_id) {
        conversation_id = randomUUID();
    }

    // Retrieve or initialize conversation
    if (!conversationStore[conversation_id]) {
        conversationStore[conversation_id] = [];
    }
    const conversation = conversationStore[conversation_id];
    conversation.push({ role: 'user', content: message });
    console.log("conversation", conversation)

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: conversation
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ error: data });
        }

        const botReply = data.choices[0].message.content.trim();
        conversation.push({ role: 'assistant', content: botReply });
        console.log("botReply", botReply);
        await saveConversation(conversation_id, conversation);

        res.json({ reply: botReply, conversation_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to contact OpenAI' });
    }
});

if (!config.isServerless) {
  // Run as a local Express server
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

// Always export, but only used in serverless mode
export default serverless(app);




// export default async function handler(req, res) {
//     if (req.method !== 'POST') {
//       return res.status(405).json({ error: 'Method not allowed' });
//     }
//     const { message, conversation_id } = req.body;
  
//     // Your OpenAI logic here (call OpenAI API, get botReply)
//     const botReply = "This is a sample reply from the bot.";
  
//     // Save conversation to Supabase
//     const { error } = await supabase
//       .from('conversations')
//       .insert([{ conversation_id, messages: [{ role: 'user', content: message }, { role: 'assistant', content: botReply }] }]);
//     if (error) {
//       return res.status(500).json({ error: error.message });
//     }
  
//     res.status(200).json({ reply: botReply });
//   }
