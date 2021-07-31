export interface IComment {
  _id: string,
  user: string,
  comment: string,
  post: string,
  isDeleted: boolean,
  parentId: string,
  replies?: any[]
}

export interface ICommentInputDTO {
  user: string,
  comment: string,
  post: string,
  isDeleted: boolean,
  parentId: string
}
