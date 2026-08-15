import React, {useEffect, useState} from 'react';
import {Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {BrandLogo} from '../components/common/BrandLogo';
import {Navigate} from '../navigation/types';

type RoutineProduct = {
  category: string;
  name: string;
  tone: string;
  shape: 'bottle' | 'dropper' | 'jar' | 'tube';
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

const WEEKLY_ROUTINE = [
  {day: '월', routine: '장벽', tone: 'green'}, {day: '화', routine: '각질', tone: 'orange'},
  {day: '수', routine: '진정', tone: 'mint'}, {day: '목', routine: '수분', tone: 'green'},
  {day: '금', routine: '각질', tone: 'orange'}, {day: '토', routine: '진정', tone: 'mint'},
  {day: '일', routine: '휴식', tone: 'gray'},
];

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatToday(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}

export function HomeScreen({navigate}: {navigate: Navigate}) {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCF9" />
      <View style={styles.page}>
        <View style={styles.screen}>
          <HomeHeader />
          <RoutineSummary todayLabel={formatToday(today)} />
        </View>
        <View style={styles.fixedShortcutArea}><ShortcutSection navigate={navigate} /></View>
        <BottomNavigation navigate={navigate} />
      </View>
    </SafeAreaView>
  );
}

function HomeHeader() {
  return <><View style={styles.topRow}><View style={styles.logoWrap}><BrandLogo /></View><Text style={styles.notification}>♧</Text></View><View style={styles.welcomeRow}><View><Text style={styles.welcome}>안녕하세요, 준영님 🌿</Text><Text style={styles.welcomeSub}>오늘의 피부에 가장 좋은 선택을 해주세요.</Text></View></View></>;
}

function RoutineSummary({todayLabel}: {todayLabel: string}) {
  const [tab, setTab] = useState<'morning' | 'evening'>('morning');
  const routine = tab === 'morning' ? MORNING_ROUTINE : EVENING_ROUTINE;
  return <><View style={styles.routineCard}><View style={styles.routineHeader}><View style={styles.titleRow}><RoutineIcon /><Text style={styles.routineTitle}>내 루틴</Text><Text style={styles.routineDate}>{todayLabel}</Text></View><View style={styles.tabRow}><RoutineTab label="☼ 아침" active={tab === 'morning'} onPress={() => setTab('morning')} /><RoutineTab label="☾ 저녁" active={tab === 'evening'} onPress={() => setTab('evening')} /></View></View>{routine.map((product, index) => <RoutineItem key={`${product.name}-${index}`} index={index + 1} product={product} isLast={index === routine.length - 1} />)}<View style={styles.tipRow}><Text style={styles.tipIcon}>☀</Text><Text style={styles.tipText}>{tab === 'morning' ? '아침 루틴 TIP  ·  자외선 차단은 스킨케어의 마지막 단계예요.' : '저녁 루틴 TIP  ·  충분한 보습으로 하루를 편안하게 마무리해요.'}</Text></View></View><WeeklySchedule /></>;
}

function RoutineIcon() { return <View style={styles.routineIcon}><View style={styles.routineIconBottle}><View style={styles.routineIconCap} /></View></View>; }
function RoutineTab({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}><Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text></Pressable>; }

function RoutineItem({index, product, isLast}: {index: number; product: RoutineProduct; isLast: boolean}) {
  const shape = product.shape === 'jar' ? styles.jar : product.shape === 'tube' ? styles.tube : product.shape === 'dropper' ? styles.dropper : styles.bottle;
  return <View style={styles.routineItem}><View style={styles.orderColumn}><View style={styles.orderNumber}><Text style={styles.orderNumberText}>{index}</Text></View>{!isLast && <View style={styles.orderLine} />}</View><View style={styles.productShapeArea}><View style={[styles.productShape, shape, {backgroundColor: product.tone}]}>{product.shape === 'dropper' && <View style={styles.dropperCap} />}{product.shape === 'bottle' && <View style={styles.bottleCap} />}</View></View><View style={styles.itemTextWrap}><Text style={styles.itemCategory}>{product.category}</Text><Text style={styles.itemName}>{product.name}</Text></View><View style={styles.statusPill}><Text style={styles.statusText}>● 유지</Text></View><Text style={styles.itemArrow}>›</Text></View>;
}

function WeeklySchedule() {
  return <View style={styles.weeklyCard}><View style={styles.weeklyHeader}><View style={styles.weeklyTitleWrap}><Text style={styles.calendarIcon}>▣</Text><Text style={styles.weeklyTitle}>주간 스케줄</Text></View><Text style={styles.weeklyLink}>기능 위주 스케줄 보기 ›</Text></View><View style={styles.scheduleRow}>{WEEKLY_ROUTINE.map(item => <View key={item.day} style={styles.dayColumn}><Text style={styles.dayText}>{item.day}</Text><View style={[styles.scheduleTag, scheduleTone(item.tone)]}><Text style={styles.scheduleTagText}>{item.routine}</Text></View></View>)}</View><View style={styles.legendRow}><Legend color="#69A174" label="수분·장벽" /><Legend color="#F0D278" label="각질 관리" /><Legend color="#B9D8B1" label="진정" /><Legend color="#CDD1CD" label="휴식/회복" /></View></View>;
}

function scheduleTone(tone: string) { if (tone === 'green') return styles.greenTag; if (tone === 'orange') return styles.orangeTag; if (tone === 'mint') return styles.mintTag; return styles.grayTag; }
function Legend({color, label}: {color: string; label: string}) { return <View style={styles.legend}><View style={[styles.legendDot, {backgroundColor: color}]} /><Text style={styles.legendText}>{label}</Text></View>; }

function ShortcutSection({navigate}: {navigate: Navigate}) {
  return <View style={styles.shortcutRow}><ShortcutCard icon="⌕" title="제품 찾아보기" description={'내 피부에 맞는 제품을\n발견해 보세요'} variant="search" onPress={() => {}} /><ShortcutCard icon="◡" title="피부가 불편해졌어요" description={'AI와 상담하고 루틴을\n조정해 보세요'} variant="sos" onPress={() => navigate('routineConsult')} /></View>;
}

function ShortcutCard({icon, title, description, variant, onPress}: {icon: string; title: string; description: string; variant: 'search' | 'sos'; onPress: () => void}) { return <Pressable onPress={onPress} style={[styles.shortcut, variant === 'search' ? styles.searchShortcut : styles.sosShortcut]}><View style={styles.shortcutIcon}><Text style={styles.shortcutIconText}>{icon}</Text></View><View><Text style={styles.shortcutTitle}>{title}</Text><Text style={styles.shortcutText}>{description}</Text></View><Text style={styles.shortcutArrow}>›</Text></Pressable>; }

function BottomNavigation({navigate}: {navigate: Navigate}) { return <View style={styles.bottomNav}><NavItem icon="⌂" label="홈" active /><NavItem icon="⌕" label="AI 상담" onPress={() => navigate('routineConsult')} /><NavItem icon="♙" label="마이" /></View>; }
function NavItem({icon, label, active = false, onPress}: {icon: string; label: string; active?: boolean; onPress?: () => void}) { return <Pressable onPress={onPress} style={styles.navItem}><Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text><Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FBFCF9'}, page: {flex: 1}, screen: {flex: 1, paddingHorizontal: 12, paddingTop: 40, paddingBottom: 10}, topRow: {height: 42, marginHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, logoWrap: {}, notification: {fontSize: 22, color: '#43815B'}, welcomeRow: {height: 80, justifyContent: 'center', paddingLeft: 12}, welcome: {fontSize: 21, color: '#2D3830', fontWeight: '800', letterSpacing: -0.7}, welcomeSub: {fontSize: 11, color: '#929B93', marginTop: 5},
  routineCard: {backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 5, marginTop: 12, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2}, routineHeader: {paddingHorizontal: 13, paddingTop: 12, paddingBottom: 10}, titleRow: {flexDirection: 'row', alignItems: 'center'}, routineTitle: {fontSize: 18, color: '#303932', fontWeight: '900', letterSpacing: -0.8}, routineDate: {fontSize: 10, color: '#89938B', fontWeight: '600', marginLeft: 8, marginTop: 2}, routineIcon: {width: 18, height: 26, marginRight: 8, position: 'relative'}, routineIconBottle: {position: 'absolute', left: 4, bottom: 1, width: 10, height: 20, borderRadius: 3, backgroundColor: '#AEC5A9'}, routineIconCap: {position: 'absolute', top: -4, alignSelf: 'center', width: 6, height: 5, borderRadius: 2, backgroundColor: '#6F8C70'}, tabRow: {flexDirection: 'row', gap: 6, marginTop: 10}, tab: {height: 39, flex: 1, borderRadius: 13, borderWidth: 1, borderColor: '#E0E5DF', alignItems: 'center', justifyContent: 'center'}, activeTab: {borderColor: '#4D885E', backgroundColor: '#F7FCF6'}, tabLabel: {fontSize: 11, color: '#767F78'}, activeTabLabel: {color: '#437F55', fontWeight: '800'},
  routineItem: {height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderTopWidth: 1, borderTopColor: '#EFF1EE'}, orderColumn: {width: 27, height: 58, alignItems: 'center', paddingTop: 10}, orderNumber: {width: 23, height: 23, borderRadius: 12, backgroundColor: '#F3F6F1', alignItems: 'center', justifyContent: 'center'}, orderNumberText: {fontSize: 11, color: '#68736A', fontWeight: '800'}, orderLine: {width: 1, height: 17, borderLeftWidth: 1, borderStyle: 'dotted', borderColor: '#B7C1B7', marginTop: 3}, productShapeArea: {width: 50, alignItems: 'center'}, productShape: {}, bottle: {width: 15, height: 31, borderRadius: 4}, dropper: {width: 15, height: 28, borderRadius: 4, marginTop: 5}, jar: {width: 29, height: 23, borderRadius: 5, marginTop: 8}, tube: {width: 19, height: 29, borderRadius: 4, marginTop: 3}, bottleCap: {position: 'absolute', top: -5, alignSelf: 'center', width: 11, height: 6, borderRadius: 2, backgroundColor: '#ECF0E9'}, dropperCap: {position: 'absolute', top: -9, alignSelf: 'center', width: 9, height: 10, borderRadius: 4, backgroundColor: '#728070'}, itemTextWrap: {flex: 1}, itemCategory: {fontSize: 8, color: '#7D8780'}, itemName: {fontSize: 12, color: '#303A32', fontWeight: '800', marginTop: 4}, statusPill: {backgroundColor: '#F0F6EE', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6}, statusText: {fontSize: 9, color: '#438052', fontWeight: '800'}, itemArrow: {fontSize: 22, color: '#8E978F', marginLeft: 9}, tipRow: {height: 31, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16}, tipIcon: {fontSize: 17, color: '#EDA450', marginRight: 7}, tipText: {fontSize: 8, color: '#858D85'},
  weeklyCard: {backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginTop: 12, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2}, weeklyHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, weeklyTitleWrap: {flexDirection: 'row', alignItems: 'center'}, calendarIcon: {fontSize: 18, color: '#4E8B5D', marginRight: 8}, weeklyTitle: {fontSize: 13, color: '#364239', fontWeight: '800'}, weeklyLink: {fontSize: 8, color: '#7C877E'}, scheduleRow: {flexDirection: 'row', gap: 4, marginTop: 15}, dayColumn: {height: 51, flex: 1, borderRadius: 8, borderWidth: 1, borderColor: '#E5E9E4', alignItems: 'center', paddingTop: 6}, dayText: {fontSize: 10, color: '#59645B', fontWeight: '800'}, scheduleTag: {borderRadius: 7, paddingHorizontal: 4, paddingVertical: 4, marginTop: 6}, scheduleTagText: {fontSize: 8, fontWeight: '800'}, greenTag: {backgroundColor: '#E5F1E4'}, orangeTag: {backgroundColor: '#FFF4DE'}, mintTag: {backgroundColor: '#EEF6EA'}, grayTag: {backgroundColor: '#F1F2F1'}, legendRow: {flexDirection: 'row', gap: 10, marginTop: 10}, legend: {flexDirection: 'row', alignItems: 'center'}, legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 4}, legendText: {fontSize: 8, color: '#7A837B'},
  fixedShortcutArea: {paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, backgroundColor: '#FBFCF9'}, shortcutRow: {flexDirection: 'row', gap: 8}, shortcut: {flex: 1, minHeight: 68, borderRadius: 13, padding: 10, flexDirection: 'row', alignItems: 'center'}, searchShortcut: {backgroundColor: '#F0F5EE'}, sosShortcut: {backgroundColor: '#FFF3E8'}, shortcutIcon: {width: 27, height: 27, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 7}, shortcutIconText: {fontSize: 18, color: '#47765B'}, shortcutTitle: {fontSize: 11, fontWeight: '800', color: '#546259'}, shortcutText: {fontSize: 8, lineHeight: 11, color: '#8A958B', marginTop: 3}, shortcutArrow: {position: 'absolute', right: 8, color: '#7F8C82', fontSize: 18},
  bottomNav: {height: 62, backgroundColor: '#FFF', borderRadius: 15, marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.07, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 2}, navItem: {alignItems: 'center', minWidth: 48}, navIcon: {fontSize: 20, color: '#98A29A'}, navLabel: {fontSize: 9, color: '#98A29A', marginTop: 2}, navActive: {color: '#3E8754', fontWeight: '800'},
});
