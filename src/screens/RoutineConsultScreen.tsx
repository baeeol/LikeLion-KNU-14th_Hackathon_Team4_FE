import React, {useEffect, useRef, useState} from 'react';
import {
  Pressable,
  ActivityIndicator,
  Image,
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
import {CareProduct, searchCareProducts} from '../api/careProduct';

type ChatMessage = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
};

type TroubleSolution = {
  canUseOwnedProducts: boolean;
  title: string;
  description: string;
  steps: string[];
};

type ProductConsultationResult = {
  product: CareProduct;
  isSuitable: boolean;
  reason: string;
};

const FALLBACK_RECOMMENDED_PRODUCT: CareProduct = {
  id: 0,
  category: '세럼',
  brand: 'ROUBAL 추천',
  name: '저자극 피지·트러블 케어 세럼',
  price: 24000,
  functions: ['트러블·피지', '진정'],
};

function createTroubleSolution(text: string): TroubleSolution {
  const canUseOwnedProducts = /붉|건조|따갑|자극|민감/.test(text);

  if (canUseOwnedProducts) {
    return {
      canUseOwnedProducts: true,
      title: '보유 제품으로 조정할 수 있어요',
      description: '진정·보습 중심으로 3일간 피부 반응을 확인해보세요.',
      steps: ['각질 케어 제품은 잠시 쉬기', '어성초 토너와 세라마이드 세럼 유지', '저녁에는 수분 크림을 충분히 바르기'],
    };
  }

  return {
    canUseOwnedProducts: false,
    title: '추가 제품으로 보완이 필요해요',
    description: '현재 보유 제품만으로는 피지·트러블 케어 기능이 부족해요.',
    steps: ['필요 기능: 피지·모공 케어', '성분 조건: 저농도 BHA(살리실산) 또는 티트리', '선택 기준: 민감 피부용, 주 1~2회부터 사용'],
  };
}

function createBotReply(text: string) {
  if (text.includes('건조')) {
    return '건조함도 함께 느껴진다면, 자극 성분을 쉬는 동안 보습 크림은 평소보다 충분히 발라주세요.';
  }

  if (text.includes('붉') || text.includes('따갑')) {
    return '붉어짐과 따가움이 지속되면 새로운 제품 추가는 잠시 멈추고, 기본 보습 루틴 위주로 관찰해보는 것을 권해요.';
  }

  return '말씀해주신 내용을 루틴 기록에 반영했어요. 오늘은 피부 자극이 느껴지는지 가볍게 확인해볼까요?';
}

function getRecommendationKeyword(trouble: string) {
  if (/피지|모공|좁쌀/.test(trouble)) return '피지 트러블';
  if (/여드름|뾰루지/.test(trouble)) return '트러블';
  return '진정';
}

function createProductConsultationResult(product: CareProduct): ProductConsultationResult {
  const productText = `${product.name} ${product.functions?.join(' ') ?? ''}`;
  const isSuitable = !/AHA|BHA|레티놀|고함량|필링/i.test(productText);

  return {
    product,
    isSuitable,
    reason: isSuitable
      ? '현재 루틴의 보습·진정 단계를 보완하면서, 기존 제품과의 자극 가능성이 낮아요.'
      : '현재 루틴에 이미 기능성 제품이 있어 함께 사용하면 각질 케어 성분이 겹치거나 피부 자극이 커질 수 있어요.',
  };
}

function getProductFromQuestion(question: string): CareProduct {
  const name = question.replace(/\s*제품이\s*제\s*피부와\s*현재\s*루틴에\s*잘\s*맞을까요\?\s*$/, '').trim();
  return {...FALLBACK_RECOMMENDED_PRODUCT, id: Date.now(), name: name || FALLBACK_RECOMMENDED_PRODUCT.name};
}

