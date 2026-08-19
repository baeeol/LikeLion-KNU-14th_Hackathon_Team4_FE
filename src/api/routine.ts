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

export async function getUserRoutines(userId: number): Promise<DailyRoutine[]> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/routine`);

  if (!response.ok) {
    throw new Error('루틴을 불러오지 못했습니다.');
  }

  const data = (await response.json()) as RoutineResponse;
  return data.routines;
}
