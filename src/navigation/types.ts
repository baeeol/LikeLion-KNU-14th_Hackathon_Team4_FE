export type AppScreen =
  | 'onboarding'
  | 'productRegister'
  | 'home'
  | 'myRoutine'
  | 'productExplore'
  | 'productDetail'
  | 'routineConsult';

export type Navigate = (screen: AppScreen) => void;
