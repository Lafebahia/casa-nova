const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const db = new sqlite3.Database("./database.db");

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

db.run("CREATE TABLE IF NOT EXISTS presente (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT, nome_pessoa TEXT)");

// Rotas da navbar 
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/cadastro", (req, res) => {
    res.sendFile(__dirname + "/public/cadastro.html");
});

app.get("/presente", (req, res) => {
    res.sendFile(__dirname + "/public/presente.html");
});

app.get("/sobre", (req, res) => {
    res.sendFile(__dirname + "/public/sobre.html");
});

// Rota presente
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

app.delete("/delete-item/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM presente WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao excluir o presente" });
    }
    res.json({ message: "Presente excluído com sucesso!" });
  });
});
  
// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta:${PORT}`);
});
