import React, { useEffect, useState } from 'react';
import { Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimetableScreen() {
  // 시간표 모드 상태
  const [timetableMode, setTimetableMode] = useState<'credit' | 'general'>('credit'); // 'credit': 고교학점제, 'general': 일반
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 애니메이션 값들
  const leftDoorAnimation = useState(new Animated.Value(0))[0];
  const rightDoorAnimation = useState(new Animated.Value(0))[0];
  const contentAnimation = useState(new Animated.Value(1))[0];
  
  const [scheduleData, setScheduleData] = useState<{[key: number]: Array<{
    subject: string;
    teacher: string;
    room: string;
    color: string;
    credits?: number; // 학점 추가
    category?: string; // 과목 카테고리 추가
  }>}>({});
  const [loading, setLoading] = useState(true);
  
  // 과목 추가 모달 관련 상태 추가
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false); // 빈칸 선택 모달
  const [subjects, setSubjects] = useState<Array<{id: number, subject_name: string, department_name: string}>>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Array<{id: number, subject_name: string, department_name: string}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [subjectsLoading, setSubjectsLoading] = useState(false); // 로딩 상태 추가
  
  const days = ['월', '화', '수', '목', '금'];
  const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];

  // 모드 전환 애니메이션
  const switchMode = (newMode: 'credit' | 'general') => {
    if (isTransitioning || newMode === timetableMode) return;
    
    setIsTransitioning(true);
    
    // 문이 열리는 애니메이션
    Animated.parallel([
      Animated.timing(leftDoorAnimation, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rightDoorAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnimation, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 모드 변경
      setTimetableMode(newMode);
      
      // 문이 닫히는 애니메이션
      Animated.parallel([
        Animated.timing(leftDoorAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rightDoorAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  // DB에서 시간표 데이터 가져오기
  useEffect(() => {
    fetchScheduleData();
    // 과목 목록은 모달이 열릴 때만 가져오기 (성능 최적화)
  }, []);



  // DB에서 과목 목록 가져오기
  const fetchSubjects = async () => {
    try {
      setSubjectsLoading(true);
      
      const response = await fetch('https://godingpick.com/api/subjects');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.subjects) {
        // 필요한 컬럼만 추출하여 저장
        const processedSubjects = data.subjects.map((subject: any) => ({
          id: subject.id,
          subject_name: subject.subject_name,
          department_name: subject.department_name,
          subject_type: subject.subject_type,
          credit_hours: subject.credit_hours
        }));
        
        setSubjects(processedSubjects);
        setFilteredSubjects(processedSubjects);
      } else {
        console.error('API 응답 구조 오류:', data);
        setSubjects([]);
        setFilteredSubjects([]);
      }
      
    } catch (error) {
      console.error('과목 데이터 로딩 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      Alert.alert(
        '과목 목록 로딩 실패', 
        `서버에서 과목 목록을 가져오는데 실패했습니다.\n\n오류: ${errorMessage}\n\n네트워크 연결과 서버 상태를 확인해주세요.`
      );
      // 오류 발생 시 빈 배열로 설정
      setSubjects([]);
      setFilteredSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchScheduleData = async () => {
    try {
      // 하드코딩된 시간표 데이터 (빈칸용)
      const hardcodedData = [
        // 월요일 - 빈칸
        [],
        // 화요일 - 빈칸
        [],
        // 수요일 - 빈칸
        [],
        // 목요일 - 빈칸
        [],
        // 금요일 - 빈칸
        []
      ];
      

      setScheduleData(hardcodedData);
      setLoading(false);
    } catch (error) {
      console.error('시간표 데이터 로딩 오류:', error);
      Alert.alert('오류', '시간표를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // 과목 검색
  const searchSubjects = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject => 
        subject.subject_name.toLowerCase().includes(query.toLowerCase()) ||
        subject.department_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  };

  // 빈칸 선택 모달 열기
  const openSlotModal = () => {
    setShowSlotModal(true);
  };

  // 과목 추가 모달이 열릴 때 과목 데이터 가져오기
  const openSubjectModal = async (dayIndex: number, periodIndex: number) => {
    setSelectedDay(dayIndex);
    setSelectedPeriod(periodIndex);
    setSearchQuery('');
    
    // 과목 데이터가 없으면 먼저 가져오기
    if (subjects.length === 0) {
      await fetchSubjects();
    } else {
      setFilteredSubjects(subjects);
    }
    
    setShowSubjectModal(true);
  };

  // 빈칸 선택
  const selectSlot = (dayIndex: number, periodIndex: number) => {
    setSelectedDay(dayIndex);
    setSelectedPeriod(periodIndex);
    setShowSlotModal(false);
    
    // 빈칸 선택 후 과목 선택 모달 열기
    openSubjectModal(dayIndex, periodIndex);
  };

  // 과목 선택 및 추가
  const selectSubject = (subject: {id: number, subject_name: string, department_name: string}) => {
    if (selectedDay !== null && selectedPeriod !== null) {
      const newLesson = {
        subject: subject.subject_name,
        teacher: '담당교사', // 기본값
        room: '교실', // 기본값
        color: getRandomColor(),
        credits: 1.0, // 기본 학점
        category: subject.department_name
      };

      const newScheduleData = { ...scheduleData };
      if (!newScheduleData[selectedDay]) {
        newScheduleData[selectedDay] = [];
      }
      
      // 해당 시간에 과목 추가
      newScheduleData[selectedDay][selectedPeriod] = newLesson;
      setScheduleData(newScheduleData);
      
      setShowSubjectModal(false);
      Alert.alert('성공', `${subject.subject_name} 과목이 추가되었습니다.`);
    }
  };

  // 랜덤 색상 생성
  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FFB347'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSubjectPress = (dayIndex: number, periodIndex: number) => {
    const lesson = scheduleData[dayIndex]?.[periodIndex];
    if (lesson) {
      Alert.alert(
        `${lesson.subject}`,
        `담당: ${lesson.teacher}\n교실: ${lesson.room}\n학점: ${lesson.credits || '미정'}\n카테고리: ${lesson.category || '미정'}\n\nVC 자료용 하드코딩된 과목입니다.`,
        [
          { text: '수정', onPress: () => editSubject(dayIndex, periodIndex) },
          { text: '삭제', onPress: () => deleteSubject(dayIndex, periodIndex), style: 'destructive' },
          { text: '취소', style: 'cancel' }
        ]
      );
    } else {
      // 빈 칸 클릭 시 안내 메시지
      Alert.alert('과목 추가', '하단의 "➕ 과목 추가" 버튼을 사용하여 과목을 추가하세요.');
    }
  };

  const addSubject = (dayIndex: number, periodIndex: number) => {
    // 과목 추가 모달 열기
    openSubjectModal(dayIndex, periodIndex);
  };



  const editSubject = (dayIndex: number, periodIndex: number) => {
    // TODO: 과목 수정 모달 또는 화면으로 이동
    Alert.alert('과목 수정', '과목 수정 기능은 추후 개발 예정입니다.');
  };

  const deleteSubject = (dayIndex: number, periodIndex: number) => {
    Alert.alert(
      '과목 삭제',
      '정말로 이 과목을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => {
            const newData = { ...scheduleData };
            if (newData[dayIndex]) {
              newData[dayIndex] = newData[dayIndex].filter((_, index) => index !== periodIndex);
              setScheduleData(newData);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>시간표를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>고딩타임 📚</Text>
          <Text style={styles.headerSubtitle}>
            {timetableMode === 'credit' ? '고교학점제 시행학교' : '일반 시간표'}
          </Text>
          
          {/* 모드 전환 버튼 */}
          <View style={styles.modeSwitchContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                timetableMode === 'credit' && styles.activeModeButton
              ]}
              onPress={() => switchMode('credit')}
              disabled={isTransitioning}
            >
              <Text style={[
                styles.modeButtonText,
                timetableMode === 'credit' && styles.activeModeButtonText
              ]}>
                고교학점제
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modeButton,
                timetableMode === 'general' && styles.activeModeButton
              ]}
              onPress={() => switchMode('general')}
              disabled={isTransitioning}
            >
              <Text style={[
                styles.modeButtonText,
                timetableMode === 'general' && styles.generalActiveModeButtonText
              ]}>
                일반 시간표
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 타임테이블 */}
        <Animated.View 
          style={[
            styles.timetableContainer,
            {
              transform: [
                { scale: contentAnimation },
                { 
                  translateX: Animated.add(
                    Animated.multiply(leftDoorAnimation, 50),
                    Animated.multiply(rightDoorAnimation, 50)
                  )
                }
              ]
            }
          ]}
        >
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
                    onPress={() => handleSubjectPress(dayIndex, periodIndex)}
                  >
                    {lesson && (
                      <>
                        <Text style={[
                          styles.subjectText,
                          { color: '#fff' }
                        ]}>
                          {lesson.subject}
                        </Text>
                        <Text style={styles.teacherText}>
                          {lesson.teacher}
                        </Text>
                        <Text style={styles.roomText}>
                          {lesson.room}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </Animated.View>

        {/* 과목 추가 버튼 */}
        <TouchableOpacity 
          style={[
            styles.addButton,
            timetableMode === 'general' && styles.generalAddButton
          ]} 
          onPress={openSlotModal}
        >
          <Text style={styles.addButtonText}>
            ➕ 과목 추가
          </Text>
        </TouchableOpacity>

        {/* 학점 정보 (고교학점제 모드에서만 표시) */}
        {timetableMode === 'credit' && (
          <View style={styles.creditsSection}>
            <Text style={styles.sectionTitle}>학점 현황</Text>
            <View style={styles.creditsInfo}>
              <View style={styles.creditsItem}>
                <Text style={styles.creditsLabel}>총 학점</Text>
                <Text style={styles.creditsNumber}>
                  {Object.values(scheduleData).flat().reduce((sum, lesson) => sum + (lesson?.credits || 0), 0)}
                </Text>
              </View>
              <View style={styles.creditsItem}>
                <Text style={styles.creditsLabel}>이수 과목</Text>
                <Text style={styles.creditsNumber}>
                  {Object.values(scheduleData).flat().filter(lesson => lesson).length}
                </Text>
              </View>
              <View style={styles.creditsItem}>
                <Text style={styles.creditsLabel}>남은 학점</Text>
                <Text style={styles.creditsNumber}>
                  {Math.max(0, 120 - Object.values(scheduleData).flat().reduce((sum, lesson) => sum + (lesson?.credits || 0), 0))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 일반 시간표 정보 (일반 모드에서만 표시) */}
        {timetableMode === 'general' && (
          <View style={styles.creditsSection}>
            <Text style={styles.sectionTitle}>일정 현황</Text>
            <View style={styles.creditsInfo}>
              <View style={styles.creditsItem}>
                <Text style={styles.creditsLabel}>총 일정</Text>
                <Text style={styles.creditsNumber}>
                  {Object.values(scheduleData).flat().filter(lesson => lesson).length}
                </Text>
              </View>
              <View style={styles.creditsItem}>
                <Text style={styles.creditsLabel}>빈 시간</Text>
                <Text style={styles.creditsNumber}>
                  {35 - Object.values(scheduleData).flat().filter(lesson => lesson).length}
                </Text>
              </View>
              <View style={styles.creditsItem}>
                <Text style={styles.creditsLabel}>이번 주</Text>
                <Text style={styles.creditsNumber}>
                  {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 안내 메시지 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ 안내</Text>
          <Text style={styles.infoText}>
            {timetableMode === 'credit' ? (
              <>
                • 고교학점제 실제 과목들로 구성된 시간표입니다.{'\n'}
                • 이동수업 정보: 과목명, 반, 담당선생님이 표시됩니다.{'\n'}
                • 일반선택: 수학Ⅱ, 영어Ⅱ, 물리학Ⅰ, 화학Ⅰ, 생명과학Ⅰ, 지구과학Ⅰ, 정보{'\n'}
                • 공통과목: 한국사, 체육, 음악, 미술, 진로와직업, 창의적체험활동{'\n'}
                • 각 과목별로 학점과 카테고리가 표시됩니다.{'\n'}
                • 과목을 터치하면 상세 정보를 확인할 수 있습니다.
              </>
            ) : (
              <>
                • 일반 시간표로 개인 일정을 관리할 수 있습니다.{'\n'}
                • 자유롭게 일정을 추가하고 수정할 수 있습니다.{'\n'}
                • 과목, 일정, 약속 등 다양한 용도로 활용하세요.{'\n'}
                • 일정을 터치하면 상세 정보를 확인할 수 있습니다.{'\n'}
                • 색상으로 카테고리를 구분할 수 있습니다.
              </>
            )}
          </Text>
        </View>
      </ScrollView>

      {/* 빈칸 선택 모달 */}
      <Modal
        visible={showSlotModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSlotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>빈칸 선택</Text>
              <TouchableOpacity onPress={() => setShowSlotModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.slotModalDescription}>
              과목을 추가할 빈칸을 선택하세요
            </Text>

            {/* 시간표 그리드 */}
            <View style={styles.slotGrid}>
              {/* 헤더 */}
              <View style={styles.slotHeader}>
                <View style={styles.slotTimeHeader}>
                  <Text style={styles.slotHeaderText}>시간</Text>
                </View>
                {days.map((day, index) => (
                  <View key={index} style={styles.slotDayHeader}>
                    <Text style={styles.slotHeaderText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* 교시별 행 */}
              {periods.map((period, periodIndex) => (
                <View key={periodIndex} style={styles.slotRow}>
                  <View style={styles.slotTimeCell}>
                    <Text style={styles.slotTimeText}>{period}</Text>
                  </View>
                  {days.map((day, dayIndex) => {
                    const lesson = scheduleData[dayIndex]?.[periodIndex];
                    const isEmpty = !lesson;
                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        style={[
                          styles.slotCell,
                          isEmpty ? styles.emptySlot : styles.occupiedSlot
                        ]}
                        onPress={() => isEmpty && selectSlot(dayIndex, periodIndex)}
                        disabled={!isEmpty}
                      >
                        {isEmpty ? (
                          <Text style={styles.emptySlotText}>+</Text>
                        ) : (
                          <Text style={styles.occupiedSlotText}>●</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.slotLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.emptySlot]} />
                <Text style={styles.legendText}>빈칸 (선택 가능)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.occupiedSlot]} />
                <Text style={styles.legendText}>수업 중 (선택 불가)</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 과목 추가 모달 */}
      <Modal
        visible={showSubjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                과목 추가 - {selectedDay !== null && selectedPeriod !== null 
                  ? `${days[selectedDay]}요일 ${periods[selectedPeriod]}`
                  : '시간 선택'
                }
              </Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 검색 입력 */}
            <TextInput
              style={styles.searchInput}
              placeholder="과목명 또는 과명으로 검색..."
              value={searchQuery}
              onChangeText={searchSubjects}
            />

            {/* 과목/일정 목록 */}
            {timetableMode === 'credit' ? (
              subjectsLoading ? (
                <View style={styles.loadingView}>
                  <Text style={styles.loadingText}>과목 목록을 불러오는 중...</Text>
                </View>
              ) : subjects.length === 0 ? (
                <View style={styles.errorView}>
                  <Text style={styles.errorText}>과목 목록을 불러올 수 없습니다.</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchSubjects}
                  >
                    <Text style={styles.retryButtonText}>다시 시도</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredSubjects}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.subjectItem}
                      onPress={() => selectSubject(item)}
                    >
                      <Text style={styles.subjectItemName}>{item.subject_name}</Text>
                      <Text style={styles.subjectItemDept}>{item.department_name}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.subjectList}
                  showsVerticalScrollIndicator={false}
                />
              )
            ) : (
              <View style={styles.generalScheduleContainer}>
                <Text style={styles.generalScheduleText}>
                  일반 시간표 모드에서는 자유롭게 일정을 추가할 수 있습니다.
                </Text>
                <TouchableOpacity
                  style={styles.addCustomScheduleButton}
                  onPress={() => {
                    // TODO: 커스텀 일정 추가 로직
                    Alert.alert('과목 추가', '커스텀 과목 추가 기능은 추후 개발 예정입니다.');
                  }}
                >
                  <Text style={styles.addCustomScheduleButtonText}>+ 새 과목 추가</Text>
                </TouchableOpacity>
              </View>
            )}

            {!subjectsLoading && subjects.length > 0 && filteredSubjects.length === 0 && (
              <Text style={styles.noResults}>검색 결과가 없습니다.</Text>
            )}
          </View>
        </View>
      </Modal>
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
  timetableContainer: {
    backgroundColor: '#f8f9fa',
    margin: 10, // 15에서 10으로 줄임
    padding: 10, // 15에서 10으로 줄임
    borderRadius: 15, // 20에서 15로 줄임
  },
  timetableTitle: {
    fontSize: 18, // 20에서 18로 줄임
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10, // 15에서 10으로 줄임
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: 25, // 20에서 25로 증가 (시간 표시가 잘 보이도록)
  },
  headerText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12, // 11에서 12로 증가
    flexWrap: 'nowrap',
  },
  timeHeaderCell: {
    flex: 0.6, // 0.8에서 0.6으로 줄임
    paddingVertical: 2, // 0에서 2로 증가
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeaderCell: {
    flex: 1,
    paddingVertical: 2, // 0에서 2로 증가
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: 50, // 60에서 50으로 줄임
  },
  timeCell: {
    flex: 0.6, // 0.8에서 0.6으로 줄임
    paddingVertical: 2, // 0에서 2로 증가
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#fff',
    minHeight: 50, // 60에서 50으로 줄임
  },
  subjectCell: {
    flex: 1,
    paddingVertical: 2, // 0에서 2로 증가
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#f8f9fa',
    minHeight: 50, // 60에서 50으로 줄임
  },
  periodText: {
    fontSize: 11, // 12에서 11로 줄임
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 1, // 2에서 1로 줄임
  },
  subjectText: {
    fontSize: 12, // 13에서 12로 줄임
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2, // 3에서 2로 줄임
    flexWrap: 'nowrap',
  },
  teacherText: {
    fontSize: 9, // 10에서 9로 줄임
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 1, // 추가
  },
  roomText: {
    fontSize: 8, // 9에서 8로 줄임
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 1, // 2에서 1로 줄임
  },
  emptyText: {
    fontSize: 11, // 10에서 11으로 증가
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    flexWrap: 'nowrap', // 줄바꿈 방지
  },
  addButton: {
    backgroundColor: '#4CAF50',
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
  creditsSection: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  creditsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  creditsItem: {
    alignItems: 'center',
  },
  creditsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  creditsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  // 모달 스타일 추가
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  subjectList: {
    maxHeight: 400,
  },
  subjectItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subjectItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subjectItemDept: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  // 추가된 스타일
  loadingView: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorView: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // 빈칸 선택 모달 스타일
  slotModalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  slotGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  slotHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  slotTimeHeader: {
    flex: 0.6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotDayHeader: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  slotRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  slotTimeCell: {
    flex: 0.6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#fff',
  },
  slotTimeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  slotCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    minHeight: 40,
  },
  emptySlot: {
    backgroundColor: '#f8f9fa',
  },
  occupiedSlot: {
    backgroundColor: '#e0e0e0',
  },
  emptySlotText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  occupiedSlotText: {
    fontSize: 16,
    color: '#999',
  },
  slotLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  // 모드 전환 스타일
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    marginTop: 15,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeModeButtonText: {
    color: '#4CAF50', // 고교학점제: 초록색
  },
  // 일반 모드 활성화 텍스트 색상
  generalActiveModeButtonText: {
    color: '#FF9800', // 일반 시간표: 오렌지색
  },
  // 일반 모드 버튼 스타일
  generalAddButton: {
    backgroundColor: '#FF9800', // 오렌지색으로 변경 (초록색과 잘 어울림)
  },
  // 일반 시간표 스타일
  generalScheduleContainer: {
    padding: 20,
    alignItems: 'center',
  },
  generalScheduleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  addCustomScheduleButton: {
    backgroundColor: '#FF9800', // 오렌지색으로 변경
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  addCustomScheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});
