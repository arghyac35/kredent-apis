export interface Socket<OnData, EmitData> {
  on(event: string, callback: (data: OnData) => void)
  emit(event: string, data: EmitData)
}

export type AppData = {
  allSockets: Socket<any, any>[],
}

export enum SockeIoEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  COMMENT = 'comment',
  FETCH_COMMENTS = 'fetchComments',
  ADD_COMMENTS = 'addComment',
  DELETE_COMMENT = 'deleteComment',
  ADD_REPLY = 'addReply',
  DELETE_REPLY = 'deleteReply',
  COMMENT_DELETED = 'commentDeleted',
  REPLY_DELETED = 'replyDeleted',
  COMMENT_POSTED = 'commentPosted',
  REPLY_POSTED = 'replyPosted'
}
