export enum Types {
  mapObject = 'map object',
  mapReview = 'map review',
  mapReply = 'map reply',
  tradingPlatform = 'trading platform',
  service = 'service',
  serviceReview = 'service review',
  chatMessage = 'chat message',
  poll = 'poll',
}

export class CreateComplaintDto {
  reason?: string;
  text: string;
  type: Types;
  objectId: number;
}
