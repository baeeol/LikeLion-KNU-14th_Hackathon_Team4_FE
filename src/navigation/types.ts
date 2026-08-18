export type AppScreen =
  | 'home'
  | 'myPage'
  | 'productExplore'
  | 'routineConsult';

export type NavigationParams = {
  consultQuestion?: string;
  routineProduct?: {
    id: number;
    category: string;
    name: string;
  };
  routineChange?: RoutineChangeRecord;
};

export type RoutineChangeRecord = {
  id: string;
  createdAt: string;
  title: string;
  detail: string;
  tone: 'green' | 'orange' | 'mint';
};

export type Navigate = (screen: AppScreen, params?: NavigationParams) => void;
