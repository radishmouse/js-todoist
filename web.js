const express = require('express');
const app = express();

const {Todo} = require('./lib');

function page(content) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Important Stuffs</title>   

  </head>
  <body>
    ${content}
  </body>
</html>
  `;
}

function todoToListItem(todo) {
  let href = todo.url ? `href="${todo.url}"`: '';
  
  return `
  <li>
    <a ${href} target="_blank" rel="noopener noreferrer">
      ${todo.title}
    </a>
  </li>
  `;
}

async function todoList() {
  let todosArray = await Todo.findAll();
  let todoListItems = todosArray.map(todoToListItem).join('');

  return `
    <ul>
      ${todoListItems}
    </ul>
  `;
}

app.get('/', async (req, res) => {
  let todos = await todoList();
  res
    .status(200)
    .end(page(todos));
});

module.exports = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Running on ${process.env.PORT}`);
  });
};


