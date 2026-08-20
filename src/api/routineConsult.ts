import { CareProduct } from './careProduct';
import { API_BASE_URL } from './user';
import { DailyRoutine } from './routine';

type AiRoutine = {
  routines: DailyRoutine[];
};

type TroubleSolutionResponse = {
  canSolveNow: boolean;
  reason?: string;
  data: AiRoutine | CareProduct;
};

export type ProductConflict = {
  conflictMsg: string;
  conflictProduct: Omit<CareProduct, 'price'>;
};

type NewProductQuestionResponse = {
  canJoinNow: boolean;
  reason?: string;
  data: AiRoutine | ProductConflict;
};

export type TroubleSolutionResult =
  | { canSolveNow: true; reason: string; routines: DailyRoutine[] }
  | { canSolveNow: false; reason: string; product: CareProduct };

export type NewProductQuestionResult =
  | { canJoinNow: true; reason: string; routines: DailyRoutine[] }
  | { canJoinNow: false; reason: string; conflict: ProductConflict };

type ApiErrorResponse = {
  message?: string | string[];
};

async function getApiErrorMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
  const message = Array.isArray(body?.message)
    ? body.message.join(', ')
    : body?.message;

  return message ? `HTTP ${response.status}: ${message}` : fallback;
}

export async function getTroubleSolution(
  userId: number,
  trouble: string,
  forceRecommend = false,
): Promise<TroubleSolutionResult> {
  const query = new URLSearchParams({ trouble });
  if (forceRecommend) {
    query.set('forceRecommend', 'true');
  }

  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/trouble_solution?${query.toString()}`,
  );
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        '트러블 해결 루틴을 불러오지 못했습니다.',
      ),
    );
  }

  const data = (await response.json()) as TroubleSolutionResponse;
  return data.canSolveNow
    ? {
        canSolveNow: true,
        reason:
          data.reason ?? '현재 보유 제품의 사용 방식을 조정해 관리할 수 있어요.',
        routines: (data.data as AiRoutine).routines,
      }
    : {
        canSolveNow: false,
        reason:
          data.reason ?? '현재 보유 제품에 필요한 핵심 기능이 부족해요.',
        product: data.data as CareProduct,
      };
}

export async function questionNewProduct(
  userId: number,
  productId: number,
): Promise<NewProductQuestionResult> {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/question_new_product?productId=${productId}`,
  );
  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(
        response,
        '제품 적합도 분석을 불러오지 못했습니다.',
      ),
    );
  }

  const data = (await response.json()) as NewProductQuestionResponse;
  return data.canJoinNow
    ? {
        canJoinNow: true,
        reason:
          data.reason ?? '현재 루틴과 함께 사용할 수 있는 제품이에요.',
        routines: (data.data as AiRoutine).routines,
      }
    : {
        canJoinNow: false,
        reason:
          data.reason ??
          (data.data as ProductConflict).conflictMsg ??
          '현재 루틴과의 중복 또는 자극 가능성을 확인했어요.',
        conflict: data.data as ProductConflict,
      };
}
