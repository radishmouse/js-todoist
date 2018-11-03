require('dotenv').config();
const axios = require('axios');
const URL = `https://beta.todoist.com/API/v8`;

const INBOX_NAME = 'Inbox';

const pgp = require('pg-promise')();
const db = pgp({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME
});


function padDate(val) {
  val = val.toString();
  return val.length < 2 ? `0${val}` : val;    
}


class Todo {
  constructor(title, url, completed=false, remoteId=0) {
    this.remoteId = remoteId;    
    this.title = title;
    this.url = url;
    this.completed = completed;
  }

  // Uses destructuring to pluck values out of JSON object sent back
  // from the API
  static from({id, content, completed}) {
    // create a `new Todo` object using the format provided by the
    // Todoist API, where the `content` includes the title and
    // description.
    let {title, url} = Todo._parseTodo(content);

    // Note that the `id` value passed to the constructor is the 
    return new Todo(title, url, completed, id);
  }

  static _parseTodo(content) {
    // Find any URLs in the content and return an object containing a
    // separate title and description (where the description includes
    // the URL)
    const isUrl = p => p.startsWith('http');

    // Get rid of extraneous parens added by Todoist Android app
    content = content.replace('(', ' ');
    content = content.replace(')', ' ');
    content = content.replace('[', ' ');
    content = content.replace(']', ' ');
    
    let parts = content.split(' ');
    let urls = parts.filter(isUrl);
    debugger;
    content = parts.filter(p => !isUrl(p)).join(' ').trim();

    // Assume that there's only one URL...
    let url = urls[0];

    // Use the URL if there's no other textual desc
    if (!content) {
      content = url;
    }

    return {
      title: content,
      url
    };
  }

  static findAll(params) {
    return db.any(`select * from todos order by id`)
      .catch(err => console.log(err));
  }  

  static findByRemoteId(id) {
    return db.any(`select * from todos where remote_id = $1`, id)
      .then(([result]) => {
        const {title, url, completed_on, remote_id} = result;
        return new Todo(title, url, (completed_on != null), remote_id);
      })
      .catch(console.warn);
  }

  static findById(id) {
    return db.any(`select * from todos where id = $1`, id)
      .then(([result]) => {
        const {title, url, completed_on, remote_id} = result;
        return new Todo(title, url, (completed_on != null), remote_id);
      })
      .catch(console.warn);
  }
  
  toggleCompleted() {
    if (this.completed) {
      // if checked, set its `completed_on` to null
      this.completed_on = null;

    } else {
      // else, set its `completed_on` to current datestamp
      let c = new Date();    
      this.completed_on = `${c.getFullYear()}-${padDate(c.getMonth())}-${padDate(c.getDate())}`;
    }
  }

  async save() {
    // saves to the database
    if (this.remoteId) {
      // see if I already exist in the db, based on `this.remoteId`
      let current = await Todo.findByRemoteId(this.remoteId);
      
      if (current) {
        // if so, we'll update        
        console.log(`Existing todo with remoteId: ${current.remoteId}`);
        return db.none(
          `update todos set title=$1, url=$2, completed_on=$4 where remote_id=$3`,
          [this.title, this.url, this.remoteId, this.completed_on]
        ).catch(console.warn);
      } else {
        // If not, we create a new one        
        console.log(`Inserting new todo with remoteId ${this.remoteId}`);
        return db.one(
          `insert into todos (title, url, remote_id) values ($1, $2, $3)`,
          [this.title, this.url, this.remoteId]
        ).catch(console.warn);
      }
    }
    return null; // Not possible to reach this point, just satisfying
                 // the linter.
  }
}

class Todoist {
  constructor() {
    this.INBOX_ID = 0;
  }

  init() {
    // The point right now is to clean up the Inbox, which keeps
    // filling up. So, let's only worry about getting the information
    // for that project.
    
    return this.projects()
      .then(ps => ps.filter(p => p.name === INBOX_NAME))
      .then(([inbox, ...rest]) => this.INBOX_ID = inbox.id)
      .then(() => {
        console.log(`Finished initializing Todoist with Inbox ID ${this.INBOX_ID}`);
      });
  }

  static _fmt(endpoint) {
    // Adds the leading '/' if it is not present.
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  static _get(endpoint, params={}) {
    // Make sure that `endpoint` starts with a leading '/'
    endpoint = this._fmt(endpoint);
    
    let url = `${URL}${endpoint}`;
    const req = axios.get(url, {
      params,
      headers:  {
        "Authorization": `Bearer ${process.env.API_TOKEN}`
      }
    });

    return req;
  }

  projects() {
    return this.constructor._get('/projects')
      .then(r => r.data);
  }

  tasks(project_id) {
    const params = { project_id };
    return this.constructor._get('/tasks', params)
      .then(r => r.data);
  }

  inboxTasks() {
    return this.tasks(this.INBOX_ID);    
  }

  importInbox() {
    this.inboxTasks()
      .then(taskArray => {
        let todoArray = taskArray.map(Todo.from);
        // console.log(todoArray.length);
        todoArray.forEach(todo => todo.save());
      });
  }
}


module.exports = {
  Todoist,
  Todo
};
