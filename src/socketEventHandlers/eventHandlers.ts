import { Server } from 'socket.io'
import comments from './comments'
import { AppData, SockeIoEvent } from './socketTypes'
import middlewares from '../api/middlewares';

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// --------------------------------------
// -------- SOCKET.IO handlers ----------
// --------------------------------------

const app: AppData = {
  allSockets: []
};
const userSocketIdMap = new Map();

// structure inspired by
// https://stackoverflow.com/questions/20466129/how-to-organize-socket-handling-in-node-js-and-socket-io-app
export default (io: Server) => {
  const nsp = io.of('/api');
  nsp.use(wrap(middlewares.isAuth));
  nsp.use(wrap(middlewares.attachCurrentUser));

  nsp.on('connection', async (socket: any) => {

    const eventHandlers = [
      comments(app, socket)
    ]

    // Bind events to handlers
    eventHandlers.forEach(handler => {
      for (let eventName in handler) {
        socket.on(eventName, handler[eventName])
      }
    })

    socket.on(SockeIoEvent.DISCONNECT, () => {
      console.log('Client disconnected');
    });

    // Keep track of the socket
    app.allSockets.push(socket)
  });
}
