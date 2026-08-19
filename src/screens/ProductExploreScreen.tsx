import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandLogo } from '../components/common/BrandLogo';
import { BottomNavigation } from '../components/common/BottomNavigation';
import {
  getProductIllustrationKind,
  ProductIllustration,
} from '../components/common/ProductIllustration';
import { Navigate } from '../navigation/types';
import {
  addUserCareProduct,
  CareProduct,
  searchCareProducts,
} from '../api/careProduct';

const FILTERS = [
  '전체',
  '세정',
  '보습',
  '피부 장벽',
  '진정',
  '각질 케어',
  '트러블·피지',
  '미백·톤',
  '자외선 차단',
] as const;

type ProductFilter = (typeof FILTERS)[number];

const productLayout = StyleSheet.create({
  grid: { flexWrap: 'wrap' },
  card: { width: '31%', flexBasis: '31%', flexGrow: 0 },
});

export function ProductExploreScreen({
  navigate,
  onPurchase,
}: {
  navigate: Navigate;
  onPurchase: (product: {
    id: number;
    category: string;
    brand: string;
    name: string;
    usedInRoutine: boolean;
  }) => void;
}) {
  const [filter, setFilter] = useState<ProductFilter>('전체');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<CareProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CareProduct | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [purchaseNotice, setPurchaseNotice] = useState<
    'success' | 'error' | null
  >(null);

  useEffect(() => {
    const keyword = query.trim();
    let isCurrentSearch = true;
    const timer = setTimeout(
      () => {
        setIsSearching(true);
        setSearchError('');
        searchCareProducts(keyword)
          .then(result => {
            if (isCurrentSearch) {
              setProducts(
                [...result].sort((first, second) =>
                  first.name.localeCompare(second.name, 'ko-KR'),
                ),
              );
            }
          })
          .catch(() => {
            if (isCurrentSearch)
              setSearchError('제품 정보를 불러오지 못했어요.');
          })
          .finally(() => {
            if (isCurrentSearch) setIsSearching(false);
          });
      },
      keyword ? 350 : 0,
    );

    return () => {
      isCurrentSearch = false;
      clearTimeout(timer);
    };
  }, [query]);

  // 서버에서 전체 제품 또는 검색 결과를 받아오고, 프론트에서 기능 필터를 적용합니다.
  const visibleProducts = useMemo(
    () => products.filter(product => matchesFunction(product, filter)),
    [filter, products],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandLogo />
            <Text style={styles.clover}>♧</Text>
          </View>
          <View style={styles.titleRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="홈으로 돌아가기"
              hitSlop={12}
              onPress={() => navigate('home')}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <Text style={styles.title}>제품 찾기</Text>
          </View>
          <Text style={styles.description}>
            내 피부에 맞는 제품을 찾아보세요
          </Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="제품 종류, 브랜드, 제품명으로 검색"
              placeholderTextColor="#9AA39B"
              style={styles.searchInput}
            />
          </View>
          <View style={styles.filterRow}>
            {FILTERS.map(item => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filter, filter === item && styles.filterActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.productGrid, productLayout.grid]}>
            {visibleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedProduct?.id === product.id}
                onPress={() => {
                  setPurchaseNotice(null);
                  setSelectedProduct(currentProduct =>
                    currentProduct?.id === product.id ? null : product,
                  );
                }}
              />
            ))}
          </View>
          {isSearching && (
            <Text style={styles.emptyText}>제품을 검색하고 있어요.</Text>
          )}
          {!isSearching && searchError ? (
            <Text style={styles.emptyText}>{searchError}</Text>
          ) : null}
          {!isSearching && !searchError && visibleProducts.length === 0 && (
            <Text style={styles.emptyText}>
              {query.trim()
                ? '검색 결과가 없어요.'
                : '등록된 제품 정보가 없어요.'}
            </Text>
          )}
        </ScrollView>
        {selectedProduct && (
          <View
            style={[
              styles.selectedProductBox,
              { marginHorizontal: 12, marginBottom: 8 },
            ]}
          >
            <View>
              <Text style={styles.selectedLabel}>선택한 제품</Text>
              <Text numberOfLines={1} style={styles.selectedName}>
                {selectedProduct.brand} {selectedProduct.name}
              </Text>
            </View>
            {purchaseNotice && (
              <View
                style={{
                  marginTop: 10,
                  padding: 9,
                  borderRadius: 9,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor:
                    purchaseNotice === 'success' ? '#EAF4E7' : '#FFF1ED',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: purchaseNotice === 'success' ? '#4D875B' : '#B46B5E',
                    marginRight: 7,
                  }}
                >
                  {purchaseNotice === 'success' ? '✓' : '!'}
                </Text>
                <View>
                  <Text
                    style={{
                      fontSize: 9,
                      color:
                        purchaseNotice === 'success' ? '#426F4C' : '#97584E',
                      fontWeight: '900',
                    }}
                  >
                    {purchaseNotice === 'success'
                      ? '보유 제품에 추가했어요'
                      : '제품을 추가하지 못했어요'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      color:
                        purchaseNotice === 'success' ? '#69816D' : '#A2736C',
                      marginTop: 2,
                    }}
                  >
                    {purchaseNotice === 'success'
                      ? '마이페이지에서 보유 제품을 확인해보세요.'
                      : '잠시 후 다시 시도해주세요.'}
                  </Text>
                </View>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Pressable
                onPress={() =>
                  navigate('routineConsult', {
                    consultQuestion: `${selectedProduct.brand} ${selectedProduct.name} 제품이 제 피부와 현재 루틴에 잘 맞을까요?`,
                    consultProductId: selectedProduct.id,
                  })
                }
                style={[styles.consultButton, { flex: 1, marginTop: 0 }]}
              >
                <Text style={styles.consultButtonText}>AI에게 물어보기 ›</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  try {
                    await addUserCareProduct(1, selectedProduct.id);
                    onPurchase({ ...selectedProduct, usedInRoutine: false });
                    setPurchaseNotice('success');
                  } catch {
                    setPurchaseNotice('error');
                  }
                }}
                style={[
                  styles.consultButton,
                  {
                    flex: 0.48,
                    marginTop: 0,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#4D875B',
                  },
                ]}
              >
                <Text style={[styles.consultButtonText, { color: '#3F7C51' }]}>
                  구매하기
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        <BottomNavigation activeScreen="productExplore" navigate={navigate} />
      </View>
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  selected,
  onPress,
}: {
  product: CareProduct;
  selected: boolean;
  onPress: () => void;
}) {
  const functions = product.functions ?? inferFunctions(product);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.productCard,
        productLayout.card,
        selected && styles.productCardSelected,
      ]}
    >
      <View style={styles.productImage}>
        <ProductIllustration
          category={product.category}
          style={getProductImageStyle(product.category)}
        />
      </View>
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      <View style={styles.tag}>
        <Text style={styles.tagText}>{functions[0] ?? product.category}</Text>
      </View>
    </Pressable>
  );
}

