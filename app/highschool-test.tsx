import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TestQuestion {
  id: string;
  category: 'carl-jung' | 'riasec' | 'big-five';
  question: string;
  options: string[];
  weights: number[];
  series?: string; // 계열 정보 (RIASEC 질문에만 해당)
}

interface TestResult {
  category: string;
  score: number;
  description: string;
  recommendation: string;
}

export default function HighschoolTestScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentPageAnswers, setCurrentPageAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: number }>({});

  // 테스트 문항 데이터 (총 150개 문항 중 일부)
  const testQuestions: TestQuestion[] = [
    // Carl Jung 심리유형 이론 (12문항)
    {
      id: '1',
      category: 'carl-jung',
      question: '새로운 사람들과 만날 때 나는...',
      options: ['대화를 통해 친해지려고 노력한다', '조용히 관찰하며 상황을 파악한다'],
      weights: [1, 0] // E vs I
    },
    {
      id: '2',
      category: 'carl-jung',
      question: '문제를 해결할 때 나는...',
      options: ['구체적인 사실과 경험을 바탕으로 한다', '직감과 가능성을 고려한다'],
      weights: [1, 0] // S vs N
    },
    {
      id: '3',
      category: 'carl-jung',
      question: '의사결정을 할 때 나는...',
      options: ['논리적이고 객관적인 분석을 한다', '사람들의 감정과 가치를 고려한다'],
      weights: [1, 0] // T vs F
    },
    {
      id: '4',
      category: 'carl-jung',
      question: '일정과 계획에 대해 나는...',
      options: ['체계적이고 계획적으로 진행한다', '유연하고 즉흥적으로 대응한다'],
      weights: [1, 0] // J vs P
    },
    {
      id: '5',
      category: 'carl-jung',
      question: '휴식을 취할 때 나는...',
      options: ['친구들과 함께 외출하거나 활동한다', '혼자만의 시간을 보내며 휴식을 취한다'],
      weights: [1, 0] // E vs I
    },
    {
      id: '6',
      category: 'carl-jung',
      question: '새로운 정보를 받았을 때 나는...',
      options: ['실용적이고 구체적인 세부사항에 집중한다', '전체적인 의미와 가능성을 추구한다'],
      weights: [1, 0] // S vs N
    },
    {
      id: '7',
      category: 'carl-jung',
      question: '갈등 상황에서 나는...',
      options: ['공정하고 논리적인 해결책을 찾는다', '모든 사람이 만족할 수 있는 방법을 찾는다'],
      weights: [1, 0] // T vs F
    },
    {
      id: '8',
      category: 'carl-jung',
      question: '마감일이 다가올 때 나는...',
      options: ['미리 계획을 세우고 여유있게 준비한다', '마감 직전에 집중하여 완성한다'],
      weights: [1, 0] // J vs P
    },
    {
      id: '9',
      category: 'carl-jung',
      question: '에너지를 얻는 방법은...',
      options: ['다른 사람들과의 상호작용을 통해', '혼자만의 시간과 공간을 통해'],
      weights: [1, 0] // E vs I
    },
    {
      id: '10',
      category: 'carl-jung',
      question: '미래에 대해 생각할 때 나는...',
      options: ['현실적이고 구체적인 계획을 세운다', '가능성과 잠재력에 대해 상상한다'],
      weights: [1, 0] // S vs N
    },
    {
      id: '11',
      category: 'carl-jung',
      question: '규칙을 어기는 사람을 보면...',
      options: ['원칙에 따라 처리해야 한다고 생각한다', '상황을 이해하고 공감한다'],
      weights: [1, 0] // T vs F
    },
    {
      id: '12',
      category: 'carl-jung',
      question: '일상적인 루틴에 대해 나는...',
      options: ['안정적이고 예측 가능한 것을 선호한다', '새롭고 다양한 것을 선호한다'],
      weights: [1, 0] // J vs P
    },

    // RIASEC 진로탐색 모델 (18문항)
    {
      id: '13',
      category: 'riasec',
      question: '실험실에서 새로운 실험을 설계하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Investigative
      series: '자연계열'
    },
    {
      id: '14',
      category: 'riasec',
      question: '사람들과 함께 팀 프로젝트를 진행하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Social
      series: '인문계열'
    },
    {
      id: '15',
      category: 'riasec',
      question: '창의적인 아이디어로 새로운 것을 만드는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Artistic
      series: '예체능계열'
    },
    {
      id: '16',
      category: 'riasec',
      question: '체계적으로 데이터를 분석하고 정리하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Conventional
      series: '사회계열'
    },
    {
      id: '17',
      category: 'riasec',
      question: '리더십을 발휘하여 팀을 이끄는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Enterprising
      series: '경영계열'
    },
    {
      id: '18',
      category: 'riasec',
      question: '기계나 도구를 다루며 실용적인 작업을 하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Realistic
      series: '공학계열'
    },
    {
      id: '19',
      category: 'riasec',
      question: '수학적 문제를 해결하고 논리적 추론을 하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Investigative
      series: '자연계열'
    },
    {
      id: '20',
      category: 'riasec',
      question: '다른 사람의 문제를 듣고 조언을 해주는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Social
      series: '인문계열'
    },
    {
      id: '21',
      category: 'riasec',
      question: '예술 작품을 감상하고 비평하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Artistic
      series: '예체능계열'
    },
    {
      id: '22',
      category: 'riasec',
      question: '회계나 재무 관련 업무를 처리하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Conventional
      series: '사회계열'
    },
    {
      id: '23',
      category: 'riasec',
      question: '사람들을 설득하고 동기부여하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Enterprising
      series: '경영계열'
    },
    {
      id: '24',
      category: 'riasec',
      question: '건축물이나 구조물을 설계하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Realistic
      series: '공학계열'
    },
    {
      id: '25',
      category: 'riasec',
      question: '의학 연구나 생명과학 실험을 하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Investigative
      series: '의약계열'
    },
    {
      id: '26',
      category: 'riasec',
      question: '교육이나 훈련 프로그램을 개발하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Social
      series: '교육계열'
    },
    {
      id: '27',
      category: 'riasec',
      question: '음악이나 문학 작품을 창작하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Artistic
      series: '예체능계열'
    },
    {
      id: '28',
      category: 'riasec',
      question: '법률 문서나 규정을 검토하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Conventional
      series: '사회계열'
    },
    {
      id: '29',
      category: 'riasec',
      question: '사업 기회를 찾고 투자 결정을 하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Enterprising
      series: '경영계열'
    },
    {
      id: '30',
      category: 'riasec',
      question: '자동차나 전자제품을 수리하는 것이 나에게 맞다.',
      options: ['매우 가깝다', '가깝다', '보통이다', '멀다', '매우 멀다'],
      weights: [4, 3, 2, 1, 0], // Realistic
      series: '공학계열'
    },

    // Big Five 성격검사 (15문항)
    {
      id: '31',
      category: 'big-five',
      question: '새로운 경험을 시도하는 것이...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Openness
    },
    {
      id: '32',
      category: 'big-five',
      question: '계획을 세우고 체계적으로 일을 진행하는 것이...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Conscientiousness
    },
    {
      id: '33',
      category: 'big-five',
      question: '사람들과 어울리고 대화하는 것이...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Extraversion
    },
    {
      id: '34',
      category: 'big-five',
      question: '다른 사람의 감정을 이해하고 공감하는 것이...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Agreeableness
    },
    {
      id: '35',
      category: 'big-five',
      question: '스트레스나 걱정을 많이 하는 편이다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Neuroticism (역방향)
    },
    {
      id: '36',
      category: 'big-five',
      question: '추상적인 개념이나 이론에 관심이 많다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Openness
    },
    {
      id: '37',
      category: 'big-five',
      question: '일을 시작하기 전에 충분히 준비한다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Conscientiousness
    },
    {
      id: '38',
      category: 'big-five',
      question: '파티나 모임에서 중심이 되는 편이다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Extraversion
    },
    {
      id: '39',
      category: 'big-five',
      question: '다른 사람과 의견이 다를 때 양보한다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Agreeableness
    },
    {
      id: '40',
      category: 'big-five',
      question: '감정의 기복이 심한 편이다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Neuroticism (역방향)
    },
    {
      id: '41',
      category: 'big-five',
      question: '예술이나 시에 깊은 감동을 받는다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Openness
    },
    {
      id: '42',
      category: 'big-five',
      question: '일을 끝까지 완성하는 편이다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Conscientiousness
    },
    {
      id: '43',
      category: 'big-five',
      question: '낯선 사람들과도 쉽게 친해진다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Extraversion
    },
    {
      id: '44',
      category: 'big-five',
      question: '다른 사람을 돕는 것을 좋아한다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Agreeableness
    },
    {
      id: '45',
      category: 'big-five',
      question: '걱정이나 불안을 자주 느낀다...',
      options: ['매우 그렇다', '그렇다', '보통이다', '아니다', '전혀 아니다'],
      weights: [4, 3, 2, 1, 0] // Neuroticism (역방향)
    }
  ];

  // 현재 페이지의 문항들만 표시 (한 페이지에 3개씩)
  const getCurrentPageQuestions = () => {
    const startIndex = currentQuestionIndex;
    const endIndex = Math.min(startIndex + 3, testQuestions.length);
    return testQuestions.slice(startIndex, endIndex);
  };

  // 첫 페이지에 RIASEC 질문들이 포함되도록 시작 인덱스 조정
  const adjustedCurrentQuestionIndex = currentQuestionIndex === 0 ? 12 : currentQuestionIndex;
  const adjustedPageQuestions = currentQuestionIndex === 0 
    ? testQuestions.slice(12, 15) // 첫 페이지: RIASEC 질문 3개
    : getCurrentPageQuestions();

  const currentPageQuestions = getCurrentPageQuestions();
  const progress = ((adjustedCurrentQuestionIndex + 1) / 150) * 100; // 총 150개 문항 기준

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    // 선택된 옵션 표시
    setSelectedOptions(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));

    const newPageAnswers = [...currentPageAnswers];
    newPageAnswers[questionIndex] = optionIndex;
    setCurrentPageAnswers(newPageAnswers);

    // 현재 페이지의 모든 문항에 답변했는지 확인
    if (newPageAnswers.filter(answer => answer !== undefined).length === adjustedPageQuestions.length) {
      // 현재 페이지 답변을 전체 답변에 저장
      const newAnswers = [...answers];
      for (let i = 0; i < adjustedPageQuestions.length; i++) {
        newAnswers[questionIndex + i] = newPageAnswers[i];
      }
      setAnswers(newAnswers);

      // 다음 페이지로 이동 또는 결과 계산
      if (currentQuestionIndex === 0) {
        // 첫 페이지 후 다음 페이지로 이동
        setCurrentQuestionIndex(15);
        setCurrentPageAnswers([]);
        setSelectedOptions({});
      } else if (currentQuestionIndex + 3 < testQuestions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 3);
        setCurrentPageAnswers([]);
        setSelectedOptions({});
      } else {
        calculateResults(newAnswers);
      }
    }
  };

  const calculateResults = (finalAnswers: number[]) => {
    // Carl Jung 결과 계산
    let eScore = 0, iScore = 0, sScore = 0, nScore = 0, tScore = 0, fScore = 0, jScore = 0, pScore = 0;
    
    for (let i = 0; i < 4; i++) {
      if (i === 0) { // E vs I
        if (finalAnswers[i] === 0) eScore += 1;
        else iScore += 1;
      } else if (i === 1) { // S vs N
        if (finalAnswers[i] === 0) sScore += 1;
        else nScore += 1;
      } else if (i === 2) { // T vs F
        if (finalAnswers[i] === 0) tScore += 1;
        else fScore += 1;
      } else if (i === 3) { // J vs P
        if (finalAnswers[i] === 0) jScore += 1;
        else pScore += 1;
      }
    }

    const jungType = `${eScore > iScore ? 'E' : 'I'}${sScore > nScore ? 'S' : 'N'}${tScore > fScore ? 'T' : 'F'}${jScore > pScore ? 'J' : 'P'}`;

    // RIASEC 결과 계산
    const riasecScores = [0, 0, 0, 0, 0, 0]; // R, I, A, S, E, C
    for (let i = 4; i < 10; i++) {
      riasecScores[i - 4] += finalAnswers[i] * 2;
    }
    
    const maxRiasecIndex = riasecScores.indexOf(Math.max(...riasecScores));
    const riasecTypes = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];

    // Big Five 결과 계산
    const bigFiveScores = [0, 0, 0, 0, 0]; // O, C, E, A, N
    for (let i = 10; i < 15; i++) {
      if (i === 14) { // Neuroticism은 역방향
        bigFiveScores[4] += (4 - finalAnswers[i]);
      } else {
        bigFiveScores[i - 10] += finalAnswers[i];
      }
    }

    const results: TestResult[] = [
      {
        category: 'Carl Jung 심리유형',
        score: 0,
        description: `당신의 심리유형은 ${jungType}입니다.`,
        recommendation: getJungRecommendation(jungType)
      },
      {
        category: 'RIASEC 진로유형',
        score: 0,
        description: `당신의 진로유형은 ${riasecTypes[maxRiasecIndex]}입니다.`,
        recommendation: getRiasecRecommendation(riasecTypes[maxRiasecIndex])
      },
      {
        category: 'Big Five 성격특성',
        score: 0,
        description: '개방성, 성실성, 외향성, 친화성, 신경증 성향을 종합적으로 분석했습니다.',
        recommendation: getBigFiveRecommendation(bigFiveScores)
      }
    ];

    setTestResults(results);
    setShowResults(true);
  };

  const getJungRecommendation = (type: string): string => {
    const recommendations: { [key: string]: string } = {
      'INTJ': '전략적 사고와 독창성이 뛰어나며, 연구나 계획 수립에 적합합니다.',
      'INTP': '논리적 분석과 이론적 탐구에 능하며, 과학이나 철학 분야가 적합합니다.',
      'ENTJ': '리더십과 조직 관리 능력이 뛰어나며, 경영이나 정치 분야가 적합합니다.',
      'ENTP': '창의적 문제 해결과 혁신에 능하며, 기업가나 발명가가 적합합니다.',
      'INFJ': '직관적 통찰력과 공감 능력이 뛰어나며, 상담이나 교육 분야가 적합합니다.',
      'INFP': '창의성과 이상주의적 성향이 강하며, 예술가나 작가가 적합합니다.',
      'ENFJ': '사람을 이끄는 능력과 동기부여에 뛰어나며, 교육자나 상담사가 적합합니다.',
      'ENFP': '열정과 창의성이 뛰어나며, 언론인이나 예술가가 적합합니다.',
      'ISTJ': '체계적이고 신뢰할 수 있으며, 행정이나 회계 분야가 적합합니다.',
      'ISFJ': '책임감과 실용성이 뛰어나며, 의료나 서비스 분야가 적합합니다.',
      'ESTJ': '조직 관리와 규칙 준수에 능하며, 경영이나 법무 분야가 적합합니다.',
      'ESFJ': '협력과 소통 능력이 뛰어나며, 의료나 교육 분야가 적합합니다.',
      'ISTP': '실용적 문제 해결과 기술적 능력이 뛰어나며, 기술자나 운동선수가 적합합니다.',
      'ISFP': '예술적 감각과 실용성이 조화를 이루며, 디자이너나 예술가가 적합합니다.',
      'ESTP': '현실적이고 적응력이 뛰어나며, 기업가나 운동선수가 적합합니다.',
      'ESFP': '사교적이고 낙관적이며, 엔터테이너나 서비스 분야가 적합합니다.'
    };
    return recommendations[type] || '당신의 심리유형에 맞는 진로를 탐색해보세요.';
  };

  const getRiasecRecommendation = (type: string): string => {
    const recommendations: { [key: string]: string } = {
      'Realistic': '실용적이고 기술적인 능력이 뛰어나며, 공학이나 기술 분야가 적합합니다.',
      'Investigative': '분석적 사고와 연구 능력이 뛰어나며, 과학이나 연구 분야가 적합합니다.',
      'Artistic': '창의성과 예술적 감각이 뛰어나며, 예술이나 디자인 분야가 적합합니다.',
      'Social': '사람들과의 소통과 협력 능력이 뛰어나며, 교육이나 상담 분야가 적합합니다.',
      'Enterprising': '리더십과 설득 능력이 뛰어나며, 경영이나 마케팅 분야가 적합합니다.',
      'Conventional': '체계적이고 정확한 업무 처리 능력이 뛰어나며, 행정이나 회계 분야가 적합합니다.'
    };
    return recommendations[type] || '당신의 진로유형에 맞는 직업을 탐색해보세요.';
  };

  const getBigFiveRecommendation = (scores: number[]): string => {
    const [openness, conscientiousness, extraversion, agreeableness, neuroticism] = scores;
    
    let recommendation = '';
    
    if (openness > 12) recommendation += '높은 개방성으로 창의적이고 혁신적인 분야가 적합합니다. ';
    if (conscientiousness > 12) recommendation += '높은 성실성으로 체계적이고 신뢰할 수 있는 업무가 적합합니다. ';
    if (extraversion > 12) recommendation += '높은 외향성으로 사람들과의 소통이 많은 분야가 적합합니다. ';
    if (agreeableness > 12) recommendation += '높은 친화성으로 협력과 조화가 중요한 분야가 적합합니다. ';
    if (neuroticism < 8) recommendation += '낮은 신경증 성향으로 스트레스 상황에서도 안정적으로 일할 수 있습니다. ';
    
    return recommendation || '균형잡힌 성격 특성을 가지고 있어 다양한 분야에서 성공할 수 있습니다.';
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setTestResults([]);
  };

  const goToSubjectRecommendation = () => {
    router.push('/subject-recommendation');
  };

  if (showResults) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 결과 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>테스트 결과 🎯</Text>
            <Text style={styles.headerSubtitle}>당신의 성향과 적성 분석</Text>
          </View>

          {/* 결과 콘텐츠 */}
          <View style={styles.contentArea}>
            {testResults.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <Text style={styles.resultTitle}>{result.category}</Text>
                <Text style={styles.resultDescription}>{result.description}</Text>
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationTitle}>💡 추천사항</Text>
                  <Text style={styles.recommendationText}>{result.recommendation}</Text>
                </View>
              </View>
            ))}

            {/* 액션 버튼들 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={goToSubjectRecommendation}
              >
                <Text style={styles.actionButtonText}>과목 추천 받기</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={resetTest}
              >
                <Text style={styles.actionButtonText}>테스트 다시하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>고딩테스트 🧠</Text>
        </View>

        {/* 진행률 표시 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>페이지 {Math.floor(adjustedCurrentQuestionIndex / 3) + 1} / 50 (총 150개 문항)</Text>
        </View>

        {/* 콘텐츠 영역 */}
        <View style={styles.contentArea}>
          {/* 현재 페이지의 문항들 */}
          {adjustedPageQuestions.map((question, pageIndex) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{adjustedCurrentQuestionIndex + pageIndex + 1}</Text>
                {question.series && (
                  <View style={styles.seriesBadge}>
                    <Text style={styles.seriesText}>{question.series}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.questionText}>{question.question}</Text>
              
              {/* 답변 옵션들 */}
              <View style={styles.optionsContainer}>
                {/* 가로 막대 그래프 형태의 선택지 */}
                <View style={styles.scaleContainer}>
                  <View style={styles.scaleLabels}>
                    <Text style={styles.scaleLabel}>매우 멀다</Text>
                    <Text style={styles.scaleLabel}>보통이다</Text>
                    <Text style={styles.scaleLabel}>매우 가깝다</Text>
                  </View>
                  <View style={styles.scaleBar}>
                    {question.options.map((_, optionIndex) => (
                      <TouchableOpacity
                        key={optionIndex}
                        style={[
                          styles.scalePoint,
                          selectedOptions[adjustedCurrentQuestionIndex + pageIndex] === optionIndex && styles.scalePointSelected
                        ]}
                        onPress={() => handleAnswer(adjustedCurrentQuestionIndex + pageIndex, optionIndex)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* 테스트 안내 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 테스트 안내</Text>
            <Text style={styles.infoContent}>
              • 총 150개의 문항으로 구성되어 있습니다{'\n'}
              • 각 문항에 솔직하게 답변해주세요{'\n'}
              • 답변 후 자동으로 다음 페이지로 넘어갑니다{'\n'}
              • 모든 문항 완료 후 개인 맞춤 결과를 확인할 수 있습니다
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50', // 고딩픽 브랜드 컬러
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -20,
  },
  questionCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 15,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  seriesBadge: {
    backgroundColor: '#e0f2f7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#a7dbef',
  },
  seriesText: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 20,
  },
  scaleContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  scaleBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scalePoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scalePointSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  recommendationBox: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
