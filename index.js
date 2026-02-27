const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

// Serve os ficheiros da pasta onde estás
app.use(express.static(path.join(__dirname, '/')));

// Rota principal: mostra o teu index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de callback (para onde o Discord manda o utilizador)
app.get('/callback', (req, res) => {
  res.send('Login efetuado com sucesso! Agora o bot já sabe quem és.');
});

app.listen(port, () => {
  console.log(`Jordan Shop a correr na porta ${port}`);
});
