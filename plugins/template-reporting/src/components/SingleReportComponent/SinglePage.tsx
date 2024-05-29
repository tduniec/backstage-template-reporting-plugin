import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import DataFetchingComponent from '../Paper/Paper';
import { Layout } from '../Layout/Layout';




export const SingleReportPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Typography variant="h6" color="error">Error: No ID provided</Typography>;
  }

  return (
    <Layout>
            <DataFetchingComponent templateReportId={id} />
    </Layout>
  );
};
