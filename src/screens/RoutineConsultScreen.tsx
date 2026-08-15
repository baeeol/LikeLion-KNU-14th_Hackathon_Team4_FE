import React, {useState} from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Navigate} from '../navigation/types';
import {BrandLogo} from '../components/common/BrandLogo';

export function RoutineConsultScreen({navigate}: {navigate: Navigate}) {
  const [message, setMessage] = useState('');
  const [proposalAccepted, setProposalAccepted] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />
      <View style={styles.page}>
        <View style={styles.screen}>
          <Header />
          <ConsultHero onBack={() => navigate('home')} />
          <IntroMessage />
          <ScrollView
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}>
          <UserMessage text="요즘 피부가 따갑고 붉어졌어요." time="오전 9:41" />
          <BotMessage>
            <Text style={styles.messageText}>최근 루틴 변화와 현재 사용 제품을{`\n`}함께 확인해볼게요.</Text>
          </BotMessage>
          <RoutineCheckCard />
          <BotMessage time="오전 9:42">
            <Text style={styles.messageText}>최근 일주일 동안 AHA 토너 사용 빈도가 늘었고,{`\n`}레티놀 세럼과 같은 저녁에 사용된 날이{`\n`}확인됐어요.</Text>
          </BotMessage>
          <SuggestionCard />
          <BotMessage time="오전 9:43">
            <Text style={styles.messageText}>한 번에 여러 제품을 바꾸기보다{`\n`}한 가지씩 조정하는 것이 좋아요.</Text>
          </BotMessage>
          <ActionButtons accepted={proposalAccepted} onAccept={() => setProposalAccepted(true)} />
          <QuickQuestions />
          <NextCheckCard />
          </ScrollView>
        </View>

        <View style={styles.composer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="추가로 궁금한 점을 입력하세요"
            placeholderTextColor="#A3ABA4"
            style={styles.input}
          />
          <Pressable onPress={() => setMessage('')} style={styles.sendButton}>
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Header() {
  return <View style={styles.header}><BrandLogo /><Text style={styles.headerClover}>♧</Text></View>;
}

function ConsultHero({onBack}: {onBack: () => void}) {
  return <View style={styles.hero}><View><View style={styles.heroTitleRow}><TouchableOpacity accessibilityRole="button" accessibilityLabel="홈으로 돌아가기" activeOpacity={0.6} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}} onPress={onBack} style={styles.heroBackButton}><Text style={styles.heroBackIcon}>‹</Text></TouchableOpacity><Text style={styles.heroTitle}>AI 루틴 상담</Text></View><Text style={styles.heroDescription}>피부 고민을 알려주시면{`\n`}현재 루틴을 바탕으로 조정안을 제안해드려요.</Text></View><RobotIllustration /></View>;
}

function IntroMessage() {
  return <View style={styles.introMessage}><RobotAvatar /><Text style={styles.introText}>현재 루틴을 기준으로{`\n`}원인을 함께 찾아볼게요.  ✧</Text></View>;
}

function BotMessage({children, time}: {children: React.ReactNode; time?: string}) {
  return <View style={styles.botRow}><RobotAvatar small /><View style={styles.botBubble}>{children}</View>{time && <Text style={styles.time}>{time}</Text>}</View>;
}

function UserMessage({text, time}: {text: string; time: string}) {
  return <View style={styles.userRow}><View style={styles.userBubble}><Text style={styles.userText}>{text}</Text></View><Text style={styles.time}>{time}</Text><Text style={styles.readMark}>✓✓</Text></View>;
}

function RoutineCheckCard() {
  return <View style={styles.checkCard}><Text style={styles.checkTitle}>최근 달라진 점</Text><View style={styles.checkTags}><CheckTag label="세럼 추가"/><CheckTag label="사용 빈도 증가"/><CheckTag label="같은 날 함께 사용"/></View></View>;
}

function CheckTag({label}: {label: string}) {
  return <View style={styles.checkTag}><Text style={styles.checkTagIcon}>✓</Text><Text style={styles.checkTagText}>{label}</Text></View>;
}

