const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// CONFIGURAÇÃO - PREENCHE ESTES DADOS
const CLIENT_ID = '1424479855466123284';
const CLIENT_SECRET = 'ZIpXF6fAzxGhTaXmXFt7TLF-T_-57aq_'; // <--- COLA AQUI
const REDIRECT_URI = 'https://jordan-shop-site.onrender.com/callback';
const GUILD_ID = '1393658313006383176';

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) return res.send('Erro: Código não fornecido pelo Discord.');

    try {
        // 1. Troca o código por um token de acesso
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            scope: 'identify guilds'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenResponse.data.access_token;

        // 2. Verifica os servidores do utilizador
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const isMember = guildsResponse.data.find(g => g.id === GUILD_ID);

        if (isMember) {
            // Se ele for Admin no servidor, as permissões têm o bit 8 ativo (0x8)
            const isStaff = (isMember.permissions & 0x8) === 0x8 || isMember.owner;
            
            if (isStaff) {
                res.send(`<body style="background:#1c0707;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">
                    <div style="text-align:center;border:2px solid #b00000;padding:40px;border-radius:15px;">
                        <h1>👑 Painel Staff - Jordan Shop</h1>
                        <p>Bem-vindo, Administrador! Acesso total concedido.</p>
                    </div>
                </body>`);
            } else {
                res.send(`<body style="background:#1c0707;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">
                    <div style="text-align:center;padding:40px;">
                        <h1>✅ Login Efetuado!</h1>
                        <p>Olá cliente! Bem-vindo à Jordan Shop.</p>
                    </div>
                </body>`);
            }
        } else {
            res.send('<h1>❌ Erro: Precisas de estar no Servidor da Jordan Shop para entrar!</h1>');
        }

    } catch (error) {
        console.error(error);
        res.send('<h1>❌ Erro ao validar login no Discord.</h1>');
    }
});

app.listen(port, () => console.log('Jordan Shop online na porta ' + port));
