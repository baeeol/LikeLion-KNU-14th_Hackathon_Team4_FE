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

type RoutineProduct = {
  category: string;
  name: string;
  tone: string;
  status: '유지' | '빈도 조절';
  shape: 'bottle' | 'dropper' | 'jar' | 'tube';
};

const morningRoutine: RoutineProduct[] = [
  {category: '클렌저', name: '약산성 젤 클렌저', tone: '#E8E9DE', status: '유지', shape: 'bottle'},
  {category: '토너', name: '나이아신아마이드 토너', tone: '#DCE8D6', status: '유지', shape: 'bottle'},
  {category: '세럼', name: '비타민 C 세럼', tone: '#B8D3AF', status: '빈도 조절', shape: 'dropper'},
  {category: '수분크림', name: '수분 장벽 크림', tone: '#D9DBC6', status: '유지', shape: 'jar'},
  {category: '선크림', name: '데일리 무기자차 선크림', tone: '#E9E4CC', status: '유지', shape: 'tube'},
];

const eveningRoutine = morningRoutine.slice(0, 4).map(product => ({
  ...product,
  name: product.category === '세럼' ? '진정 세럼' : product.name,
  status: '유지' as const,
}));

const weeklySchedule = [
  {day: '월', routine: '레티놀', tone: 'green'},
  {day: '화', routine: 'AHA', tone: 'orange'},
  {day: '수', routine: '진정', tone: 'mint'},
  {day: '목', routine: '레티놀', tone: 'green'},
  {day: '금', routine: 'AHA', tone: 'orange'},
  {day: '토', routine: '진정', tone: 'mint'},
  {day: '일', routine: '휴식', tone: 'gray'},
];

export function MyRoutineScreen({navigate}: {navigate: Navigate}) {
  const [tab, setTab] = useState<'morning' | 'evening' | 'weekly'>('morning');
  const routine = tab === 'evening' ? eveningRoutine : morningRoutine;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />

      <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.brandHeader}>
          <View>
            <Text style={styles.brand}>루틴밸런스</Text>
            <Text style={styles.brandLeaf}>◜</Text>
            <Text style={styles.pageTitle}>내 루틴</Text>
            <Text style={styles.pageDescription}>현재 기준으로 추천된 루틴이에요.</Text>
          </View>
          <SkinIllustration />
        </View>

        <View style={styles.tabRow}>
          <RoutineTab label="☼  아침" active={tab === 'morning'} onPress={() => setTab('morning')} />
          <RoutineTab label="☾  저녁" active={tab === 'evening'} onPress={() => setTab('evening')} />
          <RoutineTab label="▣  주간" active={tab === 'weekly'} onPress={() => setTab('weekly')} />
        </View>

        {tab === 'weekly' ? (
          <WeeklyCard />
        ) : (
          <>
            <View style={styles.routineCard}>
              {routine.map((product, index) => (
                <RoutineItem key={`${product.name}-${index}`} index={index + 1} product={product} />
              ))}
              <View style={styles.tipRow}>
                <Text style={styles.tipIcon}>☼</Text>
                <Text style={styles.tipText}>
                  {tab === 'morning'
                    ? '아침 루틴 TIP  ·  자외선 차단은 스킨케어의 마지막 단계예요.'
                    : '저녁 루틴 TIP  ·  충분한 보습으로 하루를 편안하게 마무리해요.'}
                </Text>
              </View>
            </View>
            <WeeklyCard />
          </>
        )}

      </ScrollView>
      <View style={styles.bottomNav}>
        <NavItem icon="⌂" label="홈" onPress={() => navigate('home')} />
        <NavItem icon="▣" label="내 루틴" active />
        <NavItem icon="⌕" label="제품 찾기" onPress={() => navigate('productExplore')} />
        <NavItem icon="♙" label="마이" />
      </View>
      </View>
    </SafeAreaView>
  );
}

