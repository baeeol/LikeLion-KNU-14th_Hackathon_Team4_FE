import { API_BASE_URL } from './user';

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
  usedInRoutine?: boolean;
};

type OwnedCareProductResponse = {
  products: OwnedCareProduct[] | OwnedCareProduct;
};

export async function searchCareProducts(
  keyword: string,
): Promise<CareProduct[]> {
  const response = await fetch(
    `${API_BASE_URL}/care_products?keyword=${encodeURIComponent(keyword)}`,
  );

  if (!response.ok) {
    throw new Error('제품을 검색하지 못했습니다.');
  }

  const data = (await response.json()) as CareProductResponse;
  return data.products;
}

export async function getUserCareProducts(
  userId: number,
): Promise<OwnedCareProduct[]> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/care_product`);

  if (!response.ok) {
    throw new Error('보유 제품을 불러오지 못했습니다.');
  }

  const data = (await response.json()) as OwnedCareProductResponse;
  return Array.isArray(data.products) ? data.products : [data.products];
}

export async function addUserCareProduct(
  userId: number,
  careProductId: number,
) {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/care_product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ careProductId }),
  });

  if (!response.ok) throw new Error('보유 제품을 추가하지 못했습니다.');
}

export async function deleteUserCareProduct(
  userId: number,
  careProductId: number,
) {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/care_product`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ careProductId }),
  });

  if (!response.ok) throw new Error('보유 제품을 삭제하지 못했습니다.');
}
