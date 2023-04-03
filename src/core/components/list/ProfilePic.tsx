import React from 'react';
import { Box, H3 } from '@adminjs/design-system';
import { ActionProps, ShowPropertyProps } from 'adminjs';

const ProfilePic: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // console.log(record.params);

  return (
    <div>
      {value ? (
        <img
          src={`http://localhost:5000/api/v1/uploads/profiles/${value}`}
          style={{ width: 40 }}
        />
      ) : (
        <span>-</span>
      )}
    </div>
  );
};

export default ProfilePic;