function RoutineTab({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
  return <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}><Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text></Pressable>;
}

function RoutineItem({index, product}: {index: number; product: RoutineProduct}) {
  const isAdjustment = product.status === '빈도 조절';

  return (
    <View style={styles.routineItem}>
      <View style={styles.orderColumn}>
        <View style={styles.orderNumber}><Text style={styles.orderNumberText}>{index}</Text></View>
        {index < morningRoutine.length && <View style={styles.orderLine} />}
      </View>
      <ProductShape product={product} />
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemCategory}>{product.category}</Text>
        <Text style={styles.itemName}>{product.name}</Text>
      </View>
      <View style={[styles.statusPill, isAdjustment && styles.adjustmentPill]}>
        <Text style={[styles.statusText, isAdjustment && styles.adjustmentText]}>{isAdjustment ? '▥ 빈도 조절' : '● 유지'}</Text>
      </View>
      <Text style={styles.itemArrow}>›</Text>
    </View>
  );
}

function ProductShape({product}: {product: RoutineProduct}) {
  const shapeStyle = product.shape === 'jar' ? styles.jar : product.shape === 'tube' ? styles.tube : product.shape === 'dropper' ? styles.dropper : styles.bottle;

  return (
    <View style={styles.productShapeArea}>
      <View style={[styles.productShape, shapeStyle, {backgroundColor: product.tone}]}>
        {product.shape === 'dropper' && <View style={styles.dropperCap} />}
        {product.shape === 'bottle' && <View style={styles.bottleCap} />}
      </View>
    </View>
  );
}

