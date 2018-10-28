require('dotenv').config();
const axios = require('axios');
const URL = `https://beta.todoist.com/API/v8`;

const INBOX_NAME = 'Inbox';

class Todo {
  constructor(id, title, description, completed=false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.completed = completed;
  }

  static from(id, content, completed) {
    // create a `new Todo` object using the format provided by the
    // Todoist API, where the `content` includes the title and
    // description.
    let {title, description} = Todo._parseTodo(content);
    return new Todo(id, title, description, completed);
  }

  static _parseTodo(content) {
    // Find any URLs in the content and return an object containing a
    // separate title and description (where the description includes
    // the URL)
    const isUrl = p => p.startsWith('http');

    let parts = content.split(' ');
    let urls = parts.filter(isUrl);

    content = parts.filter(p => !isUrl(p)).join(' ');
    content = content.replace('(', '');
    content = content.replace(')', '');

    let url = urls[0];
    
    if (!content) {
      content = url;
    }
    
    return {
      title: content,
      description: url
    };

  }  
}

class Todoist {
  constructor() {
    // this.projects = {};
    this.INBOX_ID = 0;
    // this.tasks = [];
  }

  init() {

    return this.projects()
      .then(d => d.filter(t => t.name === INBOX_NAME))
      .then(([inbox, ...rest]) => this.INBOX_ID = inbox.id)
      .then(() => {
        console.log(`Finished initializing Todoist with Inbox ID ${this.INBOX_ID}`);
        // return this;
      });

}

  static _fmt(endpoint) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  static _get(endpoint, params={}) {    
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
    // console.log(this);
    return this.tasks(this.INBOX_ID);    
  }
}


module.exports = {
  Todoist,
  Todo
};
