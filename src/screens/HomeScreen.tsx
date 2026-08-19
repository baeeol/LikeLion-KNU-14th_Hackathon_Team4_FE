import React, {useEffect, useState} from 'react';
import {Image, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {BrandLogo} from '../components/common/BrandLogo';
import {BottomNavigation} from '../components/common/BottomNavigation';
import {Navigate} from '../navigation/types';
import {DailyRoutine, getUserRoutines, RoutineApiProduct} from '../api/routine';
import {getUser} from '../api/user';

type RoutineProduct = {
  category: string;
  name: string;
  volume?: number;
  tone: string;
  shape: 'bottle' | 'dropper' | 'jar' | 'tube' | 'pump';
};

const MORNING_ROUTINE: RoutineProduct[] = [
  {category: '클렌저', name: '약산성 젤 클렌저', tone: '#E8E9DE', shape: 'bottle'},
  {category: '토너', name: '나이아신아마이드 토너', tone: '#DCE8D6', shape: 'bottle'},
  {category: '세럼', name: '비타민 C 세럼', tone: '#B8D3AF', shape: 'dropper'},
  {category: '수분크림', name: '수분 장벽 크림', tone: '#D9DBC6', shape: 'jar'},
  {category: '선크림', name: '데일리 무기자차 선크림', tone: '#E9E4CC', shape: 'tube'},
];

const EVENING_ROUTINE = MORNING_ROUTINE.slice(0, 4).map(product => ({
  ...product,
  name: product.category === '세럼' ? '진정 세럼' : product.name,
}));

const FALLBACK_ROUTINES: DailyRoutine[] = Array.from({length: 7}, () => ({
  morning: MORNING_ROUTINE.map(({category, name}, index) => ({id: index + 1, category, name})),
  evening: EVENING_ROUTINE.map(({category, name}, index) => ({id: index + 11, category, name})),
}));

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatToday(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

type AddedRoutineProduct = {id: number; category: string; name: string};

export function HomeScreen({navigate, addedRoutineProduct, routineOverride}: {navigate: Navigate; addedRoutineProduct?: AddedRoutineProduct | null; routineOverride?: DailyRoutine[] | null}) {
  const [today, setToday] = useState(() => new Date());
  const [routines, setRoutines] = useState<DailyRoutine[]>(FALLBACK_ROUTINES);
  const [nickname, setNickname] = useState('준영');

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (routineOverride) {
      setRoutines(routineOverride);
      return;
    }
    getUserRoutines(1).then(apiRoutines => setRoutines(addProductToRoutine(apiRoutines, addedRoutineProduct))).catch(() => {
      // 백엔드 연결 전에는 데모 루틴을 보여줍니다.
      setRoutines(currentRoutines => addProductToRoutine(currentRoutines, addedRoutineProduct));
    });
  }, [addedRoutineProduct, routineOverride]);

  useEffect(() => {
    getUser(1).then(user => setNickname(user.nickname)).catch(() => {
      // 네트워크 오류 시에도 기존 인사말을 유지합니다.
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCF9" />
      <View style={styles.page}>
        <View style={styles.screen}>
          <HomeHeader nickname={nickname} />
          <RoutineSummary todayLabel={formatToday(today)} routines={routines} />
        </View>
        <View style={styles.fixedShortcutArea}><ShortcutSection navigate={navigate} /></View>
        <BottomNavigation activeScreen="home" navigate={navigate} />
      </View>
    </SafeAreaView>
  );
}

function addProductToRoutine(routines: DailyRoutine[], product?: AddedRoutineProduct | null) {
  if (!product) return routines;
  return routines.map(day => {
    const alreadyIncluded = [...day.morning, ...day.evening].some(item => item.id === product.id || item.name === product.name);
    return alreadyIncluded ? day : {...day, evening: [...day.evening, product]};
  });
}

function HomeHeader({nickname}: {nickname: string}) {
  return <><View style={styles.topRow}><View style={styles.logoWrap}><BrandLogo /></View><Text style={styles.notification}>♧</Text></View><View style={styles.welcomeRow}><View><View style={styles.welcomeTitleRow}><Text style={styles.welcome}>안녕하세요, {nickname}님</Text><Image source={require('../assets/images/routine-leaf.png')} resizeMode="contain" style={styles.welcomeLeafIcon} /></View><Text style={styles.welcomeSub}>오늘의 피부에 가장 좋은 선택을 해주세요.</Text></View></View></>;
}

function RoutineSummary({todayLabel, routines}: {todayLabel: string; routines: DailyRoutine[]}) {
  const [tab, setTab] = useState<'morning' | 'evening'>('morning');
  const todayIndex = new Date().getDay();
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
  const selectedRoutine = getRoutineForWeekday(routines, selectedDayIndex);
  const routine = (tab === 'morning' ? selectedRoutine.morning : selectedRoutine.evening).map(toRoutineProduct);
  const routineDate = selectedDayIndex === todayIndex ? todayLabel : `${WEEKDAY_LABELS[selectedDayIndex]}요일 루틴`;
  return <><View style={styles.routineCard}><View style={styles.routineHeader}><View style={styles.titleRow}><RoutineIcon /><Text style={styles.routineTitle}>내 루틴</Text><Text style={styles.routineDate}>{routineDate}</Text></View><View style={styles.tabRow}><RoutineTab label="☼ 아침" active={tab === 'morning'} onPress={() => setTab('morning')} /><RoutineTab label="☾ 저녁" active={tab === 'evening'} onPress={() => setTab('evening')} /></View></View>{routine.map((product, index) => <RoutineItem key={`${product.name}-${index}`} index={index + 1} product={product} isLast={index === routine.length - 1} />)}<View style={styles.tipRow}>{tab === 'morning' ? <Text style={styles.tipIcon}>☀</Text> : <MoonIcon />}<Text style={styles.tipText}>{tab === 'morning' ? '아침' : '저녁'} 루틴  ·  현재 등록된 제품 순서예요.</Text></View></View><WeeklySchedule routines={routines} selectedDayIndex={selectedDayIndex} onSelectDay={setSelectedDayIndex} /></>;
}

function getRoutineForWeekday(routines: DailyRoutine[], dayIndex: number) { return routines[(dayIndex + 6) % 7] ?? {morning: [], evening: []}; }
function toRoutineProduct(product: RoutineApiProduct): RoutineProduct { const category = product.category.toLowerCase(); const shape = /sun_cream|sunscreen|선크림/.test(category) ? 'tube' : /toner|skin|토너|스킨/.test(category) ? 'bottle' : /cream|크림|lotion|emulsion|로션|에멀전/.test(category) ? 'jar' : /serum|ampule|essence|세럼|앰플|에센스/.test(category) ? 'dropper' : 'pump'; return {category: product.category, name: product.name, volume: product.volume, tone: '#D9E6D4', shape}; }

function RoutineIcon() { return <Text style={styles.routineLeafIcon}>🌿</Text>; }
function MoonIcon() { return <View style={styles.moonIcon}><View style={styles.moonCutout} /></View>; }
function RoutineTab({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}><Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text></Pressable>; }

function RoutineItem({index, product, isLast}: {index: number; product: RoutineProduct; isLast: boolean}) {
  const shape = product.shape === 'jar' ? styles.jar : product.shape === 'tube' ? styles.tube : product.shape === 'dropper' ? styles.dropper : styles.bottle;
  const isCleanser = /cleanser|클렌저|클렌징|폼|oil|오일/.test(product.category.toLowerCase());
  const isToner = /toner|skin|토너|스킨/.test(product.category.toLowerCase());
  const isSerum = /serum|ampule|essence|세럼|앰플|에센스/.test(product.category.toLowerCase());
  const isSunscreen = /sun_cream|sunscreen|선크림|자외선/.test(product.category.toLowerCase());
  const isCream = !isSunscreen && /cream|크림|lotion|emulsion|로션|에멀전/.test(product.category.toLowerCase());
  const productImage = product.shape === 'pump' || isCleanser
    ? require('../assets/images/cleanser.png')
    : isToner
      ? require('../assets/images/toner.png')
      : isSerum
        ? require('../assets/images/serum.png')
        : isSunscreen
          ? require('../assets/images/sunscreen.png')
          : isCream
            ? require('../assets/images/cream.png')
            : null;

  const productImageStyle = product.shape === 'pump' || isCleanser
    ? {width: 42, height: 54}
    : isToner
      ? {width: 36, height: 46}
      : isSerum
        ? {width: 40, height: 50}
        : isSunscreen
          ? {width: 34, height: 46}
          : {width: 48, height: 40};

  return <View style={styles.routineItem}><View style={styles.orderColumn}><View style={styles.orderNumber}><Text style={styles.orderNumberText}>{index}</Text></View>{!isLast && <View style={styles.orderLine} />}</View><View style={styles.productShapeArea}>{productImage ? <Image source={productImage} resizeMode="contain" style={productImageStyle} /> : <View style={[styles.productShape, shape, {backgroundColor: product.tone}]}>{product.shape === 'dropper' && <View style={styles.dropperCap} />}{product.shape === 'bottle' && <View style={styles.bottleCap} />}</View>}</View><View style={styles.itemTextWrap}><View style={{flexDirection: 'row', alignItems: 'center'}}><Text style={styles.itemCategory}>{product.category}</Text>{typeof product.volume === 'number' && <Text style={[styles.itemCategory, {marginLeft: 6, color: '#628466'}]}>사용량 {product.volume}ml</Text>}</View><Text style={styles.itemName}>{product.name}</Text></View></View>;
}

function WeeklySchedule({routines, selectedDayIndex, onSelectDay}: {routines: DailyRoutine[]; selectedDayIndex: number; onSelectDay: (dayIndex: number) => void}) {
  return <View style={styles.weeklyCard}><View style={styles.weeklyHeader}><View style={styles.weeklyTitleWrap}><Image source={require('../assets/images/calendar.png')} resizeMode="contain" style={styles.calendarImage} /><Text style={styles.weeklyTitle}>주간 스케줄</Text></View></View><View style={styles.scheduleRow}>{[1, 2, 3, 4, 5, 6, 0].map(dayIndex => { const routine = getRoutineForWeekday(routines, dayIndex); const label = getWeeklyFunctionLabel(routines, routine); return <Pressable key={dayIndex} onPress={() => onSelectDay(dayIndex)} style={[styles.dayColumn, selectedDayIndex === dayIndex && styles.dayColumnSelected]}><Text style={styles.dayText}>{WEEKDAY_LABELS[dayIndex]}</Text><View style={[styles.scheduleTag, scheduleTagStyle(label)]}><Text style={styles.scheduleTagText}>{label}</Text></View></Pressable>; })}</View><View style={styles.legendRow}><Legend color="#69A174" label="기능성 루틴" /><Legend color="#CDD1CD" label="기본·휴식 루틴" /></View></View>;
}

function getWeeklyFunctionLabel(routines: DailyRoutine[], routine: DailyRoutine) {
  const functionalProduct = [...routine.morning, ...routine.evening].find(product => {
    const functionName = getFunctionName(product.name);
    const usedDays = routines.filter(day => [...day.morning, ...day.evening].some(item => item.id === product.id || item.name === product.name)).length;
    return Boolean(functionName) && usedDays < 7;
  });
  if (!functionalProduct) return routine.morning.length + routine.evening.length ? '기본' : '휴식';
  return getFunctionName(functionalProduct.name);
}

function getFunctionName(name: string) { if (/AHA|BHA|각질/i.test(name)) return '각질'; if (/레티놀/i.test(name)) return '레티놀'; if (/비타민\s?C|나이아신/i.test(name)) return '미백·톤'; if (/판테놀|시카|진정/i.test(name)) return '진정'; return ''; }
function scheduleTagStyle(label: string) { if (label === '각질' || label === '레티놀') return styles.orangeTag; if (label === '진정') return styles.mintTag; if (label === '휴식') return styles.grayTag; return styles.greenTag; }
function Legend({color, label}: {color: string; label: string}) { return <View style={styles.legend}><View style={[styles.legendDot, {backgroundColor: color}]} /><Text style={styles.legendText}>{label}</Text></View>; }

function ShortcutSection({navigate}: {navigate: Navigate}) {
  return <View style={styles.shortcutRow}><ShortcutCard icon="⌕" title="제품 찾아보기" description={'내 피부에 맞는 제품을\n발견해 보세요'} variant="search" onPress={() => navigate('productExplore')} /><ShortcutCard icon="ai" title="피부가 불편해졌어요" description={'AI와 상담하고 루틴을\n조정해 보세요'} variant="sos" onPress={() => navigate('routineConsult')} /></View>;
}

function ShortcutCard({icon, title, description, variant, onPress}: {icon: string; title: string; description: string; variant: 'search' | 'sos'; onPress: () => void}) { return <Pressable onPress={onPress} style={[styles.shortcut, variant === 'search' ? styles.searchShortcut : styles.sosShortcut]}><View style={styles.shortcutIcon}>{icon === 'ai' ? <Image source={require('../assets/images/ai-chat-avatar.png')} resizeMode="contain" style={styles.shortcutAiImage} /> : <Text style={styles.shortcutIconText}>{icon}</Text>}</View><View><Text style={styles.shortcutTitle}>{title}</Text><Text style={styles.shortcutText}>{description}</Text></View><Text style={styles.shortcutArrow}>›</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FBFCF9'}, page: {flex: 1}, screen: {flex: 1, paddingHorizontal: 12, paddingTop: 40, paddingBottom: 10}, topRow: {height: 42, marginHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, logoWrap: {}, notification: {fontSize: 22, color: '#43815B'}, welcomeRow: {height: 80, justifyContent: 'center', paddingLeft: 12}, welcomeTitleRow: {flexDirection: 'row', alignItems: 'center'}, welcome: {fontSize: 21, color: '#2D3830', fontWeight: '800', letterSpacing: -0.7}, welcomeLeafIcon: {width: 26, height: 26, marginLeft: 4}, welcomeSub: {fontSize: 11, color: '#929B93', marginTop: 5},
  routineCard: {backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 5, marginTop: 12, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2}, routineHeader: {paddingHorizontal: 13, paddingTop: 12, paddingBottom: 10}, titleRow: {flexDirection: 'row', alignItems: 'center'}, routineTitle: {fontSize: 18, color: '#303932', fontWeight: '900', letterSpacing: -0.8}, routineDate: {fontSize: 10, color: '#89938B', fontWeight: '600', marginLeft: 8, marginTop: 2}, routineLeafIcon: {fontSize: 19, marginRight: 7}, tabRow: {flexDirection: 'row', gap: 6, marginTop: 10}, tab: {height: 39, flex: 1, borderRadius: 13, borderWidth: 1, borderColor: '#E0E5DF', alignItems: 'center', justifyContent: 'center'}, activeTab: {borderColor: '#4D885E', backgroundColor: '#F7FCF6'}, tabLabel: {fontSize: 11, color: '#767F78'}, activeTabLabel: {color: '#437F55', fontWeight: '800'},
  routineItem: {height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderTopWidth: 1, borderTopColor: '#EFF1EE'}, orderColumn: {width: 27, height: 58, alignItems: 'center', paddingTop: 10}, orderNumber: {width: 23, height: 23, borderRadius: 12, backgroundColor: '#F3F6F1', alignItems: 'center', justifyContent: 'center'}, orderNumberText: {fontSize: 11, color: '#68736A', fontWeight: '800'}, orderLine: {width: 1, height: 17, borderLeftWidth: 1, borderStyle: 'dotted', borderColor: '#B7C1B7', marginTop: 3}, productShapeArea: {width: 50, alignItems: 'center'}, productShape: {}, bottle: {width: 15, height: 31, borderRadius: 4}, dropper: {width: 15, height: 28, borderRadius: 4, marginTop: 5}, jar: {width: 29, height: 23, borderRadius: 5, marginTop: 8}, tube: {width: 19, height: 29, borderRadius: 4, marginTop: 3}, bottleCap: {position: 'absolute', top: -5, alignSelf: 'center', width: 11, height: 6, borderRadius: 2, backgroundColor: '#ECF0E9'}, dropperCap: {position: 'absolute', top: -9, alignSelf: 'center', width: 9, height: 10, borderRadius: 4, backgroundColor: '#728070'}, itemTextWrap: {flex: 1}, itemCategory: {fontSize: 8, color: '#7D8780'}, itemName: {fontSize: 12, color: '#303A32', fontWeight: '800', marginTop: 4}, tipRow: {height: 31, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16}, tipIcon: {fontSize: 17, color: '#EDA450', marginRight: 7}, moonIcon: {width: 15, height: 15, borderRadius: 8, backgroundColor: '#EDA450', overflow: 'hidden', marginRight: 9}, moonCutout: {position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFFFFF', top: -2, left: 5}, tipText: {fontSize: 8, color: '#858D85'},
  weeklyCard: {backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginTop: 12, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2}, weeklyHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, weeklyTitleWrap: {flexDirection: 'row', alignItems: 'center'}, calendarImage: {width: 23, height: 23, marginRight: 8}, weeklyTitle: {fontSize: 13, color: '#364239', fontWeight: '800'}, weeklyLink: {fontSize: 8, color: '#7C877E'}, scheduleRow: {flexDirection: 'row', gap: 4, marginTop: 15}, dayColumn: {height: 51, flex: 1, borderRadius: 8, borderWidth: 1, borderColor: '#E5E9E4', alignItems: 'center', paddingTop: 6}, dayColumnSelected: {borderColor: '#4D875B', borderWidth: 1.5, backgroundColor: '#F8FCF7'}, dayText: {fontSize: 10, color: '#59645B', fontWeight: '800'}, scheduleTag: {borderRadius: 7, paddingHorizontal: 4, paddingVertical: 4, marginTop: 6}, scheduleTagText: {fontSize: 8, fontWeight: '800'}, greenTag: {backgroundColor: '#E5F1E4'}, orangeTag: {backgroundColor: '#FFF4DE'}, mintTag: {backgroundColor: '#EEF6EA'}, grayTag: {backgroundColor: '#F1F2F1'}, legendRow: {flexDirection: 'row', gap: 10, marginTop: 10}, legend: {flexDirection: 'row', alignItems: 'center'}, legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 4}, legendText: {fontSize: 8, color: '#7A837B'},
  fixedShortcutArea: {paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, backgroundColor: '#FBFCF9'}, shortcutRow: {flexDirection: 'row', gap: 8}, shortcut: {flex: 1, minHeight: 68, borderRadius: 13, padding: 10, flexDirection: 'row', alignItems: 'center'}, searchShortcut: {backgroundColor: '#F0F5EE'}, sosShortcut: {backgroundColor: '#FFF3E8'}, shortcutIcon: {width: 27, height: 27, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 7}, shortcutAiImage: {width: 25, height: 25}, shortcutIconText: {fontSize: 18, color: '#47765B'}, shortcutTitle: {fontSize: 11, fontWeight: '800', color: '#546259'}, shortcutText: {fontSize: 8, lineHeight: 11, color: '#8A958B', marginTop: 3}, shortcutArrow: {position: 'absolute', right: 8, color: '#7F8C82', fontSize: 18},
  bottomNav: {height: 62, backgroundColor: '#FFF', borderRadius: 15, marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.07, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 2}, navItem: {alignItems: 'center', minWidth: 48}, navIcon: {fontSize: 20, color: '#98A29A'}, aiNavIcon: {width: 19, height: 17, borderRadius: 7, borderWidth: 1.4, borderColor: '#98A29A', alignItems: 'center', justifyContent: 'center', marginTop: 1}, aiNavIconActive: {borderColor: '#3E8754', backgroundColor: '#F3F8F2'}, aiAntenna: {position: 'absolute', top: -5, width: 1, height: 4, backgroundColor: '#98A29A'}, aiEyes: {fontSize: 8, lineHeight: 9, color: '#98A29A', fontWeight: '800'}, aiEyesActive: {color: '#3E8754'}, navLabel: {fontSize: 9, color: '#98A29A', marginTop: 2}, navActive: {color: '#3E8754', fontWeight: '800'},
});
