require('dotenv').config();
const axios = require('axios');
const URL = `https://beta.todoist.com/API/v8`;


class Todoist {
  constructor() {
    
  }

  _fmt(endpoint) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }


  get(endpoint) {    
    endpoint = this._fmt(endpoint);
    let url = `${URL}${endpoint}`;
    const req = axios.get(url, {
      headers:  {
        "Authorization": `Bearer ${process.env.API_TOKEN}`
      }
    });

    return req;
  }
}

function projects() {
  const T = new Todoist();
  T.get('/projects').then(r => r.data).then(console.log);
}


projects();

module.exports = {
  Todoist,
  projects
};
