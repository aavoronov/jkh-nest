export type TTypeChat = 'group' | 'personal';

export interface IMessageBody {
  email: string;
  pseudonym: string;
  text: string;
  color: string;
  // file: Buffer | Blob | string | undefined;
  file: string | undefined;
  filename: string | undefined;
  roomId: string;
}

export interface IMessage {
  sender: string;
  //   room: string;
  message: string;
  //   emoji?: string;
}
export interface IRooms {
  sender: string;
}
export interface ISender {
  sender: string;
}
export interface IGetMessages {
  sender: string;
  room: string;
  page: string;
}
export interface IBodyCreate {
  name: string;
  description: string;
  type?: TTypeChat;
  users: string | number[];

  access: boolean;
  role: string;
  user: {
    id: number;
  };
}

export interface IRequestMessage {
  message: string;
  status: number;
  data?: any;
  files?: any;
}
