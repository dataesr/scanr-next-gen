import { publicationTypeMapping } from "../../utils/string"
import { publicationsIndex, postHeaders } from "../../config/api"
import { Network, NetworkSearchBody, NetworkSearchArgs, NetworkFilterArgs } from "../../types/network"
import { PublicationAggregations } from "../../types/publication"
import createNetwork from "./network"
import createConfig from "./config"
import { graphGetAggs } from "./models"
import { openAiLabeledClusters } from "./openai"

const DEFAULT_SIZE = 2000
const SEARCH_FIELDS = ["title.*^3", "authors.fullName^3", "summary.*^2", "domains.label.*^2"]

const networkSearchSubAggregations = (model: string) => {
  const subAggregations = {
    max_year: { max: { field: "year" } },
  }
  graphGetAggs(model)?.forEach(({ name, field }) => (subAggregations[name] = { terms: { field: field, size: 10 } }))
  return subAggregations
}

const networkSearchBody = (model: string, query?: string | unknown): NetworkSearchBody => ({
  size: 0,
  // _source: SEARCH_SOURCE,
  query: {
    bool: {
      must: [
        {
          query_string: {
            query: query || "*",
            fields: SEARCH_FIELDS,
          },
        },
      ],
    },
  },
  aggs: {
    [`byCo${model}`]: {
      terms: { field: `co_${model}.keyword`, size: DEFAULT_SIZE },
      aggs: networkSearchSubAggregations(model),
    },
  },
})

export async function networkSearch({ model, query, filters }: NetworkSearchArgs): Promise<Network> {
  const body = networkSearchBody(model, query)

  if (filters && filters.length > 0) body.query.bool.filter = filters
  if (!query) body.query = { function_score: { query: body.query, random_score: {} } }

  console.log("networkSearch", body)

  const res = await fetch(`${publicationsIndex}/_search`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: postHeaders,
  }).then((response) => response.json())

  console.log("endOfSearch", res)

  const aggregation = res.aggregations?.[`byCo${model}`].buckets

  const network = createNetwork(aggregation, model)
  network.clusters = await openAiLabeledClusters(query, network?.clusters)

  const config = createConfig(network?.clusters, model)

  const data = {
    network: network,
    config: config,
  }

  console.log("data", data)
  return data
}

export async function networkFilter({ query }: NetworkFilterArgs): Promise<PublicationAggregations> {
  const body: any = {
    size: 0,
    query: {
      bool: {
        must: [
          {
            query_string: {
              query: query || "*",
              fields: SEARCH_FIELDS,
            },
          },
        ],
      },
    },
    aggs: {
      byYear: {
        terms: {
          field: "year",
        },
      },
      byPublicationType: {
        terms: {
          field: "model.keyword",
        },
      },
      byAuthors: {
        terms: {
          field: "authors.id_name.keyword",
          size: 10,
        },
      },
      byIsOa: {
        terms: {
          field: "isOa",
        },
      },
      byFunder: {
        terms: {
          field: "projects.model.keyword",
        },
      },
    },
  }

  const res = await fetch(`${publicationsIndex}/_search`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: postHeaders,
  }).then((response) => response.json())

  const { aggregations: data } = res

  const _100Year = data?.byYear?.buckets && Math.max(...data.byYear.buckets.map((el) => el.doc_count))
  const byYear =
    data?.byYear?.buckets?.map((element) => {
      return {
        value: element.key,
        label: element.key,
        count: (element.doc_count * 100) / _100Year,
      }
    }) || []
  const byType =
    data?.byPublicationType?.buckets
      ?.map((element) => {
        if (!publicationTypeMapping[element?.key]) return null
        return {
          value: element.key,
          label: publicationTypeMapping[element.key],
          count: element.doc_count,
        }
      })
      .filter((el) => el) || []

  const byFunder =
    data?.byFunder?.buckets
      ?.map((element) => {
        return {
          value: element.key,
          label: element.key,
          count: element.doc_count,
        }
      })
      .filter((el) => el) || []

  const byAuthors =
    data?.byAuthors?.buckets
      ?.map((element) => {
        return {
          value: element.key.split("###")?.[0],
          label: element.key.split("###")?.[1],
          count: element.doc_count,
        }
      })
      .filter((el) => el) || []

  const _100IsOa = data?.byIsOa?.buckets && Math.max(...data.byIsOa.buckets.map((el) => el.doc_count))
  const byIsOa =
    data?.byIsOa?.buckets
      ?.map((element) => {
        return {
          value: element.key,
          label: element.key,
          count: (element.doc_count * 100) / _100IsOa,
        }
      })
      .filter((el) => el) || []
  return { byYear, byType, byAuthors, byFunder, byIsOa }
}