function SuggestionCard() {
  return <View style={styles.suggestionCard}><View style={styles.suggestionTextWrap}><Text style={styles.suggestionKicker}>우선 조정해볼 항목</Text><Text style={styles.suggestionTitle}>AHA 토너를 7일 동안 쉬어보세요.</Text><SuggestionPoint text="나머지 기본 루틴은 유지"/><SuggestionPoint text="붉어짐과 따가움 변화 체크"/><SuggestionPoint text="레티놀은 주 2회만 유지"/><View style={styles.reason}><Text style={styles.reasonText}>추천 이유: 자극 가능성 높은 조합</Text></View></View><RestIllustration /></View>;
}

function SuggestionPoint({text}: {text: string}) {return <View style={styles.suggestionPoint}><Text style={styles.suggestionPointIcon}>●</Text><Text style={styles.suggestionPointText}>{text}</Text></View>;}

function ActionButtons({accepted, onAccept}: {accepted: boolean; onAccept: () => void}) {
  return <View style={styles.actionRow}><Pressable onPress={onAccept} style={[styles.primaryAction, accepted && styles.acceptedAction]}><Text style={styles.primaryActionText}>{accepted ? '✓ 제안 적용됨' : '◉ 제안 적용하기'}</Text></Pressable><Pressable style={styles.secondaryAction}><Text style={styles.secondaryActionText}>☷ 다른 조정안 보기</Text></Pressable><Pressable style={styles.keepAction}><Text style={styles.keepActionText}>그대로 유지</Text></Pressable></View>;
}

function QuickQuestions() {
  return <View style={styles.quickRow}><View style={styles.quickQuestion}><Text style={styles.quickIcon}>♧</Text><Text style={styles.quickText}>건조함도 있어요</Text></View><View style={styles.quickQuestion}><Text style={styles.quickIcon}>▯</Text><Text style={styles.quickText}>최근 바꾼 제품 보기</Text></View></View>;
}

function NextCheckCard() {
  return <View style={styles.nextCheck}><Text style={styles.calendarIcon}>▦</Text><View style={styles.nextCheckTextWrap}><Text style={styles.nextCheckTitle}>다음 체크 예정</Text><Text style={styles.nextCheckText}>3일 후 피부 상태를 다시 확인할게요.</Text></View><Text style={styles.nextArrow}>›</Text></View>;
}

function RobotAvatar({small = false}: {small?: boolean}) {return <View style={[styles.robotAvatar, small && styles.smallRobotAvatar]}><View style={styles.robotFace}><Text style={styles.robotEyes}>•  •</Text></View></View>;}

function RobotIllustration() {return <View style={styles.robotIllustration}><Text style={styles.robotSparkle}>✦</Text><View style={styles.robotBody}><View style={styles.robotHead}><View style={styles.robotAntenna}/><Text style={styles.robotEyesLarge}>•  •</Text></View></View><View style={styles.robotPlant}><Text>❘</Text><Text>❘</Text></View><View style={styles.robotJar}/><View style={styles.robotBottle}/></View>;}

