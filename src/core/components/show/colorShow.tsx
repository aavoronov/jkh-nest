import React from 'react';
import { Box, H3, Label } from '@adminjs/design-system';
import { ActionProps, ShowPropertyProps } from 'adminjs';

const ColorShow: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;

  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      <span>{value}</span>
      <div
        style={{
          backgroundColor: value,
          width: 20,
          height: 20,
          borderRadius: 10,
        }}
      ></div>
    </Box>
  );
  //
};

export default ColorShow;
