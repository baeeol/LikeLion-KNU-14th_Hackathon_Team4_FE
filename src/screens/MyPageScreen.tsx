import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandLogo } from '../components/common/BrandLogo';
import { BottomNavigation } from '../components/common/BottomNavigation';
import {
  getProductIllustrationKind,
  ProductIllustration,
} from '../components/common/ProductIllustration';
import { Navigate, RoutineChangeRecord } from '../navigation/types';
import { getUser, User } from '../api/user';
import {
  deleteUserCareProduct,
  getUserCareProducts,
  OwnedCareProduct,
} from '../api/careProduct';
import {
  DailyRoutine,
  generateRoutineFromOwnedProducts,
  getUserRoutines,
} from '../api/routine';

const FALLBACK_USER: User = {
  id: 1,
  nickname: '준영',
  age: 24,
  skinType: { type: '수부지' },
};
const RECORDS: Record<
  number,
  { title: string; detail: string; tone: 'green' | 'orange' | 'mint' }
> = {
  3: {
    title: '장벽 루틴 강화',
    detail: '세라마이드 크림을 추가했어요.',
    tone: 'green',
  },
  7: {
    title: '각질 케어 조정',
    detail: 'AHA 토너 사용을 주 2회로 줄였어요.',
    tone: 'orange',
  },
  12: {
    title: '진정 루틴 유지',
    detail: '판테놀 세럼을 유지하고 있어요.',
    tone: 'mint',
  },
  16: {
    title: '수분 루틴 보완',
    detail: '히알루론산 수분 크림을 사용했어요.',
    tone: 'green',
  },
};
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type CalendarRecord = Pick<RoutineChangeRecord, 'title' | 'detail' | 'tone'>;

