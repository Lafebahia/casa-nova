const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const app = express();
const db = new sqlite3.Database("./database.db");
require('dotenv').config();

app.use(express.json());

const options = {
  key: fs.readFileSync(path.join(__dirname, '../certificado/chave_privada.key')), 
  cert: fs.readFileSync(path.join(__dirname, '../certificado/certificado.crt')),
  ca: fs.readFileSync(path.join(__dirname, '../certificado/CA.crt'))
};

function generateAppKey() {
  return crypto.randomBytes(16).toString('hex');
}

if (!process.env.APP_KEY || process.env.APP_KEY.trim() === '') {
  const appKey = generateAppKey();
  const envFilePath = '.env';
  let envFileContent = fs.readFileSync(envFilePath, 'utf-8');
  if (envFileContent.includes('APP_KEY=')) {
      envFileContent = envFileContent.replace(/APP_KEY=\s*(.*)/, `APP_KEY=${appKey}`);
  } else {
      envFileContent += `APP_KEY=${appKey}\n`;
  }
  fs.writeFileSync(envFilePath, envFileContent, 'utf-8');
  console.log('chave de acesso gerada com sucesso');
}

const validAppKey = process.env.APP_KEY;

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

db.run("CREATE TABLE IF NOT EXISTS presente (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT, nome_pessoa TEXT)");

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/cadastro", (req, res) => {
    const chave = req.query.chave;
    if (!chave || chave !== validAppKey) {
        return res.status(403).send('Acesso não permitido: chave inválida ou ausente');
    }
    res.sendFile(__dirname + "/public/cadastro.html");
});

app.get("/presente", (req, res) => {
    res.sendFile(__dirname + "/public/presente.html");
});

app.get("/sobre", (req, res) => {
    res.sendFile(__dirname + "/public/sobre.html");
});

app.post("/add-item", (req, res) => {
  const { descricao, pessoa } = req.body;
  db.run("INSERT INTO presente (descricao, nome_pessoa) VALUES (?, ?)", [descricao, pessoa], (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao adicionar presente" });
    }
    res.json({ message: "Presente adicionado com sucesso!" });
  });
});

app.get("/get-items", (req, res) => {
    db.all("SELECT * FROM presente", (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Erro ao consultar os presentes' });
        } else {
          res.json(rows);
        }
    });
});

app.put("/set-item/:id", (req, res) => {
  const { id } = req.params;
  const { descricao, pessoa } = req.body;
  db.run("UPDATE presente SET descricao = ?, nome_pessoa = ? WHERE id = ?", [descricao, pessoa, id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao atualizar presente" });
    }
    res.json({ message: "Presente atualizado com sucesso!" });
  });
});

app.put("/set-item-pessoa/:id", (req, res) => {
  const { id } = req.params;
  const { pessoa } = req.body;
  db.run("UPDATE presente SET nome_pessoa = ? WHERE id = ?", [pessoa, id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao atualizar presente" });
    }
    res.json({ message: "Presente atualizado com sucesso!" });
  });
});

app.delete("/delete-item/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM presente WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao excluir o presente" });
    }
    res.json({ message: "Presente excluído com sucesso!" });
  });
});
  
const PORT = process.env.SERVER_PORT || 3000;
// server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Servidor HTTPS rodando na porta ${PORT}`);
});
// localhost
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });