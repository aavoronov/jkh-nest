import { Box, Label } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs/types/src';
import React from 'react';

const ObjectWithComplaint = (props: ShowPropertyProps) => {
  const { record, property } = props;

  enum Types {
    mapObject = 'map object',
    mapReview = 'map review',
    mapReply = 'map reply',
    tradingPlatform = 'trading platform',
    service = 'service',
    serviceReview = 'service review',
    chatMessage = 'chat message',
    poll = 'poll',
  }
  const typeMap = new Object({
    [Types.mapObject]: 'MapObjects',
    [Types.mapReview]: 'MapObjectReviews',
    [Types.mapReply]: 'MapObjectReplies',
    [Types.tradingPlatform]: 'TradingPlatformProducts',
    [Types.service]: 'Services',
    [Types.serviceReview]: 'ServiceReviews',
    [Types.chatMessage]: 'Messages',
    [Types.poll]: 'Polls',
  });
  const objectType = record.params.objectType;

  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      <a
        href={`http://localhost:5000/admin/resources/${typeMap[objectType]}/records/${record.params.objectId}/show`}
      >
        link
      </a>
    </Box>
  );
};

export default ObjectWithComplaint;
