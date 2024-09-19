
const express = require('express');
const xml2js = require('xml2js'); // Mova esta linha para o topo
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para analisar dados do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


// Servir o index.html quando a raiz for acessada
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para servir a página de favoritos
app.get('/favoritos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'favoritos.html'));
});

// Rota para processar a pesquisa
app.post('/search', async (req, res) => {
    const { artist, song } = req.body;

    console.log(`Buscando letras para artista: ${artist}, música: ${song}`); // Log para ver os parâmetros

    try {
        const response = await fetch(`http://api.chartlyrics.com/apiv1.asmx/SearchLyric?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar letras: ${response.statusText}`);
        }

        const xml = await response.text();
        console.log('Resposta XML:', xml); // Log da resposta XML

        // Converter XML para JSON
        xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
            if (err) {
                console.error("Erro ao converter XML:", err); // Log do erro
                return res.status(500).json({ error: "Erro ao converter XML para JSON." });
            }
            const lyricsResults = result.ArrayOfSearchLyricResult.SearchLyricResult;
            res.json(lyricsResults); // Retornar apenas os resultados
        });
    } catch (error) {
        console.error("Erro na busca:", error);
        res.status(500).json({ error: error.message || "Erro ao buscar letras." });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