export function MyPageScreen({
  navigate,
  routineChanges = [],
  purchasedProducts = [],
  onRemovePurchasedProduct,
}: {
  navigate: Navigate;
  routineChanges?: RoutineChangeRecord[];
  purchasedProducts?: OwnedCareProduct[];
  onRemovePurchasedProduct: (productId: number) => void;
}) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [user, setUser] = useState<User>(FALLBACK_USER);
  const [ownedProducts, setOwnedProducts] = useState<OwnedCareProduct[]>([]);
  const [serverProductIds, setServerProductIds] = useState<number[]>([]);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<
    DailyRoutine[] | null
  >(null);
  const monthLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;
  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    ).getDay();
    const lastDate = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: lastDate }, (_, index) => index + 1),
    ];
  }, [today]);
  const recordsByDay = useMemo<Record<number, CalendarRecord>>(() => {
    const currentMonthChanges = routineChanges.filter(change => {
      const date = new Date(change.createdAt);
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      );
    });

    return currentMonthChanges.reduce<Record<number, CalendarRecord>>(
      (records, change) => {
        const changeDate = new Date(change.createdAt);
        records[changeDate.getDate()] = change;
        return records;
      },
      { ...RECORDS },
    );
  }, [routineChanges, today]);
  const selectedRecord = recordsByDay[selectedDay];

  useEffect(() => {
    getUser(1)
      .then(setUser)
      .catch(() => {
        // 백엔드 연결 전에도 해커톤 데모 화면은 기본 정보로 유지합니다.
      });
    getUserCareProducts(1)
      .then(async products => {
        let routineProductIds = new Set<number>();

        try {
          const routines = await getUserRoutines(1);
          routineProductIds = new Set(
            routines.flatMap(day => [
              ...day.morning.map(product => product.id),
              ...day.evening.map(product => product.id),
            ]),
          );
        } catch {
          // 루틴을 불러오지 못해도 보유 제품 자체는 표시합니다.
        }

        const productsWithRoutineStatus = products.map(product => ({
          ...product,
          usedInRoutine:
            Boolean(product.usedInRoutine) || routineProductIds.has(product.id),
        }));

        setServerProductIds(productsWithRoutineStatus.map(product => product.id));
        setOwnedProducts(currentProducts =>
          mergeOwnedProducts(productsWithRoutineStatus, currentProducts),
        );
      })
      .catch(() => {
        // 보유 제품 API가 준비되기 전에는 구매한 제품만 표시합니다.
      });
  }, []);

  useEffect(() => {
    setOwnedProducts(currentProducts =>
      mergeOwnedProducts(currentProducts, purchasedProducts),
    );
  }, [purchasedProducts]);

  const generateRoutine = async () => {
    if (!ownedProducts.length) {
      Alert.alert(
        '보유 제품이 없어요',
        '제품을 추가한 뒤 루틴을 생성해주세요.',
      );
      return;
    }

    try {
      setIsGeneratingRoutine(true);
      const routines = await generateRoutineFromOwnedProducts(1);
      setGeneratedRoutine(routines);
    } catch (error) {
      Alert.alert(
        '루틴을 생성하지 못했어요',
        error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      );
    } finally {
      setIsGeneratingRoutine(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCF9" />
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandLogo />
            <Text style={styles.clover}>♧</Text>
          </View>
          <Text style={styles.title}>마이페이지</Text>
          <Text style={styles.description}>
            내 피부와 보유 제품을 확인해보세요.
          </Text>

          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}></Text>
            </View>
            <View>
              <Text style={styles.nickname}>{user.nickname}님</Text>
              <Text style={styles.age}>
                {user.age}세 · 루틴을 시작한 지 14일째
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>현재 피부 타입</Text>
          <View style={styles.skinTypeInfoCard}>
            <View style={styles.skinTypeInfoIcon}>
              <Text style={styles.skinTypeInfoIconText}>◌</Text>
            </View>
            <View style={styles.skinTypeInfoCopy}>
              <Text style={styles.skinTypeInfoLabel}>
                루틴 분석에 반영 중인 피부 타입
              </Text>
              <Text style={styles.skinTypeInfoValue}>{user.skinType.type}</Text>
            </View>
            <Text style={styles.readOnlyLabel}>등록 정보</Text>
          </View>
          <Text style={styles.skinHint}>
            온보딩에서 입력한 정보예요. 이 정보로 맞춤 루틴을 추천합니다.
          </Text>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>루틴 변화 기록</Text>
              <Text style={styles.monthText}>{monthLabel}</Text>
            </View>
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map(day => (
                <Text key={day} style={styles.weekday}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) =>
                day ? (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.dayCell,
                      selectedDay === day && styles.selectedDayCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        selectedDay === day && styles.selectedDayNumber,
                      ]}
                    >
                      {day}
                    </Text>
                    {recordsByDay[day] && (
                      <View
                        style={[
                          styles.recordDot,
                          recordTone(recordsByDay[day].tone),
                        ]}
                      />
                    )}
                  </Pressable>
                ) : (
                  <View key={`blank-${index}`} style={styles.dayCell} />
                ),
              )}
            </View>
            <View style={styles.legendRow}>
              <Legend color="#62A06E" label="장벽·수분" />
              <Legend color="#F1CB70" label="각질 관리" />
              <Legend color="#A8CDA2" label="진정" />
            </View>
          </View>
          <View style={styles.recordCard}>
            <View
              style={[
                styles.recordIcon,
                selectedRecord
                  ? recordTone(selectedRecord.tone)
                  : styles.grayTone,
              ]}
            >
              <Text style={styles.recordIconText}>✓</Text>
            </View>
            <View style={styles.recordCopy}>
              {selectedRecord ? (
                <>
                  <Text style={styles.recordTitle}>
                    {selectedDay}일 · {selectedRecord.title}
                  </Text>
                  <Text style={styles.recordText}>{selectedRecord.detail}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.recordTitle}>
                    {selectedDay}일 · 기록 없음
                  </Text>
                  <Text style={styles.recordText}>
                    이날은 기본 루틴을 유지했어요.
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.ownedHeader}>
            <Text style={styles.sectionTitle}>보유 제품</Text>
            <Text style={styles.productCount}>{ownedProducts.length}개</Text>
          </View>
          <Text style={styles.ownedDescription}>
            현재 루틴에 등록된 제품이에요.
          </Text>
          <View style={styles.ownedList}>
            {ownedProducts.map(product => (
              <OwnedProductCard
                key={product.id}
                product={product}
                onDelete={async () => {
                  if (!serverProductIds.includes(product.id)) {
                    setOwnedProducts(currentProducts =>
                      currentProducts.filter(item => item.id !== product.id),
                    );
                    onRemovePurchasedProduct(product.id);
                    return;
                  }
                  try {
                    await deleteUserCareProduct(1, product.id);
                    setOwnedProducts(currentProducts =>
                      currentProducts.filter(item => item.id !== product.id),
                    );
                    onRemovePurchasedProduct(product.id);
                  } catch {
                    Alert.alert(
                      '삭제하지 못했어요',
                      '잠시 후 다시 시도해주세요.',
                    );
                  }
                }}
              />
            ))}
          </View>
          <Pressable
            disabled={isGeneratingRoutine}
            onPress={generateRoutine}
            style={[
              styles.createRoutineButton,
              isGeneratingRoutine && styles.createRoutineButtonDisabled,
            ]}
          >
            <Text style={styles.createRoutineButtonText}>
              {isGeneratingRoutine
                ? 'AI가 루틴을 생성하고 있어요...'
                : '보유 제품으로 루틴 생성하기'}
            </Text>
            <Text style={styles.createRoutineButtonArrow}>›</Text>
          </Pressable>
          {generatedRoutine && (
            <View style={styles.generatedRoutineCard}>
              <View style={styles.generatedRoutineIcon}>
                <Text style={styles.generatedRoutineIconText}>✓</Text>
              </View>
              <View style={styles.generatedRoutineCopy}>
                <Text style={styles.generatedRoutineTitle}>
                  새 루틴을 만들었어요
                </Text>
                <Text style={styles.generatedRoutineDescription}>
                  보유한 제품을 기준으로 AI가 이번 주 루틴을 구성했어요.
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  navigate('home', {
                    routineOverride: generatedRoutine,
                    routineChange: {
                      id: `owned-product-routine-${Date.now()}`,
                      createdAt: new Date().toISOString(),
                      title: '보유 제품 루틴 생성',
                      detail:
                        '보유한 제품을 기준으로 AI가 주간 루틴을 새로 만들었어요.',
                      tone: 'green',
                    },
                  })
                }
                style={styles.viewRoutineButton}
              >
                <Text style={styles.viewRoutineButtonText}>
                  홈에서 새 루틴 확인하기
                </Text>
                <Text style={styles.viewRoutineButtonArrow}>›</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
        <BottomNavigation activeScreen="myPage" navigate={navigate} />
      </View>
    </SafeAreaView>
  );
}

