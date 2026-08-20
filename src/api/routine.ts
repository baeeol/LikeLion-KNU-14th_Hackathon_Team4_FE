import { API_BASE_URL } from './user';

export type RoutineApiProduct = {
  id: number;
  category: string;
  name: string;
  volume?: number;
};

export type DailyRoutine = {
  morning: RoutineApiProduct[];
  evening: RoutineApiProduct[];
};

type RoutineResponse = {
  routines: DailyRoutine[];
};

type ApiErrorResponse = {
  message?: string | string[];
};

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (Array.isArray(data.message)) {
      return `HTTP ${response.status}\n${data.message.join('\n')}`;
    }
    if (data.message) return `HTTP ${response.status}\n${data.message}`;
  } catch {
    // JSON 오류 응답이 아닌 경우 기본 안내를 사용합니다.
  }

  return `HTTP ${response.status}\n${fallbackMessage}`;
}

export async function getUserRoutines(userId: number): Promise<DailyRoutine[]> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/routine`);

  if (!response.ok) {
    throw new Error('루틴을 불러오지 못했습니다.');
  }

  const data = (await response.json()) as RoutineResponse;
  return data.routines;
}

export async function generateRoutineFromOwnedProducts(
  userId: number,
): Promise<DailyRoutine[]> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/routine`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        '보유 제품 기반 루틴을 생성하지 못했습니다.',
      ),
    );
  }

  // 백엔드는 PATCH 요청에서 AI 루틴을 DB에 저장만 하고 응답 본문은 반환하지 않습니다.
  // 저장이 완료된 뒤 GET 요청으로 새 주간 루틴을 가져옵니다.
  return getUserRoutines(userId);
}
