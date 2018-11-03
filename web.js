const express = require('express');
const app = express();

const {page, todoList} = require('./templates');
const {Todo} = require('./lib');

app.use(express.static('public'));

app.get('/', async (req, res) => {
  let todos = await todoList();
  res.status(200)
    .end(page(todos));
});

app.post('/:id', async (req, res) => {
  let {id} = req.params;
  let todo = await Todo.findById(id);
  
  todo.toggleCompleted();
  await todo.save();
  
  res.redirect('/');
});

module.exports = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Running on ${process.env.PORT}`);
  });
};


