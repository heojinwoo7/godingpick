import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CelebritiesScreen() {
  const router = useRouter();

  const handleSubjectRecommendation = () => {
    router.push('/subject-recommendation');
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
          <Text style={styles.headerTitle}>고딩 루트 🚀</Text>
          <Text style={styles.headerSubtitle}>나만의 진로 길 찾기</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 고딩테스트 */}
          <TouchableOpacity 
            style={styles.mainCard}
            onPress={() => router.push('/highschool-test')}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                🧠 고딩테스트
              </Text>
              <Text style={styles.cardDescription}>
                저희 테스트는 <Text style={styles.highlightText}>Carl Jung</Text>의 심리유형 이론, <Text style={styles.highlightText}>RIASEC</Text> 진로탐색 모델, 그리고 <Text style={styles.highlightText}>Big Five</Text> 성격검사를 기반으로 설계되었습니다. 이를 통해 학생 개개인의 성향을 다각도로 진단하고, 학점제 과목 선택과 진로 설계에 최적화된 맞춤형 솔루션을 제공합니다.
              </Text>
            </View>
          </TouchableOpacity>

          {/* 과목 추천 */}
          <TouchableOpacity 
            style={styles.mainCard}
            onPress={handleSubjectRecommendation}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                📚 과목 추천
              </Text>
              <Text style={styles.cardSubtitle}>
                고딩테스트 기반 해당 학교 개설 과목
              </Text>
              <Text style={styles.cardDescription}>
                인문/사회, 의과, 공학 등 계열별 맞춤 과목 추천
              </Text>
            </View>
          </TouchableOpacity>

          {/* 컨설팅 */}
          <TouchableOpacity style={styles.mainCard}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                💼 입시 컨설팅
              </Text>
              <Text style={styles.cardSubtitle}>
                과목 기반 맞춤 대학 입시 상담
              </Text>
              <Text style={styles.cardDescription}>
                고딩테스트 결과와 과목추천을 바탕으로 한 맞춤형 입시 전략을 제공합니다. 학생의 성향과 선택한 과목을 분석하여 최적의 대학과 학과를 추천하고, 성공적인 대학 진학을 위한 맞춤형 로드맵을 제시합니다.
              </Text>
            </View>
          </TouchableOpacity>
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
    paddingTop: 20, // 상단 여백 조정
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
  mainCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  highlightText: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#4CAF50', // 강조 색상
    fontSize: 14, // 강조 폰트 크기
  },
  highlightText2: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#FFD700', // 더 눈에 띄는 강조 색상 (예: 금색)
    fontSize: 14, // 강조 폰트 크기
  },
});