export function RoutineConsultScreen({navigate, initialQuestion = '', onQuestionHandled}: {navigate: Navigate; initialQuestion?: string; onQuestionHandled?: () => void}) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [awaitingTroubleDetail, setAwaitingTroubleDetail] = useState(false);
  const [isAnalyzingTrouble, setIsAnalyzingTrouble] = useState(false);
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState(false);
  const [troubleSolution, setTroubleSolution] = useState<TroubleSolution | null>(null);
  const [troubleSolutionMessageId, setTroubleSolutionMessageId] = useState<number | null>(null);
  const [recommendedProduct, setRecommendedProduct] = useState<CareProduct | null>(null);
  const [productUnderReview, setProductUnderReview] = useState<CareProduct | null>(null);
  const [productResult, setProductResult] = useState<ProductConsultationResult | null>(null);
  const [productResultMessageId, setProductResultMessageId] = useState<number | null>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollToEnd({animated: true});
  }, [chatMessages, troubleSolution, isAnalyzingTrouble, isAnalyzingProduct, productResult]);

  useEffect(() => {
    if (!initialQuestion) {
      return;
    }

    setMessage(initialQuestion);
    onQuestionHandled?.();
  }, [initialQuestion, onQuestionHandled]);

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isAnalyzingTrouble || isAnalyzingProduct) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmedMessage,
    };
    const questionProduct = productUnderReview ?? (trimmedMessage.includes('현재 루틴에 잘 맞을까요') ? getProductFromQuestion(trimmedMessage) : null);

    if (questionProduct) {
      setChatMessages(currentMessages => [...currentMessages, userMessage]);
      setProductUnderReview(null);
      setProductResult(null);
      setIsAnalyzingProduct(true);

      setTimeout(() => {
        const result = createProductConsultationResult(questionProduct);
        const botMessage: ChatMessage = {
          id: userMessage.id + 1,
          sender: 'bot',
          text: result.isSuitable
            ? '이 제품은 현재 루틴에 추가하는 것을 추천드려요. 보습·진정 중심의 루틴을 해치지 않으면서 부족한 기능을 보완해줘요.'
            : '이 제품은 현재 루틴에는 비추천드려요. 사용 중인 기능성 제품과 겹쳐 피부 부담이 커질 수 있어요.',
        };
        setChatMessages(currentMessages => [...currentMessages, botMessage]);
        setProductResult(result);
        setProductResultMessageId(botMessage.id);
        setIsAnalyzingProduct(false);
      }, 3000);
    } else if (awaitingTroubleDetail) {
      setChatMessages(currentMessages => [...currentMessages, userMessage]);
      setAwaitingTroubleDetail(false);
      setIsAnalyzingTrouble(true);

      setTimeout(() => {
        const solution = createTroubleSolution(trimmedMessage);
        const botMessage: ChatMessage = {
          id: userMessage.id + 1,
          sender: 'bot',
          text: '입력해주신 트러블 유형과 현재 보유 제품을 기준으로 조정안을 준비했어요.',
        };
        setChatMessages(currentMessages => [...currentMessages, botMessage]);
        setTroubleSolution(solution);
        setTroubleSolutionMessageId(botMessage.id);
        if (!solution.canUseOwnedProducts) {
          void searchCareProducts(getRecommendationKeyword(trimmedMessage))
            .then(products => setRecommendedProduct(products[0] ?? FALLBACK_RECOMMENDED_PRODUCT))
            .catch(() => setRecommendedProduct(FALLBACK_RECOMMENDED_PRODUCT));
        }
        setIsAnalyzingTrouble(false);
      }, 3000);
    } else {
      const botMessage: ChatMessage = {id: userMessage.id + 1, sender: 'bot', text: createBotReply(trimmedMessage)};
      setChatMessages(currentMessages => [...currentMessages, userMessage, botMessage]);
    }
    setMessage('');
  };

  const startTroubleConsult = () => {
    setAwaitingTroubleDetail(true);
    setIsAnalyzingTrouble(false);
    setMessage('');
    setChatMessages(currentMessages => [...currentMessages, {id: Date.now(), sender: 'bot', text: '어떤 트러블인지 알려주세요.\n예: 좁쌀, 붉은 여드름, 피지, 따가움'}]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDF9" />
      <View style={styles.page}>
        <View style={styles.screen}>
          <Header />
          <ConsultHero onBack={() => navigate('home')} />
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}>
          <BotMessage>
            <Text style={styles.messageText}>현재 루틴을 기준으로{`\n`}원인을 함께 찾아볼게요.  ✧</Text>
          </BotMessage>
          {chatMessages.map(chatMessage => <React.Fragment key={chatMessage.id}>
            {chatMessage.sender === 'user' ? (
              <UserMessage text={chatMessage.text} time="방금" />
            ) : (
              <BotMessage time="방금"><Text style={styles.messageText}>{chatMessage.text}</Text></BotMessage>
            )}
            {troubleSolution && troubleSolutionMessageId === chatMessage.id && <>
              <TroubleSolutionCard solution={troubleSolution} recommendedProduct={recommendedProduct} onCheckRoutine={() => navigate('home')} onAskProduct={product => { setProductUnderReview(product); setMessage(`${product.brand} ${product.name} 제품이 제 피부와 현재 루틴에 잘 맞을까요?`); }} />
              <BotMessage><Text style={styles.messageText}>상담이 종료되었습니다.{`\n`}추가 상담이 필요하다면 ‘트러블 상담’ 버튼을 다시 눌러주세요.</Text></BotMessage>
            </>}
          {productResult && productResultMessageId === chatMessage.id && <ProductConsultationCard result={productResult} onApply={() => navigate('home', {routineProduct: {id: productResult.product.id, category: productResult.product.category, name: productResult.product.name}, routineChange: createRoutineChangeRecord(productResult.product)})} />}
          </React.Fragment>)}
          {isAnalyzingTrouble && <RoutineAnalyzingCard />}
          {isAnalyzingProduct && <ProductAnalyzingCard />}
          </ScrollView>
        </View>

        <View style={styles.composer}>
          <View style={styles.quickActionRow}>
            <Pressable onPress={startTroubleConsult} style={styles.troubleConsultLink}><Text style={[styles.quickActionIcon, styles.troubleActionIcon]}>✦</Text><Text style={styles.troubleConsultText}>트러블 상담</Text><Text style={styles.troubleActionArrow}>›</Text></Pressable>
            <Pressable onPress={() => navigate('productExplore')} style={styles.productExploreLink}><Text style={styles.quickActionIcon}>⌕</Text><Text style={styles.productExploreText}>새 제품을 찾고 있나요?</Text><Text style={styles.quickActionArrow}>›</Text></Pressable>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="추가로 궁금한 점을 입력하세요"
              placeholderTextColor="#A3ABA4"
              style={styles.input}
              multiline
              blurOnSubmit={false}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="메시지 전송"
              onPress={sendMessage}
              style={[styles.sendButton, (!message.trim() || isAnalyzingTrouble || isAnalyzingProduct) && styles.sendButtonDisabled]}>
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Header() {
  return <View style={styles.header}><BrandLogo /><Text style={styles.headerClover}>♧</Text></View>;
}

function TroubleSolutionCard({solution, recommendedProduct, onCheckRoutine, onAskProduct}: {solution: TroubleSolution; recommendedProduct: CareProduct | null; onCheckRoutine: () => void; onAskProduct: (product: CareProduct) => void}) {
  return <View style={[styles.troubleSolutionCard, !solution.canUseOwnedProducts && styles.productNeededCard]}>
    <Text style={styles.solutionKicker}>{solution.canUseOwnedProducts ? '현재 보유 제품으로 해결 가능' : '현재 보유 제품만으로는 부족'}</Text>
    <Text style={styles.solutionTitle}>{solution.title}</Text>
    <Text style={styles.solutionDescription}>{solution.description}</Text>
    {solution.steps.map(step => <View key={step} style={styles.solutionStep}><Text style={styles.solutionDot}>●</Text><Text style={styles.solutionStepText}>{step}</Text></View>)}
    {solution.canUseOwnedProducts && <TodayTroubleRoutineCard onPress={onCheckRoutine} />}
    {!solution.canUseOwnedProducts && recommendedProduct && <RecommendedProductCard product={recommendedProduct} onAskProduct={onAskProduct} />}
  </View>;
}

function RecommendedProductCard({product, onAskProduct}: {product: CareProduct; onAskProduct: (product: CareProduct) => void}) {
  const [selected, setSelected] = useState(false);
  const functionName = product.functions?.[0] ?? product.category;
  return <View>
    <Pressable onPress={() => setSelected(current => !current)} style={[styles.recommendedProductCard, selected && styles.recommendedProductCardSelected]}>
    <Text style={styles.recommendedLabel}>AI 추천 제품</Text>
    <View style={styles.recommendedProductContent}>
      <View style={styles.recommendedProductImage}><Text style={styles.recommendedProductImageText}>{product.brand}</Text></View>
      <View style={styles.recommendedProductInfo}>
        <Text style={styles.recommendedBrand}>{product.brand}</Text>
        <Text style={styles.recommendedName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.recommendedPrice}>{product.price.toLocaleString('ko-KR')}원</Text>
        <View style={styles.recommendedTag}><Text style={styles.recommendedTagText}>{functionName}</Text></View>
      </View>
    </View>
    </Pressable>
    {selected && <Pressable onPress={() => onAskProduct(product)} style={styles.recommendedAskButton}><Text style={styles.recommendedAskButtonText}>AI에게 물어보기</Text><Text style={styles.recommendedAskArrow}>›</Text></Pressable>}
  </View>;
}

function ProductAnalyzingCard() {
  return <View style={styles.analyzingRow}>
    <RobotAvatar small />
    <View style={styles.analyzingCard}>
      <View style={styles.analyzingTextWrap}>
        <Text style={styles.analyzingTitle}>제품 적합도 분석 중이에요</Text>
        <Text style={styles.analyzingDescription}>현재 루틴과 제품 기능을 비교하고 있어요.</Text>
      </View>
      <ActivityIndicator size="small" color="#578D61" />
    </View>
  </View>;
}

function ProductConsultationCard({result, onApply}: {result: ProductConsultationResult; onApply: () => void}) {
  if (!result.isSuitable) {
    return <View style={styles.unsuitableCard}>
      <Text style={styles.productResultKicker}>AI 분석 결과 · 비추천</Text>
      <Text style={styles.productResultTitle}>현재 루틴에는 추가하지 않는 편이 좋아요</Text>
      <Text style={styles.productResultReason}>{result.reason}</Text>
    </View>;
  }

  return <View style={styles.suitableCard}>
    <Text style={styles.productResultKicker}>AI 분석 결과 · 추천</Text>
    <Text style={styles.productResultTitle}>오늘 루틴에 추가해볼까요?</Text>
    <Text style={styles.productResultReason}>{result.reason}</Text>
    <View style={styles.newProductRoutine}>
      <Text style={styles.newRoutineTitle}>오늘의 조정 루틴</Text>
      <Text style={styles.newRoutineLine}>PM  약산성 클렌저  →  진정 세럼  →</Text>
      <Text style={styles.newRoutineProduct}>+ {result.product.name}</Text>
      <Text style={styles.newRoutineLine}>→  수분 크림</Text>
    </View>
    <Pressable onPress={onApply} style={styles.applyRoutineButton}><Text style={styles.applyRoutineButtonText}>이 루틴 적용하기</Text><Text style={styles.applyRoutineArrow}>›</Text></Pressable>
  </View>;
}

function createRoutineChangeRecord(product: CareProduct) {
  return {
    id: `routine-change-${Date.now()}`,
    createdAt: new Date().toISOString(),
    title: 'AI 추천 제품 추가',
    detail: `${product.name}을(를) 저녁 루틴에 추가했어요.`,
    tone: 'green' as const,
  };
}

function TodayTroubleRoutineCard({onPress}: {onPress: () => void}) {
  return <View style={styles.todayTroubleRoutine}>
    <View style={styles.todayTroubleHeader}>
      <Text style={styles.todayTroubleKicker}>오늘의 트러블 케어 루틴</Text>
      <Text style={styles.todayTroubleBadge}>조정됨</Text>
    </View>
    <View style={styles.todayRoutineLine}><Text style={styles.todayRoutineTime}>AM</Text><Text style={styles.todayRoutineProducts}>약산성 클렌저  →  어성초 토너  →  수분 크림</Text></View>
    <View style={styles.todayRoutineLine}><Text style={styles.todayRoutineTime}>PM</Text><Text style={styles.todayRoutineProducts}>약산성 클렌저  →  세라마이드 세럼  →  수분 크림</Text></View>
    <Pressable onPress={onPress} style={styles.checkRoutineButton}><Text style={styles.checkRoutineButtonText}>루틴 확인하기</Text><Text style={styles.checkRoutineArrow}>›</Text></Pressable>
  </View>;
}

function RoutineAnalyzingCard() {
  return <View style={styles.analyzingRow}>
    <RobotAvatar small />
    <View style={styles.analyzingCard}>
      <View style={styles.analyzingTextWrap}>
        <Text style={styles.analyzingTitle}>루틴 분석 중이에요</Text>
        <Text style={styles.analyzingDescription}>트러블 원인과 보유 제품을 살펴보고 있어요.</Text>
      </View>
      <ActivityIndicator size="small" color="#578D61" />
    </View>
  </View>;
}

function ConsultHero({onBack}: {onBack: () => void}) {
  return <View style={styles.hero}><View><View style={styles.heroTitleRow}><TouchableOpacity accessibilityRole="button" accessibilityLabel="홈으로 돌아가기" activeOpacity={0.6} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}} onPress={onBack} style={styles.heroBackButton}><Text style={styles.heroBackIcon}>‹</Text></TouchableOpacity><Text style={styles.heroTitle}>AI 루틴 상담</Text></View><Text style={styles.heroDescription}>피부 고민을 알려주시면{`\n`}현재 루틴을 바탕으로 조정안을 제안해드려요.</Text></View><RobotIllustration /></View>;
}

