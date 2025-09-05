// app/(tabs_t)/students.tsx
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Student {
  id: number;
  name: string;
  studentNumber: string;
  grade: number;
  classNumber: number;
  attendanceNumber: number;
  phone: string;
  parentPhone: string;
  subjects: string[];
  attendance: {
    present: number;
    absent: number;
    late: number;
  };
  grades: {
    [subject: string]: number;
  };
}

export default function StudentManagementScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // 더미 데이터 (하드코딩)
  const dummyStudents: Student[] = [
    {
      id: 1,
      name: '김학생',
      studentNumber: 'S000001',
      grade: 2,
      classNumber: 3,
      attendanceNumber: 1,
      phone: '010-1234-5678',
      parentPhone: '010-8765-4321',
      subjects: ['수학', '정보'],
      attendance: { present: 45, absent: 2, late: 1 },
      grades: { '수학': 85, '정보': 92 }
    },
    {
      id: 2,
      name: '이학생',
      studentNumber: 'S000002',
      grade: 2,
      classNumber: 3,
      attendanceNumber: 2,
      phone: '010-2345-6789',
      parentPhone: '010-9876-5432',
      subjects: ['수학', '정보'],
      attendance: { present: 42, absent: 5, late: 2 },
      grades: { '수학': 78, '정보': 88 }
    },
    {
      id: 3,
      name: '박학생',
      studentNumber: 'S000003',
      grade: 2,
      classNumber: 3,
      attendanceNumber: 3,
      phone: '010-3456-7890',
      parentPhone: '010-0987-6543',
      subjects: ['수학', '정보'],
      attendance: { present: 48, absent: 0, late: 0 },
      grades: { '수학': 95, '정보': 96 }
    },
    {
      id: 4,
      name: '최학생',
      studentNumber: 'S000004',
      grade: 1,
      classNumber: 2,
      attendanceNumber: 1,
      phone: '010-4567-8901',
      parentPhone: '010-1098-7654',
      subjects: ['수학'],
      attendance: { present: 35, absent: 3, late: 1 },
      grades: { '수학': 82 }
    },
    {
      id: 5,
      name: '정학생',
      studentNumber: 'S000005',
      grade: 1,
      classNumber: 2,
      attendanceNumber: 2,
      phone: '010-5678-9012',
      parentPhone: '010-2109-8765',
      subjects: ['수학'],
      attendance: { present: 38, absent: 1, late: 0 },
      grades: { '수학': 89 }
    }
  ];

  useEffect(() => {
    // TODO: 실제 API 호출로 교체
    setTimeout(() => {
      setStudents(dummyStudents);
      setLoading(false);
    }, 500);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchQuery) || 
                         student.studentNumber.includes(searchQuery);
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'grade2') return student.grade === 2 && matchesSearch;
    if (selectedFilter === 'grade1') return student.grade === 1 && matchesSearch;
    if (selectedFilter === 'class3') return student.classNumber === 3 && matchesSearch;
    if (selectedFilter === 'class2') return student.classNumber === 2 && matchesSearch;
    
    return matchesSearch;
  });

  const getAttendanceRate = (attendance: Student['attendance']) => {
    const total = attendance.present + attendance.absent + attendance.late;
    return total > 0 ? Math.round((attendance.present / total) * 100) : 0;
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#4CAF50';
    if (grade >= 80) return '#2196F3';
    if (grade >= 70) return '#FF9800';
    return '#F44336';
  };

  const renderStudentCard = ({ item: student }: { item: Student }) => (
    <View style={styles.studentCard}>
      {/* 학생 기본 정보 */}
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentNumber}>{student.studentNumber}</Text>
        </View>
        <View style={styles.classInfo}>
          <Text style={styles.classText}>
            {student.grade}학년 {student.classNumber}반 {student.attendanceNumber}번
          </Text>
        </View>
      </View>

      {/* 연락처 정보 */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>학생: {student.phone}</Text>
        <Text style={styles.contactLabel}>보호자: {student.parentPhone}</Text>
      </View>

      {/* 담당 과목 */}
      <View style={styles.subjectsContainer}>
        <Text style={styles.subjectsTitle}>담당 과목:</Text>
        <View style={styles.subjectTags}>
          {student.subjects.map((subject, index) => (
            <View key={index} style={styles.subjectTag}>
              <Text style={styles.subjectText}>{subject}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 출석 정보 */}
      <View style={styles.attendanceContainer}>
        <Text style={styles.attendanceTitle}>출석률: {getAttendanceRate(student.attendance)}%</Text>
        <View style={styles.attendanceDetails}>
          <Text style={styles.attendanceText}>출석: {student.attendance.present}일</Text>
          <Text style={styles.attendanceText}>결석: {student.attendance.absent}일</Text>
          <Text style={styles.attendanceText}>지각: {student.attendance.late}일</Text>
        </View>
      </View>

      {/* 성적 정보 */}
      <View style={styles.gradesContainer}>
        <Text style={styles.gradesTitle}>성적 현황:</Text>
        <View style={styles.gradeItems}>
          {Object.entries(student.grades).map(([subject, grade]) => (
            <View key={subject} style={styles.gradeItem}>
              <Text style={styles.gradeSubject}>{subject}</Text>
              <Text style={[styles.gradeScore, { color: getGradeColor(grade) }]}>
                {grade}점
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📊 성적 입력</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📞 연락처</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>📝 메모</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>학생 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>학생 관리</Text>
        <Text style={styles.headerSubtitle}>담당 학생 정보 및 관리</Text>
      </View>

      {/* 검색 및 필터 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="학생명 또는 학번으로 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'all' && styles.selectedFilterButton]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'all' && styles.selectedFilterButtonText]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'grade2' && styles.selectedFilterButton]}
            onPress={() => setSelectedFilter('grade2')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'grade2' && styles.selectedFilterButtonText]}>
              2학년
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'grade1' && styles.selectedFilterButton]}
            onPress={() => setSelectedFilter('grade1')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'grade1' && styles.selectedFilterButtonText]}>
              1학년
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'class3' && styles.selectedFilterButton]}
            onPress={() => setSelectedFilter('class3')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'class3' && styles.selectedFilterButtonText]}>
              3반
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, selectedFilter === 'class2' && styles.selectedFilterButton]}
            onPress={() => setSelectedFilter('class2')}
          >
            <Text style={[styles.filterButtonText, selectedFilter === 'class2' && styles.selectedFilterButtonText]}>
              2반
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 학생 목록 */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.studentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.studentListContent}
      />

      {/* 하단 통계 */}
      <View style={styles.bottomStats}>
        <Text style={styles.statsText}>
          총 {filteredStudents.length}명의 학생
        </Text>
      </View>
    </View>
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
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: '#fff',
  },
  studentList: {
    flex: 1,
  },
  studentListContent: {
    padding: 15,
  },
  studentCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studentNumber: {
    fontSize: 14,
    color: '#666',
  },
  classInfo: {
    alignItems: 'flex-end',
  },
  classText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  subjectsContainer: {
    marginBottom: 15,
  },
  subjectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subjectText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceContainer: {
    marginBottom: 15,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  attendanceDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  attendanceText: {
    fontSize: 14,
    color: '#666',
  },
  gradesContainer: {
    marginBottom: 20,
  },
  gradesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  gradeItems: {
    flexDirection: 'row',
    gap: 15,
  },
  gradeItem: {
    alignItems: 'center',
  },
  gradeSubject: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  gradeScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  bottomStats: {
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});



