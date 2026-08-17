export type AppScreen =
  | 'home'
  | 'myPage'
  | 'productExplore'
  | 'routineConsult';

export type NavigationParams = {
  consultQuestion?: string;
};

export type Navigate = (screen: AppScreen, params?: NavigationParams) => void;
