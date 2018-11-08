const express = require('express');
const app = express();

const {
  page,
  todoList,
  form
} = require('./templates');

const {Todo, Todoist} = require('./lib');

app.use(express.static('public'));

app.get('/', async (req, res) => {
  let todosArray = await Todo.findAll();  
  let todos = todoList(todosArray);

  res.status(200)
    .end(page(todos));
});

app.get('/:id([0-9]*)', async (req, res) => {
  let {id} = req.params;
  let todo = await Todo.findById(id);

  res.status(200)
    .end(page(form(todo)));
});

app.post('/:id([0-9]*)', async (req, res) => {
  let {id} = req.params;
  let todo = await Todo.findById(id);
  
  todo.toggleCompleted();
  await todo.save();
  
  res.redirect('/');
});

app.post('/import', async (req, res) => {
  let T = new Todoist();
  T.init()
    .then(() => {
      console.log(T.INBOX_ID);
      return T.importInbox();
    })
    .then((vals) => {
      console.log(`Imported ${vals.length} todos from Todoist`);
      res.redirect('/');
    });
});

module.exports = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Running on ${process.env.PORT}`);
  });
};


