import { projectsIndex, postHeaders } from "../../../config/api";
import {
  SearchArgs,
  SearchResponse,
  ElasticResult,
} from "../../../types/commons";
import { LightProject } from "../../../types/project";
import { FIELDS } from "../_utils/constants";

const SOURCE = [
  "label.*",
  "publications",
  "participants.structure.id",
  "participants.structure.label.*",
  "participants.structure.address.*",
  "year",
  "type",
  "id",
  "keywords.*",
];
const SORTER = [
  // requires a second field to sort on for elastic to return a cursor
  { _score: { order: "desc" } },
  { "id.keyword": { order: "desc" } },
];
const HIGHLIGHT = {
  number_of_fragments: 3,
  fragment_size: 125,
  pre_tags: ["<strong>"],
  post_tags: ["</strong>"],
  fields: {
    "title.default": {},
    "summary.default": {},
    "domains.label.default": {},
  },
};

export async function searchProjects({
  cursor,
  query,
  filters,
  size,
}: SearchArgs): Promise<SearchResponse<LightProject>> {
  const body: any = {
    _source: SOURCE,
    sort: SORTER,
    highlight: HIGHLIGHT,
    query: {
      bool: {
        must: [
          {
            query_string: {
              query: query || "*",
              fields: FIELDS,
            },
          },
        ],
      },
    },
  };
  if (filters) body.query.bool.filter = filters;
  if (size) body.size = size;
  if (cursor) body.search_after = cursor;
  if (!query)
    body.query = { function_score: { query: body.query, random_score: {} } };

  // USING FUNCTION SCORE TO BOOST PROJECTS WITH MORE PARTICIPANTS
  // body.query = { function_score: {
  //   query: body.query,
  //   functions: [
  //     {
  //       filter: { range: { participantCount: { gt: 20 } } },
  //       random_score: {},
  //       weight: 1.3
  //     },
  //     {
  //       filter: { range: { participantCount: { gt: 10 } } },
  //       random_score: {},
  //       weight: 1.2
  //     },
  //     {
  //       filter: { range: { participantCount: { gt: 5 } } },
  //       random_score: {},
  //       weight: 1.1
  //     }
  //   ],
  //   score_mode: 'first',
  //   boost_mode: 'multiply'
  // }}

  const res = await fetch(`${projectsIndex}/_search`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: postHeaders,
  });
  const json = await res.json();
  const nextCursor: string =
    json?.hits?.hits[json.hits.hits.length - 1]?.sort || "";
  const totalCount: number = json?.hits?.total?.value || 0;
  const data: ElasticResult<LightProject>[] = json?.hits?.hits || [];

  return { data, cursor: nextCursor as string, total: totalCount };
}
