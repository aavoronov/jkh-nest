import { ShowPropertyProps } from 'adminjs/types/src';
import React, { useState } from 'react';

const mapObjectDetailsLink = (props: ShowPropertyProps) => {
  const { record, property } = props;
  // console.log(record);
  const [id, setId] = useState<number>(0);

  // async function getId() {
  //   try {
  //     const details = await MapObjectDetails.findOne({
  //       where: { objectId: record.params.id },
  //     });
  //     // console.log(details.id);
  //     setId(details.id);
  //   } catch (e) {
  //     // console.log(e);
  //   }
  // }

  // useEffect(() => {
  // getId();
  // }, []);

  return (
    <a
      href={`http://localhost:5000/admin/resources/MapObjectDetails/records/${id}/show`}
    >
      link
    </a>
  );
};

export default mapObjectDetailsLink;
