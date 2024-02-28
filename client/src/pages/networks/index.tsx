import { FormattedMessage, useIntl, createIntl, RawIntlProvider } from "react-intl"
import { Container, Breadcrumb, Link, Row, Col, SearchBar, Tabs, Tab, useDSFRConfig } from "@dataesr/dsfr-plus"
import useSearchFilter from "./hooks/useSearchFilter"
import NetworkFilters from "./components/filter"
import useTab from "./hooks/useTab"
import { Graph } from "./components/graph"
import Home from "./components/home"
import ClustersTable from "./components/table"

const modules = import.meta.glob("./locales/*.json", {
  eager: true,
  import: "default",
})
const messages = Object.keys(modules).reduce((acc, key) => {
  const locale = key.match(/\.\/locales\/(.+)\.json$/)?.[1]
  if (locale) {
    return { ...acc, [locale]: modules[key] }
  }
  return acc
}, {})

const NETWORK_TABS_MAPPING = {
  authors: {
    index: 0,
    label: "authors",
    icon: "user-line",
  },
  institutions: {
    index: 1,
    label: "institutions",
    icon: "building-line",
  },
  structures: {
    index: 2,
    label: "structures",
    icon: "microscope-line",
  },
  domains: {
    index: 3,
    label: "domains",
    icon: "trophy-line",
  },
}
const networkTabs = Object.values(NETWORK_TABS_MAPPING).sort((a, b) => a.index - b.index)
const networkTabFindIndex = (label) => networkTabs.findIndex((tab) => tab.label === label)
const networkTabFindLabel = (index) => networkTabs[index].label

function NetworksPage() {
  const intl = useIntl()
  const { currentTab, handleTabChange } = useTab()
  const { currentQuery, handleQueryChange } = useSearchFilter()

  return (
    <>
      <Container className={"bg-network"} fluid>
        <Container>
          <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w">
            <Link href="/">
              <FormattedMessage id="networks.top.breadcrumb.home" />
            </Link>
            <Link current>{intl.formatMessage({ id: "networks.top.breadcrumb.explore" })}</Link>
          </Breadcrumb>
          <Row gutters>
            <Col xs="12" sm="8" lg="8">
              <SearchBar
                key={currentQuery}
                isLarge
                buttonLabel={intl.formatMessage({ id: "networks.top.main-search-bar" })}
                defaultValue={currentQuery || ""}
                placeholder={intl.formatMessage({ id: "networks.top.main-search-bar" })}
                onSearch={(value) => handleQueryChange(value)}
              />
            </Col>
            <Col xs="12" sm="4" lg="2">
              <NetworkFilters />
            </Col>
          </Row>
        </Container>
      </Container>
      <Container className="fr-mt-2w">
        <Tabs
          defaultActiveIndex={networkTabFindIndex(currentTab)}
          onTabChange={(index) => handleTabChange(networkTabFindLabel(index))}
        >
          {networkTabs.map(({ label, icon }) => (
            <Tab index={label} label={intl.formatMessage({ id: `networks.header.tab.${label}` })} icon={icon}>
              <Home value={intl} currentTab={label} />
              <Graph currentTab={label} />
              <ClustersTable currentTab={label} />
            </Tab>
          ))}
        </Tabs>
      </Container>
    </>
  )
}

export default function Networks() {
  const { locale } = useDSFRConfig()
  const intl = createIntl({
    locale,
    messages: messages[locale],
  })
  return (
    <RawIntlProvider value={intl}>
      <NetworksPage />
    </RawIntlProvider>
  )
}
