const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const CLIENT_ID = '1424479855466123284';
const CLIENT_SECRET = 'ZIpXF6fAzxGhTaXmXFt7TLF-T_-57aq_'; 
const REDIRECT_URI = 'https://jordan-shop-site.onrender.com/callback';
const GUILD_ID = '1393658313006383176';

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
    // Se mudaste o nome do ficheiro, aqui tem de dizer login.html
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

        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const isMember = guildsResponse.data.find(g => g.id === GUILD_ID);

        if (isMember) {
            // AJUSTE PARA RECONHECER O DONO (TU!)
            const permissions = BigInt(isMember.permissions);
            const isAdmin = (permissions & 0x8n) === 0x8n;
            const isStaff = isAdmin || isMember.owner;
            
            if (isStaff) {
                res.send(`<body style="background:#1c0707;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">
                    <div style="text-align:center;border:2px solid #b00000;padding:40px;border-radius:15px;background:rgba(0,0,0,0.3);">
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
            // Se der este erro e tu ESTÁS no server, é porque o cache do Discord ainda não atualizou
            res.send('<h1>❌ Erro: Não te encontrei no Servidor da Jordan Shop! Tenta sair e entrar no servidor.</h1>');
        }
    } catch (error) {
        console.error(error);
        res.send('<h1>❌ Erro ao validar login no Discord.</h1>');
    }
});

app.listen(port, () => console.log('Jordan Shop online na porta ' + port));
