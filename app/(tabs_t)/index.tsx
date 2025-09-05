// app/(tabs_t)/index.tsx
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TeacherInfo {
  id: number;
  name: string;
  teacherNumber: string;
  school: {
    name: string;
    province: string;
    district: string;
  };
  position: string;
  subjects: string[];
  homeroomClass?: {
    grade: number;
    classNumber: number;
  };
}

export default function TeacherHomeScreen() {
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 더미 데이터 (하드코딩)
  const dummyTeacherInfo: TeacherInfo = {
    id: 1,
    name: '교사진우',
    teacherNumber: 'T000001',
    school: {
      name: '테스트고등학교',
      province: '서울특별시',
      district: '강남구'
    },
    position: '교과',
    subjects: ['수학과', '정보과'],
    homeroomClass: {
      grade: 2,
      classNumber: 3
    }
  };

  useEffect(() => {
    loadTeacherInfo();
  }, []);

  const loadTeacherInfo = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 교체
      // const response = await fetch(`https://godingpick.com/api/teachers/profile`);
      // const data = await response.json();
      // setTeacherInfo(data);
      
      // 임시로 더미 데이터 사용
      setTimeout(() => {
        setTeacherInfo(dummyTeacherInfo);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('교사 정보 로드 오류:', error);
      setTeacherInfo(dummyTeacherInfo);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeacherInfo();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>교사 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!teacherInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>교사 정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTeacherInfo}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>안녕하세요, {teacherInfo.name} 선생님!</Text>
          <Text style={styles.subGreeting}>오늘도 좋은 하루 되세요.</Text>
        </View>

        {/* 교사 기본 정보 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>교사 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>교사번호:</Text>
            <Text style={styles.infoValue}>{teacherInfo.teacherNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>직책:</Text>
            <Text style={styles.infoValue}>{teacherInfo.position}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>소속학교:</Text>
            <Text style={styles.infoValue}>{teacherInfo.school.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>위치:</Text>
            <Text style={styles.infoValue}>{teacherInfo.school.province} {teacherInfo.school.district}</Text>
          </View>
        </View>

        {/* 담당 과목 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>담당 과목</Text>
          <View style={styles.subjectsContainer}>
            {teacherInfo.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectTag}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 담임반 정보 카드 */}
        {teacherInfo.homeroomClass && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>담임반</Text>
            <View style={styles.homeroomInfo}>
              <Text style={styles.homeroomText}>
                {teacherInfo.homeroomClass.grade}학년 {teacherInfo.homeroomClass.classNumber}반
              </Text>
              <TouchableOpacity style={styles.viewClassButton}>
                <Text style={styles.viewClassButtonText}>반 관리하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 빠른 액션 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>빠른 액션</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📚 시간표 보기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>👥 학생 관리</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📊 성적 관리</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 오늘 일정 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>오늘 일정</Text>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>09:00 - 09:50</Text>
            <Text style={styles.scheduleText}>2학년 3반 수학 수업</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>10:00 - 10:50</Text>
            <Text style={styles.scheduleText}>1학년 2반 수학 수업</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>14:00 - 15:00</Text>
            <Text style={styles.scheduleText}>교사 회의</Text>
          </View>
        </View>

        {/* 하단 여백 추가 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subjectTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subjectText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  homeroomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeroomText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  viewClassButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewClassButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  scheduleText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  bottomPadding: {
    height: 100, // 하단 여백을 위한 빈 뷰
  },
});
