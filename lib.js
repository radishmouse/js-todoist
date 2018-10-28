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

  // Uses destructuring to pluck values out of JSON object sent back
  // from the API
  static from({id, content, completed}) {
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
