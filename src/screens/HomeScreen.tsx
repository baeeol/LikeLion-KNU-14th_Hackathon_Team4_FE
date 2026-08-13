import React from 'react';
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
  name: string;
  detail: string;
  tone: string;
};

type RoutineStatus = {
  icon: string;
  label: string;
  value: string;
  color: string;
  isWarning?: boolean;
};

const MORNING_PRODUCTS: Product[] = [
  {name: '클렌저', detail: '약산성 폼', tone: '#E6E6D9'},
  {name: '토너', detail: '수분 토너', tone: '#DCECD5'},
  {name: '세럼', detail: '진정 세럼', tone: '#B9DFC4'},
  {name: '선크림', detail: 'SPF 50+', tone: '#F7E4C5'},
  {name: '크림', detail: '수분 크림', tone: '#C8DCCD'},
];

const NIGHT_PRODUCTS = MORNING_PRODUCTS.filter(
  product => product.name !== '선크림',
);

const ROUTINE_STATUSES: RoutineStatus[] = [
  {icon: '◈', label: '보습', value: '양호', color: '#DAEEE0'},
  {icon: '⬡', label: '장벽', value: '양호', color: '#E5EEE2'},
  {icon: '◜', label: '진정', value: '보통', color: '#E2F1E1'},
  {icon: '◌', label: '각질', value: '부족', color: '#F6E5E0', isWarning: true},
];

export function HomeScreen({navigate}: {navigate: Navigate}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCF9" />

      <ScrollView
        contentContainerStyle={styles.screen}
        showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <RoutineConditionCard />
        <TodayRoutineCard onPressRoutine={() => navigate('myRoutine')} />

        <View style={styles.bottomArea}>
          <ShortcutSection navigate={navigate} />
          <BottomNavigation navigate={navigate} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeHeader() {
  return (
    <>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brand}>루틴밸런스</Text>
          <Text style={styles.brandLeaf}>◜</Text>
        </View>
        <Text style={styles.notification}>♧</Text>
      </View>

      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.welcome}>안녕하세요, 준영님 🌿</Text>
          <Text style={styles.welcomeSub}>
            오늘도 피부에 가장 좋은 선택을 해주세요.
          </Text>
        </View>
        <SkinIllustration />
      </View>
    </>
  );
}

function RoutineConditionCard() {
  return (
    <View style={styles.conditionCard}>
      <CardHeader title="현재 루틴 상태" actionLabel="자세히 보기  ›" />

      <View style={styles.scoreRow}>
        <View style={styles.scoreCircle}>
          <Text style={styles.score}>78</Text>
          <Text style={styles.scoreUnit}>점</Text>
        </View>
        <Text style={styles.outOf}>/ 100</Text>

        <View style={styles.scoreTextWrap}>
          <Text style={styles.scoreTitle}>조금만 조정하면 더 좋아져요 🌿</Text>
          <Text style={styles.scoreText}>
            보습과 장벽 케어는 잘하고 있어요.{`\n`}
            각질 관리와 진정 케어를 보완해 보세요.
          </Text>
        </View>
      </View>

      <View style={styles.functionGrid}>
        {ROUTINE_STATUSES.map(status => (
          <FunctionCard key={status.label} {...status} />
        ))}
      </View>
    </View>
  );
}

function TodayRoutineCard({onPressRoutine}: {onPressRoutine: () => void}) {
  return (
    <View style={styles.routineCard}>
      <View style={styles.cardHeading}>
        <View style={styles.routineHeading}>
          <Text style={styles.routineHeadingText}>오늘의 루틴</Text>
          <Text style={styles.leaf}>◜</Text>
        </View>

        <Pressable onPress={onPressRoutine} style={styles.checkButton}>
          <Text style={styles.checkText}>오늘은 어디가 시원할까? ›</Text>
        </Pressable>
      </View>

      <RoutineLine icon="☀" time="AM" products={MORNING_PRODUCTS} />
      <RoutineLine icon="☾" time="PM" products={NIGHT_PRODUCTS} isNight />
    </View>
  );
}

function ShortcutSection({navigate}: {navigate: Navigate}) {
  return (
    <View style={styles.shortcutRow}>
      <ShortcutCard
        icon="⌕"
        title="제품 찾아보기"
        description={'내 피부에 맞는 제품을\n발견해 보세요'}
        variant="search"
        onPress={() => navigate('productExplore')}
      />
      <ShortcutCard
        icon="◡"
        title="피부가 불편해졌어요"
        description={'AI와 상담하고 루틴을\n조정해 보세요'}
        variant="sos"
        onPress={() => navigate('myRoutine')}
      />
    </View>
  );
}

function BottomNavigation({navigate}: {navigate: Navigate}) {
  return (
    <View style={styles.bottomNav}>
      <NavItem icon="⌂" label="홈" active />
      <NavItem icon="▣" label="내 루틴" onPress={() => navigate('myRoutine')} />
      <NavItem icon="⌕" label="제품 찾기" onPress={() => navigate('productExplore')} />
      <NavItem icon="♙" label="마이" />
    </View>
  );
}

