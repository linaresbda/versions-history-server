

const Hapi = require('@hapi/hapi');
const Git = require('./util-git');

let git = new Git();

const repoURL = 'https://github.com/linaresbda/versions-history-server.git';
const repoName = 'versions-history-server';

class ServerClass {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }

  init() {
    // Referencia Server Options: https://hapi.dev/api/?v=18.4.0#server.options
    const server = Hapi.server({
      port: 81,
      host: 'localhost'
    });
    setRoutes(server);
    setEvents(server);
    server.start();
  };
}

const setRoutes = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    handler: async function (request, h) {
      try {
        await git.log(repoName);
      } catch (error) {

      }
      return 'Hello World!';
    }
  });
}

const setEvents = (server) => {
  server.events.on('route', (route) => {
    console.log(`New route added: ${route.path}`);
  });
  server.events.on('start', async () => {
    console.log(`Server running on port: ${server.info.port}`);

    // Logica para clonar el repositorio de Git o actualizarlo.
    try {
      await git.clone(repoURL, repoName);
    } catch (error) {
      console.error(error.message);
    }
  });
  server.events.on('stop', () => {
    console.log(`Server stopped`);
  });
  server.events.on('response', (request) => {
    console.log(`Response sent for request: ${request.info.id}`);
  });
  server.events.on('log', (event, tags) => {
    if (tags.error) {
      console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
    }
  });
}

let Server = new ServerClass();

module.exports = Server;