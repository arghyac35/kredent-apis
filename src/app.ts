import 'reflect-metadata'; // We need this in order to use @Decorators

import config from './config';

import express from 'express';

import Logger from './loaders/logger';

import { createServer, Server } from 'http';
import socketIoHandlers from './socketEventHandlers/eventHandlers'

async function startServer() {
  const app = express();

  await require('./loaders').default({ expressApp: app });

  const server: Server = createServer(app);

  server.listen(config.port, () => {
    Logger.info(`
    ################################################
    🛡️  Server listening on port: ${config.port} 🛡️
    ################################################
  `);
  }).on('error', err => {
    Logger.error(err);
    process.exit(1);
  });

  const io = require("socket.io")(server, {
    cors: {
      origin: config.allowedOrigins.split(','),
      methods: ["GET", "POST"]
    }
  });

  socketIoHandlers(io)

}

startServer();
