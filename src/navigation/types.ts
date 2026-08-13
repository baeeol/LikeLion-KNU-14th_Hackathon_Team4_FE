export type AppScreen =
  | 'onboarding'
  | 'productRegister'
  | 'home'
  | 'myRoutine'
  | 'productExplore'
  | 'productDetail';

export type Navigate = (screen: AppScreen) => void;
