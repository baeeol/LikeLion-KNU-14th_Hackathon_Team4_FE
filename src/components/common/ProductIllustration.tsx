import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

export type ProductIllustrationKind =
  | 'cleanser'
  | 'toner'
  | 'serum'
  | 'cream'
  | 'sunscreen';

type ProductIllustrationProps = {
  category: string;
  style: StyleProp<ImageStyle>;
};

const ILLUSTRATION_SOURCES: Record<ProductIllustrationKind, number> = {
  cleanser: require('../../assets/images/cleanser.png'),
  toner: require('../../assets/images/toner.png'),
  serum: require('../../assets/images/serum.png'),
  cream: require('../../assets/images/cream.png'),
  sunscreen: require('../../assets/images/sunscreen.png'),
};

export function getProductIllustrationKind(
  rawCategory: string,
): ProductIllustrationKind {
  const category = rawCategory.toLowerCase();

  if (/sun_cream|sunscreen|선크림|자외선/.test(category)) {
    return 'sunscreen';
  }

  if (/toner|skin|토너|스킨/.test(category)) {
    return 'toner';
  }

  if (/serum|ampule|essence|세럼|앰플|에센스/.test(category)) {
    return 'serum';
  }

  if (/cream|크림|lotion|emulsion|로션|에멀전/.test(category)) {
    return 'cream';
  }

  // 클렌징오일과 아직 정의되지 않은 기타 분류는 클렌저 이미지로 보여줍니다.
  return 'cleanser';
}

export function ProductIllustration({
  category,
  style,
}: ProductIllustrationProps) {
  const kind = getProductIllustrationKind(category);

  return (
    <Image
      source={ILLUSTRATION_SOURCES[kind]}
      resizeMode="contain"
      style={style}
    />
  );
}
