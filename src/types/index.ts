export interface LocalizedName {
  en: string;
  tr: string;
}

export interface Nuts {
  nuts1: { code: string; name: LocalizedName };
  nuts2: { code: string; name: string };
  nuts3: string;
}

export interface Maps {
  googleMaps: string;
  openStreetMap: string;
}

export interface Region {
  en: string;
  tr: string;
}

export interface Province {
  id: number;
  registrationNo: number | null;
  name: string;
  fullOfficialName: string | null;
  population: number | null;
  area: number | null;
  postalCode: string | null;
  altitude: number | null;
  areaCodes: number[] | null;
  isCoastal: boolean | null;
  isMetropolitan: boolean | null;
  nuts: Nuts | null;
  coordinates: { latitude: number | null; longitude: number | null } | null;
  maps: Maps | null;
  region: Region | null;
}

export interface District {
  id: number;
  provinceId: number;
  registrationNo: number | null;
  name: string;
  fullOfficialName: string | null;
  population: number | null;
  area: number | null;
  postalCode: string | null;
  provinceName: string;
}

export interface Neighborhood {
  id: number;
  provinceId: number;
  districtId: number;
  parentRegistrationId: number | null;
  municipalityTypeCode: number | null;
  neighborhoodTypeCode: number | null;
  name: string | null;
  fullOfficialName: string | null;
  population: number | null;
  provinceName: string;
  districtName: string;
}

export interface Street {
  id: number;
  provinceId: number;
  districtId: number;
  neighborhoodId: number;
  neighborhoodRegistrationNo: number | null;
  typeCode: number | null;
  typeName: string | null;
  name: string | null;
  fullOfficialName: string | null;
  provinceName: string;
  districtName: string;
  neighborhoodName: string;
}

export interface Town {
  id: number;
  provinceId: number;
  districtId: number;
  name: string | null;
  population: number | null;
  provinceName: string | null;
  districtName: string | null;
}

export interface Village {
  id: number;
  provinceId: number;
  districtId: number;
  name: string | null;
  population: number | null;
  provinceName: string | null;
  districtName: string | null;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiErrorBody {
  error: string;
  requestId: string;
}

export interface GeoIndex {
  root: string;
  provinces: Province[];
  districts: District[];
  neighborhoods: Neighborhood[];
  streets: Street[];
  towns: Town[];
  villages: Village[];
  provinceById: Map<number, Province>;
  districtById: Map<number, District>;
  neighborhoodById: Map<number, Neighborhood>;
  streetById: Map<number, Street>;
  townById: Map<number, Town>;
  villageById: Map<number, Village>;
  districtsByProvinceId: Map<number, District[]>;
  neighborhoodsByProvinceId: Map<number, Neighborhood[]>;
  neighborhoodsByDistrictId: Map<number, Neighborhood[]>;
  streetsByProvinceId: Map<number, Street[]>;
  streetsByDistrictId: Map<number, Street[]>;
  streetsByNeighborhoodId: Map<number, Street[]>;
  townsByProvinceId: Map<number, Town[]>;
  villagesByProvinceId: Map<number, Village[]>;
}
