export const FIELDS = [
  "id.keyword^10",
  "patents.id^10",
  "title.*^3",
  "summary.*^3",
  "domains.label.*",
  "domains.code^5",
];

export const LIGHT_SOURCE = [
  "title",
  "id",
  "submissionDate",
  "publicationDate",
  "authors",
  "patents",
];
