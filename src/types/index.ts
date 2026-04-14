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
  nuts: Record<string, unknown> | null;
  coordinates: { latitude: number | null; longitude: number | null } | null;
  maps: Record<string, unknown> | null;
  region: Record<string, unknown> | null;
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
