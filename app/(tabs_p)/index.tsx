// app/(tabs_p)/index.tsx
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Child {
  id: number;
  name: string;
  grade: number;
  classNumber: number;
  school: string;
  recentGrades: {
    [subject: string]: number;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
  };
}

interface ParentInfo {
  id: number;
  name: string;
  phone: string;
  email: string;
  children: Child[];
}

export default function ParentHomeScreen() {
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 더미 데이터 (하드코딩)
  const dummyParentInfo: ParentInfo = {
    id: 1,
    name: '학부모',
    phone: '010-8765-4321',
    email: 'parent@test.com',
    children: [
      {
        id: 1,
        name: '김학생',
        grade: 2,
        classNumber: 3,
        school: '테스트고등학교',
        recentGrades: {
          '수학': 87,
          '정보': 94,
          '영어': 82
        },
        attendance: {
          present: 45,
          absent: 2,
          late: 1
        }
      },
      {
        id: 2,
        name: '이학생',
        grade: 1,
        classNumber: 2,
        school: '테스트고등학교',
        recentGrades: {
          '수학': 84,
          '국어': 89
        },
        attendance: {
          present: 38,
          absent: 1,
          late: 0
        }
      }
    ]
  };

  useEffect(() => {
    loadParentInfo();
  }, []);

  const loadParentInfo = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 교체
      // const response = await fetch(`https://godingpick.com/api/parents/profile`);
      // const data = await response.json();
      // setParentInfo(data);
      
      // 임시로 더미 데이터 사용
      setTimeout(() => {
        setParentInfo(dummyParentInfo);
        if (dummyParentInfo.children.length > 0) {
          setSelectedChild(dummyParentInfo.children[0].id);
        }
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('부모 정보 로드 오류:', error);
      setParentInfo(dummyParentInfo);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadParentInfo();
    setRefreshing(false);
  };

  const getAttendanceRate = (attendance: Child['attendance']) => {
    const total = attendance.present + attendance.absent + attendance.late;
    return total > 0 ? Math.round((attendance.present / total) * 100) : 0;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#4CAF50';
    if (grade >= 80) return '#2196F3';
    if (grade >= 70) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>부모 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!parentInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>부모 정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadParentInfo}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentChild = parentInfo.children.find(child => child.id === selectedChild);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {parentInfo.name}님!</Text>
        <Text style={styles.subGreeting}>자녀의 학교생활을 모니터링하세요.</Text>
      </View>

      {/* 자녀 선택 */}
      {parentInfo.children.length > 1 && (
        <View style={styles.childSelector}>
          <Text style={styles.childSelectorTitle}>자녀 선택</Text>
          <View style={styles.childButtons}>
            {parentInfo.children.map(child => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childButton,
                  selectedChild === child.id && styles.selectedChildButton
                ]}
                onPress={() => setSelectedChild(child.id)}
              >
                <Text style={[
                  styles.childButtonText,
                  selectedChild === child.id && styles.selectedChildButtonText
                ]}>
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 선택된 자녀 정보 */}
      {currentChild && (
        <>
          {/* 자녀 기본 정보 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{currentChild.name} 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>학교:</Text>
              <Text style={styles.infoValue}>{currentChild.school}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>학년/반:</Text>
              <Text style={styles.infoValue}>
                {currentChild.grade}학년 {currentChild.classNumber}반
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>출석률:</Text>
              <Text style={styles.infoValue}>
                {getAttendanceRate(currentChild.attendance)}%
              </Text>
            </View>
          </View>

          {/* 최근 성적 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>최근 성적</Text>
            <View style={styles.gradesContainer}>
              {Object.entries(currentChild.recentGrades).map(([subject, grade]) => (
                <View key={subject} style={styles.gradeItem}>
                  <Text style={styles.gradeSubject}>{subject}</Text>
                  <Text style={[styles.gradeScore, { color: getGradeColor(grade) }]}>
                    {grade}점
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 출석 현황 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>출석 현황</Text>
            <View style={styles.attendanceContainer}>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>출석</Text>
                <Text style={styles.attendanceValue}>{currentChild.attendance.present}일</Text>
              </View>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>결석</Text>
                <Text style={styles.attendanceValue}>{currentChild.attendance.absent}일</Text>
              </View>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>지각</Text>
                <Text style={styles.attendanceValue}>{currentChild.attendance.late}일</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* 빠른 액션 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>빠른 액션</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📚 시간표 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📊 성적 상세보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 실라버스</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 최근 학교 소식 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>최근 학교 소식</Text>
        <View style={styles.newsItem}>
          <Text style={styles.newsTitle}>2024학년도 1학기 중간고사 안내</Text>
          <Text style={styles.newsDate}>2024.04.15</Text>
        </View>
        <View style={styles.newsItem}>
          <Text style={styles.newsTitle}>봄맞이 체육대회 개최</Text>
          <Text style={styles.newsDate}>2024.04.10</Text>
        </View>
        <View style={styles.newsItem}>
          <Text style={styles.newsTitle}>학부모 상담주간 안내</Text>
          <Text style={styles.newsDate}>2024.04.05</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
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
  childSelector: {
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
  childSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  childButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  childButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedChildButton: {
    backgroundColor: '#FF6B35',
  },
  childButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedChildButtonText: {
    color: '#fff',
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
  gradesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  gradeItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  gradeSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  gradeScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attendanceItem: {
    alignItems: 'center',
  },
  attendanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  attendanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
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
  newsItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  newsTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
});



