export type AppScreen =
  | 'home'
  | 'routineConsult';

export type Navigate = (screen: AppScreen) => void;
