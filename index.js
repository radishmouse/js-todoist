// import {Todoist} from './lib';
const {
  Todoist,
  Todo
} = require('./lib');

const web = require('./web');

function main() {
  web();
  // Todo.findAll()
  // .then(console.log)
  // .catch(console.log)
  // let T = new Todoist();
  // T.init()
  //   .then(() => {
  //     // console.log('about to log T');
  //     console.log(T);
  //     console.log(T.INBOX_ID)
  //     return T.importInbox();
  //   })
  //   .then(arr => arr.map(Todo.from))
  //   // .then(tasks => tasks.map(t => t.content))
  //   // .then(contentArray => contentArray.map(Todo._parseTodo))
  //   .then(console.log)
  //   // .catch(err => console.log('sigh. internet.'))
}

main();
