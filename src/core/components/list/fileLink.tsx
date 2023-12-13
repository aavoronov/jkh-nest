import { Box } from '@adminjs/design-system';
import AdminJS, { ShowPropertyProps } from 'adminjs';
import React from 'react';

const ProfilePic: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // console.log(property);

  return (
    <Box mb="xl">
      <a href={`${process.env.API_URL}uploads/workers/${value}`}>link</a>
    </Box>
  );
  //
};

export default ProfilePic;