function BotMessage({children, time}: {children: React.ReactNode; time?: string}) {
  return <View style={styles.botRow}><RobotAvatar small /><View style={styles.botBubble}>{children}</View>{time && <Text style={styles.time}>{time}</Text>}</View>;
}

function UserMessage({text, time}: {text: string; time: string}) {
  return <View style={styles.userRow}><View style={styles.userBubble}><Text style={styles.userText}>{text}</Text></View><Text style={styles.time}>{time}</Text><Text style={styles.readMark}>✓✓</Text></View>;
}

function RobotAvatar({small = false}: {small?: boolean}) {return <Image source={require('../assets/images/ai-chat-avatar.png')} resizeMode="contain" style={[styles.robotAvatar, small && styles.smallRobotAvatar]} />;}

function RobotIllustration() {return <Image source={require('../assets/images/ai-consult-illustration.png')} resizeMode="contain" style={styles.robotIllustration} />;}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFDF9'}, page: {flex: 1}, screen: {flex: 1, paddingHorizontal: 24, paddingTop: 40}, chatScroll: {flex: 1, marginTop: 8}, chatContent: {paddingBottom: 18},
  header: {height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, headerClover: {fontSize: 22, color: '#43815B'}, hero: {height: 112, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, heroTitleRow: {flexDirection: 'row', alignItems: 'center'}, heroBackButton: {width: 28, height: 36, justifyContent: 'center', marginRight: 5}, heroBackIcon: {fontSize: 37, lineHeight: 32, color: '#374239'}, heroTitle: {fontSize: 28, letterSpacing: -1.4, color: '#303A32', fontWeight: '900'}, heroDescription: {fontSize: 11, lineHeight: 16, color: '#717C73', marginTop: 8},
  robotIllustration: {width: 134, height: 101},
  introMessage: {minHeight: 49, borderRadius: 15, backgroundColor: '#FFF', shadowColor: '#758075', shadowOpacity: 0.08, shadowOffset: {width: 0, height: 2}, shadowRadius: 7, elevation: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}, introText: {fontSize: 11, lineHeight: 15, color: '#3E4B42', fontWeight: '800', marginLeft: 9},
  robotAvatar: {width: 48, height: 39}, smallRobotAvatar: {width: 40, height: 34, marginTop: 4},
  userRow: {flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 10}, userBubble: {maxWidth: '72%', flexShrink: 1, backgroundColor: '#EFF4E9', borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 11}, userText: {fontSize: 11, lineHeight: 16, color: '#4B574D', flexShrink: 1}, time: {fontSize: 7, color: '#9AA29B', marginLeft: 5, marginBottom: 3}, readMark: {fontSize: 8, color: '#6B9B74', marginLeft: 2, marginBottom: 3},
  botRow: {flexDirection: 'row', alignItems: 'flex-end', marginTop: 8, marginLeft: -6}, botBubble: {maxWidth: '78%', backgroundColor: '#FFF', borderRadius: 14, borderBottomLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 10, marginLeft: 7, shadowColor: '#758075', shadowOpacity: 0.05, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, messageText: {fontSize: 11, lineHeight: 16, color: '#4C574E'}, troubleSolutionCard: {marginTop: 10, marginLeft: 34, borderRadius: 14, backgroundColor: '#F1F7EE', padding: 13, borderWidth: 1, borderColor: '#D7E7D2'}, productNeededCard: {backgroundColor: '#FFF7EC', borderColor: '#F1DEC0'}, solutionKicker: {fontSize: 9, color: '#54865C', fontWeight: '800'}, solutionTitle: {fontSize: 14, color: '#36593C', fontWeight: '900', marginTop: 4}, solutionDescription: {fontSize: 9, color: '#687869', lineHeight: 13, marginTop: 5, marginBottom: 5}, solutionStep: {flexDirection: 'row', alignItems: 'center', marginTop: 5}, solutionDot: {fontSize: 7, color: '#5A9665', marginRight: 6}, solutionStepText: {fontSize: 9, color: '#526954', flexShrink: 1},
  todayTroubleRoutine: {marginTop: 11, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE9D9'}, todayTroubleHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6}, todayTroubleKicker: {fontSize: 10, color: '#3D6844', fontWeight: '900'}, todayTroubleBadge: {fontSize: 8, color: '#4F8759', backgroundColor: '#EAF4E7', borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, fontWeight: '800'}, todayRoutineLine: {flexDirection: 'row', alignItems: 'center', marginTop: 4}, todayRoutineTime: {width: 21, fontSize: 8, color: '#52875B', fontWeight: '900'}, todayRoutineProducts: {fontSize: 8, color: '#657467', flex: 1}, checkRoutineButton: {height: 30, marginTop: 9, borderRadius: 8, backgroundColor: '#4F875B', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, checkRoutineButtonText: {fontSize: 9, color: '#FFFFFF', fontWeight: '900'}, checkRoutineArrow: {position: 'absolute', right: 10, fontSize: 17, color: '#FFFFFF'},
  suitableCard: {marginTop: 10, marginLeft: 34, borderRadius: 14, backgroundColor: '#F1F7EE', borderWidth: 1, borderColor: '#D7E7D2', padding: 13}, unsuitableCard: {marginTop: 10, marginLeft: 34, borderRadius: 14, backgroundColor: '#FFF7EC', borderWidth: 1, borderColor: '#F1DEC0', padding: 13}, productResultKicker: {fontSize: 9, color: '#558360', fontWeight: '900'}, productResultTitle: {fontSize: 14, color: '#385B3E', fontWeight: '900', marginTop: 4}, productResultReason: {fontSize: 9, lineHeight: 14, color: '#687869', marginTop: 5}, newProductRoutine: {marginTop: 10, borderRadius: 9, backgroundColor: '#FFFFFF', padding: 9, borderWidth: 1, borderColor: '#DDE9D9'}, newRoutineTitle: {fontSize: 9, color: '#46754D', fontWeight: '900', marginBottom: 5}, newRoutineLine: {fontSize: 8, lineHeight: 13, color: '#647466'}, newRoutineProduct: {fontSize: 8, lineHeight: 13, color: '#4C8657', fontWeight: '900'}, applyRoutineButton: {height: 32, marginTop: 9, borderRadius: 8, backgroundColor: '#4F875B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, applyRoutineButtonText: {fontSize: 9, color: '#FFFFFF', fontWeight: '900'}, applyRoutineArrow: {position: 'absolute', right: 10, fontSize: 17, color: '#FFFFFF'},
  recommendedProductCard: {marginTop: 11, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0DFC3'}, recommendedProductCardSelected: {borderWidth: 1.5, borderColor: '#A16D40'}, recommendedLabel: {fontSize: 10, color: '#A36D3D', fontWeight: '900', marginBottom: 7}, recommendedProductContent: {flexDirection: 'row', alignItems: 'center'}, recommendedProductImage: {width: 45, height: 54, borderRadius: 7, backgroundColor: '#EEF0E7', alignItems: 'center', justifyContent: 'center', marginRight: 9}, recommendedProductImageText: {fontSize: 6, color: '#758070', textAlign: 'center', paddingHorizontal: 3}, recommendedProductInfo: {flex: 1, minWidth: 0}, recommendedBrand: {fontSize: 8, color: '#7A867A'}, recommendedName: {fontSize: 10, lineHeight: 14, color: '#3F4B41', fontWeight: '900', marginTop: 2}, recommendedPrice: {fontSize: 10, color: '#3D493E', fontWeight: '900', marginTop: 4}, recommendedTag: {alignSelf: 'flex-start', borderRadius: 5, backgroundColor: '#FDF3E6', paddingHorizontal: 5, paddingVertical: 3, marginTop: 5}, recommendedTagText: {fontSize: 7, color: '#A16D40'}, recommendedAskButton: {height: 32, marginTop: 7, borderRadius: 8, backgroundColor: '#4F875B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, recommendedAskButtonText: {fontSize: 9, color: '#FFFFFF', fontWeight: '900'}, recommendedAskArrow: {position: 'absolute', right: 10, color: '#FFFFFF', fontSize: 17},
  analyzingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: -6}, analyzingCard: {minHeight: 66, flex: 1, maxWidth: '78%', marginLeft: 7, borderRadius: 14, borderBottomLeftRadius: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EEE7', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center'}, analyzingTextWrap: {flex: 1}, analyzingTitle: {fontSize: 13, color: '#3C6744', fontWeight: '900'}, analyzingDescription: {fontSize: 9, lineHeight: 13, color: '#718172', marginTop: 3},
  checkCard: {backgroundColor: '#FFF', borderRadius: 11, padding: 10, marginLeft: 35, marginTop: 7, shadowColor: '#758075', shadowOpacity: 0.06, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, checkTitle: {fontSize: 11, color: '#4F5A51', fontWeight: '800'}, checkTags: {flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8}, checkTag: {backgroundColor: '#EFF6EC', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, flexDirection: 'row', alignItems: 'center'}, checkTagIcon: {fontSize: 8, color: '#4E8C5D', marginRight: 3}, checkTagText: {fontSize: 7, color: '#579063', fontWeight: '800'},
  suggestionCard: {minHeight: 145, borderRadius: 14, backgroundColor: '#F6F8F2', marginLeft: 35, marginTop: 9, padding: 13, flexDirection: 'row', shadowColor: '#758075', shadowOpacity: 0.06, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, suggestionTextWrap: {flex: 1, minWidth: 0, paddingRight: 4}, suggestionKicker: {fontSize: 9, color: '#5B8E62', fontWeight: '800'}, suggestionTitle: {fontSize: 16, lineHeight: 21, color: '#35523B', fontWeight: '900', marginTop: 3}, suggestionPoint: {flexDirection: 'row', alignItems: 'center', marginTop: 6}, suggestionPointIcon: {fontSize: 8, color: '#568E60', marginRight: 5}, suggestionPointText: {fontSize: 9, color: '#56705B', flexShrink: 1}, reason: {alignSelf: 'flex-start', borderRadius: 7, backgroundColor: '#EEF1E7', paddingHorizontal: 8, paddingVertical: 4, marginTop: 7}, reasonText: {fontSize: 7, color: '#688068'},
  restIllustration: {width: 77, height: 100, position: 'relative'}, daysCard: {position: 'absolute', right: 1, top: 17, width: 43, height: 56, borderRadius: 4, backgroundColor: '#FDFDF9', alignItems: 'center', justifyContent: 'center', transform: [{rotate: '4deg'}]}, daysNumber: {fontSize: 24, color: '#5C8B62', fontWeight: '900'}, daysLabel: {fontSize: 7, color: '#899789'}, restBottleOne: {position: 'absolute', left: 1, bottom: 2, width: 12, height: 30, borderRadius: 3, backgroundColor: '#B8C8AF'}, restBottleTwo: {position: 'absolute', left: 15, bottom: 2, width: 13, height: 40, borderRadius: 3, backgroundColor: '#DAE2D4'}, restLeaf: {position: 'absolute', right: -3, bottom: 0, fontSize: 28, color: '#9DB69B'},
  actionRow: {flexDirection: 'row', gap: 6, marginTop: 13}, primaryAction: {height: 37, flex: 1.15, minWidth: 0, borderRadius: 18, backgroundColor: '#4D875B', alignItems: 'center', justifyContent: 'center'}, acceptedAction: {backgroundColor: '#397C4E'}, primaryActionText: {fontSize: 9, color: '#FFF', fontWeight: '800'}, secondaryAction: {height: 37, flex: 1.22, minWidth: 0, borderRadius: 18, borderWidth: 1, borderColor: '#4D875B', alignItems: 'center', justifyContent: 'center'}, secondaryActionText: {fontSize: 8, color: '#487E56', fontWeight: '800'}, keepAction: {height: 37, flex: .85, minWidth: 0, borderRadius: 18, borderWidth: 1, borderColor: '#E2E6E1', alignItems: 'center', justifyContent: 'center'}, keepActionText: {fontSize: 8, color: '#626E64'},
  quickRow: {flexDirection: 'row', gap: 7, marginTop: 10}, quickQuestion: {height: 33, flex: 1, borderWidth: 1, borderColor: '#EEF0EC', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}, quickIcon: {fontSize: 13, color: '#68936E', marginRight: 6}, quickText: {fontSize: 9, color: '#647065'},
  nextCheck: {height: 53, backgroundColor: '#FFF', borderRadius: 12, marginTop: 9, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', shadowColor: '#758075', shadowOpacity: 0.06, shadowOffset: {width: 0, height: 2}, shadowRadius: 5, elevation: 1}, calendarIcon: {fontSize: 20, color: '#568B5F', marginRight: 10}, nextCheckTextWrap: {flex: 1}, nextCheckTitle: {fontSize: 10, color: '#5E765F', fontWeight: '800'}, nextCheckText: {fontSize: 9, color: '#7C877E', marginTop: 4}, nextArrow: {fontSize: 22, color: '#748076'},
  composer: {height: 94, paddingHorizontal: 26, paddingTop: 5, paddingBottom: 8, backgroundColor: '#FFFDF9'}, quickActionRow: {height: 34, flexDirection: 'row', gap: 7, marginBottom: 6}, productExploreLink: {flex: 1, borderRadius: 11, backgroundColor: '#F0F6ED', paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center'}, troubleConsultLink: {flex: 1, borderRadius: 11, backgroundColor: '#FFF3E8', paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center'}, quickActionIcon: {fontSize: 13, color: '#4C8258', marginRight: 5}, troubleActionIcon: {color: '#A06D42'}, productExploreText: {fontSize: 8, color: '#48634C', fontWeight: '800', flex: 1}, troubleConsultText: {fontSize: 8, color: '#A06D42', fontWeight: '800', flex: 1}, quickActionArrow: {fontSize: 16, color: '#51825C'}, troubleActionArrow: {fontSize: 16, color: '#A06D42'}, inputRow: {height: 36, flexDirection: 'row', gap: 8}, input: {height: 36, flex: 1, borderRadius: 18, borderWidth: 1, borderColor: '#E9ECE8', paddingHorizontal: 13, fontSize: 9, color: '#526054'}, sendButton: {width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#4F8A5E', alignItems: 'center', justifyContent: 'center'}, sendButtonDisabled: {borderColor: '#C9D2CA', opacity: 0.5}, sendIcon: {fontSize: 16, color: '#4F8A5E', transform: [{rotate: '-35deg'}]},
});
