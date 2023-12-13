import { Box, Label } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs';
import React from 'react';

const ProfilePic: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // // console.log(record.params);

  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      {value ? (
        <a href={`${process.env.API_URL}uploads/profiles/${value}`}>
          <img
            src={`${process.env.API_URL}uploads/profiles/${value}`}
            style={{ width: 40 }}
          />
        </a>
      ) : (
        <span>-</span>
      )}
    </Box>
  );
  //
};

export default ProfilePic;
