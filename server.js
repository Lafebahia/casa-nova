const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const app = express();
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST, 
  user: process.env.DB_USERNAME, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, 
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao Mysql: ', err.message);
    return;
  }
});

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

connection.query('CREATE TABLE IF NOT EXISTS presente (id INT AUTO_INCREMENT PRIMARY KEY, descricao TEXT, nome_pessoa TEXT)', (err, results) => {
  if (err) {
    console.error('Erro ao execudar DDL:', err.message);
    return;
  }
});

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
  connection.query('INSERT INTO presente (descricao, nome_pessoa) VALUES (?, ?)', [descricao, pessoa], (err, results) => {
    if (err) {
      console.error('Erro ao inserir o registro: ', err.message);
      return;
    }
    res.json({ message: "Presente adicionado com sucesso!" });
  });
});

app.get("/get-items", (req, res) => {
  connection.query('SELECT * FROM presente', (err, results) => {
    if (err) {
      console.error('Erro ao buscar registros: ', err.message);
      return;
    }
    res.json(results);
  });
});

app.put("/set-item/:id", (req, res) => {
  const { id } = req.params;
  const { descricao, pessoa } = req.body;
  connection.query('UPDATE presente SET descricao = ?, nome_pessoa = ? WHERE id = ?', [descricao, pessoa, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar presente: ', err.message);
      return;
    }
    res.json({ message: "Presente atualizado com sucesso!" });
  });
});

app.put("/set-item-pessoa/:id", (req, res) => {
  const { id } = req.params;
  const { pessoa } = req.body;
  connection.query('UPDATE presente SET nome_pessoa = ? WHERE id = ?', [pessoa, id], (err, results) => {
    if (err) {
      console.error('Erro ao atualizar presente: ', err.message);
      return;
    }
    res.json({ message: "Presente atualizado com sucesso!" });
  });
});

app.delete("/delete-item/:id", (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM presente WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir o presente: ', err.message);
      return;
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