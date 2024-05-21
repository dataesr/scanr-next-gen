import {
  Autocomplete,
  AutocompleteItem,
  DismissibleTag,
  TagGroup,
  Text,
  useAutocompleteList,
} from "@dataesr/dsfr-plus";
import { FormattedMessage } from "react-intl";
import useUrl from "../../../hooks/useUrl";
import {
  LocalisationAutocomplete,
  autocompleteLocalisations,
} from "../../../../../api/localisations";
import OperatorButton from "../../../../../components/operator-button";

export default function ProjectLocalisationsFilter() {
  const { currentFilters, handleFilterChange, setOperator } = useUrl();

  const localisationAutocompletedList =
    useAutocompleteList<LocalisationAutocomplete>({
      async load({ filterText }) {
        if (!filterText) {
          return { items: [] };
        }
        const res = await autocompleteLocalisations({ query: filterText });
        return { items: res.data?.map((org) => org._source) };
      },
    });

  const filter =
    currentFilters?.[
      "participants.structure.mainAddress.localisationSuggestions"
    ];
  const operator = filter?.operator || "or";

  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexGrow: 1 }}>
          <Text className="fr-mb-1v" bold size="md">
            <FormattedMessage id="search.filters.projects.by-localisation" />
          </Text>
          <Text className="fr-card__detail fr-mb-2w" size="sm">
            <FormattedMessage id="search.filters.projects.by-localisation-description" />
          </Text>
        </div>
        <OperatorButton
          operator={operator}
          setOperator={(key) =>
            setOperator(
              "participants.structure.mainAddress.localisationSuggestions",
              key === "and" ? "and" : "or"
            )
          }
        />
      </div>
      {filter ? (
        <Text bold size="sm" className="fr-mb-1v">
          Sélectionnées:
        </Text>
      ) : null}
      <TagGroup>
        {filter?.values?.map(({ value, label }) => (
          <DismissibleTag
            key={value}
            className="fr-mr-1v"
            color="orange-terre-battue"
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange({
                field:
                  "participants.structure.mainAddress.localisationSuggestions",
                value,
              });
            }}
          >
            {label || value}
          </DismissibleTag>
        ))}
      </TagGroup>
      <Autocomplete
        label="Rechercher des structures"
        items={localisationAutocompletedList.items}
        inputValue={localisationAutocompletedList.filterText}
        onInputChange={localisationAutocompletedList.setFilterText}
        loadingState={localisationAutocompletedList.loadingState}
        // menuTrigger="focus"
        size="md"
        onSelectionChange={(item) => {
          if (!item) return;
          handleFilterChange({
            field: "participants.structure.mainAddress.localisationSuggestions",
            value: item,
          });
        }}
      >
        {({ autocompleted }) => (
          <AutocompleteItem key={autocompleted?.[0]}>
            {autocompleted?.[0]}
          </AutocompleteItem>
        )}
      </Autocomplete>
    </>
  );
}