function WeeklyCard() {
  return (
    <View style={styles.weeklyCard}>
      <View style={styles.weeklyHeader}>
        <View style={styles.weeklyTitleWrap}><Text style={styles.calendarIcon}>▦</Text><Text style={styles.weeklyTitle}>주간 스케줄</Text></View>
        <Text style={styles.weeklyLink}>성분 위주 스케줄 보기  ›</Text>
      </View>

      <View style={styles.scheduleRow}>
        {weeklySchedule.map(schedule => (
          <View key={schedule.day} style={styles.dayColumn}>
            <Text style={styles.dayText}>{schedule.day}</Text>
            <View style={[styles.routineTag, getScheduleStyle(schedule.tone)]}><Text style={[styles.routineTagText, getScheduleTextStyle(schedule.tone)]}>{schedule.routine}</Text></View>
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <Legend color="#69A174" label="레티놀" />
        <Legend color="#F0D278" label="AHA" />
        <Legend color="#B9D8B1" label="진정" />
        <Legend color="#CDD1CD" label="휴식/회복" />
      </View>

      <View style={styles.weeklyAdvice}>
        <View style={styles.adviceIcon}><Text style={styles.adviceIconText}>◜</Text></View>
        <Text style={styles.adviceText}>AHA 토너와 레티놀은 같은 날보다{`\n`}나누어 사용하는 것이 좋아요.</Text>
        <View style={styles.adviceBottles}><View style={styles.smallBottle}/><View style={styles.tallBottle}/><Text style={styles.adviceLeaf}>❘</Text></View>
      </View>
    </View>
  );
}

function Legend({color, label}: {color: string; label: string}) {
  return <View style={styles.legend}><View style={[styles.legendDot, {backgroundColor: color}]} /><Text style={styles.legendText}>{label}</Text></View>;
}

function NavItem({icon, label, active, onPress}: {icon: string; label: string; active?: boolean; onPress?: () => void}) {
  return <Pressable onPress={onPress} style={styles.navItem}><Text style={[styles.navIcon, active && styles.activeNav]}>{icon}</Text><Text style={[styles.navLabel, active && styles.activeNav]}>{label}</Text></Pressable>;
}

function getScheduleStyle(tone: string) {
  return tone === 'green' ? styles.greenTag : tone === 'orange' ? styles.orangeTag : tone === 'mint' ? styles.mintTag : styles.grayTag;
}

function getScheduleTextStyle(tone: string) {
  return tone === 'green' ? styles.greenTagText : tone === 'orange' ? styles.orangeTagText : tone === 'mint' ? styles.mintTagText : styles.grayTagText;
}

function SkinIllustration() {
  return <View style={styles.illustration}><Text style={styles.sparkle}>✦</Text><View style={styles.plant}><Text>❘</Text><Text>❘</Text><Text>❘</Text></View><View style={styles.face}><View style={styles.hair}/><Text style={styles.faceText}>◡</Text></View><View style={styles.illustrationBottle}/><View style={styles.illustrationJar}/></View>;
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'},
  page: {flex: 1},
  screen: {paddingHorizontal: 30, paddingTop: 29, paddingBottom: 18},
  brandHeader: {height: 147, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  brand: {fontSize: 24, color: '#2F6848', fontWeight: '900', letterSpacing: -1.5},
  brandLeaf: {position: 'absolute', right: -17, top: -8, fontSize: 20, color: '#568A65'},
  pageTitle: {fontSize: 25, color: '#303932', fontWeight: '900', marginTop: 28, letterSpacing: -1.1},
  pageDescription: {fontSize: 11, color: '#7C867E', marginTop: 8},
  illustration: {width: 148, height: 105, position: 'relative'},
  sparkle: {position: 'absolute', right: 8, top: 0, color: '#E6C67F', fontSize: 18},
  plant: {position: 'absolute', left: 8, top: 28, color: '#A9C19F', fontSize: 20, transform: [{rotate: '-8deg'}]},
  face: {position: 'absolute', right: 32, top: 7, width: 63, height: 78, borderRadius: 34, backgroundColor: '#F8DDC9', justifyContent: 'center', alignItems: 'center'},
  faceText: {fontSize: 22, color: '#D18B75', marginTop: 10},
  hair: {position: 'absolute', top: -4, width: 65, height: 36, borderRadius: 32, backgroundColor: '#696151'},
  illustrationBottle: {position: 'absolute', left: 49, bottom: 7, width: 15, height: 37, borderRadius: 4, backgroundColor: '#A8B99D'},
  illustrationJar: {position: 'absolute', left: 67, bottom: 7, width: 26, height: 21, borderRadius: 5, backgroundColor: '#E2E2D4'},
  tabRow: {flexDirection: 'row', gap: 6, marginBottom: 14},
  tab: {height: 39, flex: 1, borderRadius: 13, borderWidth: 1, borderColor: '#E0E5DF', alignItems: 'center', justifyContent: 'center'},
  activeTab: {borderColor: '#4D885E', backgroundColor: '#F7FCF6'},
  tabLabel: {fontSize: 11, color: '#767F78'},
  activeTabLabel: {color: '#437F55', fontWeight: '800'},
  routineCard: {backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 5, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2},
  routineItem: {height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: '#EFF1EE'},
  orderColumn: {width: 27, height: 58, alignItems: 'center', paddingTop: 10},
  orderNumber: {width: 23, height: 23, borderRadius: 12, backgroundColor: '#F3F6F1', alignItems: 'center', justifyContent: 'center'},
  orderNumberText: {fontSize: 11, color: '#68736A', fontWeight: '800'},
  orderLine: {width: 1, height: 17, borderLeftWidth: 1, borderStyle: 'dotted', borderColor: '#B7C1B7', marginTop: 3},
  productShapeArea: {width: 50, alignItems: 'center'},
  productShape: {},
  bottle: {width: 15, height: 31, borderRadius: 4},
  dropper: {width: 15, height: 28, borderRadius: 4, marginTop: 5},
  jar: {width: 29, height: 23, borderRadius: 5, marginTop: 8},
  tube: {width: 19, height: 29, borderRadius: 4, marginTop: 3},
  bottleCap: {position: 'absolute', top: -5, alignSelf: 'center', width: 11, height: 6, borderRadius: 2, backgroundColor: '#ECF0E9'},
  dropperCap: {position: 'absolute', top: -9, alignSelf: 'center', width: 9, height: 10, borderRadius: 4, backgroundColor: '#728070'},
  itemTextWrap: {flex: 1},
  itemCategory: {fontSize: 8, color: '#7D8780'},
  itemName: {fontSize: 12, color: '#303A32', fontWeight: '800', marginTop: 4},
  statusPill: {backgroundColor: '#F0F6EE', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6},
  adjustmentPill: {backgroundColor: '#FFF5E8'},
  statusText: {fontSize: 9, color: '#438052', fontWeight: '800'},
  adjustmentText: {color: '#B7803B'},
  itemArrow: {fontSize: 22, color: '#8E978F', marginLeft: 9},
  tipRow: {height: 31, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16},
  tipIcon: {fontSize: 17, color: '#EDA450', marginRight: 7},
  tipText: {fontSize: 8, color: '#858D85'},
  weeklyCard: {backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginTop: 12, shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 3}, shadowRadius: 9, elevation: 2},
  weeklyHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  weeklyTitleWrap: {flexDirection: 'row', alignItems: 'center'},
  calendarIcon: {fontSize: 18, color: '#4E8B5D', marginRight: 8},
  weeklyTitle: {fontSize: 13, color: '#364239', fontWeight: '800'},
  weeklyLink: {fontSize: 8, color: '#7C877E'},
  scheduleRow: {flexDirection: 'row', gap: 4, marginTop: 15},
  dayColumn: {height: 51, flex: 1, borderRadius: 8, borderWidth: 1, borderColor: '#E5E9E4', alignItems: 'center', paddingTop: 6},
  dayText: {fontSize: 10, color: '#59645B', fontWeight: '800'},
  routineTag: {borderRadius: 7, paddingHorizontal: 4, paddingVertical: 4, marginTop: 6},
  routineTagText: {fontSize: 8, fontWeight: '800'},
  greenTag: {backgroundColor: '#E5F1E4'},
  orangeTag: {backgroundColor: '#FFF4DE'},
  mintTag: {backgroundColor: '#EEF6EA'},
  grayTag: {backgroundColor: '#F1F2F1'},
  greenTagText: {color: '#4C8757'},
  orangeTagText: {color: '#B9822E'},
  mintTagText: {color: '#619063'},
  grayTagText: {color: '#858A86'},
  legendRow: {flexDirection: 'row', gap: 10, marginTop: 10},
  legend: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 4},
  legendText: {fontSize: 8, color: '#7A837B'},
  weeklyAdvice: {height: 64, marginTop: 14, borderRadius: 12, backgroundColor: '#F2F5EE', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12},
  adviceIcon: {width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#86AD8A', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  adviceIconText: {fontSize: 16, color: '#5F9468'},
  adviceText: {flex: 1, fontSize: 11, lineHeight: 16, color: '#45684E', fontWeight: '800'},
  adviceBottles: {width: 50, height: 44, position: 'relative'},
  smallBottle: {position: 'absolute', left: 1, bottom: 2, width: 10, height: 23, borderRadius: 3, backgroundColor: '#B2C3A9'},
  tallBottle: {position: 'absolute', left: 15, bottom: 2, width: 14, height: 34, borderRadius: 4, backgroundColor: '#DCE5D7'},
  adviceLeaf: {position: 'absolute', right: 1, bottom: 2, color: '#8CB18C', fontSize: 25},
  bottomNav: {height: 62, borderRadius: 15, backgroundColor: '#FFF', marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.07, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 2},
  navItem: {alignItems: 'center', minWidth: 48},
  navIcon: {fontSize: 20, color: '#98A29A'},
  navLabel: {fontSize: 9, color: '#98A29A', marginTop: 2},
  activeNav: {color: '#3E8754', fontWeight: '800'},
});
