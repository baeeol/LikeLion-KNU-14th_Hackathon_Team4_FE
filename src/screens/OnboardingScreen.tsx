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
import {BrandLogo} from '../components/common/BrandLogo';

const skinTypes = ['건성', '지성', '수부지', '복합성', '잘 모르겠어요'];
const skinConcerns = ['건조', '트러블', '붉어짐', '피부결', '유분', '잡티'];

export function OnboardingScreen({navigate}: {navigate: Navigate}) {
  const [skinType, setSkinType] = useState('수부지');
  const [isSensitive, setIsSensitive] = useState(true);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(['트러블', '붉어짐']);

  const toggleConcern = (concern: string) => {
    setSelectedConcerns(current => {
      if (current.includes(concern)) {
        return current.filter(item => item !== concern);
      }

      return current.length < 2 ? [...current, concern] : current;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />

      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <BrandHeader />
        <OnboardingProgress />

        <Text style={styles.pageTitle}>피부 정보 입력</Text>
        <Text style={styles.pageDescription}>
          정확한 루틴 추천을 위해 정보를 알려주세요.
        </Text>

        <View style={styles.questionCard}>
          <QuestionTitle icon="◯" title="현재 피부 타입은 어떤가요?" />
          <View style={styles.chipRow}>
            {skinTypes.map(type => (
              <ChoiceChip
                key={type}
                label={type}
                selected={skinType === type}
                onPress={() => setSkinType(type)}
              />
            ))}
          </View>
        </View>

        <View style={styles.questionCard}>
          <QuestionTitle icon="◜" title="피부가 예민한 편인가요?" />
          <View style={styles.sensitivityRow}>
            <WideChoice
              label="예"
              selected={isSensitive}
              onPress={() => setIsSensitive(true)}
            />
            <WideChoice
              label="아니오"
              selected={!isSensitive}
              onPress={() => setIsSensitive(false)}
            />
          </View>
        </View>

        <View style={styles.questionCard}>
          <QuestionTitle icon="✦" title="주요 피부 고민" subtitle="(최대 2개 선택)" />
          <View style={styles.concernRow}>
            {skinConcerns.map(concern => (
              <ChoiceChip
                key={concern}
                label={concern}
                selected={selectedConcerns.includes(concern)}
                onPress={() => toggleConcern(concern)}
                compact
              />
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}><Text style={styles.infoIconText}>i</Text></View>
          <Text style={styles.infoText}>
            입력하신 정보는 나에게 딱 맞는 루틴 추천을 위해 활용돼요.{`\n`}
            언제든 ‘내 정보’에서 수정할 수 있어요.
          </Text>
        </View>

        <Pressable
          onPress={() => navigate('productRegister')}
          style={({pressed}) => [styles.nextButton, pressed && styles.buttonPressed]}>
          <Text style={styles.nextButtonText}>다음: 보유 제품 등록</Text>
          <Text style={styles.nextArrow}>›</Text>
        </Pressable>

        <Pressable style={styles.detailTestButton}>
          <Text style={styles.detailTestText}>상세 피부 테스트 해보기  ›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function BrandHeader() {
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brandCopy}>
        <BrandLogo />
        <Text style={styles.brandDescription}>내 화장품 루틴을 똑똑하게 관리해보세요</Text>
      </View>
      <SkinIllustration />
    </View>
  );
}

function OnboardingProgress() {
  const labels = ['피부 정보', '보유 제품', '루틴 목표', '완료'];

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressLine} />
      <View style={styles.progressRow}>
        {labels.map((label, index) => {
          const active = index === 0;

          return (
            <View key={label} style={styles.progressStep}>
              <View style={[styles.stepCircle, active && styles.activeStepCircle]}>
                <Text style={[styles.stepNumber, active && styles.activeStepNumber]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, active && styles.activeStepLabel]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function QuestionTitle({icon, title, subtitle}: {icon: string; title: string; subtitle?: string}) {
  return (
    <View style={styles.questionTitleRow}>
      <View style={styles.questionIcon}>
        <Text style={styles.questionIconText}>{icon}</Text>
      </View>
      <Text style={styles.questionTitle}>{title}</Text>
      {subtitle && <Text style={styles.questionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
  compact = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        compact && styles.compactChip,
        selected && styles.selectedChip,
      ]}>
      {selected && <Text style={styles.checkMark}>✓</Text>}
      <Text style={[styles.choiceLabel, selected && styles.selectedChoiceLabel]}>{label}</Text>
    </Pressable>
  );
}

function WideChoice({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.wideChoice, selected && styles.selectedWideChoice]}>
      {selected && <Text style={styles.wideCheckMark}>✓</Text>}
      <Text style={[styles.wideChoiceLabel, selected && styles.selectedWideChoiceLabel]}>{label}</Text>
    </Pressable>
  );
}

function SkinIllustration() {
  return (
    <View style={styles.illustration}>
      <Text style={styles.sparkle}>✦</Text>
      <View style={styles.plantLeft}><Text>❘</Text><Text>❘</Text><Text>❘</Text></View>
      <View style={styles.face}><View style={styles.hair} /><Text style={styles.faceText}>◡</Text></View>
      <View style={styles.bottleOne} /><View style={styles.bottleTwo} /><View style={styles.bottleThree} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'},
  screen: {paddingHorizontal: 24, paddingTop: 28, paddingBottom: 22},
  brandHeader: {height: 148, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  brandCopy: {alignSelf: 'flex-start'},
  brand: {fontSize: 26, letterSpacing: -1.6, color: '#2F6848', fontWeight: '900'},
  brandLeaf: {position: 'absolute', right: -17, top: -8, fontSize: 22, color: '#568A65'},
  brandDescription: {fontSize: 11, color: '#7F8C83', marginTop: 11},
  illustration: {width: 147, height: 102, position: 'relative'},
  sparkle: {position: 'absolute', top: 0, right: 5, color: '#EBCB8A', fontSize: 18},
  plantLeft: {position: 'absolute', left: 8, top: 25, color: '#A4B99D', fontSize: 21, transform: [{rotate: '-8deg'}]},
  face: {position: 'absolute', right: 36, top: 7, width: 59, height: 76, borderRadius: 31, backgroundColor: '#F8DDC9', justifyContent: 'center', alignItems: 'center'},
  faceText: {fontSize: 23, color: '#D28E78', marginTop: 11},
  hair: {position: 'absolute', top: -4, width: 61, height: 35, borderRadius: 30, backgroundColor: '#696151'},
  bottleOne: {position: 'absolute', bottom: 5, left: 41, width: 15, height: 37, borderRadius: 4, backgroundColor: '#B6C5A5'},
  bottleTwo: {position: 'absolute', bottom: 5, left: 59, width: 25, height: 21, borderRadius: 5, backgroundColor: '#E4E4D5'},
  bottleThree: {position: 'absolute', bottom: 5, right: 10, width: 18, height: 32, borderRadius: 4, backgroundColor: '#EBF0E2'},
  progressSection: {height: 68, justifyContent: 'flex-start'},
  progressLine: {position: 'absolute', top: 12, left: 43, right: 43, height: 1, backgroundColor: '#C8D3C9'},
  progressRow: {flexDirection: 'row', justifyContent: 'space-between'},
  progressStep: {width: 57, alignItems: 'center'},
  stepCircle: {width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD3CC', alignItems: 'center', justifyContent: 'center'},
  activeStepCircle: {backgroundColor: '#36754E', borderColor: '#36754E'},
  stepNumber: {fontSize: 11, color: '#8F9990', fontWeight: '700'},
  activeStepNumber: {color: '#FFF'},
  stepLabel: {fontSize: 9, color: '#818B82', marginTop: 8},
  activeStepLabel: {color: '#3E664B', fontWeight: '800'},
  pageTitle: {fontSize: 24, color: '#2C352E', fontWeight: '900', letterSpacing: -1.2, marginTop: 12},
  pageDescription: {fontSize: 11, color: '#818981', marginTop: 10, marginBottom: 19},
  questionCard: {backgroundColor: '#FFF', borderRadius: 17, padding: 13, marginTop: 10, shadowColor: '#758075', shadowOpacity: 0.09, shadowOffset: {width: 0, height: 3}, shadowRadius: 10, elevation: 2},
  questionTitleRow: {flexDirection: 'row', alignItems: 'center'},
  questionIcon: {width: 33, height: 33, borderRadius: 17, backgroundColor: '#EDF4E9', justifyContent: 'center', alignItems: 'center', marginRight: 9},
  questionIconText: {fontSize: 17, color: '#6A9A72'},
  questionTitle: {fontSize: 13, color: '#3D473F', fontWeight: '800'},
  questionSubtitle: {fontSize: 9, color: '#68736B', marginLeft: 4},
  chipRow: {flexDirection: 'row', gap: 7, marginTop: 15},
  choiceChip: {height: 38, minWidth: 58, paddingHorizontal: 11, borderRadius: 19, borderWidth: 1, borderColor: '#E0E4DF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'},
  compactChip: {flex: 1, minWidth: 0, paddingHorizontal: 4},
  selectedChip: {borderColor: '#4F8A62', backgroundColor: '#F5FBF4'},
  checkMark: {position: 'absolute', top: -8, right: -2, width: 16, height: 16, borderRadius: 8, overflow: 'hidden', color: '#FFF', backgroundColor: '#39784F', textAlign: 'center', fontSize: 11, fontWeight: '900', paddingTop: 1},
  choiceLabel: {fontSize: 11, color: '#657066'},
  selectedChoiceLabel: {color: '#3A7951', fontWeight: '800'},
  sensitivityRow: {flexDirection: 'row', gap: 9, marginTop: 15},
  wideChoice: {height: 39, flex: 1, borderRadius: 20, borderWidth: 1, borderColor: '#DEE4DE', justifyContent: 'center', alignItems: 'center'},
  selectedWideChoice: {borderColor: '#4F8A62', backgroundColor: '#F7FCF6'},
  wideCheckMark: {position: 'absolute', top: -8, right: 7, width: 16, height: 16, borderRadius: 8, overflow: 'hidden', color: '#FFF', backgroundColor: '#39784F', textAlign: 'center', fontSize: 11, fontWeight: '900', paddingTop: 1},
  wideChoiceLabel: {fontSize: 12, color: '#69736B'},
  selectedWideChoiceLabel: {color: '#39784F', fontWeight: '800'},
  concernRow: {flexDirection: 'row', gap: 7, marginTop: 15},
  infoBox: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7F2', padding: 11, borderRadius: 12, marginTop: 12},
  infoIcon: {width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#5C9670', alignItems: 'center', justifyContent: 'center', marginRight: 9},
  infoIconText: {fontSize: 12, fontWeight: '800', color: '#4F875F'},
  infoText: {fontSize: 9, lineHeight: 14, color: '#788078', flex: 1},
  nextButton: {height: 54, borderRadius: 12, backgroundColor: '#5D8966', marginTop: 14, alignItems: 'center', justifyContent: 'center'},
  buttonPressed: {opacity: 0.82},
  nextButtonText: {fontSize: 16, color: '#FFF', fontWeight: '800'},
  nextArrow: {position: 'absolute', right: 18, color: '#FFF', fontSize: 25, top: 10},
  detailTestButton: {alignItems: 'center', paddingVertical: 13},
  detailTestText: {fontSize: 12, color: '#4D7656', fontWeight: '800', textDecorationLine: 'underline'},
});
