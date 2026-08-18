import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {HomeScreen} from '../screens/HomeScreen';
import {MyPageScreen} from '../screens/MyPageScreen';
import {ProductExploreScreen} from '../screens/ProductExploreScreen';
import {RoutineConsultScreen} from '../screens/RoutineConsultScreen';
import {AppScreen, Navigate, RoutineChangeRecord} from './types';

type AddedRoutineProduct = {id: number; category: string; name: string};

export function AppNavigator() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [consultQuestion, setConsultQuestion] = useState('');
  const [addedRoutineProduct, setAddedRoutineProduct] = useState<AddedRoutineProduct | null>(null);
  const [routineChanges, setRoutineChanges] = useState<RoutineChangeRecord[]>([]);
  const navigate: Navigate = (nextScreen, params) => {
    if (params?.consultQuestion) {
      setConsultQuestion(params.consultQuestion);
    }
    if (params?.routineProduct) {
      setAddedRoutineProduct(params.routineProduct);
    }
    if (params?.routineChange) {
      setRoutineChanges(currentChanges => [params.routineChange!, ...currentChanges]);
    }
    setScreen(nextScreen);
  };

  return <View style={styles.container}>
    {screen === 'home' && <HomeScreen navigate={navigate} addedRoutineProduct={addedRoutineProduct} />}
    {screen === 'myPage' && <MyPageScreen navigate={navigate} routineChanges={routineChanges} />}
    {screen === 'productExplore' && <ProductExploreScreen navigate={navigate} />}
    <View style={screen === 'routineConsult' ? styles.consultVisible : styles.consultHidden}>
      <RoutineConsultScreen navigate={navigate} initialQuestion={consultQuestion} onQuestionHandled={() => setConsultQuestion('')} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: {flex: 1},
  consultVisible: {flex: 1},
  consultHidden: {display: 'none'},
});
