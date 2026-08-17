import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {AppScreen, Navigate} from '../../navigation/types';

type NavigationItem = {
  screen: AppScreen;
  icon: string;
  label: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {screen: 'home', icon: '⌂', label: '홈'},
  {screen: 'routineConsult', icon: 'ai', label: 'AI 상담'},
  {screen: 'productExplore', icon: '⌕', label: '제품 찾기'},
  {screen: 'myPage', icon: '♙', label: '마이페이지'},
];

export function BottomNavigation({activeScreen, navigate}: {activeScreen: AppScreen; navigate: Navigate}) {
  return (
    <View style={styles.container}>
      {NAVIGATION_ITEMS.map(item => (
        <NavigationButton
          key={item.screen}
          item={item}
          active={item.screen === activeScreen}
          onPress={() => navigate(item.screen)}
        />
      ))}
    </View>
  );
}

function NavigationButton({item, active, onPress}: {item: NavigationItem; active: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      {item.icon === 'ai' ? <AiIcon active={active} /> : <Text style={[styles.icon, active && styles.activeText]}>{item.icon}</Text>}
      <Text style={[styles.label, active && styles.activeText]}>{item.label}</Text>
    </Pressable>
  );
}

function AiIcon({active}: {active: boolean}) {
  return (
    <View style={[styles.aiIcon, active && styles.activeAiIcon]}>
      <View style={[styles.antenna, active && styles.activeAntenna]} />
      <Text style={[styles.eyes, active && styles.activeText]}>• •</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 62,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#758075',
    shadowOpacity: 0.07,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
    elevation: 2,
  },
  item: {alignItems: 'center', minWidth: 48},
  icon: {fontSize: 20, color: '#98A29A'},
  label: {fontSize: 9, color: '#98A29A', marginTop: 2},
  activeText: {color: '#3E8754', fontWeight: '800'},
  aiIcon: {
    width: 19,
    height: 17,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: '#98A29A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  activeAiIcon: {borderColor: '#3E8754', backgroundColor: '#F3F8F2'},
  antenna: {position: 'absolute', top: -5, width: 1, height: 4, backgroundColor: '#98A29A'},
  activeAntenna: {backgroundColor: '#3E8754'},
  eyes: {fontSize: 8, lineHeight: 9, color: '#98A29A', fontWeight: '800'},
});
