const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getApiBaseUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    return '/api';
}

const API_BASE_URL = getApiBaseUrl();

async function getOpenAIResponse(message) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        return data.reply || "Sorry, I didn't get a response.";
    } catch (err) {
        console.error(err);
        return "Sorry, there was an error contacting the server.";
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    userInput.value = '';
    addMessage('...', 'bot');
    const botReply = await getOpenAIResponse(message);
    // Remove the '...' loading message
    chatMessages.removeChild(chatMessages.lastChild);
    addMessage(botReply, 'bot');
}); 