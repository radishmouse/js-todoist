const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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


app.post('/:id([0-9]+)/toggle', async (req, res) => {
  let {id} = req.params;
  let todo = await Todo.findById(id);
  
  todo.toggleCompleted();
  await todo.save();
  
  res.redirect('/');
});

app.get('/:id(\\d+)/edit', async (req, res) => {
  console.log(req.params);
  let {id} = req.params;
  let todo = await Todo.findById(id);
  
  res.status(200)
    .end(page(form(todo)));
});

app.post('/:id([0-9]+)/edit', async (req, res) => {
  let {id} = req.params;
  let {
    title,
    url,
    completed
  } = req.body;


  let todo = await Todo.findById(id);
  todo.title = title;
  todo.url = url;
  todo.completedOn = completed;
  await todo.save();
  
  res.redirect(`/${todo.id}/edit`);
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


