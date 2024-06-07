import React, { useState, useEffect } from 'react';
import {
  configApiRef,
  fetchApiRef,
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
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';

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
  const fetchApi = useApi(fetchApiRef);
  const [data, setData] = useState<TemplateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState('');

  const handleFilterChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setFilter(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = (await identityApi.getBackstageIdentity()).userEntityRef;
        let response;
        if (!byUser) {
          response = await fetchApi.fetch(
            `${configApi.getString(
              'backend.baseUrl',
            )}/api/template-reporting/report?user=${userId}`,
          );
        } else {
          response = await fetchApi.fetch(
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
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchApi, configApi, identityApi, byUser]);

  const filteredData = data.filter(report => {
    return (
      report.id.toLowerCase().includes(filter.toLowerCase()) ||
      new Date(report.created_at)
        .toLocaleString()
        .toLowerCase()
        .includes(filter.toLowerCase()) ||
      report.template_name.toLowerCase().includes(filter.toLowerCase()) ||
      report.created_by.toLowerCase().includes(filter.toLowerCase())
    );
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Container>
      <TextField
        fullWidth
        label="Filter"
        variant="outlined"
        value={filter}
        onChange={handleFilterChange}
        style={{ marginBottom: '20px' }}
      />
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
            {filteredData.map(report => (
              <TableRow key={report.id}>
                <TableCell>
                  <Link
                    href={`${configApi.getString(
                      'app.baseUrl',
                    )}/template-reporting/${report.id}`}
                  >
                    {report.id}
                  </Link>
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
