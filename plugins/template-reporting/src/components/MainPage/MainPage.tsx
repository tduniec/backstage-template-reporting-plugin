import React, { useState } from 'react';
import { FormControlLabel, FormGroup, Grid, Switch } from '@material-ui/core';
import TemplateReportList from '../ListOfReports/ListOfReports';
import { Layout } from '../Layout/Layout';

export const ExampleComponent = () => {
  const [showAllReports, setShowAllReports] = useState(false);

  // Step 3: Handle switch change
  const handleSwitchChange = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setShowAllReports(event.target.checked);
  };

  return (
    <Layout>
      <Grid container spacing={4} direction="column">
        <FormGroup>
          <FormControlLabel
            control={
              <Switch checked={showAllReports} onChange={handleSwitchChange} />
            }
            label="All reports"
          />
        </FormGroup>
        <TemplateReportList byUser={showAllReports} />
      </Grid>
    </Layout>
  );
};
