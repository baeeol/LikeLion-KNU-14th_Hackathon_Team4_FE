import React, {useState} from 'react';
import {HomeScreen} from '../screens/HomeScreen';
import {RoutineConsultScreen} from '../screens/RoutineConsultScreen';
import {AppScreen, Navigate} from './types';

export function AppNavigator() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const navigate: Navigate = setScreen;

  switch (screen) {
    case 'home': return <HomeScreen navigate={navigate} />;
    case 'routineConsult': return <RoutineConsultScreen navigate={navigate} />;
    default: return <HomeScreen navigate={navigate} />;
  }
}
