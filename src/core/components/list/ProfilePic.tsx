import { ShowPropertyProps } from 'adminjs';
import React from 'react';

const ProfilePic: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // // console.log(record.params);

  return (
    <div>
      {value ? (
        <img
          src={`${process.env.API_URL}uploads/profiles/${value}`}
          style={{ width: 40 }}
        />
      ) : (
        <span>-</span>
      )}
    </div>
  );
};

export default ProfilePic;
