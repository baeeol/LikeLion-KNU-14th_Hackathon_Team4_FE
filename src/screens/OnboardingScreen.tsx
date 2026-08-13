import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PrimaryButton, ScreenLayout} from '../components/common/ScreenLayout';
import {Navigate} from '../navigation/types';

export function OnboardingScreen({navigate}: {navigate: Navigate}) {
  return <ScreenLayout><View style={styles.hero}><Text style={styles.logo}>R</Text><Text style={styles.brand}>ROUBAL</Text><Text style={styles.kicker}>오늘의 피부 루틴</Text><Text style={styles.title}>내 제품으로{`\n`}가벼운 루틴을 만들어요.</Text><Text style={styles.description}>보유 제품을 한곳에 모으고,{`\n`}오늘 필요한 순서로 정리해 드려요.</Text></View><View style={styles.preview}><Text style={styles.previewTitle}>기본 루틴에 집중해요</Text><Text style={styles.previewText}>세정 · 수분 정돈 · 보습 · 자외선 차단</Text></View><PrimaryButton label="시작하기" onPress={() => navigate('productRegister')} /></ScreenLayout>;
}
const styles = StyleSheet.create({hero:{alignItems:'center',paddingTop:82},logo:{width:54,height:54,borderRadius:27,backgroundColor:'#D98763',color:'#FFF',textAlign:'center',paddingTop:14,fontSize:20,fontWeight:'800'},brand:{marginTop:12,color:'#2F665C',fontWeight:'800',fontSize:14,letterSpacing:1.5},kicker:{color:'#8A9A8E',fontSize:10,marginTop:3},title:{color:'#21372F',fontSize:29,lineHeight:38,fontWeight:'800',textAlign:'center',marginTop:55},description:{color:'#7E8F84',fontSize:13,lineHeight:20,textAlign:'center',marginTop:13},preview:{backgroundColor:'#E5F0E3',borderRadius:18,padding:19,marginTop:45},previewTitle:{fontSize:13,fontWeight:'800',color:'#456D5B'},previewText:{fontSize:11,color:'#708478',marginTop:8}});
