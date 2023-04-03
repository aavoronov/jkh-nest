import React from 'react';
import { Box, H3, Label } from '@adminjs/design-system';
import { ActionProps } from 'adminjs';
import { ShowPropertyProps } from 'adminjs/types/src';

const mapObjectDetailsLink = (props: ShowPropertyProps) => {
  const { record, property } = props;
  console.log(record);
  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      <a
        href={`http://localhost:5000/admin/resources/MapObjectDetails/records/${record.params.objectId}/show`}
      >
        link
      </a>
    </Box>
  );
};

export default mapObjectDetailsLink;
