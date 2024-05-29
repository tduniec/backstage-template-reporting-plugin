import React, { useState, useEffect } from 'react';
import {
  Container,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { configApiRef, identityApiRef, useApi } from '@backstage/core-plugin-api';

interface TemplateReport {
  id: string;
  created_at: string;
  template_report_template_name: string;
  template_report_template: string;
  template_name: string,
  created_by: string;
}


interface TemplateReportListProps {
  byUser: boolean;
}

const TemplateReportList: React.FC<TemplateReportListProps> = ({byUser}) => {
  const configApi = useApi(configApiRef);
  const identityApi = useApi(identityApiRef)
  const [data, setData] = useState<TemplateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  

  useEffect(() => {

    const fetchData = async () => {
      try {
        const userId = (await identityApi.getBackstageIdentity()).userEntityRef
        var response;
        if (!byUser) {
         response = await fetch(
            `${configApi.getString('backend.baseUrl')}/api/template-reporting/report?user=${userId}`,
        );
      } else {
         response = await fetch(
        `${configApi.getString('backend.baseUrl')}/api/template-reporting/report`,
        )
      
      }
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result: TemplateReport[] = await response.json();
        setData(result);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [byUser]);

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
            {data.map((report) => (
              <TableRow key={report.id}>
              <TableCell>
                  <a href={`${configApi.getString('app.baseUrl')}/template-reporting/${report.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {report.id}
                  </a>
                </TableCell>                
                <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
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
