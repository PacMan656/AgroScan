const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { extractAndCompare } = require('./utils/compare');

const app = express();
const port = 8000;
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/comparar', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const result = await extractAndCompare(imagePath);
    fs.unlinkSync(imagePath); // Remove imagem temporária
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor rodando: http://localhost:${port}`);
});