function RestIllustration() {return <View style={styles.restIllustration}><View style={styles.daysCard}><Text style={styles.daysNumber}>7</Text><Text style={styles.daysLabel}>DAYS</Text></View><View style={styles.restBottleOne}/><View style={styles.restBottleTwo}/><Text style={styles.restLeaf}>❘</Text></View>;}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'}, page: {flex: 1}, screen: {flex: 1, paddingHorizontal: 24, paddingTop: 40}, chatScroll: {flex: 1, marginTop: 8}, chatContent: {paddingBottom: 18},
  header: {height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, headerClover: {fontSize: 22, color: '#43815B'}, hero: {height: 112, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, heroTitleRow: {flexDirection: 'row', alignItems: 'center'}, heroBackButton: {width: 28, height: 36, justifyContent: 'center', marginRight: 5}, heroBackIcon: {fontSize: 37, lineHeight: 32, color: '#374239'}, heroTitle: {fontSize: 28, letterSpacing: -1.4, color: '#303A32', fontWeight: '900'}, heroDescription: {fontSize: 11, lineHeight: 16, color: '#717C73', marginTop: 8},
  robotIllustration: {width: 134, height: 101, position: 'relative'}, robotSparkle: {position: 'absolute', top: 0, right: 9, fontSize: 16, color: '#E7C87B'}, robotBody: {position: 'absolute', right: 34, top: 27, width: 58, height: 57, borderRadius: 19, backgroundColor: '#EDF0E4', borderWidth: 1, borderColor: '#B3BEA9', alignItems: 'center'}, robotHead: {position: 'absolute', top: -13, width: 56, height: 38, borderRadius: 19, backgroundColor: '#E5ECDD', borderWidth: 1, borderColor: '#99AA93', alignItems: 'center', justifyContent: 'center'}, robotAntenna: {position: 'absolute', top: -13, width: 1, height: 12, backgroundColor: '#578561'}, robotEyesLarge: {fontSize: 16, color: '#447D55'}, robotPlant: {position: 'absolute', right: 0, bottom: 13, color: '#A4B89B', fontSize: 18}, robotJar: {position: 'absolute', left: 22, bottom: 4, width: 32, height: 20, borderRadius: 5, backgroundColor: '#D7DDCC'}, robotBottle: {position: 'absolute', left: 10, bottom: 4, width: 13, height: 36, borderRadius: 4, backgroundColor: '#B5C2A9'},
  introMessage: {minHeight: 49, borderRadius: 15, backgroundColor: '#FFF', shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 2}, shadowRadius: 7, elevation: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}, introText: {fontSize: 11, lineHeight: 15, color: '#3E4B42', fontWeight: '800', marginLeft: 9},
  robotAvatar: {width: 37, height: 30, borderRadius: 15, backgroundColor: '#E6EDE1', borderWidth: 1, borderColor: '#C2CEBC', alignItems: 'center', justifyContent: 'center'}, smallRobotAvatar: {width: 27, height: 23, borderRadius: 12, marginTop: 7}, robotFace: {width: 25, height: 15, borderRadius: 8, backgroundColor: '#557E5C', alignItems: 'center', justifyContent: 'center'}, robotEyes: {color: '#E5F2E6', fontSize: 8},
  userRow: {flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10}, userBubble: {backgroundColor: '#EFF4E9', borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 11}, userText: {fontSize: 11, color: '#4B574D'}, time: {fontSize: 7, color: '#9AA29B', marginLeft: 5, marginBottom: 3}, readMark: {fontSize: 8, color: '#6B9B74', marginLeft: 2, marginBottom: 3},
  botRow: {flexDirection: 'row', alignItems: 'flex-end', marginTop: 8}, botBubble: {maxWidth: '78%', backgroundColor: '#FFF', borderRadius: 14, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 7, shadowColor: '#758075', shadowOpacity: 0.05, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, messageText: {fontSize: 11, lineHeight: 16, color: '#4C574E'},
  checkCard: {backgroundColor: '#FFF', borderRadius: 11, padding: 10, marginLeft: 35, marginTop: 7, shadowColor: '#758075', shadowOpacity: 0.06, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, checkTitle: {fontSize: 11, color: '#4F5A51', fontWeight: '800'}, checkTags: {flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8}, checkTag: {backgroundColor: '#EFF6EC', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, flexDirection: 'row', alignItems: 'center'}, checkTagIcon: {fontSize: 8, color: '#4E8C5D', marginRight: 3}, checkTagText: {fontSize: 7, color: '#579063', fontWeight: '800'},
  suggestionCard: {minHeight: 145, borderRadius: 14, backgroundColor: '#F6F8F2', marginLeft: 35, marginTop: 9, padding: 13, flexDirection: 'row', shadowColor: '#758075', shadowOpacity: 0.06, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, suggestionTextWrap: {flex: 1, minWidth: 0, paddingRight: 4}, suggestionKicker: {fontSize: 9, color: '#5B8E62', fontWeight: '800'}, suggestionTitle: {fontSize: 16, lineHeight: 21, color: '#35523B', fontWeight: '900', marginTop: 3}, suggestionPoint: {flexDirection: 'row', alignItems: 'center', marginTop: 6}, suggestionPointIcon: {fontSize: 8, color: '#568E60', marginRight: 5}, suggestionPointText: {fontSize: 9, color: '#56705B', flexShrink: 1}, reason: {alignSelf: 'flex-start', borderRadius: 7, backgroundColor: '#EEF1E7', paddingHorizontal: 8, paddingVertical: 4, marginTop: 7}, reasonText: {fontSize: 7, color: '#688068'},
  restIllustration: {width: 77, height: 100, position: 'relative'}, daysCard: {position: 'absolute', right: 1, top: 17, width: 43, height: 56, borderRadius: 4, backgroundColor: '#FDFDF9', alignItems: 'center', justifyContent: 'center', transform: [{rotate: '4deg'}]}, daysNumber: {fontSize: 24, color: '#5C8B62', fontWeight: '900'}, daysLabel: {fontSize: 7, color: '#899789'}, restBottleOne: {position: 'absolute', left: 1, bottom: 2, width: 12, height: 30, borderRadius: 3, backgroundColor: '#B8C8AF'}, restBottleTwo: {position: 'absolute', left: 15, bottom: 2, width: 13, height: 40, borderRadius: 3, backgroundColor: '#DAE2D4'}, restLeaf: {position: 'absolute', right: -3, bottom: 0, fontSize: 28, color: '#9DB69B'},
  actionRow: {flexDirection: 'row', gap: 6, marginTop: 13}, primaryAction: {height: 37, flex: 1.15, minWidth: 0, borderRadius: 18, backgroundColor: '#4D875B', alignItems: 'center', justifyContent: 'center'}, acceptedAction: {backgroundColor: '#397C4E'}, primaryActionText: {fontSize: 9, color: '#FFF', fontWeight: '800'}, secondaryAction: {height: 37, flex: 1.22, minWidth: 0, borderRadius: 18, borderWidth: 1, borderColor: '#4D875B', alignItems: 'center', justifyContent: 'center'}, secondaryActionText: {fontSize: 8, color: '#487E56', fontWeight: '800'}, keepAction: {height: 37, flex: .85, minWidth: 0, borderRadius: 18, borderWidth: 1, borderColor: '#E2E6E1', alignItems: 'center', justifyContent: 'center'}, keepActionText: {fontSize: 8, color: '#626E64'},
  quickRow: {flexDirection: 'row', gap: 7, marginTop: 10}, quickQuestion: {height: 33, flex: 1, borderWidth: 1, borderColor: '#EEF0EC', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, quickIcon: {fontSize: 13, color: '#68936E', marginRight: 6}, quickText: {fontSize: 9, color: '#647065'},
  nextCheck: {height: 53, backgroundColor: '#FFF', borderRadius: 12, marginTop: 9, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.06, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, calendarIcon: {fontSize: 20, color: '#568B5F', marginRight: 10}, nextCheckTextWrap: {flex: 1}, nextCheckTitle: {fontSize: 10, color: '#5E765F', fontWeight: '800'}, nextCheckText: {fontSize: 9, color: '#7C877E', marginTop: 4}, nextArrow: {fontSize: 22, color: '#748076'},
  composer: {height: 56, paddingHorizontal: 26, paddingBottom: 8, flexDirection: 'row', gap: 8, backgroundColor: '#FFFDF9'}, input: {height: 36, flex: 1, borderRadius: 18, borderWidth: 1, borderColor: '#E9ECE8', paddingHorizontal: 13, fontSize: 9, color: '#526054'}, sendButton: {width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#4F8A5E', alignItems: 'center', justifyContent: 'center'}, sendIcon: {fontSize: 16, color: '#4F8A5E', transform: [{rotate: '-35deg'}]},
});
