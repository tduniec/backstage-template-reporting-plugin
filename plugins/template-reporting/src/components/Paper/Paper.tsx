import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { Box, Card, Divider, Grid, Paper } from '@material-ui/core';
import MarkdownIt from 'markdown-it';
import { scaffolderApiRef } from '@backstage/plugin-scaffolder-react';

interface DataFetchingComponentProps {
  templateReportId: string;
}

const DataFetchingComponent: React.FC<DataFetchingComponentProps> = ({
  templateReportId,
}) => {
  const configApi = useApi(configApiRef);
  const scaffolderApi = useApi(scaffolderApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [data, setData] = useState<string | null>(null);
  const [fullReport, setFullReport] = useState<any | null>(null);
  const [scaffolderObj, setScaffolderObj] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchApi.fetch(
          `${configApi.getString(
            'backend.baseUrl',
          )}/api/template-reporting/report/${templateReportId}`,
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        try {
          const scaffolderTask = await scaffolderApi.getTask(
            jsonData.template_task_id,
          );
          setScaffolderObj(scaffolderTask);
        } catch (err) {
          setScaffolderObj({ status: 'NOT FOUND' });
        }
        const ren = new MarkdownIt().renderer.render(
          JSON.parse(jsonData.report_rendered_content as string),
          {},
          undefined,
        );

        setData(ren);
        setFullReport(jsonData);
      } catch (err) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scaffolderApi, templateReportId, configApi, error]);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        Error: {error.message}
      </Typography>
    );
  }

  const statusColor = scaffolderObj.status === 'completed' ? 'green' : 'red';

  return (
    <Box>
      <Paper elevation={3}>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">
              <b>Template Name:</b>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography>{fullReport.template_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">
              <b>Template Task ID:</b>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography>{fullReport.template_task_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">
              <b>Created by:</b>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography>{fullReport.created_by}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6">
              <b>Template status:</b>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography style={{ color: statusColor }}>
              {scaffolderObj.status}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Divider />
      <br />
      <br />
      <Card variant="outlined">
        <div dangerouslySetInnerHTML={{ __html: data as string }} />
      </Card>
    </Box>
  );
};

export default DataFetchingComponent;
