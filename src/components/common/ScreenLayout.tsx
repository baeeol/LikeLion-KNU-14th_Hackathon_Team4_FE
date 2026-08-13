import React from 'react';
import {Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';

export function ScreenLayout({children, title, onBack}: {children: React.ReactNode; title?: string; onBack?: () => void}) {
  return <SafeAreaView style={styles.safeArea}><StatusBar barStyle="dark-content" backgroundColor="#F3F7F1" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{(title || onBack) && <View style={styles.header}><Pressable onPress={onBack} hitSlop={10} style={styles.backButton}><Text style={styles.back}>{onBack ? '‹' : ''}</Text></Pressable><Text style={styles.brand}>ROUBAL</Text><Text style={styles.headerTitle}>{title}</Text></View>}{children}</ScrollView></SafeAreaView>;
}

export function PrimaryButton({label, onPress}: {label: string; onPress: () => void}) {
  return <Pressable onPress={onPress} style={({pressed}) => [styles.button, pressed && styles.pressed]}><Text style={styles.buttonText}>{label}</Text><Text style={styles.arrow}>›</Text></Pressable>;
}

export function PageTitle({title, description}: {title: string; description: string}) {
  return <><Text style={styles.pageTitle}>{title}</Text><Text style={styles.description}>{description}</Text></>;
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F3F7F1'}, content: {padding: 24, paddingBottom: 34},
  header: {height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30}, backButton: {width: 30}, back: {fontSize: 35, color: '#50665A', lineHeight: 35}, brand: {color: '#2F665C', fontSize: 12, fontWeight: '800', letterSpacing: 1.2}, headerTitle: {width: 55, textAlign: 'right', color: '#8A9A8E', fontSize: 10, fontWeight: '700'},
  pageTitle: {color: '#22382F', fontSize: 27, lineHeight: 35, fontWeight: '800', letterSpacing: -0.7}, description: {color: '#84948A', fontSize: 12, lineHeight: 18, marginTop: 10},
  button: {height: 54, borderRadius: 15, backgroundColor: '#2F665C', marginTop: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, pressed: {opacity: .85}, buttonText: {color: '#FFF', fontSize: 14, fontWeight: '800'}, arrow: {color: '#FFF', fontSize: 23, position: 'absolute', right: 20, top: 11},
});
