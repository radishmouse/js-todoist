require('dotenv').config();
const axios = require('axios');
const URL = `https://beta.todoist.com/API/v8`;

const INBOX_NAME = 'Inbox';

const pgp = require('pg-promise')();
const db = pgp({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME
});



class Todo {
  constructor(title, description, completed=false, remoteId=0) {
    // this.id = id;
    this.remoteId = remoteId;    
    this.title = title;
    this.description = description;
    this.completed = completed;
  }

  // Uses destructuring to pluck values out of JSON object sent back
  // from the API
  static from({id, content, completed}) {
    // create a `new Todo` object using the format provided by the
    // Todoist API, where the `content` includes the title and
    // description.
    let {title, description} = Todo._parseTodo(content);

    // Note that the `id` value passed to the constructor is the 
    return new Todo(title, description, completed, id);
  }

  static _parseTodo(content) {
    // Find any URLs in the content and return an object containing a
    // separate title and description (where the description includes
    // the URL)
    const isUrl = p => p.startsWith('http');

    let parts = content.split(' ');
    let urls = parts.filter(isUrl);

    // Get rid of extraneous parens added by Todoist Android app
    content = parts.filter(p => !isUrl(p)).join(' ');
    content = content.replace('(', '');
    content = content.replace(')', '');

    // Assume that there's only one URL...
    let url = urls[0];

    // Use the URL if there's no other textual desc
    if (!content) {
      content = url;
    }
    
    return {
      title: content,
      description: url
    };
  }

  static findAll(params) {
    return db.any(`select * from todos`)
      .catch(err => console.log(err));
  }  

  static findByRemoteId(id) {
    return db.one(`select * from todos where remote_id = $1`, id);
  }

  async save() {
    // saves to the database
    if (this.remoteId) {
      // see if I already exist in the db, based on `this.remoteId`
      let current = await Todo.findByRemoteId(this.remoteId);
      // if so, we'll update
      if (current) {
        console.log('it exists, let\'s update it');
      } else {
        console.log('there are nuthings. let us to updatey');
        // return db.one();
      }
      // if not, insert a new record      
    }
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
      ...params,
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
}


module.exports = {
  Todoist,
  Todo
};
