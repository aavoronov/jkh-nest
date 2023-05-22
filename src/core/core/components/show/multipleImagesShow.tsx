import { Box, Label } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs';
import React from 'react';

const MultipleImagesShow: React.FC<ShowPropertyProps> = (
  props: ShowPropertyProps,
) => {
  const { record, property } = props;

  const refId = record.params[property.path];
  const populated = record.populated[property.path];
  const value = (populated && populated.title) || refId;
  // console.log(record);

  const images = [];
  for (let i = 0; i < 10; i++) {
    if (!!record.params[`images.${i}`])
      images.push(record.params[`images.${i}`]);
  }
  // console.log(images);

  return (
    <Box mb="xl">
      <Label style={{ color: '#898A9A', marginBottom: 4 }}>
        {property.name}
      </Label>
      {images.length ? (
        images.map((item, index) => (
          <a
            style={{ marginRight: 10 }}
            key={index}
            target="_blank"
            href={`http://localhost:5000/api/v1/uploads/map-objects/${item}`}
          >
            <img
              src={`http://localhost:5000/api/v1/uploads/map-objects/${item}`}
              style={{ width: 80 }}
            />
          </a>
        ))
      ) : (
        <span>-</span>
      )}
    </Box>
  );
  //
};

export default MultipleImagesShow;
