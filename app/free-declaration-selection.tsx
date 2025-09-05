import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FreeDeclarationSelectionScreen() {
  const router = useRouter();

  const handleTestHighschoolStories = () => {
    // 테스트고딩 이야기 화면으로 이동
    router.push('/test-highschool-stories');
  };

  const handleDaeguHighschoolStories = () => {
    // 대구 고딩 이야기 화면으로 이동
    router.push('/daegu-highschool-stories');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>자유선언 💬</Text>
          <Text style={styles.headerSubtitle}>우리학교와 맞닿아 있는 다른 학교 이야기</Text>
        </View>

        {/* 콘텐츠 영역 */}
        <View style={styles.contentArea}>
          {/* 테스트고딩 이야기 */}
          <TouchableOpacity 
            style={styles.selectionCard}
            onPress={handleTestHighschoolStories}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>🧠</Text>
              <Text style={styles.cardTitle}>테스트고딩 이야기</Text>
              <Text style={styles.cardSubtitle}>아주 편한 익명 게시판</Text>
              <Text style={styles.cardDescription}>
                우리 학교 친구들과 일상적인 이야기를 나누고, 학교 주변에 무슨 일이 생기면 
                커뮤니티로 확인할 수 있어요. 편하게 소통해보세요!
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 대구 고딩 이야기 */}
          <TouchableOpacity 
            style={styles.selectionCard}
            onPress={handleDaeguHighschoolStories}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>🏫</Text>
              <Text style={styles.cardTitle}>대구시 고딩 이야기</Text>
              <Text style={styles.cardSubtitle}>대구 지역 고등학생들의 학교생활 이야기</Text>
              <Text style={styles.cardDescription}>
                대구 지역 고등학교 학생들과 학교생활, 수업, 친구들에 대한 
                다양한 이야기를 나누어보세요!
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 안내 카드 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 자유선언 안내</Text>
            <Text style={styles.infoContent}>
              • 익명으로 자유롭게 이야기할 수 있습니다{'\n'}
              • 서로를 배려하는 마음으로 소통해주세요{'\n'}
              • 개인정보나 민감한 내용은 피해주세요{'\n'}
              • 건전하고 유익한 대화를 만들어가요
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
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -20,
  },
  selectionCard: {
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 15,
  },
  arrowText: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
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
