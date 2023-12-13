import { Box, Label } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs/types/src';
import React from 'react';

const mapObjectDetailsLink = (props: ShowPropertyProps) => {
  const { record, property } = props;
  // console.log(record);
  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      <a
        href={`${process.env.ADMIN_URL}/resources/MapObjectDetails/records/${record.params.objectId}/show`}
      >
        link
      </a>
    </Box>
  );
};

export default mapObjectDetailsLink;