function getProductImageStyle(category: string) {
  switch (getProductIllustrationKind(category)) {
    case 'toner':
      return styles.tonerIllustration;
    case 'serum':
      return styles.serumIllustration;
    case 'cream':
      return styles.creamIllustration;
    case 'sunscreen':
      return styles.sunscreenIllustration;
    default:
      return styles.cleanserIllustration;
  }
}

function formatPrice(price: number) {
  return `${price.toLocaleString('ko-KR')}원`;
}
function matchesFunction(product: CareProduct, filter: ProductFilter) {
  if (filter === '전체') return true;
  return (product.functions ?? inferFunctions(product)).includes(filter);
}

function inferFunctions(product: CareProduct) {
  const value = `${product.category} ${product.name}`.replaceAll(' ', '');
  const functions: string[] = [];
  if (product.category === 'cleanser') functions.push('세정');
  if (value.includes('수분') || value.includes('보습')) functions.push('보습');
  if (value.includes('세라마이드') || value.includes('장벽'))
    functions.push('피부 장벽');
  if (
    value.includes('진정') ||
    value.includes('판테놀') ||
    value.includes('시카')
  )
    functions.push('진정');
  if (value.includes('AHA') || value.includes('BHA') || value.includes('각질'))
    functions.push('각질 케어');
  if (value.includes('트러블') || value.includes('피지'))
    functions.push('트러블·피지');
  if (
    value.includes('미백') ||
    value.includes('비타민C') ||
    value.includes('나이아신')
  )
    functions.push('미백·톤');
  if (
    product.category === 'sun_cream' ||
    value.includes('선크림') ||
    value.includes('자외선')
  )
    functions.push('자외선 차단');
  return functions;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFDF9' },
  page: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 18 },
  header: {
    height: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    height: 43,
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 29,
    height: 36,
    justifyContent: 'center',
    marginRight: 4,
  },
  backIcon: { fontSize: 37, lineHeight: 32, color: '#374239' },
  clover: { fontSize: 22, color: '#43815B' },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#303932',
    letterSpacing: -1.2,
  },
  description: { fontSize: 11, color: '#7C867E', marginTop: 2, marginLeft: 33 },
  searchBox: {
    height: 47,
    marginTop: 21,
    borderRadius: 16,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#758075',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
    elevation: 2,
  },
  searchIcon: { fontSize: 23, color: '#9BA49D', marginRight: 9 },
  searchInput: { flex: 1, color: '#425045', fontSize: 11, paddingVertical: 0 },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 27,
    marginBottom: 11,
  },
  sparkle: { fontSize: 19, color: '#4E8C5E', marginRight: 8 },
  sectionTitleText: { fontSize: 14, fontWeight: '900', color: '#374239' },
  noticeCard: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    padding: 14,
    flexDirection: 'row',
    shadowColor: '#758075',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
    elevation: 2,
  },
  noticeIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: '#EFF5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  noticeTitle: { fontSize: 13, fontWeight: '800', color: '#3B473D' },
  noticeText: { fontSize: 9, lineHeight: 14, color: '#838C84', marginTop: 6 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  filter: {
    height: 31,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1E5E1',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: { borderColor: '#4E8B5E', backgroundColor: '#F7FCF6' },
  filterText: { fontSize: 10, color: '#758078' },
  filterTextActive: { color: '#407E52', fontWeight: '800' },
  productGrid: { flexDirection: 'row', gap: 8, marginTop: 14 },
  productCard: {
    flex: 1,
    minHeight: 183,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF0EC',
    backgroundColor: '#FFF',
    padding: 8,
    alignItems: 'center',
  },
  productCardSelected: { borderColor: '#4D875B', borderWidth: 2 },
  score: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: { fontSize: 7, color: '#8A928B' },
  scoreCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4B8A5D',
    borderLeftColor: '#E1EDE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { fontSize: 8, fontWeight: '800', color: '#4B8A5D' },
  productImage: {
    height: 64,
    width: 64,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFallback: {
    height: 42,
    width: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanserIllustration: { width: 42, height: 58 },
  tonerIllustration: { width: 35, height: 50 },
  serumIllustration: { width: 38, height: 53 },
  creamIllustration: { width: 56, height: 44 },
  sunscreenIllustration: { width: 36, height: 51 },
  productImageText: { fontSize: 5, color: '#68726A', textAlign: 'center' },
  brand: { fontSize: 8, color: '#6E796F', marginTop: 7 },
  productName: {
    height: 23,
    fontSize: 9,
    lineHeight: 11,
    textAlign: 'center',
    color: '#3D473F',
    fontWeight: '800',
    marginTop: 3,
  },
  price: { fontSize: 10, fontWeight: '900', color: '#3E4940', marginTop: 4 },
  tag: {
    borderRadius: 5,
    backgroundColor: '#EEF5EB',
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginTop: 7,
  },
  tagText: { fontSize: 6, color: '#68906E' },
  selectedProductBox: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#F0F6ED',
    padding: 13,
    borderWidth: 1,
    borderColor: '#DDEAD8',
  },
  selectedLabel: { fontSize: 9, color: '#668168' },
  selectedName: {
    fontSize: 12,
    color: '#365B3E',
    fontWeight: '800',
    marginTop: 3,
  },
  consultButton: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4D875B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  consultButtonText: { fontSize: 10, color: '#FFF', fontWeight: '800' },
  emptyText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#838C84',
    marginTop: 34,
  },
  bottomNav: {
    height: 62,
    borderRadius: 15,
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#758075',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  navItem: { alignItems: 'center', minWidth: 48 },
  navIcon: { fontSize: 20, color: '#98A29A' },
  aiNavIcon: {
    width: 19,
    height: 17,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: '#98A29A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  aiNavIconActive: { borderColor: '#3E8754', backgroundColor: '#F3F8F2' },
  aiAntenna: {
    position: 'absolute',
    top: -5,
    width: 1,
    height: 4,
    backgroundColor: '#98A29A',
  },
  aiEyes: { fontSize: 8, lineHeight: 9, color: '#98A29A', fontWeight: '800' },
  aiEyesActive: { color: '#3E8754' },
  navLabel: { fontSize: 9, color: '#98A29A', marginTop: 2 },
  navActive: { color: '#3E8754', fontWeight: '800' },
});
