import {API_BASE_URL} from './user';

export type CareProduct = {
  id: number;
  category: string;
  brand: string;
  name: string;
  price: number;
  functions?: string[];
};

type CareProductResponse = {
  products: CareProduct[];
};

export type OwnedCareProduct = {
  id: number;
  category: string;
  brand: string;
  name: string;
  usedInRoutine: boolean;
};

type OwnedCareProductResponse = {
  products: OwnedCareProduct[];
};

export async function searchCareProducts(keyword: string): Promise<CareProduct[]> {
  const response = await fetch(`${API_BASE_URL}/care_product?keyword=${encodeURIComponent(keyword)}`);

  if (!response.ok) {
    throw new Error('제품을 검색하지 못했습니다.');
  }

  const data = (await response.json()) as CareProductResponse;
  return data.products;
}

export async function getUserCareProducts(userId: number): Promise<OwnedCareProduct[]> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/care_product`);

  if (!response.ok) {
    throw new Error('보유 제품을 불러오지 못했습니다.');
  }

  const data = (await response.json()) as OwnedCareProductResponse;
  return data.products;
}
