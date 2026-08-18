export type AppScreen =
  | 'home'
  | 'myPage'
  | 'productExplore'
  | 'routineConsult';

export type NavigationParams = {
  consultQuestion?: string;
  consultProductId?: number;
  routineProduct?: {
    id: number;
    category: string;
    name: string;
  };
  routineChange?: RoutineChangeRecord;
  routineOverride?: DailyRoutine[];
};

export type RoutineChangeRecord = {
  id: string;
  createdAt: string;
  title: string;
  detail: string;
  tone: 'green' | 'orange' | 'mint';
};

export type Navigate = (screen: AppScreen, params?: NavigationParams) => void;
import {DailyRoutine} from '../api/routine';
