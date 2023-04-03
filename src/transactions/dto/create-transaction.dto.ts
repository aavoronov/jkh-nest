export enum TransactionTypes {
  siteWiseAd = 'site-wise ad',
  chatAd = 'chat ad',
  TPTop3d = 'TP product - top 3d',
  TPTop7d = 'TP product - top 7d',
  TPVip = 'TP product - vip',
  TPTop3dVip = 'TP product - vip + top 3d',
  TPTop7dVip = 'TP product - vip + top 7d',
  serviceAd = 'service ad',
  utility = 'utility',
  default = 'other',
}

export class CreateTransactionDto {
  basis: TransactionTypes;
  userId: number;
  objectId: number;
  sum: number;
}
