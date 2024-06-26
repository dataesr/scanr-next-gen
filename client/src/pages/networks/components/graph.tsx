import { useMemo } from "react"
import { Container, Spinner } from "@dataesr/dsfr-plus"
import { VOSviewerOnline } from "vosviewer-online"
import { useDSFRConfig } from "@dataesr/dsfr-plus"
import useSearchData from "../hooks/useSearchData"
import Error204 from "./error204"

type GraphArgs = {
  currentTab: string
  computeClusters: boolean
  focusItem: string
}

export default function Graph({ currentTab, computeClusters, focusItem }: GraphArgs) {
  const { search, currentQuery, filters } = useSearchData(currentTab, false)
  const { search: searchClusters } = useSearchData(currentTab, computeClusters)
  const { locale: lang } = useDSFRConfig()
  const keyClusters = searchClusters.isFetching ? false : computeClusters
  const vosviewer = keyClusters ? searchClusters?.data : search?.data
  const key = useMemo(
    () => JSON.stringify({ currentTab, currentQuery, filters, keyClusters, lang, focusItem }),
    [currentTab, currentQuery, filters, keyClusters, lang, focusItem]
  )

  if (!currentQuery) return null

  if (search.isFetching)
    return (
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <Spinner />
      </Container>
    )

  if (!vosviewer?.network)
    return (
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <Error204 />
      </Container>
    )

  const theme = document.documentElement.getAttribute("data-fr-scheme")
  const parameters = {
    largest_component: false,
    dark_ui: theme === "dark",
    simple_ui: true,
    show_item: focusItem,
  }

  return (
    <Container key={key} style={{ height: "500px" }}>
      <VOSviewerOnline data={vosviewer} parameters={parameters} />
    </Container>
  )
}
