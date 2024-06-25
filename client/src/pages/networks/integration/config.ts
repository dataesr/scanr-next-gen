import { useSuspenseQuery } from "@tanstack/react-query"
import { useMemo } from "react"

const url = "https://raw.githubusercontent.com/dataesr/bso-ui/main/src/config/locals.json"

export default function getBsoLocals() {
  const { data } = useSuspenseQuery({
    queryKey: ["bso", "locals"],
    queryFn: () => fetch(url).then((response) => (response.ok ? response.json() : {})),
  })

  const values = useMemo(() => {
    return data
  }, [data])

  return values
}
