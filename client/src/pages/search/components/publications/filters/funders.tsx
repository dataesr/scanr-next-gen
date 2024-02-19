import { SelectableTag, TagGroup, Text } from "@dataesr/dsfr-plus";
import { FormattedMessage } from "react-intl";
import { PublicationAggregations } from "../../../../../types/publication";
import useAggregateData from "../../../hooks/useAggregationData";
import useUrl from "../../../hooks/useUrl";

export default function PublicationFunderFilter() {
  const { currentFilters, handleFilterChange } = useUrl()
  const { data = { byFunder: [] } } = useAggregateData('filters')
  const { byFunder } = data as PublicationAggregations

  return (
    <>
      <Text className="fr-mb-1v" bold size="md">
        <FormattedMessage id="search.publications.filters.by-project" />
      </Text>
      <Text className="fr-card__detail fr-mb-2w" size="sm">
        <FormattedMessage id="search.publications.filters.by-project-description" />
      </Text>
      <TagGroup>
        {byFunder.map((funder) => (
          <SelectableTag
            selected={currentFilters.find((el) => el.field === 'projects.type')?.value?.includes(funder.value)}
            key={funder.value}
            color="yellow-tournesol"
            onClick={() => handleFilterChange('projects.type', funder.value)}
          >
            {funder.label}
          </SelectableTag>
        ))}
      </TagGroup>
    </>
  )
}