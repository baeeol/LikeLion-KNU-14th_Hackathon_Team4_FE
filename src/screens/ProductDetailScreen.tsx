import React, {useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Navigate} from '../navigation/types';

const currentRoutine = ['클렌징', '토너', '세럼', '수분크림', '선크림'];
const suggestedRoutine = ['클렌징', '토너', '세럼', '+ 이 제품', '수분크림'];

export function ProductDetailScreen({navigate}: {navigate: Navigate}) {
  const [addedToCart, setAddedToCart] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />

      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <Header onBack={() => navigate('productExplore')} />
          <ProductOverview />
          <RoutineFitCard />
          <RoutineComparison />
          <PreviewCard onPress={() => navigate('myRoutine')} />
        </ScrollView>

        <View style={styles.actionBar}>
          <Pressable
            onPress={() => setAddedToCart(!addedToCart)}
            style={[styles.cartButton, addedToCart && styles.addedCartButton]}>
            <Text style={[styles.cartButtonText, addedToCart && styles.addedCartButtonText]}>
              {addedToCart ? '✓ 장바구니에 담김' : '장바구니 담기'}
            </Text>
          </Pressable>
          <Pressable style={styles.buyButton}>
            <Text style={styles.buyButtonText}>구매하기</Text>
            <Text style={styles.buyPrice}>28,000원</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Header({onBack}: {onBack: () => void}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={10}><Text style={styles.backButton}>‹</Text></Pressable>
      <Text style={styles.headerTitle}>제품 상세</Text>
      <View style={styles.headerActions}><Text style={styles.headerIcon}>♡</Text><Text style={styles.headerIcon}>⇧</Text></View>
    </View>
  );
}

function ProductOverview() {
  return (
    <View style={styles.overview}>
      <ProductBottle large />
      <View style={styles.overviewText}>
        <Text style={styles.brand}>루틴밸런스</Text>
        <Text style={styles.productTitle}>딥 하이드레이팅 세럼</Text>
        <Text style={styles.productDescription}>수분 장벽을 강화하는{`\n`}저자극 고보습 세럼</Text>
        <Text style={styles.price}>28,000원</Text>
        <View style={styles.categoryRow}>
          <Category label="수분충전" />
          <Category label="장벽케어" />
          <Category label="저자극" />
        </View>
      </View>
    </View>
  );
}

function RoutineFitCard() {
  return (
    <View style={styles.fitCard}>
      <View style={styles.fitHeader}>
        <ScoreCircle />
        <View>
          <Text style={styles.fitTitle}>루틴밸런스가 분석했어요 ◜</Text>
          <FitPoint icon="♧" text="현재 부족한 보습 기능을 보완해요" />
          <FitPoint icon="◌" text="기존 수분크림과 일부 역할이 겹쳐요" />
          <FitPoint icon="☾" text="저녁 루틴에 추가하는 것을 추천해요" />
        </View>
      </View>
      <Text style={styles.analysisNote}>ⓘ 분석은 회원님의 피부 타입 ‘수부지’와 현재 루틴을 기준으로 해요.</Text>
    </View>
  );
}

function RoutineComparison() {
  return (
    <View style={styles.comparisonCard}>
      <Text style={styles.sectionTitle}>내 루틴에 넣어보면  ⓘ</Text>
      <View style={styles.routineComparisonRow}>
        <RoutinePreview title="현재 루틴" products={currentRoutine} />
        <View style={styles.compareArrow}><Text style={styles.compareArrowText}>›</Text></View>
        <RoutinePreview title="추가 후 루틴 (저녁)" products={suggestedRoutine} suggested />
      </View>
      <View style={styles.recommendMethod}>
        <View style={styles.methodIcon}><Text style={styles.methodIconText}>♧</Text></View>
        <View style={styles.methodTextWrap}><Text style={styles.methodLabel}>추천 방식</Text><Text style={styles.methodTitle}>세럼 추가 <Text style={styles.recommendBadge}>추천</Text></Text><Text style={styles.methodDescription}>보습 부스트 효과를 위해 기존 루틴에 추가하는 것을 추천해요.</Text></View>
        <Pressable style={styles.detailMethodButton}><Text style={styles.detailMethodText}>대체 추천 보기  ›</Text></Pressable>
      </View>
    </View>
  );
}

function PreviewCard({onPress}: {onPress: () => void}) {
  return <Pressable onPress={onPress} style={styles.previewCard}><Text style={styles.previewIcon}>✧</Text><View><Text style={styles.previewTitle}>내 루틴에 미리 넣어보기</Text><Text style={styles.previewText}>변화되는 루틴과 추천 이유를 확인할 수 있어요</Text></View><Text style={styles.previewArrow}>›</Text></Pressable>;
}

