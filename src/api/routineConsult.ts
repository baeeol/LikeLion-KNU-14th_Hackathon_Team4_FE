import { CareProduct } from './careProduct';
import { API_BASE_URL } from './user';
import { DailyRoutine } from './routine';

type AiRoutine = {
  routines: DailyRoutine[];
};

type TroubleSolutionResponse = {
  canSolveNow: boolean;
  data: AiRoutine | CareProduct;
};

export type ProductConflict = {
  conflictMsg: string;
  conflictProduct: Omit<CareProduct, 'price'>;
};

type NewProductQuestionResponse = {
  canJoinNow: boolean;
  data: AiRoutine | ProductConflict;
};

export type TroubleSolutionResult =
  | { canSolveNow: true; routines: DailyRoutine[] }
  | { canSolveNow: false; product: CareProduct };

export type NewProductQuestionResult =
  | { canJoinNow: true; routines: DailyRoutine[] }
  | { canJoinNow: false; conflict: ProductConflict };

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
): Promise<TroubleSolutionResult> {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/trouble_solution?trouble=${encodeURIComponent(
      trouble,
    )}`,
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
        routines: (data.data as AiRoutine).routines,
      }
    : { canSolveNow: false, product: data.data as CareProduct };
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
        routines: (data.data as AiRoutine).routines,
      }
    : { canJoinNow: false, conflict: data.data as ProductConflict };
}