function CardHeader({title, actionLabel}: {title: string; actionLabel: string}) {
  return (
    <View style={styles.cardHeading}>
      <Text style={styles.cardHeadingText}>{title}</Text>
      <Pressable>
        <Text style={styles.detailLink}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function FunctionCard({icon, label, value, color, isWarning}: RoutineStatus) {
  return (
    <View style={styles.functionCard}>
      <View style={[styles.functionIcon, {backgroundColor: color}]}>
        <Text style={styles.functionIconText}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.functionLabel}>{label}</Text>
        <Text style={[styles.functionValue, isWarning && styles.functionValueWarn]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function RoutineLine({
  icon,
  time,
  products,
  isNight = false,
}: {
  icon: string;
  time: string;
  products: Product[];
  isNight?: boolean;
}) {
  return (
    <View style={styles.routineLine}>
      <View style={[styles.timeBox, isNight && styles.nightBox]}>
        <Text style={[styles.timeIcon, isNight && styles.nightIcon]}>{icon}</Text>
        <Text style={[styles.timeText, isNight && styles.nightText]}>{time}</Text>
      </View>

      <View style={styles.products}>
        {products.map((product, index) => (
          <React.Fragment key={product.name}>
            <RoutineProduct product={product} />
            {index < products.length - 1 && <Text style={styles.nextArrow}>→</Text>}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function RoutineProduct({product}: {product: Product}) {
  return (
    <View style={styles.product}>
      <View style={[styles.productBottle, {backgroundColor: product.tone}]}>
        <View style={styles.productCap} />
      </View>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productDetail}>{product.detail}</Text>
      <View style={styles.productTag}>
        <Text style={styles.productTagText}>◜ 수분 공급</Text>
      </View>
    </View>
  );
}

function ShortcutCard({
  icon,
  title,
  description,
  variant,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  variant: 'search' | 'sos';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.shortcut, variant === 'search' ? styles.searchShortcut : styles.sosShortcut]}>
      <View style={styles.shortcutIcon}>
        <Text style={styles.shortcutIconText}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.shortcutTitle}>{title}</Text>
        <Text style={styles.shortcutText}>{description}</Text>
      </View>
      <Text style={styles.shortcutArrow}>›</Text>
    </Pressable>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.navItem}>
      <Text style={[styles.navIcon, active && styles.navActive]}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navActive]}>{label}</Text>
    </Pressable>
  );
}

function SkinIllustration() {
  return (
    <View style={styles.illustration}>
      <Text style={styles.sparkle}>✦</Text>
      <View style={styles.plantLeft}>
        <Text>❘</Text><Text>❘</Text><Text>❘</Text>
      </View>
      <View style={styles.face}>
        <View style={styles.hair} />
        <Text style={styles.faceText}>◡</Text>
      </View>
      <View style={styles.bottleOne} />
      <View style={styles.bottleTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FBFCF9'},
  screen: {flexGrow: 1, paddingHorizontal: 12, paddingTop: 40, paddingBottom: 12},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  brand: {color: '#2D714A', fontSize: 17, fontWeight: '900', letterSpacing: -0.8},
  brandLeaf: {position: 'absolute', right: -12, top: -4, color: '#75A77B', fontSize: 16},
  notification: {fontSize: 22, color: '#43815B'},
  welcomeRow: {height: 102, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  welcome: {fontSize: 18, color: '#2D3830', fontWeight: '800', letterSpacing: -0.5},
  welcomeSub: {fontSize: 11, color: '#929B93', marginTop: 7},
  illustration: {width: 126, height: 82, position: 'relative'},
  sparkle: {position: 'absolute', right: 9, top: 2, color: '#F5BB61', fontSize: 17},
  plantLeft: {position: 'absolute', left: 7, top: 21, color: '#A9C3A7', fontSize: 19, transform: [{rotate: '-10deg'}]},
  face: {position: 'absolute', right: 28, top: 8, width: 49, height: 62, borderRadius: 27, backgroundColor: '#F9DBC6', alignItems: 'center', justifyContent: 'center'},
  faceText: {fontSize: 19, color: '#D78975', marginTop: 10},
  hair: {position: 'absolute', top: -2, width: 50, height: 30, borderRadius: 28, backgroundColor: '#665D4D'},
  bottleOne: {position: 'absolute', bottom: 1, left: 42, width: 13, height: 31, borderRadius: 3, backgroundColor: '#B6C5A5'},
  bottleTwo: {position: 'absolute', bottom: 1, left: 57, width: 22, height: 19, borderRadius: 4, backgroundColor: '#E8E8DD'},
  conditionCard: {backgroundColor: '#FFF', borderRadius: 17, padding: 18, marginTop: 11, shadowColor: '#879385', shadowOpacity: 0.09, shadowOffset: {width: 0, height: 3}, shadowRadius: 10, elevation: 2},
  cardHeading: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  cardHeadingText: {fontSize: 14, fontWeight: '800', color: '#3E4A41'},
  detailLink: {fontSize: 10, color: '#78847C'},
  scoreRow: {flexDirection: 'row', alignItems: 'center', marginTop: 15},
  scoreCircle: {width: 83, height: 83, borderRadius: 42, borderWidth: 7, borderColor: '#377347', borderLeftColor: '#DCEADE', alignItems: 'center', justifyContent: 'center'},
  score: {fontSize: 28, color: '#2E6C42', fontWeight: '800'},
  scoreUnit: {fontSize: 11, color: '#65816B', marginTop: -4},
  outOf: {fontSize: 12, color: '#8D9790', marginLeft: 10},
  scoreTextWrap: {flex: 1, marginLeft: 18},
  scoreTitle: {fontSize: 13, color: '#3D8A55', fontWeight: '800'},
  scoreText: {fontSize: 11, lineHeight: 16, color: '#68746B', marginTop: 7},
  functionGrid: {flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EDF0EC', marginTop: 16, paddingTop: 14},
  functionCard: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, borderRightWidth: 1, borderRightColor: '#EEF1ED', paddingLeft: 5},
  functionIcon: {width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center'},
  functionIconText: {fontSize: 12, color: '#5B8764'},
  functionLabel: {fontSize: 9, color: '#758177'},
  functionValue: {fontSize: 9, color: '#498159', fontWeight: '800', marginTop: 2},
  functionValueWarn: {color: '#D98474'},
  routineCard: {backgroundColor: '#FFF', borderRadius: 17, padding: 17, marginTop: 17, shadowColor: '#879385', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 2}, shadowRadius: 8, elevation: 1},
  routineHeading: {flexDirection: 'row', alignItems: 'center', gap: 3},
  routineHeadingText: {fontSize: 14, fontWeight: '800', color: '#3E4A41'},
  leaf: {fontSize: 14, color: '#66A472'},
  checkButton: {backgroundColor: '#F2F7F0', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6},
  checkText: {fontSize: 9, color: '#69906F'},
  routineLine: {flexDirection: 'row', alignItems: 'flex-start', marginTop: 16},
  timeBox: {width: 38, height: 48, borderRadius: 8, backgroundColor: '#FFF6DD', alignItems: 'center', justifyContent: 'center', marginRight: 7},
  nightBox: {backgroundColor: '#EFF2FF'},
  timeIcon: {fontSize: 16, color: '#F5B638'},
  nightIcon: {color: '#7589DB'},
  timeText: {fontSize: 11, fontWeight: '800', color: '#5A6155', marginTop: 3},
  nightText: {color: '#6375B9'},
  products: {flex: 1, flexDirection: 'row', justifyContent: 'space-between'},
  product: {width: 41, alignItems: 'center'},
  productBottle: {width: 20, height: 37, borderRadius: 5},
  productCap: {position: 'absolute', top: -5, alignSelf: 'center', width: 10, height: 6, borderRadius: 2, backgroundColor: '#718274'},
  productName: {fontSize: 9, color: '#4B564C', fontWeight: '800', marginTop: 5},
  productDetail: {fontSize: 8, color: '#8D9790', marginTop: 2},
  productTag: {marginTop: 5, backgroundColor: '#F3F6F1', borderRadius: 7, paddingHorizontal: 4, paddingVertical: 3, minWidth: 43},
  productTagText: {fontSize: 7, textAlign: 'center', color: '#75937A'},
  nextArrow: {alignSelf: 'center', marginTop: 13, color: '#A4ADA5', fontSize: 16},
  bottomArea: {marginTop: 'auto', paddingTop: 18},
  shortcutRow: {flexDirection: 'row', gap: 8},
  shortcut: {flex: 1, minHeight: 68, borderRadius: 13, padding: 10, flexDirection: 'row', alignItems: 'center'},
  searchShortcut: {backgroundColor: '#F0F5EE'},
  sosShortcut: {backgroundColor: '#FFF3E8'},
  shortcutIcon: {width: 27, height: 27, borderRadius: 14, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 7},
  shortcutIconText: {fontSize: 18, color: '#47765B'},
  shortcutTitle: {fontSize: 11, fontWeight: '800', color: '#546259'},
  shortcutText: {fontSize: 8, lineHeight: 11, color: '#8A958B', marginTop: 3},
  shortcutArrow: {position: 'absolute', right: 8, color: '#7F8C82', fontSize: 18},
  bottomNav: {height: 62, backgroundColor: '#FFF', borderRadius: 15, marginTop: 8, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'},
  navItem: {alignItems: 'center', minWidth: 48},
  navIcon: {fontSize: 20, color: '#98A29A'},
  navLabel: {fontSize: 9, color: '#98A29A', marginTop: 2},
  navActive: {color: '#3E8754', fontWeight: '800'},
});