function ScoreCircle() {
  return <View style={styles.scoreOuter}><View style={styles.scoreInner}><Text style={styles.scoreLabel}>내 루틴{`\n`}적합도</Text><Text style={styles.score}>87%</Text></View></View>;
}

function FitPoint({icon, text}: {icon: string; text: string}) {
  return <View style={styles.fitPoint}><Text style={styles.fitPointIcon}>{icon}</Text><Text style={styles.fitPointText}>{text}</Text></View>;
}

function Category({label}: {label: string}) {
  return <View style={styles.category}><Text style={styles.categoryText}>{label}</Text></View>;
}

function RoutinePreview({title, products, suggested = false}: {title: string; products: string[]; suggested?: boolean}) {
  return (
    <View style={styles.routinePreview}>
      <Text style={styles.routinePreviewTitle}>{title}</Text>
      <View style={styles.previewProducts}>
        {products.map((product, index) => (
          <React.Fragment key={`${product}-${index}`}>
            <MiniProduct label={product} highlighted={suggested && product === '+ 이 제품'} />
            {index < products.length - 1 && <Text style={styles.miniArrow}>›</Text>}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function MiniProduct({label, highlighted}: {label: string; highlighted: boolean}) {
  return <View style={styles.miniProductWrap}><View style={[styles.miniProduct, highlighted && styles.highlightedProduct]}>{highlighted ? <Text style={styles.plusProductText}>＋</Text> : <View style={styles.miniBottle}/>}</View><Text style={[styles.miniProductLabel, highlighted && styles.highlightedProductLabel]}>{label.replace('+ ', '')}</Text></View>;
}

function ProductBottle({large = false}: {large?: boolean}) {
  return <View style={[styles.bottleWrap, large && styles.largeBottleWrap]}><View style={[styles.bottleCap, large && styles.largeBottleCap]}/><View style={[styles.bottleDropper, large && styles.largeBottleDropper]}/><View style={[styles.bottleBody, large && styles.largeBottleBody]}><Text style={[styles.bottleBrand, large && styles.largeBottleBrand]}>LUTIN BALANCE</Text><Text style={[styles.bottleName, large && styles.largeBottleName]}>DEEP HYDRATING{`\n`}SERUM</Text></View></View>;
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'},
  page: {flex: 1},
  screen: {paddingHorizontal: 25, paddingTop: 38, paddingBottom: 18},
  header: {height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  backButton: {fontSize: 37, lineHeight: 35, color: '#3C463E'},
  headerTitle: {fontSize: 15, color: '#333C35', fontWeight: '800'},
  headerActions: {flexDirection: 'row', gap: 18},
  headerIcon: {fontSize: 29, color: '#2F3932'},
  overview: {minHeight: 225, flexDirection: 'row', alignItems: 'center', paddingBottom: 8},
  bottleWrap: {width: 26, height: 46, alignItems: 'center', justifyContent: 'flex-end'},
  largeBottleWrap: {width: 135, height: 195, justifyContent: 'flex-end', transform: [{translateX: -16}]},
  bottleCap: {width: 10, height: 8, borderRadius: 3, backgroundColor: '#A9AA88'},
  largeBottleCap: {width: 30, height: 21, borderRadius: 6},
  bottleDropper: {width: 8, height: 13, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: '#6E754B'},
  largeBottleDropper: {width: 31, height: 38, borderTopLeftRadius: 16, borderTopRightRadius: 16},
  bottleBody: {width: 24, height: 30, borderRadius: 3, backgroundColor: '#84966C', justifyContent: 'center', alignItems: 'center'},
  largeBottleBody: {width: 84, height: 113, borderRadius: 5},
  bottleBrand: {fontSize: 3, color: '#E9E9D9'},
  largeBottleBrand: {fontSize: 7},
  bottleName: {fontSize: 3, color: '#E9E9D9', textAlign: 'center', marginTop: 3},
  largeBottleName: {fontSize: 7, lineHeight: 10, marginTop: 8},
  overviewText: {flex: 1, paddingTop: 10},
  brand: {fontSize: 10, color: '#5E956A', fontWeight: '800'},
  productTitle: {fontSize: 23, color: '#333C35', fontWeight: '900', marginTop: 11, letterSpacing: -1},
  productDescription: {fontSize: 11, lineHeight: 17, color: '#7B857D', marginTop: 9},
  price: {fontSize: 17, color: '#303932', fontWeight: '900', marginTop: 14},
  categoryRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13},
  category: {borderWidth: 1, borderColor: '#DDE2DD', borderRadius: 13, paddingHorizontal: 10, paddingVertical: 6},
  categoryText: {fontSize: 8, color: '#647066'},
  fitCard: {backgroundColor: '#F6F9F3', borderRadius: 15, padding: 14, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 1},
  fitHeader: {flexDirection: 'row', alignItems: 'center'},
  scoreOuter: {width: 105, height: 105, borderRadius: 53, borderWidth: 8, borderColor: '#5D966B', borderRightColor: '#DFE9DF', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  scoreInner: {alignItems: 'center'},
  scoreLabel: {fontSize: 10, lineHeight: 15, color: '#4E7457', textAlign: 'center'},
  score: {fontSize: 27, color: '#4A8B58', fontWeight: '900', marginTop: 4},
  fitTitle: {fontSize: 11, color: '#3E5143', fontWeight: '800', marginBottom: 7},
  fitPoint: {height: 30, backgroundColor: '#FFF', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, marginTop: 5},
  fitPointIcon: {fontSize: 14, color: '#63966C', marginRight: 8},
  fitPointText: {fontSize: 9, color: '#5F6B61'},
  analysisNote: {fontSize: 8, color: '#8A958A', textAlign: 'center', marginTop: 11},
  comparisonCard: {backgroundColor: '#FFF', borderRadius: 15, padding: 13, marginTop: 11, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 1},
  sectionTitle: {fontSize: 12, color: '#3D473F', fontWeight: '800'},
  routineComparisonRow: {flexDirection: 'row', alignItems: 'center', marginTop: 11},
  routinePreview: {height: 87, flex: 1, minWidth: 0, borderRadius: 10, borderWidth: 1, borderColor: '#EDF0EC', padding: 8, overflow: 'hidden'},
  routinePreviewTitle: {fontSize: 8, color: '#68726A', fontWeight: '800'},
  previewProducts: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10},
  miniProductWrap: {alignItems: 'center', width: 20},
  miniProduct: {width: 14, height: 25, borderRadius: 3, backgroundColor: '#EEF1EB', justifyContent: 'center', alignItems: 'center'},
  highlightedProduct: {backgroundColor: '#E5F1E3', borderWidth: 1, borderStyle: 'dashed', borderColor: '#679B71'},
  miniBottle: {width: 8, height: 20, borderRadius: 2, backgroundColor: '#D4DDD0'},
  plusProductText: {fontSize: 15, color: '#468756', fontWeight: '800'},
  miniProductLabel: {fontSize: 4.5, color: '#748074', textAlign: 'center', marginTop: 4},
  highlightedProductLabel: {color: '#4B8A59', fontWeight: '800'},
  miniArrow: {fontSize: 10, color: '#A1AAA1'},
  compareArrow: {width: 22, height: 22, borderRadius: 11, backgroundColor: '#518960', alignItems: 'center', justifyContent: 'center', marginHorizontal: 4},
  compareArrowText: {fontSize: 22, color: '#FFF', marginTop: -2},
  recommendMethod: {minHeight: 72, borderRadius: 10, backgroundColor: '#F7F9F5', marginTop: 10, padding: 9, flexDirection: 'row', alignItems: 'center'},
  methodIcon: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5F1E4', justifyContent: 'center', alignItems: 'center', marginRight: 9},
  methodIconText: {fontSize: 17, color: '#61956A'},
  methodTextWrap: {flex: 1},
  methodLabel: {fontSize: 8, color: '#7C877C'},
  methodTitle: {fontSize: 12, color: '#4A8758', fontWeight: '900', marginTop: 2},
  recommendBadge: {fontSize: 7, color: '#5D9168', backgroundColor: '#E5F1E4'},
  methodDescription: {fontSize: 7, color: '#818B82', marginTop: 4},
  detailMethodButton: {borderWidth: 1, borderColor: '#D7DDD7', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 6},
  detailMethodText: {fontSize: 6.5, color: '#677268'},
  previewCard: {height: 55, borderRadius: 12, backgroundColor: '#F2F5EE', marginTop: 11, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center'},
  previewIcon: {fontSize: 21, color: '#609A6B', marginRight: 11},
  previewTitle: {fontSize: 11, color: '#4E8057', fontWeight: '800'},
  previewText: {fontSize: 8, color: '#7E897F', marginTop: 4},
  previewArrow: {marginLeft: 'auto', fontSize: 22, color: '#4F835A'},
  actionBar: {height: 64, flexDirection: 'row', gap: 8, paddingHorizontal: 25, paddingBottom: 9, backgroundColor: '#FFFDF9'},
  cartButton: {height: 42, flex: 1, borderRadius: 8, borderWidth: 1, borderColor: '#558A60', alignItems: 'center', justifyContent: 'center'},
  addedCartButton: {backgroundColor: '#EEF6EC'},
  cartButtonText: {fontSize: 12, color: '#4E845A', fontWeight: '800'},
  addedCartButtonText: {color: '#3C7E4D'},
  buyButton: {height: 42, flex: 1.4, borderRadius: 8, backgroundColor: '#4F8559', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13},
  buyButtonText: {fontSize: 12, color: '#FFF', fontWeight: '800'},
  buyPrice: {fontSize: 10, color: '#E8F1E8'},
});
