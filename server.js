const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Módulo para manipulação de arquivos

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const db = new sqlite3.Database('escola.db');
db.run(`CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY,
    materia TEXT,
    titulo TEXT,
    descricao TEXT,
    data_entrega DATE,
    professor TEXT,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    imagem TEXT
)`);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'aluno.html'));
});

app.get('/tarefas', (req, res) => {
    db.all('SELECT * FROM tarefas ORDER BY data_entrega', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

app.post('/tarefas', upload.single('imagem'), (req, res) => {
    const { materia, titulo, descricao, data_entrega, professor } = req.body;
    const imagemPath = req.file ? 'uploads/' + req.file.filename : null;

    if (!materia || !titulo || !data_entrega || !professor) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    db.run('INSERT INTO tarefas (materia, titulo, descricao, data_entrega, professor, imagem) VALUES (?, ?, ?, ?, ?, ?)',
        [materia, titulo, descricao, data_entrega, professor, imagemPath], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, ...req.body, imagem: imagemPath });
        });
});

app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;

    // Primeiro, busque o caminho da imagem para poder removê-la
    db.get('SELECT imagem FROM tarefas WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Tarefa não encontrada." });
        }

        const imagemPath = row.imagem;

        db.run('DELETE FROM tarefas WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes > 0) {
                // Se a tarefa foi removida, tente remover a imagem também
                if (imagemPath) {
                    const fullPath = path.join(__dirname, 'public', imagemPath);
                    fs.unlink(fullPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Erro ao remover arquivo de imagem:', unlinkErr);
                        }
                    });
                }
                res.status(200).json({ message: "Tarefa removida com sucesso." });
            } else {
                res.status(404).json({ error: "Tarefa não encontrada." });
            }
        });
    });
});


// Inicia o servidor
app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
    console.log('Acesse a página do professor: http://localhost:3000/professor.html');
    console.log('Acesse a página do aluno: http://localhost:3000/aluno.html');
});