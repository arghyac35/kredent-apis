export interface IPost {
  _id: string,
  user: string,
  details: string
}

export interface IPostInputDTO {
  user: string,
  details: string
}
