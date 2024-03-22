import { Container, Text, Title } from '@dataesr/dsfr-plus';
import schema from '../../../../../../docs/scanr_projects.json';
import SchemaDocumentation from '../components/schema-documentation';


export default function ProjectsDocs() {
  return (
    <Container className="fr-mb-8w">
      <Title as="h1" look="h3">Projects</Title>
      <Text>
        This page describes the fields of the <code>projects</code> resource of the ScanR API.
      </Text>
      <SchemaDocumentation schema={schema} />
    </Container>
  );
}