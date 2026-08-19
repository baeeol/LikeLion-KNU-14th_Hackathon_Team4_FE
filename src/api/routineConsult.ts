import { CareProduct } from './careProduct';
import { API_BASE_URL } from './user';
import { DailyRoutine } from './routine';

type TroubleSolutionResponse = {
  canSolveNow: boolean;
  data: DailyRoutine[] | CareProduct;
};

export type ProductConflict = {
  conflictMsg: string;
  conflictProduct: Omit<CareProduct, 'price'>;
};

type NewProductQuestionResponse = {
  canJoinNow: boolean;
  data: DailyRoutine[] | ProductConflict;
};

export type TroubleSolutionResult =
  | { canSolveNow: true; routines: DailyRoutine[] }
  | { canSolveNow: false; product: CareProduct };

export type NewProductQuestionResult =
  | { canJoinNow: true; routines: DailyRoutine[] }
  | { canJoinNow: false; conflict: ProductConflict };

export async function getTroubleSolution(
  userId: number,
  trouble: string,
): Promise<TroubleSolutionResult> {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/trouble_solution?trouble=${encodeURIComponent(
      trouble,
    )}`,
  );
  if (!response.ok) throw new Error('트러블 해결 루틴을 불러오지 못했습니다.');

  const data = (await response.json()) as TroubleSolutionResponse;
  return data.canSolveNow
    ? { canSolveNow: true, routines: data.data as DailyRoutine[] }
    : { canSolveNow: false, product: data.data as CareProduct };
}

export async function questionNewProduct(
  userId: number,
  productId: number,
): Promise<NewProductQuestionResult> {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/question_new_product?productId=${productId}`,
  );
  if (!response.ok) throw new Error('제품 적합도 분석을 불러오지 못했습니다.');

  const data = (await response.json()) as NewProductQuestionResponse;
  return data.canJoinNow
    ? { canJoinNow: true, routines: data.data as DailyRoutine[] }
    : { canJoinNow: false, conflict: data.data as ProductConflict };
}
