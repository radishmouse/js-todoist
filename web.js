const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res
    .status(200)
    .end(`
<h1>hey</h1>
    `);
});

module.exports = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Running on ${process.env.PORT}`);
  });
};


