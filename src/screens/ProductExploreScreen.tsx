import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {BrandLogo} from '../components/common/BrandLogo';
import {Navigate} from '../navigation/types';
import {CareProduct, searchCareProducts} from '../api/careProduct';

const DEMO_PRODUCTS: CareProduct[] = [
  {id: 1, brand: '에스트라', name: '아토베리어 365 크림', price: 28000, category: '크림', functions: ['보습', '피부 장벽']},
  {id: 2, brand: '일리윤', name: '세라마이드 아토 세럼', price: 24000, category: '세럼', functions: ['피부 장벽', '진정']},
  {id: 3, brand: '라운드랩', name: '자작나무 수분 크림', price: 26000, category: '크림', functions: ['보습', '진정']},
];
const FILTERS = ['전체', '보습', '피부 장벽', '진정', '각질 케어', '트러블·피지', '미백·톤', '자외선 차단'] as const;

export function ProductExploreScreen({navigate}: {navigate: Navigate}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('전체');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<CareProduct[]>(DEMO_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<CareProduct | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) {
      setProducts(DEMO_PRODUCTS);
      setSearchError('');
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      setSearchError('');
      searchCareProducts(keyword)
        .then(setProducts)
        .catch(() => setSearchError('제품 정보를 불러오지 못했어요.'))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const visibleProducts = useMemo(() => products.filter(product => {
    const matchesFilter = matchesFunction(product, filter);
    return matchesFilter;
  }), [filter, products]);

  return <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><BrandLogo /><Text style={styles.clover}>♧</Text></View>
        <View style={styles.titleRow}><Pressable accessibilityRole="button" accessibilityLabel="홈으로 돌아가기" hitSlop={12} onPress={() => navigate('home')} style={styles.backButton}><Text style={styles.backIcon}>‹</Text></Pressable><Text style={styles.title}>제품 찾기</Text></View>
        <Text style={styles.description}>내 피부에 맞는 제품을 찾아보세요</Text>
        <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="제품명, 브랜드, 성분으로 검색" placeholderTextColor="#9AA39B" style={styles.searchInput} /></View>
        <View style={styles.filterRow}>{FILTERS.map(item => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>
        <View style={styles.productGrid}>{visibleProducts.map(product => <ProductCard key={product.id} product={product} selected={selectedProduct?.id === product.id} onPress={() => setSelectedProduct(currentProduct => currentProduct?.id === product.id ? null : product)} />)}</View>
        {selectedProduct && <View style={styles.selectedProductBox}><View><Text style={styles.selectedLabel}>선택한 제품</Text><Text style={styles.selectedName}>{selectedProduct.brand} {selectedProduct.name}</Text></View><Pressable onPress={() => navigate('routineConsult', {consultQuestion: `${selectedProduct.brand} ${selectedProduct.name} 제품이 제 피부와 현재 루틴에 잘 맞을까요?`})} style={styles.consultButton}><Text style={styles.consultButtonText}>AI에게 물어보기  ›</Text></Pressable></View>}
        {isSearching && <Text style={styles.emptyText}>제품을 검색하고 있어요.</Text>}
        {!isSearching && searchError ? <Text style={styles.emptyText}>{searchError}</Text> : null}
        {!isSearching && !searchError && visibleProducts.length === 0 && <Text style={styles.emptyText}>검색 결과가 없어요.</Text>}
      </ScrollView>
      <View style={styles.bottomNav}><NavItem icon="⌂" label="홈" onPress={() => navigate('home')} /><NavItem icon="ai" label="AI 상담" onPress={() => navigate('routineConsult')} /><NavItem icon="⌕" label="제품 찾기" active /><NavItem icon="♙" label="마이페이지" onPress={() => navigate('myPage')} /></View>
    </View>
  </SafeAreaView>;
}

function ProductCard({product, selected, onPress}: {product: CareProduct; selected: boolean; onPress: () => void}) {
  const functions = product.functions ?? inferFunctions(product);
  return <Pressable onPress={onPress} style={[styles.productCard, selected && styles.productCardSelected]}><View style={[styles.productImage, {backgroundColor: getProductTone(functions[0])}]}><Text style={styles.productImageText}>{product.brand}</Text></View><Text style={styles.brand}>{product.brand}</Text><Text style={styles.productName}>{product.name}</Text><Text style={styles.price}>{formatPrice(product.price)}</Text><View style={styles.tag}><Text style={styles.tagText}>{functions[0] ?? product.category}</Text></View></Pressable>;
}

function formatPrice(price: number) { return `${price.toLocaleString('ko-KR')}원`; }
function getProductTone(functionName?: string) { if (functionName === '진정') return '#D8E7D6'; if (functionName === '피부 장벽') return '#DDE4E1'; if (functionName === '자외선 차단') return '#F1E5C9'; if (functionName === '각질 케어') return '#F4E4BC'; return '#E8E6DC'; }
function matchesFunction(product: CareProduct, filter: (typeof FILTERS)[number]) {
  if (filter === '전체') return true;
  return (product.functions ?? inferFunctions(product)).includes(filter);
}
function inferFunctions(product: CareProduct) {
  const value = `${product.category} ${product.name}`.replaceAll(' ', '');
  const functions: string[] = [];
  if (value.includes('수분') || value.includes('보습')) functions.push('보습');
  if (value.includes('세라마이드') || value.includes('장벽')) functions.push('피부 장벽');
  if (value.includes('진정') || value.includes('판테놀') || value.includes('시카')) functions.push('진정');
  if (value.includes('AHA') || value.includes('BHA') || value.includes('각질')) functions.push('각질 케어');
  if (value.includes('트러블') || value.includes('피지')) functions.push('트러블·피지');
  if (value.includes('미백') || value.includes('비타민C') || value.includes('나이아신')) functions.push('미백·톤');
  if (value.includes('선크림') || value.includes('자외선')) functions.push('자외선 차단');
  return functions;
}

function NavItem({icon, label, active = false, onPress}: {icon: string; label: string; active?: boolean; onPress?: () => void}) { return <Pressable onPress={onPress} style={styles.navItem}>{icon === 'ai' ? <AiNavIcon active={active} /> : <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>}<Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text></Pressable>; }
function AiNavIcon({active}: {active: boolean}) { return <View style={[styles.aiNavIcon, active && styles.aiNavIconActive]}><View style={styles.aiAntenna} /><Text style={[styles.aiEyes, active && styles.aiEyesActive]}>• •</Text></View>; }

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'}, page: {flex: 1}, content: {paddingHorizontal: 24, paddingTop: 40, paddingBottom: 18}, header: {height: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, titleRow: {height: 43, marginTop: 25, flexDirection: 'row', alignItems: 'center'}, backButton: {width: 29, height: 36, justifyContent: 'center', marginRight: 4}, backIcon: {fontSize: 37, lineHeight: 32, color: '#374239'}, clover: {fontSize: 22, color: '#43815B'}, title: {fontSize: 27, fontWeight: '900', color: '#303932', letterSpacing: -1.2}, description: {fontSize: 11, color: '#7C867E', marginTop: 2, marginLeft: 33}, searchBox: {height: 47, marginTop: 21, borderRadius: 16, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, shadowColor: '#758075', shadowOpacity: .08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2}, searchIcon: {fontSize: 23, color: '#9BA49D', marginRight: 9}, searchInput: {flex: 1, color: '#425045', fontSize: 11, paddingVertical: 0}, sectionTitle: {flexDirection: 'row', alignItems: 'center', marginTop: 27, marginBottom: 11}, sparkle: {fontSize: 19, color: '#4E8C5E', marginRight: 8}, sectionTitleText: {fontSize: 14, fontWeight: '900', color: '#374239'}, noticeCard: {borderRadius: 16, backgroundColor: '#FFF', padding: 14, flexDirection: 'row', shadowColor: '#758075', shadowOpacity: .07, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2}, noticeIcon: {width: 49, height: 49, borderRadius: 25, backgroundColor: '#EFF5EA', alignItems: 'center', justifyContent: 'center', marginRight: 11}, noticeTitle: {fontSize: 13, fontWeight: '800', color: '#3B473D'}, noticeText: {fontSize: 9, lineHeight: 14, color: '#838C84', marginTop: 6}, filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14}, filter: {height: 31, borderRadius: 16, borderWidth: 1, borderColor: '#E1E5E1', paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center'}, filterActive: {borderColor: '#4E8B5E', backgroundColor: '#F7FCF6'}, filterText: {fontSize: 10, color: '#758078'}, filterTextActive: {color: '#407E52', fontWeight: '800'}, productGrid: {flexDirection: 'row', gap: 8, marginTop: 14}, productCard: {flex: 1, minHeight: 183, borderRadius: 12, borderWidth: 1, borderColor: '#EDF0EC', backgroundColor: '#FFF', padding: 8, alignItems: 'center'}, productCardSelected: {borderColor: '#4D875B', borderWidth: 2}, score: {width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, scoreLabel: {fontSize: 7, color: '#8A928B'}, scoreCircle: {width: 31, height: 31, borderRadius: 16, borderWidth: 2, borderColor: '#4B8A5D', borderLeftColor: '#E1EDE1', alignItems: 'center', justifyContent: 'center'}, scoreText: {fontSize: 8, fontWeight: '800', color: '#4B8A5D'}, productImage: {height: 55, width: 38, marginTop: 16, borderRadius: 6, alignItems: 'center', justifyContent: 'center'}, productImageText: {fontSize: 5, color: '#68726A', textAlign: 'center'}, brand: {fontSize: 8, color: '#6E796F', marginTop: 7}, productName: {height: 23, fontSize: 9, lineHeight: 11, textAlign: 'center', color: '#3D473F', fontWeight: '800', marginTop: 3}, price: {fontSize: 10, fontWeight: '900', color: '#3E4940', marginTop: 4}, tag: {borderRadius: 5, backgroundColor: '#EEF5EB', paddingHorizontal: 5, paddingVertical: 3, marginTop: 7}, tagText: {fontSize: 6, color: '#68906E'}, selectedProductBox: {marginTop: 14, borderRadius: 14, backgroundColor: '#F0F6ED', padding: 13, borderWidth: 1, borderColor: '#DDEAD8'}, selectedLabel: {fontSize: 9, color: '#668168'}, selectedName: {fontSize: 12, color: '#365B3E', fontWeight: '800', marginTop: 3}, consultButton: {height: 36, borderRadius: 10, backgroundColor: '#4D875B', justifyContent: 'center', alignItems: 'center', marginTop: 10}, consultButtonText: {fontSize: 10, color: '#FFF', fontWeight: '800'}, emptyText: {textAlign: 'center', fontSize: 12, color: '#838C84', marginTop: 34}, bottomNav: {height: 62, borderRadius: 15, backgroundColor: '#FFF', marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#758075', shadowOpacity: .07, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 2}, navItem: {alignItems: 'center', minWidth: 48}, navIcon: {fontSize: 20, color: '#98A29A'}, aiNavIcon: {width: 19, height: 17, borderRadius: 7, borderWidth: 1.4, borderColor: '#98A29A', alignItems: 'center', justifyContent: 'center', marginTop: 1}, aiNavIconActive: {borderColor: '#3E8754', backgroundColor: '#F3F8F2'}, aiAntenna: {position: 'absolute', top: -5, width: 1, height: 4, backgroundColor: '#98A29A'}, aiEyes: {fontSize: 8, lineHeight: 9, color: '#98A29A', fontWeight: '800'}, aiEyesActive: {color: '#3E8754'}, navLabel: {fontSize: 9, color: '#98A29A', marginTop: 2}, navActive: {color: '#3E8754', fontWeight: '800'},
});
