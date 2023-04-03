import React from 'react';
import { Box, H3 } from '@adminjs/design-system';
import { ActionProps, ShowPropertyProps } from 'adminjs';

const Color: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;

  return (
    <div>
      <div
        style={{
          backgroundColor: value,
          width: 20,
          height: 20,
          borderRadius: 10,
        }}
      ></div>
    </div>
  );
  //
};

export default Color;