function mergeOwnedProducts(
  baseProducts: OwnedCareProduct[],
  addedProducts: OwnedCareProduct[],
) {
  return [
    ...baseProducts,
    ...addedProducts.filter(
      product => !baseProducts.some(item => item.id === product.id),
    ),
  ];
}

function OwnedProductCard({
  product,
  onDelete,
}: {
  product: OwnedCareProduct;
  onDelete: () => void;
}) {
  return (
    <View style={styles.ownedProduct}>
      <View style={styles.ownedProductImage}>
        <ProductIllustration
          category={product.category}
          style={getOwnedProductImageStyle(product.category)}
        />
      </View>
      <View style={styles.ownedCopy}>
        <Text style={styles.ownedCategory}>{product.category}</Text>
        <Text style={styles.ownedName}>
          {product.brand} {product.name}
        </Text>
        <Text style={styles.ownedFunction}>
          {product.usedInRoutine
            ? '현재 루틴 사용중인 제품'
            : '아직 루틴에 넣지 않은 제품'}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Text
          style={[
            styles.ownedStatus,
            !product.usedInRoutine && styles.ownedInactiveStatus,
          ]}
        >
          {product.usedInRoutine ? '루틴 사용중' : '보유 중'}
        </Text>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={{ fontSize: 8, color: '#9A665D' }}>삭제</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getOwnedProductImageStyle(category: string) {
  switch (getProductIllustrationKind(category)) {
    case 'toner':
      return styles.ownedTonerImage;
    case 'serum':
      return styles.ownedSerumImage;
    case 'cream':
      return styles.ownedCreamImage;
    case 'sunscreen':
      return styles.ownedSunscreenImage;
    default:
      return styles.ownedCleanserImage;
  }
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}
function recordTone(tone: 'green' | 'orange' | 'mint') {
  return tone === 'orange'
    ? styles.orangeTone
    : tone === 'mint'
    ? styles.mintTone
    : styles.greenTone;
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBFCF9' },
  page: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 18 },
  header: {
    height: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clover: { fontSize: 22, color: '#43815B' },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: '#303932',
    marginTop: 30,
    letterSpacing: -1.2,
  },
  description: { fontSize: 11, color: '#7C867E', marginTop: 8 },
  profileCard: {
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#758075',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
    elevation: 2,
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E6F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 17, fontWeight: '900', color: '#4B8057' },
  nickname: { fontSize: 15, fontWeight: '900', color: '#334037' },
  age: { fontSize: 9, color: '#818C83', marginTop: 5 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#3B473D',
    marginTop: 23,
  },
  skinTypeInfoCard: {
    height: 58,
    marginTop: 10,
    borderRadius: 13,
    backgroundColor: '#F4F8F2',
    borderWidth: 1,
    borderColor: '#E1EBDD',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skinTypeInfoIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#E2EFDE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  skinTypeInfoIconText: { fontSize: 18, color: '#4C8758' },
  skinTypeInfoCopy: { flex: 1 },
  skinTypeInfoLabel: { fontSize: 8, color: '#748076' },
  skinTypeInfoValue: {
    fontSize: 15,
    color: '#3F754B',
    fontWeight: '900',
    marginTop: 2,
  },
  readOnlyLabel: {
    fontSize: 8,
    color: '#6F8C73',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 9,
  },
  skinHint: { fontSize: 9, color: '#768276', marginTop: 8 },
  ownedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productCount: {
    fontSize: 11,
    color: '#4D875B',
    fontWeight: '800',
    marginTop: 23,
  },
  ownedDescription: { fontSize: 9, color: '#7C877E', marginTop: 6 },
  ownedList: { marginTop: 11, gap: 8 },
  ownedProduct: {
    minHeight: 69,
    borderRadius: 14,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#758075',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  ownedProductImage: {
    width: 43,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ownedCleanserImage: { width: 38, height: 51 },
  ownedTonerImage: { width: 30, height: 43 },
  ownedSerumImage: { width: 34, height: 46 },
  ownedCreamImage: { width: 43, height: 34 },
  ownedSunscreenImage: { width: 30, height: 42 },
  ownedCopy: { flex: 1 },
  ownedCategory: { fontSize: 8, color: '#7B877D' },
  ownedName: {
    fontSize: 11,
    color: '#39463C',
    fontWeight: '800',
    marginTop: 3,
  },
  ownedFunction: { fontSize: 8, color: '#69906E', marginTop: 5 },
  ownedStatus: {
    fontSize: 9,
    color: '#4D875B',
    fontWeight: '800',
    backgroundColor: '#EEF6EC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ownedInactiveStatus: { color: '#7A847B', backgroundColor: '#F1F2F0' },
  createRoutineButton: {
    height: 50,
    marginTop: 13,
    borderRadius: 13,
    backgroundColor: '#4D875B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createRoutineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  createRoutineButtonDisabled: { opacity: 0.65 },
  createRoutineButtonArrow: {
    position: 'absolute',
    right: 16,
    color: '#FFFFFF',
    fontSize: 21,
  },
  generatedRoutineCard: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: '#F1F7EE',
    borderWidth: 1,
    borderColor: '#DDEBD9',
    padding: 13,
  },
  generatedRoutineIcon: {
    position: 'absolute',
    top: 13,
    left: 13,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5B9267',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatedRoutineIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  generatedRoutineCopy: { marginLeft: 40 },
  generatedRoutineTitle: { color: '#3D6846', fontSize: 12, fontWeight: '900' },
  generatedRoutineDescription: {
    marginTop: 4,
    color: '#6E8371',
    fontSize: 9,
    lineHeight: 13,
  },
  viewRoutineButton: {
    height: 39,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#84A98A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewRoutineButtonText: { color: '#467F52', fontSize: 10, fontWeight: '900' },
  viewRoutineButtonArrow: {
    position: 'absolute',
    right: 12,
    color: '#467F52',
    fontSize: 18,
  },
  calendarCard: {
    marginTop: 22,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFF',
    shadowColor: '#758075',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarTitle: { fontSize: 14, fontWeight: '900', color: '#374239' },
  monthText: { fontSize: 10, color: '#758078' },
  weekdayRow: { flexDirection: 'row', marginTop: 16 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 9, color: '#889188' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 7 },
  dayCell: {
    width: '14.285%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 10,
  },
  selectedDayCell: { backgroundColor: '#4D875B' },
  dayNumber: { fontSize: 10, color: '#526053' },
  selectedDayNumber: { color: '#FFF', fontWeight: '800' },
  recordDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  greenTone: { backgroundColor: '#62A06E' },
  orangeTone: { backgroundColor: '#F1CB70' },
  mintTone: { backgroundColor: '#A8CDA2' },
  grayTone: { backgroundColor: '#B8C0B9' },
  legendRow: { flexDirection: 'row', gap: 11, marginTop: 10 },
  legend: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 7, height: 7, borderRadius: 4, marginRight: 4 },
  legendText: { fontSize: 8, color: '#7D877E' },
  recordCard: {
    minHeight: 65,
    marginTop: 13,
    borderRadius: 14,
    backgroundColor: '#F3F7F1',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recordIconText: { fontSize: 14, color: '#FFF', fontWeight: '800' },
  recordCopy: { flex: 1 },
  recordTitle: { fontSize: 11, color: '#405243', fontWeight: '800' },
  recordText: { fontSize: 9, color: '#778278', marginTop: 5 },
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
