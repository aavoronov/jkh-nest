import React from 'react';
import { Box, H3, H4, Label } from '@adminjs/design-system';
import { ActionProps, ShowPropertyProps } from 'adminjs';
import { PropertyLabel } from 'adminjs/types/src/frontend';

const Coordinates: React.FC<ShowPropertyProps> = (props: ShowPropertyProps) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  console.log(record);

  return (
    <Box mb="xl">
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
