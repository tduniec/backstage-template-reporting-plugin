import React, { useState, useEffect } from 'react';

import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

interface TemplateReport {
  id: string;
  created_at: string;
  template_report_template_name: string;
  template_report_template: string;
  template_name: string;
  created_by: string;
}

interface TemplateReportListProps {
  byUser: boolean;
}

const TemplateReportList: React.FC<TemplateReportListProps> = ({ byUser }) => {
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const [data, setData] = useState<TemplateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = (await identityApi.getBackstageIdentity()).userEntityRef;
        let response;
        if (!byUser) {
          response = await fetch(
            `${configApi.getString(
              'backend.baseUrl',
            )}/api/template-reporting/report?user=${userId}`,
          );
        } else {
          response = await fetch(
            `${configApi.getString(
              'backend.baseUrl',
            )}/api/template-reporting/report`,
          );
        }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: TemplateReport[] = await response.json();
        setData(result);
      } catch (err) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [configApi, identityApi, byUser, error]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Template Reports
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Template Name</TableCell>
              <TableCell>Created By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(report => (
              <TableRow key={report.id}>
                <TableCell>
                  <a
                    href={`${configApi.getString(
                      'app.baseUrl',
                    )}/template-reporting/${report.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {report.id}
                  </a>
                </TableCell>
                <TableCell>
                  {new Date(report.created_at).toLocaleString()}
                </TableCell>
                <TableCell>{report.template_name}</TableCell>
                <TableCell>{report.created_by}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TemplateReportList;
