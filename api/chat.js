import express from 'express';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    res.json({ reply: `You said: ${message}` });
});

// app.listen(3000, () => {
//     console.log(`Server running on port 3000`);
// });
export default serverless(app);
