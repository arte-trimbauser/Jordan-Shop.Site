const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = '1424479855466123284';
const CLIENT_SECRET = 'ZIpXF6fAzxGhTaXmXFt7TLF-T_-57aq_'; 
const REDIRECT_URI = 'https://jordan-shop-site.onrender.com/callback';
const GUILD_ID = '1393629457599828040';

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); 
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.send('Erro: Código não fornecido.');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            scope: 'identify guilds'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenResponse.data.access_token;

        // --- NOVO: PEGAR OS DADOS DO UTILIZADOR (NOME) ---
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const discordUser = userResponse.data; // Aqui está o nome!

        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const isMember = guildsResponse.data.find(g => g.id === GUILD_ID);

        if (isMember) {
            // Manda para a loja com o nome do Discord para a animação de 2 segundos
            res.redirect(`/loja.html?user=${encodeURIComponent(discordUser.username)}`);
        } else {
            res.send('<h1>❌ Erro: Não estás no servidor da Jordan Shop!</h1>');
        }
    } catch (error) {
        console.error(error);
        res.send('<h1>❌ Erro ao validar login no Discord.</h1>');
    }
});

app.listen(port, () => console.log('Jordan Shop online na porta ' + port));
