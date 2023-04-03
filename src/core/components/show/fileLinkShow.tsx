import React from 'react';
import { Box, H3, H4, Label } from '@adminjs/design-system';
import { ActionProps, ShowPropertyProps } from 'adminjs';
import { PropertyLabel } from 'adminjs/types/src/frontend';

const ProfilePic: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  console.log(property);

  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      <a href={`http://localhost:5000/api/v1/uploads/workers/${value}`}>link</a>
    </Box>
  );
  //
};

export default ProfilePic;
