import { SockeIoEvent } from './socketTypes'
import { Container } from 'typedi';
import CommentsService from '../services/comments';

const comments = (app: any, socket: any) => {
  const handler = {
    [SockeIoEvent.COMMENT]: newComments(app, socket),
    [SockeIoEvent.FETCH_COMMENTS]: fetchComments(app, socket),
    [SockeIoEvent.DELETE_COMMENT]: deleteComments(app, socket),
  }
  return handler
}

// Events
const newComments = (app, socket) => async (data) => {
  let returnData: any = '';

  try {
    const commentServiceInstance = Container.get(CommentsService);
    returnData = await commentServiceInstance.addComment(data);
    socket.emit(SockeIoEvent.COMMENT_POSTED, 'Commented posted successfully');
  } catch (error) {
    returnData = { err: error.message };
  }

  app.allSockets.forEach(soc => {
    soc.emit(SockeIoEvent.FETCH_COMMENTS, returnData);
  })
}

const fetchComments = (app, socket) => async (data) => {
  let returnData: any = '';

  try {
    const commentServiceInstance = Container.get(CommentsService);
    returnData = await commentServiceInstance.fetchCommentsByPost(data.postID);
  } catch (error) {
    returnData = { err: error.message };
  }

  app.allSockets.forEach(soc => {
    soc.emit(SockeIoEvent.FETCH_COMMENTS, returnData);
  })
}

const deleteComments = (app, socket) => async (data) => {
  let returnData: any = '';

  try {
    const commentServiceInstance = Container.get(CommentsService);
    returnData = await commentServiceInstance.deleteComment(data);
    socket.emit(SockeIoEvent.COMMENT_DELETED, 'Comment deleted successfully');
  } catch (error) {
    returnData = { err: error.message };
  }

  app.allSockets.forEach(soc => {
    soc.emit(SockeIoEvent.FETCH_COMMENTS, returnData);
  })
}

export default comments
