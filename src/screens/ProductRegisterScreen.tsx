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

type Product = {
  id: number;
  brand: string;
  name: string;
  category: string;
  ingredients: string[];
  color: string;
  shape: 'bottle' | 'dropper' | 'jar';
};

type ProductSetting = {
  time: 'AM' | 'PM';
  frequency: string;
  added: boolean;
};

const categories = ['토너', '세럼', '크림', '클렌저', '선크림'];

const products: Product[] = [
  {id: 1, brand: 'Anua', name: '어성초 77% 하트리프 수딩 토너', category: '토너', ingredients: ['어성초', '히알루론산', '판테놀'], color: '#E9E9E4', shape: 'bottle'},
  {id: 2, brand: 'The Ordinary', name: '나이아신아마이드 10% + 징크 1% 세럼', category: '세럼', ingredients: ['나이아신아마이드', '아연', '알란토인'], color: '#A5C9AE', shape: 'dropper'},
  {id: 3, brand: 'SKIN1004', name: '마다가스카르 센텔라 수딩 크림', category: '크림', ingredients: ['병풀추출물', '세라마이드', '스쿠알란'], color: '#D7D1BF', shape: 'jar'},
];

const initialSettings: Record<number, ProductSetting> = {
  1: {time: 'AM', frequency: '매일', added: false},
  2: {time: 'AM', frequency: '매일', added: false},
  3: {time: 'PM', frequency: '주 3회', added: false},
};

