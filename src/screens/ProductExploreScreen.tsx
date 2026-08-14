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
import {BrandLogo} from '../components/common/BrandLogo';

type Recommendation = {
  name: string;
  brand: string;
  price: string;
  score: string;
  tags: string[];
  tone: string;
  shape: 'tube' | 'dropper' | 'jar';
};

const filters = ['전체', '보습', '진정', '장벽', '미백', '선크림'];

const recommendations: Recommendation[] = [
  {name: '에스트라 아토베리어365 크림', brand: '에스트라', price: '28,000원', score: '92%', tags: ['민감 피부', '독일 성분', '보습'], tone: '#DDE4E1', shape: 'tube'},
  {name: '세라마이드 아토 세럼', brand: '일리윤', price: '24,000원', score: '90%', tags: ['민감 피부', '장벽 강화', '보습'], tone: '#D9E5DE', shape: 'dropper'},
  {name: '자작나무 수분 크림', brand: '라운드랩', price: '26,000원', score: '88%', tags: ['수분 공급', '보습', '저자극'], tone: '#E8E7DF', shape: 'jar'},
];

export function ProductExploreScreen({navigate}: {navigate: Navigate}) {
  const [selectedFilter, setSelectedFilter] = useState('전체');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={styles.brandHeader}>
            <View style={styles.brandCopy}>
              <BrandLogo />
              <Text style={styles.pageTitle}>제품 찾기</Text>
              <Text style={styles.pageDescription}>내 피부에 맞는 제품을 찾아보세요</Text>
            </View>
            <SkinIllustration />
          </View>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>제품명, 브랜드, 성분으로 검색</Text>
          </View>

          <View style={styles.requiredTitleRow}>
            <Text style={styles.sparkle}>✧</Text>
            <Text style={styles.requiredTitle}>현재 루틴에 필요한 제품</Text>
          </View>

          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.waterIcon}><Text style={styles.waterIconText}>♧</Text></View>
              <View>
                <Text style={styles.recommendationTitle}>보습 장벽 보완이 필요해요</Text>
                <Text style={styles.recommendationDescription}>현재 루틴은 수분 공급은 잘 되고 있지만,{`\n`}피부 장벽을 강화해주는 제품이 부족해요.</Text>
              </View>
            </View>

            <View style={styles.productsRow}>
              {recommendations.map(product => (
                <RecommendationProduct
                  key={product.name}
                  product={product}
                  onPress={() => navigate('productDetail')}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            {filters.map(filter => (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[styles.filterChip, selectedFilter === filter && styles.selectedFilter]}>
                <Text style={[styles.filterText, selectedFilter === filter && styles.selectedFilterText]}>{filter}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.filterSettings}><Text style={styles.filterSettingsText}>☷</Text></Pressable>
          </View>

          <Pressable onPress={() => navigate('myRoutine')} style={styles.compareCard}>
            <View style={styles.compareProducts}><View style={styles.compareBottleOne}/><View style={styles.compareBottleTwo}/><Text style={styles.compareCheck}>✓</Text></View>
            <View style={styles.compareTextWrap}>
              <Text style={styles.compareTitle}>내 루틴과 비교해보기</Text>
              <Text style={styles.compareText}>현재 사용 중인 제품과 추천 제품을{`\n`}성분과 효능으로 비교해보세요.</Text>
            </View>
            <Text style={styles.compareArrow}>›</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.bottomNav}>
          <NavItem icon="⌂" label="홈" onPress={() => navigate('home')} />
          <NavItem icon="▣" label="내 루틴" onPress={() => navigate('myRoutine')} />
          <NavItem icon="⌕" label="제품 찾기" active />
          <NavItem icon="♙" label="마이" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function RecommendationProduct({product, onPress}: {product: Recommendation; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={styles.productCard}>
      <View style={styles.scoreRow}><Text style={styles.scoreLabel}>루틴 적합도</Text><View style={styles.scoreCircle}><Text style={styles.scoreText}>{product.score}</Text></View></View>
      <ProductShape product={product} />
      <Text style={styles.productBrand}>{product.brand}</Text>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price}</Text>
      <View style={styles.tagRow}>{product.tags.map(tag => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View>
    </Pressable>
  );
}

function ProductShape({product}: {product: Recommendation}) {
  const shapeStyle = product.shape === 'jar' ? styles.jar : product.shape === 'dropper' ? styles.dropper : styles.tube;
  return <View style={styles.productShapeArea}><View style={[styles.productShape, shapeStyle, {backgroundColor: product.tone}]}>{product.shape === 'dropper' && <View style={styles.dropperCap}/>}<Text style={styles.productMark}>{product.brand}</Text></View></View>;
}

function NavItem({icon, label, active, onPress}: {icon: string; label: string; active?: boolean; onPress?: () => void}) {
  return <Pressable onPress={onPress} style={styles.navItem}><Text style={[styles.navIcon, active && styles.activeNav]}>{icon}</Text><Text style={[styles.navLabel, active && styles.activeNav]}>{label}</Text></Pressable>;
}

function SkinIllustration() {
  return <View style={styles.illustration}><Text style={styles.illustrationSparkle}>✦</Text><View style={styles.plant}><Text>❘</Text><Text>❘</Text><Text>❘</Text></View><View style={styles.face}><View style={styles.hair}/><Text style={styles.faceText}>◡</Text></View><View style={styles.illustrationBottle}/><View style={styles.illustrationJar}/></View>;
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'},
  page: {flex: 1},
  screen: {paddingHorizontal: 24, paddingTop: 28, paddingBottom: 18},
  brandHeader: {height: 156, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  brandCopy: {alignSelf: 'flex-start'},
  brand: {fontSize: 24, color: '#2F6848', fontWeight: '900', letterSpacing: -1.5},
  brandLeaf: {position: 'absolute', right: -17, top: -8, fontSize: 20, color: '#568A65'},
  pageTitle: {fontSize: 25, color: '#303932', fontWeight: '900', marginTop: 28, letterSpacing: -1.1},
  pageDescription: {fontSize: 11, color: '#7C867E', marginTop: 8},
  illustration: {width: 148, height: 105, position: 'relative'},
  illustrationSparkle: {position: 'absolute', right: 8, top: 0, color: '#E6C67F', fontSize: 18},
  plant: {position: 'absolute', left: 8, top: 28, color: '#A9C19F', fontSize: 20, transform: [{rotate: '-8deg'}]},
  face: {position: 'absolute', right: 32, top: 7, width: 63, height: 78, borderRadius: 34, backgroundColor: '#F8DDC9', justifyContent: 'center', alignItems: 'center'},
  faceText: {fontSize: 22, color: '#D18B75', marginTop: 10},
  hair: {position: 'absolute', top: -4, width: 65, height: 36, borderRadius: 32, backgroundColor: '#696151'},
  illustrationBottle: {position: 'absolute', left: 49, bottom: 7, width: 15, height: 37, borderRadius: 4, backgroundColor: '#A8B99D'},
  illustrationJar: {position: 'absolute', left: 67, bottom: 7, width: 26, height: 21, borderRadius: 5, backgroundColor: '#E2E2D4'},
  searchBox: {height: 44, backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2},
  searchIcon: {fontSize: 24, color: '#A4AAA5', marginRight: 11},
  searchText: {fontSize: 11, color: '#929993'},
  requiredTitleRow: {flexDirection: 'row', alignItems: 'center', marginTop: 27, marginBottom: 11},
  sparkle: {fontSize: 19, color: '#4E8C5E', marginRight: 8},
  requiredTitle: {fontSize: 14, color: '#374239', fontWeight: '900'},
  recommendationCard: {backgroundColor: '#FFF', borderRadius: 16, padding: 14, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2},
  recommendationHeader: {flexDirection: 'row', alignItems: 'center'},
  waterIcon: {width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF5EA', justifyContent: 'center', alignItems: 'center', marginRight: 11},
  waterIconText: {fontSize: 25, color: '#79A77D'},
  recommendationTitle: {fontSize: 13, color: '#3B473D', fontWeight: '800'},
  recommendationDescription: {fontSize: 9, lineHeight: 14, color: '#838C84', marginTop: 6},
  productsRow: {flexDirection: 'row', gap: 7, marginTop: 14},
  productCard: {flex: 1, minHeight: 205, borderRadius: 11, borderWidth: 1, borderColor: '#EDF0EC', padding: 8, alignItems: 'center'},
  scoreRow: {width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  scoreLabel: {fontSize: 7, color: '#8A928B'},
  scoreCircle: {width: 33, height: 33, borderRadius: 17, borderWidth: 2, borderColor: '#4B8A5D', borderLeftColor: '#E1EDE1', justifyContent: 'center', alignItems: 'center'},
  scoreText: {fontSize: 8, color: '#4B8A5D', fontWeight: '800'},
  productShapeArea: {height: 73, justifyContent: 'flex-end', alignItems: 'center'},
  productShape: {justifyContent: 'center', alignItems: 'center'},
  tube: {width: 28, height: 59, borderRadius: 5},
  dropper: {width: 26, height: 53, borderRadius: 6},
  jar: {width: 57, height: 36, borderRadius: 8},
  dropperCap: {position: 'absolute', top: -14, width: 14, height: 15, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: '#EBEEEA'},
  productMark: {fontSize: 5, color: '#69736B', fontWeight: '800', textAlign: 'center'},
  productBrand: {fontSize: 8, color: '#6E796F', marginTop: 8},
  productName: {height: 22, fontSize: 9, lineHeight: 11, color: '#3D473F', fontWeight: '800', marginTop: 3, textAlign: 'center'},
  productPrice: {fontSize: 10, color: '#3E4940', fontWeight: '900', marginTop: 5},
  tagRow: {width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 8},
  tag: {backgroundColor: '#EEF5EB', borderRadius: 5, paddingHorizontal: 4, paddingVertical: 3},
  tagText: {fontSize: 6, color: '#68906E'},
  filterRow: {height: 54, borderRadius: 14, backgroundColor: '#FFF', paddingHorizontal: 9, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 5, shadowColor: '#758075', shadowOpacity: 0.07, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 1},
  filterChip: {height: 28, minWidth: 43, borderRadius: 14, borderWidth: 1, borderColor: '#E1E5E1', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9},
  selectedFilter: {borderColor: '#4E8B5E', backgroundColor: '#F7FCF6'},
  filterText: {fontSize: 9, color: '#758078'},
  selectedFilterText: {color: '#407E52', fontWeight: '800'},
  filterSettings: {marginLeft: 'auto', padding: 4},
  filterSettingsText: {fontSize: 18, color: '#59655C'},
  compareCard: {height: 77, borderRadius: 13, backgroundColor: '#F4F6F0', marginTop: 12, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center'},
  compareProducts: {width: 62, height: 54, position: 'relative'},
  compareBottleOne: {position: 'absolute', bottom: 2, left: 5, width: 13, height: 35, borderRadius: 4, backgroundColor: '#B5C9AE'},
  compareBottleTwo: {position: 'absolute', bottom: 2, left: 23, width: 15, height: 41, borderRadius: 4, backgroundColor: '#DDE8D8'},
  compareCheck: {position: 'absolute', bottom: 0, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4D8A5C', color: '#FFF', textAlign: 'center', fontSize: 10, fontWeight: '900', paddingTop: 2},
  compareTextWrap: {flex: 1},
  compareTitle: {fontSize: 12, color: '#445044', fontWeight: '800'},
  compareText: {fontSize: 8, lineHeight: 12, color: '#869087', marginTop: 5},
  compareArrow: {fontSize: 24, color: '#5D8C68'},
  bottomNav: {height: 62, borderRadius: 15, backgroundColor: '#FFF', marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.07, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 2},
  navItem: {alignItems: 'center', minWidth: 48},
  navIcon: {fontSize: 20, color: '#98A29A'},
  navLabel: {fontSize: 9, color: '#98A29A', marginTop: 2},
  activeNav: {color: '#3E8754', fontWeight: '800'},
});
