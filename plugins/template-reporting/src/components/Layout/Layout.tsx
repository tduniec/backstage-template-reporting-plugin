import React, { ReactNode } from 'react';
import {
  Page,
  Header,
  HeaderLabel,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <Page themeId="tool">
    <Header
      title="Template Reports"
      subtitle="Generated reports from your templates"
    >
      <HeaderLabel label="Owner" value="Rackspace" />
    </Header>
    <Content>
      <ContentHeader title="">
        <SupportButton>
          Generate reports based on your template, combine your outputs in
          customized fashion using nunjuck and markdown files
        </SupportButton>
      </ContentHeader>
      {children}
    </Content>
  </Page>
);
