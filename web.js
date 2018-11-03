const express = require('express');
const app = express();

const {page, todoList} = require('./templates');

app.use(express.static('public'));

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


