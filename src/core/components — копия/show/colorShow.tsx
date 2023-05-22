import { Box, Label } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs';
import React from 'react';

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
