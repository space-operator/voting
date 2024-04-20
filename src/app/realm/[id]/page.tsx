import React from 'react';

const RealmPage = ({ params }: { params: { id: string } }) => {
  return <div>hello {params.id}</div>;
};

export default RealmPage;
