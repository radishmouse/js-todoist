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

function form(todo) {
  let href = todo.url ? `href="${todo.url}"`: '';
  let checked = todo.completedOn ? 'checked=checked' : '';
  
  return `
<a href="/">Back to list</a>
<form method="POST" action="/${todo.id}/edit">
<label> Title
  <input name="title" value="${todo.title}">
</label>
<br>
<label> URL
  <input name="url" value="${todo.url ? todo.url : ''}">
</label>
<br>
<label> Completed
  <input name="completed" type="checkbox" ${checked}>
</label>
<br>
  <input type="submit">
</form>
`;
}

function todoToListItem(todo) {
  let href = todo.url ? `href="${todo.url}"`: '';
  let checked = todo.completedOn ? 'checked=checked' : '';

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
    (<a href="/${todo.id}/edit">edit</a>)
  </li>
  `;
}

function todoList(todosArray) {
  let todoListItems = todosArray.map(todoToListItem).join('');
  return `
    <form action="/import" method="POST">
      <input type="submit" value="Import from Todoist">
    </form>
    <ul class="todos">
      ${todoListItems}
    </ul>
  `;
}

module.exports = {
  page,
  todoList,
  form
};
