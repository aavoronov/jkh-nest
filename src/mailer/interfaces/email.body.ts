export interface IEmailRegister {
  verification: string;
  email: string;
}
export interface IEmailUpdatePassword {
  password: string;
  email: string;
}

export interface IEmailChatAdApproval {
  email: string;
  description: string;
}
