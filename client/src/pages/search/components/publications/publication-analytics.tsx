import BarLink from "../../../../components/bar-link";
import { useIntl } from "react-intl";
import useSearchData from "../../hooks/useSearchData";
import AnalyticsSkeleton from "../../../../components/skeleton/analytics-skeleton";
import { PublicationAggregations } from "../../../../types/publication";
import useAggregateData from "../../hooks/useAggregationData";
import getYearChartOptions from "../../../../components/analytics-graph/graph-options/years";
import { Row, Col } from "@dataesr/dsfr-plus";
import AnalyticsGraph from "../../../../components/analytics-graph";

export default function PublicationAnalytics() {
  const intl = useIntl();
  const { data, isLoading, isError } = useAggregateData('analytics');
  const { search: { data: searchData } } = useSearchData();
  if (isError) return null;
  if (isLoading || !searchData?.length) return <AnalyticsSkeleton />

  const { byYear, byAuthors } = data as PublicationAggregations

  const yearOptions = getYearChartOptions({ data: byYear, colors: ['var(--artwork-minor-purple-glycine)'] });

  const _100TopAuthors = Math.max(...byAuthors.map((el) => el.count | 0));



  return (
    <Row>
      <Col xs="12">
        <AnalyticsGraph
          title={intl.formatMessage({ id: "search.analytics.publications.by-year.title" })}
          description={intl.formatMessage({ id: "search.analytics.publications.by-year.description" })}
          options={yearOptions}
        />
      </Col>
      <Col xs="12">
        {byAuthors?.slice(0, 10)?.map((coAuthor) => (
          <BarLink
            key={coAuthor.value}
            name={coAuthor.label}
            count={coAuthor.count}
            width={coAuthor.count * 100 / _100TopAuthors}
            href={`/authors/${coAuthor.value}`}
          />
        ))}
      </Col>
    </Row>
  )
}