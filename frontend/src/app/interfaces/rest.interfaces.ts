class Record {
  recordId : number
  recordType : string
  geoScope : string
  lat : number
  lon : number
}

class RecordDetails {
  recordId	: number
  recordType	: string
  contributionDate : string
  contributorName	: string
  contributorSurname	: string
  lastEdited : string
  geographicScopeType	: string
  publicationType	: string
  year	: number
  title	: string
  url	: string
  image : string
}

class SearchFilter {
  name : string
  value : string
}

export {Record, RecordDetails, SearchFilter}
