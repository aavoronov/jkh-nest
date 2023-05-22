import { Box } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs';
import React from 'react';

const ProfilePic: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // console.log(property);

  return (
    <Box mb="xl">
      <a href={`http://localhost:5000/api/v1/uploads/workers/${value}`}>link</a>
    </Box>
  );
  //
};

export default ProfilePic;
