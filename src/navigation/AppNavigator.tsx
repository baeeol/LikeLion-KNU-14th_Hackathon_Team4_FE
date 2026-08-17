import React, {useState} from 'react';
import {HomeScreen} from '../screens/HomeScreen';
import {MyPageScreen} from '../screens/MyPageScreen';
import {ProductExploreScreen} from '../screens/ProductExploreScreen';
import {RoutineConsultScreen} from '../screens/RoutineConsultScreen';
import {AppScreen, Navigate} from './types';

export function AppNavigator() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [consultQuestion, setConsultQuestion] = useState('');
  const navigate: Navigate = (nextScreen, params) => {
    if (params?.consultQuestion) {
      setConsultQuestion(params.consultQuestion);
    }
    setScreen(nextScreen);
  };

  switch (screen) {
    case 'home': return <HomeScreen navigate={navigate} />;
    case 'myPage': return <MyPageScreen navigate={navigate} />;
    case 'productExplore': return <ProductExploreScreen navigate={navigate} />;
    case 'routineConsult': return <RoutineConsultScreen navigate={navigate} initialQuestion={consultQuestion} onQuestionHandled={() => setConsultQuestion('')} />;
    default: return <HomeScreen navigate={navigate} />;
  }
}
