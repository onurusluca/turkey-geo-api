export interface Province {
  id: number;
  name: string;
  area: number;
  areaCode: number[];
}

export interface District {
  provinceId: number;
  id: number;
  province: string;
  name: string;
  area: number;
}

export interface Neighborhood {
  provinceId: number;
  districtId: number;
  id: number;
  province: string;
  district: string;
  name: string;
}
