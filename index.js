// import {Todoist} from './lib';
const {
  Todoist,
  Todo
} = require('./lib');

function main() {
  let T = new Todoist();
  T.init()
    .then(() => {
      console.log('about to log T');
      console.log(T);
      return T.inboxTasks();
    })
    .then(arr => arr.map(Todo.from))
    // .then(tasks => tasks.map(t => t.content))
    // .then(contentArray => contentArray.map(Todo._parseTodo))
    .then(console.log)
    // .catch(err => console.log('sigh. internet.'))
}

main();
