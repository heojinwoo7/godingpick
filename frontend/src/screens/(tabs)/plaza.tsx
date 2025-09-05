import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlazaScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>고딩광장 🏫</Text>
          <Text style={styles.headerSubtitle}>우리 반 이야기</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 1-1 급훈 */}
          <View style={styles.mottoCard}>
            <Text style={styles.mottoTitle}>1-1 급훈</Text>
            <Text style={styles.mottoText}>"열심히 공부하면 배우자가 바뀐다"</Text>
            <Text style={styles.mottoAuthor}>- 담임선생님</Text>
          </View>

          {/* 공지 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📢 공지</Text>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>오늘 종례시간 안내</Text>
              <Text style={styles.noticeContent}>
                오늘 종례시간에 반장 선거 관련해서 간단한 안내가 있습니다. 
                모두 교실에 모여서 듣고 가세요.
              </Text>
              <Text style={styles.noticeDate}>2025.04.15</Text>
            </View>
            
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>체육대회 참가 신청</Text>
              <Text style={styles.noticeContent}>
                체육대회 종목별 참가 신청을 받습니다. 
                원하는 종목이 있으면 담임선생님께 말씀해주세요.
              </Text>
              <Text style={styles.noticeDate}>2025.04.14</Text>
            </View>
          </View>

          {/* 알림장 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 알림장</Text>
            <View style={styles.diaryCard}>
              <Text style={styles.diaryTitle}>수행평가 제출 안내</Text>
              <Text style={styles.diaryContent}>
                국어 수행평가 '독서 에세이' 제출 마감일이 다음 주 월요일입니다. 
                아직 제출하지 않은 학생은 빠뜨리지 마세요.
              </Text>
              <View style={styles.diaryFooter}>
                <Text style={styles.diaryAuthor}>- 국어 담당교사</Text>
                <Text style={styles.diaryDate}>2025.04.15</Text>
              </View>
            </View>
            
            <View style={styles.diaryCard}>
              <Text style={styles.diaryTitle}>활동보고서 제출</Text>
              <Text style={styles.diaryContent}>
                봉사활동 보고서 제출 기한이 이번 주 금요일까지입니다. 
                봉사시간 인증서와 함께 제출해주세요.
              </Text>
              <View style={styles.diaryFooter}>
                <Text style={styles.diaryAuthor}>- 담임선생님</Text>
                <Text style={styles.diaryDate}>2025.04.15</Text>
              </View>
            </View>

            <View style={styles.diaryCard}>
              <Text style={styles.diaryTitle}>수강신청 안내</Text>
              <Text style={styles.diaryContent}>
                다음 학기 수강신청이 내일부터 시작됩니다. 
                희망 과목을 미리 확인하고 신청 일정을 체크하세요.
              </Text>
              <View style={styles.diaryFooter}>
                <Text style={styles.diaryAuthor}>- 교무실</Text>
                <Text style={styles.diaryDate}>2025.04.15</Text>
              </View>
            </View>

            <View style={styles.diaryCard}>
              <Text style={styles.diaryTitle}>중간고사 일정 안내</Text>
              <Text style={styles.diaryContent}>
                다음 주 월요일부터 중간고사가 시작됩니다. 
                각 과목별 시험 시간표를 확인하고 준비하세요.
              </Text>
              <View style={styles.diaryFooter}>
                <Text style={styles.diaryAuthor}>- 교무실</Text>
                <Text style={styles.diaryDate}>2025.04.15</Text>
              </View>
            </View>
          </View>

          {/* 반 게시판 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 반 게시판</Text>
            <View style={styles.boardCard}>
              <Text style={styles.boardContent}>
                여러분, 오늘도 열심히 공부하자! 
                우리 반이 최고가 될 수 있어요 💪
              </Text>
              <View style={styles.boardFooter}>
                <Text style={styles.boardAuthor}>- 담임선생님</Text>
                <Text style={styles.boardDate}>2025.04.15</Text>
              </View>
            </View>
            
            <View style={styles.boardCard}>
              <Text style={styles.boardContent}>
                내일 점심에 같이 밥 먹을 사람? 
                학교 앞 새로 생긴 분식집 가보자!
              </Text>
              <View style={styles.boardFooter}>
                <Text style={styles.boardAuthor}>- 박준호</Text>
                <Text style={styles.boardDate}>2025.04.15</Text>
              </View>
            </View>
            
            <View style={styles.boardCard}>
              <Text style={styles.boardContent}>
                수학 숙제 어려워서 고민 중인데, 
                도와줄 수 있는 사람 있나요? 😅
              </Text>
              <View style={styles.boardFooter}>
                <Text style={styles.boardAuthor}>- 최수진</Text>
                <Text style={styles.boardDate}>2025.04.15</Text>
              </View>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 20, // 상단 여백 조정
    paddingBottom: 30,
    alignItems: 'center',
    // 배경색 제거 (container에서 이미 초록색)
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
    backgroundColor: '#f8f9fa', // 콘텐츠 영역을 흰색으로
    borderTopLeftRadius: 20, // 상단 모서리 둥글게
    borderTopRightRadius: 20,
    flex: 1,
    paddingTop: 20,
  },
  mottoCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  mottoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  mottoText: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  mottoAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  noticeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 15,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  noticeContent: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  noticeDate: {
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  diaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 15,
  },
  diaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  diaryContent: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  diaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  diaryAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  diaryDate: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  boardCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 15,
  },
  boardContent: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  boardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  boardAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  boardDate: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
});


