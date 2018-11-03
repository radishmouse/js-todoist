const {Todo} = require('./lib');

function page(content) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Important Stuffs</title>   
    <link rel="stylesheet" href="/stylesheets/normalize.css">
    <link rel="stylesheet" href="/stylesheets/index.css">
  </head>
  <body>
    <section class="todos-container">
      ${content}
    </section>
  </body>
</html>
  `;
}

function todoToListItem(todo) {
  let href = todo.url ? `href="${todo.url}"`: '';
  let checked = todo.completed_on ? 'checked=checked' : '';
  
  return `
  <li>
    <form class="todo-form" method="POST" action="/${todo.id}">
      <input 
        type="checkbox" 
        ${checked}
        onChange="this.form.submit()"
      >
    </form>

    <a ${href} target="_blank" rel="noopener noreferrer">
      ${todo.title} (${todo.id})
    </a>
  </li>
  `;
}

async function todoList() {
  let todosArray = await Todo.findAll();
  let todoListItems = todosArray.map(todoToListItem).join('');

  return `
    <ul class="todos">
      ${todoListItems}
    </ul>
  `;
}

module.exports = {
  page,
  todoList
};
