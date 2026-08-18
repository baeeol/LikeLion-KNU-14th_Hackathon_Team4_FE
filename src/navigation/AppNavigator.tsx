import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {HomeScreen} from '../screens/HomeScreen';
import {MyPageScreen} from '../screens/MyPageScreen';
import {ProductExploreScreen} from '../screens/ProductExploreScreen';
import {RoutineConsultScreen} from '../screens/RoutineConsultScreen';
import {AppScreen, Navigate, RoutineChangeRecord} from './types';
import {DailyRoutine} from '../api/routine';

type AddedRoutineProduct = {id: number; category: string; name: string};

export function AppNavigator() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [consultQuestion, setConsultQuestion] = useState('');
  const [consultProductId, setConsultProductId] = useState<number | null>(null);
  const [addedRoutineProduct, setAddedRoutineProduct] = useState<AddedRoutineProduct | null>(null);
  const [routineOverride, setRoutineOverride] = useState<DailyRoutine[] | null>(null);
  const [routineChanges, setRoutineChanges] = useState<RoutineChangeRecord[]>([]);
  const navigate: Navigate = (nextScreen, params) => {
    if (params?.consultQuestion) {
      setConsultQuestion(params.consultQuestion);
    }
    if (params?.consultProductId) {
      setConsultProductId(params.consultProductId);
    }
    if (params?.routineProduct) {
      setAddedRoutineProduct(params.routineProduct);
    }
    if (params?.routineChange) {
      setRoutineChanges(currentChanges => [params.routineChange!, ...currentChanges]);
    }
    if (params?.routineOverride) {
      setRoutineOverride(params.routineOverride);
    }
    setScreen(nextScreen);
  };

  return <View style={styles.container}>
    {screen === 'home' && <HomeScreen navigate={navigate} addedRoutineProduct={addedRoutineProduct} routineOverride={routineOverride} />}
    {screen === 'myPage' && <MyPageScreen navigate={navigate} routineChanges={routineChanges} />}
    {screen === 'productExplore' && <ProductExploreScreen navigate={navigate} />}
    <View style={screen === 'routineConsult' ? styles.consultVisible : styles.consultHidden}>
      <RoutineConsultScreen navigate={navigate} initialQuestion={consultQuestion} initialProductId={consultProductId} onQuestionHandled={() => { setConsultQuestion(''); setConsultProductId(null); }} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: {flex: 1},
  consultVisible: {flex: 1},
  consultHidden: {display: 'none'},
});
