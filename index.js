const express = require('express');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth');
const app = express();

// Puerto dinámico (para Render)
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());
app.use(express.static('public'));

// Autenticación básica (protege /tasks)
const auth = basicAuth({
  users: { 'Grupo': 'GrupoPass1234' },
  challenge: true,
  realm: 'Acceso restringido'
});

// Conexión a MongoDB Atlas
const MONGO_URI = 'mongodb+srv://Grupo:GrupoPass1234@cloudappcluster.wvv5ppj.mongodb.net/cloudApp?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });

// Esquema y modelo de Tarea
const taskSchema = new mongoose.Schema({ text: String });
const Task = mongoose.model('Task', taskSchema);

// Ruta principal (pública)
app.get('/', (req, res) => {
  res.send('
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="/public/styles.css">
    </head>
    <body>
    <h1>App de Tareas del Grupo</h1><p>Visita <a href="/tasks">/tasks</a> (requiere usuario y contraseña).</p>
    </body>
    ');
});

// Rutas protegidas
app.use('/tasks', auth);

// Ver todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Añadir tarea
app.post('/tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'El campo "text" es obligatorio' });
    
    const newTask = new Task({ text });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Eliminar tarea
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
