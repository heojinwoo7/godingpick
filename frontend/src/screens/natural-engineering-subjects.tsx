import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Subject {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function NaturalEngineeringSubjectsScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 자연공학 과목 데이터 (공통 제외)
  const subjects: Subject[] = [
    {
      id: '1',
      name: '과학탐구실험1',
      category: '일반선택',
      description: '과학적 탐구 방법을 실험을 통해 학습한다. 문제를 설정하고 자료를 수집·분석하는 과정을 경험한다. 과학적 태도와 협력적 탐구 능력을 기른다.'
    },
    {
      id: '2',
      name: '과학탐구실험2',
      category: '일반선택',
      description: '심화된 실험 활동으로 과학적 개념을 구체적으로 이해한다. 과학적 자료를 분석하고 해석하는 능력을 키운다. 탐구 결과를 발표하며 의사소통 능력을 기른다.'
    },
    {
      id: '3',
      name: '물리학',
      category: '일반선택',
      description: '물질의 구조와 힘, 에너지 개념을 학습한다. 물리 현상을 수학적으로 분석한다. 탐구와 실험을 통해 논리적 사고를 기른다.'
    },
    {
      id: '4',
      name: '화학',
      category: '일반선택',
      description: '원자의 구조와 물질의 성질을 이해한다. 화학 반응과 에너지 변화를 탐구한다. 실생활과 연계하여 화학의 유용성을 인식한다.'
    },
    {
      id: '5',
      name: '생명과학',
      category: '일반선택',
      description: '생명체의 구조와 기능을 이해한다. 생명 현상의 원리를 탐구한다. 생태계와 인간 삶의 관계를 고찰한다.'
    },
    {
      id: '6',
      name: '지구과학',
      category: '일반선택',
      description: '지구의 구조와 변화를 학습한다. 기후, 대기, 해양 등 자연 현상을 탐구한다. 환경 문제 해결을 위한 과학적 시각을 기른다.'
    },
    {
      id: '7',
      name: '역학과 에너지',
      category: '진로선택',
      description: '힘과 운동, 에너지 보존 법칙을 탐구한다. 실험과 수학적 모델링을 통해 물리 개념을 이해한다. 공학적 현상과 연계하여 사고를 확장한다.'
    },
    {
      id: '8',
      name: '전자기와 양자',
      category: '진로선택',
      description: '전자기와 파동, 양자 세계의 원리를 학습한다. 실험을 통해 물리학의 현대적 개념을 탐구한다. 첨단 과학 기술과의 관련성을 이해한다.'
    },
    {
      id: '9',
      name: '물질과 에너지',
      category: '진로선택',
      description: '물질의 구조와 화학 결합을 탐구한다. 에너지의 이동과 전환을 이해한다. 화학적 사고와 실험 능력을 기른다.'
    },
    {
      id: '10',
      name: '화학반응의 세계',
      category: '진로선택',
      description: '화학 반응의 원리를 학습한다. 다양한 반응 유형과 속도를 이해한다. 생활 속 화학의 의미를 탐구한다.'
    },
    {
      id: '11',
      name: '세포와 물질대사',
      category: '진로선택',
      description: '세포의 구조와 물질대사를 탐구한다. 생명체의 에너지 흐름을 이해한다. 건강과 관련된 생명과학적 지식을 기른다.'
    },
    {
      id: '12',
      name: '생물의 유전',
      category: '진로선택',
      description: '유전의 원리를 학습한다. 생명의 다양성과 진화를 탐구한다. 생명공학의 응용 가능성을 이해한다.'
    },
    {
      id: '13',
      name: '지구시스템과학',
      category: '진로선택',
      description: '지구 시스템의 상호작용을 학습한다. 대기·해양·지권의 변화를 탐구한다. 지속가능한 환경을 위한 시각을 기른다.'
    },
    {
      id: '14',
      name: '행성우주과학',
      category: '진로선택',
      description: '우주의 기원과 구조를 학습한다. 행성과 별, 은하의 운동을 탐구한다. 인간과 우주의 관계를 고찰한다.'
    },
    {
      id: '15',
      name: '과학의 역사와 문화',
      category: '융합선택',
      description: '과학의 발달 과정과 문화적 의미를 이해한다. 역사 속 과학자들의 업적을 탐구한다. 과학과 인문학의 융합적 시각을 기른다.'
    },
    {
      id: '16',
      name: '기후 변화와 환경생태',
      category: '융합선택',
      description: '기후 변화의 원인과 영향을 학습한다. 환경 생태계의 지속 가능성을 탐구한다. 과학적 해결 방안을 모색한다.'
    },
    {
      id: '17',
      name: '융합과학 탐구',
      category: '융합선택',
      description: '과학·수학·기술을 융합하여 문제를 탐구한다. 창의적 설계와 실험을 통해 해결책을 찾는다. 협력적 탐구와 발표를 경험한다.'
    },
    {
      id: '18',
      name: '전문 수학',
      category: '융합선택',
      description: '수학의 전문적 개념과 원리를 학습한다. 문제 해결 과정에서 논리적 사고와 창의성을 기른다. 고급 학문과 진학에 필요한 기초를 다진다.'
    },
    {
      id: '19',
      name: '이산수학',
      category: '융합선택',
      description: '불연속적 자료를 다루는 수학의 한 분야를 학습한다. 알고리즘과 정보 과학의 기반을 이해한다. 수학적 모델링과 실제 적용 능력을 기른다.'
    },
    {
      id: '20',
      name: '고급 대수',
      category: '융합선택',
      description: '고급 대수의 구조와 원리를 탐구한다. 수식 전개와 증명 능력을 기른다. 수학적 사고의 깊이와 넓이를 확장한다.'
    },
    {
      id: '21',
      name: '고급 미적분',
      category: '융합선택',
      description: '함수의 극한과 미분, 적분을 심화 학습한다. 수학적 원리를 문제 해결에 적용한다. 학문·공학 분야 진학에 필요한 역량을 기른다.'
    },
    {
      id: '22',
      name: '고급 기하',
      category: '융합선택',
      description: '도형과 공간에 대한 고급 이론을 학습한다. 추론과 증명 능력을 기른다. 수학적 직관과 창의성을 함양한다.'
    },
    {
      id: '23',
      name: '고급 물리학',
      category: '융합선택',
      description: '물리학의 근본 법칙을 심화 학습한다. 역학·전자기·열·파동 등 물리 현상을 분석한다. 실험과 탐구를 통해 과학적 태도를 기른다.'
    },
    {
      id: '24',
      name: '고급 화학',
      category: '융합선택',
      description: '화학의 기본 원리와 반응을 고급 수준에서 학습한다. 물질의 구조와 변화를 심화 탐구한다. 실험을 통한 분석 능력을 기른다.'
    },
    {
      id: '25',
      name: '고급 생명과학',
      category: '융합선택',
      description: '생명 과학의 구조와 기능을 심화 학습한다. 세포·유전·생태를 고급 수준에서 탐구한다. 실험적 탐구 능력과 생명 윤리를 기른다.'
    },
    {
      id: '26',
      name: '고급 지구과학',
      category: '융합선택',
      description: '지구과학의 다양한 영역을 심화 학습한다. 지구 시스템과 천체 현상을 탐구한다. 과학적 탐구와 환경적 이해를 기른다.'
    },
    {
      id: '27',
      name: '과학과제 연구',
      category: '융합선택',
      description: '과학적 문제를 주제로 연구 과제를 수행한다. 자료 수집·분석·발표를 통해 탐구 역량을 기른다. 자기 주도적 연구 태도를 형성한다.'
    },
    {
      id: '28',
      name: '정보과학',
      category: '융합선택',
      description: '정보과학의 기본 원리와 프로그래밍을 학습한다. 문제 해결을 위한 알고리즘을 설계한다. 디지털 사회에 필요한 정보 활용 능력을 기른다.'
    },
    {
      id: '29',
      name: '물리학 실험',
      category: '융합선택',
      description: '물리학의 실험을 설계하고 수행한다. 측정과 분석 능력을 기른다. 탐구를 통해 물리학적 개념을 심화한다.'
    },
    {
      id: '30',
      name: '화학 실험',
      category: '융합선택',
      description: '화학의 실험을 계획하고 수행한다. 화학 반응을 정량적으로 분석한다. 탐구적 사고와 실험 기술을 기른다.'
    },
    {
      id: '31',
      name: '생명과학 실험',
      category: '융합선택',
      description: '생명과학 실험을 수행하며 자료를 수집·분석한다. 생명 현상의 원리를 탐구한다. 과학적 탐구 태도를 기른다.'
    },
    {
      id: '32',
      name: '지구과학 실험',
      category: '융합선택',
      description: '지구과학 실험을 수행한다. 자료를 분석하여 지구 현상을 설명한다. 탐구 과정에서 환경적 이해를 기른다.'
    }
  ];

  const handleSubjectPress = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
  };

  const handleSyllabusPress = (subject: Subject) => {
    // 실라버스 페이지로 이동하는 로직 추가
    console.log(`Syllabus for ${subject.name} pressed.`);
    // 예시: router.push('/syllabus');
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
          <Text style={styles.headerTitle}>자연공학 과목 🔬</Text>
          <Text style={styles.headerSubtitle}>자연 + 공학 계열 과목 목록</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 과목 리스트 */}
          {subjects.map((subject) => (
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
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 과목 설명 모달 */}
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
                    <TouchableOpacity 
                      style={styles.syllabusButton}
                      onPress={() => handleSyllabusPress(selectedSubject)}
                    >
                      <Text style={styles.syllabusButtonText}>실라버스</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalDescription}>{selectedSubject.description}</Text>
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
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  modalCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  syllabusButton: {
    backgroundColor: '#45B7D1', // 진로선택 테마 색상
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  syllabusButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});