export function ProductRegisterScreen({navigate}: {navigate: Navigate}) {
  const [selectedCategory, setSelectedCategory] = useState('토너');
  const [settings, setSettings] = useState(initialSettings);

  const updateSetting = (id: number, setting: Partial<ProductSetting>) => {
    setSettings(current => ({
      ...current,
      [id]: {...current[id], ...setting},
    }));
  };

  const addedCount = Object.values(settings).filter(setting => setting.added).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />

      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigate('onboarding')} hitSlop={10}>
            <Text style={styles.backButton}>‹</Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>보유 제품 등록</Text>
            <Text style={styles.headerDescription}>현재 사용 중인 제품을 등록하고 사용 습관을 알려주세요</Text>
          </View>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchPlaceholder}>제품명 또는 브랜드 검색</Text>
        </View>

        <View style={styles.categoryRow}>
          {categories.map(category => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[styles.categoryChip, selectedCategory === category && styles.selectedCategoryChip]}>
              <Text style={[styles.categoryLabel, selectedCategory === category && styles.selectedCategoryLabel]}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.searchResultTitle}>검색 결과</Text>

        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            setting={settings[product.id]}
            onChange={setting => updateSetting(product.id, setting)}
          />
        ))}

        <Pressable style={styles.directRegister}>
          <View style={styles.directIcon}><Text style={styles.directIconText}>◜</Text></View>
          <View style={styles.directTextWrap}>
            <Text style={styles.directTitle}>원하는 제품이 없나요?</Text>
            <Text style={styles.directDescription}>직접 제품을 등록해 맞춤 루틴을 관리해보세요.</Text>
          </View>
          <View style={styles.directButton}><Text style={styles.directButtonText}>직접 등록</Text></View>
        </Pressable>

        <Pressable
          onPress={() => navigate('home')}
          style={({pressed}) => [styles.completeButton, pressed && styles.pressed]}>
          <Text style={styles.completeText}>
            등록 완료{addedCount > 0 ? ` · ${addedCount}개 추가됨` : ''}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  setting,
  onChange,
}: {
  product: Product;
  setting: ProductSetting;
  onChange: (setting: Partial<ProductSetting>) => void;
}) {
  return (
    <View style={styles.productCard}>
      <ProductBottle product={product} />

      <View style={styles.productInfo}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.categoryPill}><Text style={styles.categoryPillText}>{product.category}</Text></View>
        <View style={styles.ingredientRow}>
          {product.ingredients.map(ingredient => (
            <View key={ingredient} style={styles.ingredientPill}>
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.settingArea}>
        <Text style={styles.settingLabel}>사용 시간</Text>
        <View style={styles.timeRow}>
          <TimeButton label="☼  AM" selected={setting.time === 'AM'} onPress={() => onChange({time: 'AM'})} />
          <TimeButton label="☾  PM" selected={setting.time === 'PM'} onPress={() => onChange({time: 'PM'})} />
        </View>

        <Text style={styles.settingLabel}>사용 빈도</Text>
        <Pressable onPress={() => onChange({frequency: setting.frequency === '매일' ? '주 3회' : '매일'})} style={styles.frequencyButton}>
          <Text style={styles.frequencyText}>{setting.frequency}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>

        <Pressable onPress={() => onChange({added: !setting.added})} style={[styles.addButton, setting.added && styles.addedButton]}>
          <Text style={[styles.addButtonText, setting.added && styles.addedButtonText]}>
            {setting.added ? '✓ 추가됨' : '＋ 추가'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProductBottle({product}: {product: Product}) {
  const bottleStyle = product.shape === 'jar' ? styles.jar : product.shape === 'dropper' ? styles.dropper : styles.bottle;

  return (
    <View style={styles.productImageArea}>
      <View style={[styles.productShape, bottleStyle, {backgroundColor: product.color}]}>
        {product.shape === 'dropper' && <View style={styles.dropperCap} />}
        {product.shape === 'bottle' && <View style={styles.bottleCap} />}
        <Text style={styles.productMark}>{product.category}</Text>
      </View>
    </View>
  );
}

function TimeButton({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.timeButton, selected && styles.selectedTimeButton]}>
      <Text style={[styles.timeButtonText, selected && styles.selectedTimeButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'},
  screen: {paddingHorizontal: 30, paddingTop: 42, paddingBottom: 20},
  header: {height: 82, flexDirection: 'row', alignItems: 'flex-start'},
  backButton: {fontSize: 37, lineHeight: 32, color: '#47534A'},
  headerTitleWrap: {flex: 1, alignItems: 'center'},
  headerTitle: {fontSize: 18, color: '#323B34', fontWeight: '900'},
  headerDescription: {fontSize: 10, color: '#7D8780', marginTop: 6},
  headerSpace: {width: 25},
  searchBox: {height: 49, backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#778077', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2},
  searchIcon: {fontSize: 25, color: '#A2AAA4', marginRight: 10},
  searchPlaceholder: {fontSize: 12, color: '#A2A8A3'},
  categoryRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 15},
  categoryChip: {height: 31, minWidth: 73, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: '#D7DED7', alignItems: 'center', justifyContent: 'center'},
  selectedCategoryChip: {backgroundColor: '#4C7F59', borderColor: '#4C7F59'},
  categoryLabel: {fontSize: 11, color: '#566159'},
  selectedCategoryLabel: {color: '#FFF', fontWeight: '800'},
  searchResultTitle: {fontSize: 14, color: '#3A443C', fontWeight: '900', marginTop: 24, marginBottom: 8},
  productCard: {minHeight: 147, backgroundColor: '#FFF', borderRadius: 15, padding: 12, marginTop: 8, flexDirection: 'row', shadowColor: '#748077', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 10, elevation: 2},
  productImageArea: {width: 80, alignItems: 'center', justifyContent: 'center'},
  productShape: {alignItems: 'center', justifyContent: 'center'},
  bottle: {width: 30, height: 86, borderRadius: 5},
  dropper: {width: 31, height: 78, borderRadius: 6, marginTop: 9},
  jar: {width: 59, height: 52, borderRadius: 8, marginTop: 22},
  bottleCap: {position: 'absolute', top: -10, width: 25, height: 11, borderRadius: 3, backgroundColor: '#FAFAF8'},
  dropperCap: {position: 'absolute', top: -17, width: 16, height: 18, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#ECECE8'},
  productMark: {fontSize: 6, color: '#687269', fontWeight: '800'},
  productInfo: {width: 146, paddingTop: 2},
  brand: {fontSize: 10, color: '#8B938D'},
  productName: {fontSize: 13, lineHeight: 18, color: '#303A32', fontWeight: '800', marginTop: 4},
  categoryPill: {alignSelf: 'flex-start', backgroundColor: '#E9F2E7', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, marginTop: 7},
  categoryPillText: {fontSize: 8, color: '#67906E', fontWeight: '800'},
  ingredientRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 8},
  ingredientPill: {borderWidth: 1, borderColor: '#E0E5E0', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2},
  ingredientText: {fontSize: 6, color: '#727A73'},
  settingArea: {flex: 1, paddingLeft: 5},
  settingLabel: {fontSize: 8, color: '#677168', marginBottom: 4},
  timeRow: {flexDirection: 'row', gap: 4, marginBottom: 9},
  timeButton: {height: 25, flex: 1, borderRadius: 13, borderWidth: 1, borderColor: '#E0E5E0', alignItems: 'center', justifyContent: 'center'},
  selectedTimeButton: {borderColor: '#5B9270', backgroundColor: '#F7FCF6'},
  timeButtonText: {fontSize: 8, color: '#A0A8A1'},
  selectedTimeButtonText: {color: '#4B7E5A', fontWeight: '800'},
  frequencyButton: {height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#E0E5E0', paddingHorizontal: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7},
  frequencyText: {fontSize: 8, color: '#6F796F'},
  chevron: {fontSize: 14, color: '#657167'},
  addButton: {height: 25, borderRadius: 13, borderWidth: 1, borderColor: '#4C875E', alignItems: 'center', justifyContent: 'center'},
  addedButton: {backgroundColor: '#4C875E'},
  addButtonText: {fontSize: 10, color: '#4C875E', fontWeight: '800'},
  addedButtonText: {color: '#FFF'},
  directRegister: {height: 64, borderRadius: 13, borderWidth: 1, borderStyle: 'dashed', borderColor: '#A9C0AD', marginTop: 11, paddingHorizontal: 13, alignItems: 'center', flexDirection: 'row'},
  directIcon: {width: 31, height: 31, borderRadius: 16, backgroundColor: '#EEF5EB', alignItems: 'center', justifyContent: 'center', marginRight: 9},
  directIconText: {fontSize: 16, color: '#65926B'},
  directTextWrap: {flex: 1},
  directTitle: {fontSize: 11, color: '#465247', fontWeight: '800'},
  directDescription: {fontSize: 8, color: '#89938B', marginTop: 4},
  directButton: {borderWidth: 1, borderColor: '#5A8B65', borderRadius: 15, paddingHorizontal: 14, paddingVertical: 8},
  directButtonText: {fontSize: 10, color: '#4C7F59', fontWeight: '800'},
  completeButton: {height: 49, borderRadius: 10, backgroundColor: '#5C8B67', marginTop: 10, alignItems: 'center', justifyContent: 'center'},
  pressed: {opacity: 0.82},
  completeText: {fontSize: 15, color: '#FFF', fontWeight: '800'},
});
