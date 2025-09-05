import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubjectRecommendationScreen() {
  const router = useRouter();

  const handleSubjectDescription = (major: string) => {
    console.log('과목 설명 선택:', major);
    
    if (major === '자연공학') {
      router.push('/natural-engineering-subjects');
    }
    // 다른 계열들도 여기에 추가할 수 있습니다
  };

  const handlePersonalRecommendation = (major: string) => {
    console.log('개인 맞춤 추천 선택:', major);
    // 개인 맞춤 추천 로직 구현
  };

  const handleNaturalEngineeringRecommendation = () => {
    console.log('자연공학 개인 맞춤 추천 선택');
    router.push('/natural-engineering-recommendation');
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
          <Text style={styles.headerTitle}>과목 추천 📚</Text>
          <Text style={styles.headerSubtitle}>계열을 선택해주세요</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 인문사회 계열 */}
          <View style={styles.majorSection}>
            <View style={[styles.majorCard, styles.humanitiesSocial]}>
              <Text style={styles.majorIcon}>📖</Text>
              <Text style={styles.majorTitle}>인문사회</Text>
              <Text style={styles.majorSubtitle}>인문 + 사회 + 교육</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.descriptionButton]}
                onPress={() => handleSubjectDescription('인문사회')}
              >
                <Text style={styles.buttonText}>과목 설명</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.recommendationButton]}
                onPress={() => handlePersonalRecommendation('인문사회')}
              >
                <Text style={styles.buttonText}>나에게 맞는 과목{'\n'}추천 받기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 자연공학 계열 */}
          <View style={styles.majorSection}>
            <View style={[styles.majorCard, styles.naturalEngineering]}>
              <Text style={styles.majorIcon}>🔬</Text>
              <Text style={styles.majorTitle}>자연공학</Text>
              <Text style={styles.majorSubtitle}>자연 + 공학</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.descriptionButton]}
                onPress={() => handleSubjectDescription('자연공학')}
              >
                <Text style={styles.buttonText}>과목 설명</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.recommendationButton]}
                onPress={() => handleNaturalEngineeringRecommendation()}
              >
                <Text style={styles.buttonText}>나에게 맞는 과목{'\n'}추천 받기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 의약 계열 */}
          <View style={styles.majorSection}>
            <View style={[styles.majorCard, styles.medical]}>
              <Text style={styles.majorIcon}>🏥</Text>
              <Text style={styles.majorTitle}>의약</Text>
              <Text style={styles.majorSubtitle}>의학 + 약학</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.descriptionButton]}
                onPress={() => handleSubjectDescription('의약')}
              >
                <Text style={styles.buttonText}>과목 설명</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.recommendationButton]}
                onPress={() => handlePersonalRecommendation('의약')}
              >
                <Text style={styles.buttonText}>나에게 맞는 과목{'\n'}추천 받기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 예체능 계열 */}
          <View style={styles.majorSection}>
            <View style={[styles.majorCard, styles.artsSports]}>
              <Text style={styles.majorIcon}>🎨</Text>
              <Text style={styles.majorTitle}>예체능</Text>
              <Text style={styles.majorSubtitle}>예술 + 체육</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.descriptionButton]}
                onPress={() => handleSubjectDescription('예체능')}
              >
                <Text style={styles.buttonText}>과목 설명</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.recommendationButton]}
                onPress={() => handlePersonalRecommendation('예체능')}
              >
                <Text style={styles.buttonText}>나에게 맞는 과목{'\n'}추천 받기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 안내 메시지 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 안내</Text>
            <Text style={styles.infoContent}>
              • 고딩테스트 결과를 바탕으로 맞춤 과목을 추천합니다{'\n'}
              • "과목 설명"을 통해 각 계열의 세부 과목을 확인할 수 있습니다{'\n'}
              • "나에게 맞는 과목 추천 받기"로 개인 맞춤 과목을 추천받을 수 있습니다{'\n'}
              • 각 과목별로 학점, 교육과정, 진로 연계 정보를 제공합니다
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
    backgroundColor: '#4CAF50', // 전체 배경을 초록색으로
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 탭바 공간 확보
  },
  header: {
    backgroundColor: 'transparent', // 배경색 제거 (container에서 상속)
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
    backgroundColor: '#fff', // 흰색 배경
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -20, // 헤더와 연결
  },
  majorSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  majorCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 120,
  },
  humanitiesSocial: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  naturalEngineering: {
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  medical: {
    borderLeftWidth: 4,
    borderLeftColor: '#45B7D1',
  },
  artsSports: {
    borderLeftWidth: 4,
    borderLeftColor: '#96CEB4',
  },
  majorIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  majorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  majorSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center', // 세로 가운데 정렬 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 50, // 최소 높이 설정으로 세로 정렬 개선
  },
  descriptionButton: {
    backgroundColor: '#4ECDC4',
  },
  recommendationButton: {
    backgroundColor: '#45B7D1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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
});
