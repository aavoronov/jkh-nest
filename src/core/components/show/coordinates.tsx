import { Box, Label } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs';
import React from 'react';

const Coordinates: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // console.log(property);

  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      <span>
        {record.params['point.coordinates.0'] +
          ', ' +
          record.params['point.coordinates.1']}
      </span>
    </Box>
  );
  //
};

export default Coordinates;
