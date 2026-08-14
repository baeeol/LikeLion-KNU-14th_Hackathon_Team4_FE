import React, {useState} from 'react';
import {HomeScreen} from '../screens/HomeScreen';
import {MyRoutineScreen} from '../screens/MyRoutineScreen';
import {OnboardingScreen} from '../screens/OnboardingScreen';
import {ProductDetailScreen} from '../screens/ProductDetailScreen';
import {ProductExploreScreen} from '../screens/ProductExploreScreen';
import {ProductRegisterScreen} from '../screens/ProductRegisterScreen';
import {RoutineConsultScreen} from '../screens/RoutineConsultScreen';
import {AppScreen, Navigate} from './types';

export function AppNavigator() {
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const navigate: Navigate = setScreen;

  switch (screen) {
    case 'productRegister': return <ProductRegisterScreen navigate={navigate} />;
    case 'home': return <HomeScreen navigate={navigate} />;
    case 'myRoutine': return <MyRoutineScreen navigate={navigate} />;
    case 'productExplore': return <ProductExploreScreen navigate={navigate} />;
    case 'productDetail': return <ProductDetailScreen navigate={navigate} />;
    case 'routineConsult': return <RoutineConsultScreen navigate={navigate} />;
    default: return <OnboardingScreen navigate={navigate} />;
  }
}
