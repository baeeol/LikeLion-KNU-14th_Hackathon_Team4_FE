import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { MyPageScreen } from '../screens/MyPageScreen';
import { ProductExploreScreen } from '../screens/ProductExploreScreen';
import { RoutineConsultScreen } from '../screens/RoutineConsultScreen';
import { AppScreen, Navigate, RoutineChangeRecord } from './types';
import { DailyRoutine } from '../api/routine';

type PurchasedProduct = {
  id: number;
  category: string;
  brand: string;
  name: string;
  usedInRoutine: boolean;
};

export function AppNavigator() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [consultQuestion, setConsultQuestion] = useState('');
  const [consultProductId, setConsultProductId] = useState<number | null>(null);
  const [routineOverride, setRoutineOverride] = useState<DailyRoutine[] | null>(
    null,
  );
  const [routineChanges, setRoutineChanges] = useState<RoutineChangeRecord[]>(
    [],
  );
  const [purchasedProducts, setPurchasedProducts] = useState<
    PurchasedProduct[]
  >([]);
  const removePurchasedProduct = (productId: number) =>
    setPurchasedProducts(currentProducts =>
      currentProducts.filter(product => product.id !== productId),
    );
  const addPurchasedProduct = (product: PurchasedProduct) =>
    setPurchasedProducts(currentProducts =>
      currentProducts.some(item => item.id === product.id)
        ? currentProducts
        : [...currentProducts, product],
    );
  const navigate: Navigate = (nextScreen, params) => {
    if (params?.consultQuestion) {
      setConsultQuestion(params.consultQuestion);
    }
    if (params?.consultProductId) {
      setConsultProductId(params.consultProductId);
    }
    if (params?.routineChange) {
      setRoutineChanges(currentChanges => [
        params.routineChange!,
        ...currentChanges,
      ]);
    }
    if (params?.routineOverride) {
      setRoutineOverride(params.routineOverride);
    }
    if (params?.ownedProduct) {
      const product = { ...params.ownedProduct, usedInRoutine: false };
      setPurchasedProducts(currentProducts =>
        currentProducts.some(item => item.id === product.id)
          ? currentProducts
          : [...currentProducts, product],
      );
    }
    setScreen(nextScreen);
  };

  return (
    <View style={styles.container}>
      {screen === 'home' && (
        <HomeScreen
          navigate={navigate}
          routineOverride={routineOverride}
        />
      )}
      {screen === 'myPage' && (
        <MyPageScreen
          navigate={navigate}
          routineChanges={routineChanges}
          purchasedProducts={purchasedProducts}
          onRemovePurchasedProduct={removePurchasedProduct}
        />
      )}
      {screen === 'productExplore' && (
        <ProductExploreScreen
          navigate={navigate}
          onPurchase={addPurchasedProduct}
        />
      )}
      <View
        style={
          screen === 'routineConsult'
            ? styles.consultVisible
            : styles.consultHidden
        }
      >
        <RoutineConsultScreen
          navigate={navigate}
          initialQuestion={consultQuestion}
          initialProductId={consultProductId}
          onQuestionHandled={() => {
            setConsultQuestion('');
            setConsultProductId(null);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  consultVisible: { flex: 1 },
  consultHidden: { display: 'none' },
});
