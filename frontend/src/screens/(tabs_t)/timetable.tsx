import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherTimetableScreen() {
  // 과학 선생님용 시간표 데이터 (다양한 과목으로 나누기)
  const scheduleData: {[key: number]: Array<{
    subject: string;
    teacher: string;
    room: string;
    color: string;
    credits?: number;
    category?: string;
  } | null>} = {
    0: [ // 월요일 - 1,3,5,7교시만
      { subject: '통합과학', teacher: '김과학', room: '2-1', color: '#FF6B6B' },
      null,
      { subject: '물리학', teacher: '김과학', room: '2-3', color: '#4ECDC4' },
      null,
      { subject: '화학', teacher: '김과학', room: '2-5', color: '#45B7D1' },
      null,
      { subject: '생명과학', teacher: '김과학', room: '2-7', color: '#96CEB4' },
    ],
    1: [ // 화요일 - 2,4,6교시만
      null,
      { subject: '지구과학', teacher: '김과학', room: '1-2', color: '#FFEAA7' },
      null,
      { subject: '역학과 에너지', teacher: '김과학', room: '1-4', color: '#FF9FF3' },
      null,
      { subject: '전자기와 양자', teacher: '김과학', room: '1-6', color: '#FECA57' },
      null,
    ],
    2: [ // 수요일 - 1,3,5교시만
      { subject: '물질과 에너지', teacher: '김과학', room: '3-1', color: '#48DB71' },
      null,
      { subject: '화학반응의 세계', teacher: '김과학', room: '3-3', color: '#FF6B9D' },
      null,
      { subject: '세포와 물질대사', teacher: '김과학', room: '3-5', color: '#4ECDC4' },
      null,
      null,
    ],
    3: [ // 목요일 - 2,4,6교시만
      null,
      { subject: '생물의 유전', teacher: '김과학', room: '2-2', color: '#A8E6CF' },
      null,
      { subject: '지구시스템과학', teacher: '김과학', room: '2-4', color: '#FFB3BA' },
      null,
      { subject: '행성우주과학', teacher: '김과학', room: '2-6', color: '#B8E6B8' },
      null,
    ],
    4: [ // 금요일 - 1,3,5교시만
      { subject: '과학의 역사와 문화', teacher: '김과학', room: '1-1', color: '#DDA0DD' },
      null,
      { subject: '기후 변화와 환경생태', teacher: '김과학', room: '1-3', color: '#98D8C8' },
      null,
      { subject: '융합과학 탐구', teacher: '김과학', room: '1-5', color: '#F7DC6F' },
      null,
      null,
    ],
  };

  const days = ['월', '화', '수', '목', '금'];
  const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>교사타임 📚</Text>
          <Text style={styles.headerSubtitle}>교사용 시간표 관리</Text>
        </View>

        {/* 타임테이블 */}
        <View style={styles.timetableContainer}>
          {/* 테이블 헤더 (요일) */}
          <View style={styles.tableHeader}>
            <View style={styles.timeHeaderCell}>
              <Text style={styles.headerText}>시간</Text>
            </View>
            {days.map((day, index) => (
              <View key={index} style={styles.dayHeaderCell}>
                <Text style={styles.headerText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* 테이블 행들 (교시별) */}
          {periods.map((period, periodIndex) => (
            <View key={periodIndex} style={styles.tableRow}>
              {/* 시간 컬럼 */}
              <View style={styles.timeCell}>
                <Text style={styles.periodText}>{period}</Text>
              </View>
              
              {/* 각 요일별 과목 */}
              {days.map((day, dayIndex) => {
                const lesson = scheduleData[dayIndex]?.[periodIndex];
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.subjectCell,
                      { backgroundColor: lesson?.color || '#f8f9fa' }
                    ]}
                    onPress={() => Alert.alert('과목 추가', '시간표의 빈 칸을 터치하여 과목을 추가하세요.')}
                  >
                    <Text style={[
                      styles.subjectText,
                      { color: lesson ? '#fff' : '#999' }
                    ]}>
                      {lesson?.subject || '+'}
                    </Text>
                    {lesson && (
                      <>
                        <Text style={styles.teacherText}>
                          {lesson.teacher}
                        </Text>
                        <Text style={styles.roomText}>
                          {lesson.room}
                        </Text>
                      </>
                    )}
                    {!lesson && (
                      <Text style={styles.emptyText}>
                        과목 추가
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* 과목 추가 버튼 */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => Alert.alert('과목 추가', '시간표의 빈 칸을 터치하여 과목을 추가하세요.')}
        >
          <Text style={styles.addButtonText}>➕ 과목 추가</Text>
        </TouchableOpacity>

        {/* 하단 여백 추가 */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3', // 파란색으로 변경 (교사용)
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
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
  timetableContainer: {
    backgroundColor: '#f8f9fa',
    margin: 10,
    padding: 10,
    borderRadius: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD', // 연한 파란색으로 변경
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: 25,
  },
  timeHeaderCell: {
    flex: 0.6,
    paddingVertical: 2,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderCell: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
    flexWrap: 'nowrap',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: 50,
  },
  timeCell: {
    flex: 0.6,
    paddingVertical: 2,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#fff',
    minHeight: 50,
  },
  subjectCell: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: 50,
  },
  periodText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2196F3', // 파란색으로 변경
    marginBottom: 1,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    flexWrap: 'nowrap',
  },
  teacherText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 1,
  },
  roomText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 1,
  },
  emptyText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    flexWrap: 'nowrap',
  },
  addButton: {
    backgroundColor: '#2196F3', // 파란색으로 변경
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
});
