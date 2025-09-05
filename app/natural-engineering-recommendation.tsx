import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface RecommendedSubject {
  id: string;
  name: string;
  category: string;
  description: string;
  reason: string;
  difficulty: string;
  credits: number;
}

export default function NaturalEngineeringRecommendationScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<RecommendedSubject | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 개인 맞춤 추천 과목 데이터
  const recommendedSubjects: RecommendedSubject[] = [
    {
      id: '1',
      name: '수학',
      category: '일반선택',
      description: '수학적 사고와 논리적 추론 능력을 기르는 핵심 과목입니다.',
      reason: '당신의 논리적 사고 성향과 문제 해결 능력을 고려하여 추천합니다.',
      difficulty: '보통',
      credits: 3
    },
    {
      id: '2',
      name: '과학탐구실험',
      category: '일반선택',
      description: '실험을 통한 과학적 탐구 방법과 태도를 기르는 과목입니다.',
      reason: '실험적이고 탐구적인 성향이 강하여 이 과목이 적합합니다.',
      difficulty: '보통',
      credits: 2
    },
    {
      id: '3',
      name: '물리학',
      category: '일반선택',
      description: '물질의 구조와 힘, 에너지 개념을 학습하는 과목입니다.',
      reason: '물리적 현상에 대한 호기심과 분석적 사고가 뛰어납니다.',
      difficulty: '어려움',
      credits: 3
    },
    {
      id: '4',
      name: '화학',
      category: '일반선택',
      description: '원자의 구조와 물질의 성질을 이해하는 과목입니다.',
      reason: '화학적 변화에 대한 관찰력과 실험적 성향이 우수합니다.',
      difficulty: '보통',
      credits: 3
    },
    {
      id: '5',
      name: '기술가정',
      category: '일반선택',
      description: '생활 속 기술과 가정의 역할을 이해하는 과목입니다.',
      reason: '실용적이고 창의적인 문제 해결 능력이 뛰어납니다.',
      difficulty: '쉬움',
      credits: 2
    },
    {
      id: '6',
      name: '정보과학',
      category: '융합선택',
      description: '정보과학의 기본 원리와 프로그래밍을 학습하는 과목입니다.',
      reason: '디지털 기술에 대한 관심과 논리적 사고가 우수합니다.',
      difficulty: '보통',
      credits: 3
    },
    {
      id: '7',
      name: '역학과 에너지',
      category: '진로선택',
      description: '힘과 운동, 에너지 보존 법칙을 탐구하는 과목입니다.',
      reason: '물리적 원리에 대한 깊은 이해와 수학적 사고가 뛰어납니다.',
      difficulty: '어려움',
      credits: 3
    },
    {
      id: '8',
      name: '융합과학 탐구',
      category: '융합선택',
      description: '과학·수학·기술을 융합하여 문제를 탐구하는 과목입니다.',
      reason: '다양한 분야를 연결하는 융합적 사고 능력이 우수합니다.',
      difficulty: '보통',
      credits: 3
    }
  ];

  const handleSubjectPress = (subject: RecommendedSubject) => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>자연공학 맞춤 추천 🔬</Text>
          <Text style={styles.headerSubtitle}>당신에게 최적화된 과목들</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 추천 안내 메시지 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 개인 맞춤 추천 결과</Text>
            <Text style={styles.infoContent}>
              고딩테스트 결과를 바탕으로 당신의 성향과 적성에 맞는 자연공학 계열 과목들을 추천합니다. 각 과목을 클릭하면 상세 정보와 추천 이유를 확인할 수 있습니다.
            </Text>
          </View>

          {/* 추천 과목 리스트 */}
          {recommendedSubjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={styles.subjectCard}
              onPress={() => handleSubjectPress(subject)}
            >
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{subject.name}</Text>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(subject.category) }
                ]}>
                  <Text style={styles.categoryText}>{subject.category}</Text>
                </View>
              </View>
              
              <Text style={styles.subjectDescription}>{subject.description}</Text>
              
              <View style={styles.subjectFooter}>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>난이도: {subject.difficulty}</Text>
                </View>
                <View style={styles.creditsBadge}>
                  <Text style={styles.creditsText}>{subject.credits}학점</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 과목 상세 정보 모달 */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSubject && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedSubject.name}</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalHeaderRow}>
                    <View style={[
                      styles.modalCategoryBadge,
                      { backgroundColor: getCategoryColor(selectedSubject.category) }
                    ]}>
                      <Text style={styles.modalCategoryText}>{selectedSubject.category}</Text>
                    </View>
                    <View style={styles.modalInfoBadges}>
                      <View style={styles.modalDifficultyBadge}>
                        <Text style={styles.modalDifficultyText}>난이도: {selectedSubject.difficulty}</Text>
                      </View>
                      <View style={styles.modalCreditsBadge}>
                        <Text style={styles.modalCreditsText}>{selectedSubject.credits}학점</Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.modalDescription}>{selectedSubject.description}</Text>
                  
                  <View style={styles.reasonSection}>
                    <Text style={styles.reasonTitle}>🎯 추천 이유</Text>
                    <Text style={styles.reasonText}>{selectedSubject.reason}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 카테고리별 색상 반환 함수
const getCategoryColor = (category: string): string => {
  switch (category) {
    case '일반선택':
      return '#4ECDC4';
    case '진로선택':
      return '#45B7D1';
    case '융합선택':
      return '#96CEB4';
    default:
      return '#999';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4ECDC4', // 자연공학 테마 색상
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
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -20,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
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
  subjectCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 15,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  subjectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: '#D68910',
    fontWeight: '600',
  },
  creditsBadge: {
    backgroundColor: '#DDA0DD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  creditsText: {
    fontSize: 12,
    color: '#8B008B',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    padding: 5,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalCategoryBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  modalCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalInfoBadges: {
    alignItems: 'flex-end',
  },
  modalDifficultyBadge: {
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 5,
  },
  modalDifficultyText: {
    fontSize: 12,
    color: '#D68910',
    fontWeight: '600',
  },
  modalCreditsBadge: {
    backgroundColor: '#DDA0DD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  modalCreditsText: {
    fontSize: 12,
    color: '#8B008B',
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  reasonSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
