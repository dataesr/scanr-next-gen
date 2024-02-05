import { Container, Text } from "@dataesr/dsfr-plus"
import { VOSviewerOnline } from "vosviewer-online"
import useSearchData from "../hooks/useSearchData"
import { Network } from "../../../types/network"

export function Graph({ currentTab }: { currentTab: string }) {
  const { search } = useSearchData(currentTab)
  const network = search?.data as Network

  const theme = document.documentElement.getAttribute("data-fr-scheme")
  const parameters = {
    attraction: 1,
    largest_component: false,
    simple_ui: false,
    dark_ui: theme === "dark",
  }

  if (!network)
    return (
      <Container
        className="fr-mt-5w"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "500px" }}
      >
        <Text>Loading data...</Text>
      </Container>
    )
  return (
    <Container key={currentTab} className="fr-mt-5w" style={{ height: "500px" }}>
      <VOSviewerOnline data={{ network }} parameters={parameters} />
    </Container>
  )
}
