import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    id: 1, // 임시로 1 설정
    name: '사용자',
    email: 'user@example.com',
    school: '테스트 고등학교',
    grade: '2학년',
    class: '3반'
  });

  // 컴포넌트 마운트 시 AsyncStorage에서 사용자 정보 로드
  useEffect(() => {
    loadUserInfoFromStorage();
  }, []);

  // AsyncStorage에서 사용자 정보 로드
  const loadUserInfoFromStorage = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const storedUserInfo = JSON.parse(userInfoStr);
        
        // 사용자 정보 업데이트
        setUserInfo({
          id: storedUserInfo.id || 1,
          name: storedUserInfo.name || '사용자',
          email: storedUserInfo.email || 'user@example.com',
          school: storedUserInfo.school || '테스트 고등학교',
          grade: storedUserInfo.grade || '2학년',
          class: storedUserInfo.class || '3반'
        });
        
        // 프로필 업데이트 데이터도 설정
        setProfileUpdateData(prev => ({
          ...prev,
          name: storedUserInfo.name || '',
          phone: storedUserInfo.phone || '',
          birthDate: storedUserInfo.birthDate || ''
        }));
      }
    } catch (error) {
      console.error('AsyncStorage에서 사용자 정보 로드 오류:', error);
    }
  };

  // 회원정보 변경 모달용 상태
  const [profileUpdateData, setProfileUpdateData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    schoolName: '',
    educationLevel: '',
    grade: '',
    classNumber: '',
    attendanceNumber: '',
    teacherName: ''
  });

  // 학교/교사 검색 관련 상태
  const [schoolSearchResults, setSchoolSearchResults] = useState<Array<{
    id: number;
    name: string;
    province: string;
    district: string;
    school_type: string;
    establishment_type: string;
  }>>([]);
  const [teacherSearchResults, setTeacherSearchResults] = useState<Array<{
    id: number;
    name: string;
    subject: string;
  }>>([]);

  // 프로필 수정 상태
  const [editProfile, setEditProfile] = useState({
    name: userInfo.name,
    phone: '010-1234-5678',
    birthDate: '2006-01-01'
  });

  // 회원정보 조회 함수
  const fetchUserProfile = async () => {
    try {

      
      // AsyncStorage에서 사용자 정보 가져오기
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
      
      const storedUserInfo = JSON.parse(userInfoStr);
      
      // 실제 API 호출로 JOIN된 데이터 가져오기
      try {
        const response = await fetch(`https://godingpick.com/api/users/${storedUserInfo.id}/profile`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.profile) {
            const profile = data.profile;
            
            // JOIN된 데이터로 프로필 설정
            const newProfileData = {
              name: profile.name || storedUserInfo.name,
              phone: profile.phone || storedUserInfo.phone,
              birthDate: profile.birthDate || storedUserInfo.birthDate,
              schoolName: profile.student?.school?.name || storedUserInfo.school,
              educationLevel: '고등학교',
              grade: profile.student?.grade?.toString() || storedUserInfo.grade?.replace('학년', '') || '',
              classNumber: profile.student?.class_number?.toString() || storedUserInfo.class?.replace('반', '') || '',
              attendanceNumber: profile.student?.attendance_number?.toString() || '1',
              teacherName: profile.student?.teacher_name || '담임교사'
            };
            

            setProfileUpdateData(newProfileData);
            return;
          }
        }
      } catch (apiError) {

      }
      
      // API 실패 시 AsyncStorage 데이터 사용 (기존 로직)
      const newProfileData = {
        name: storedUserInfo.name || '',
        phone: storedUserInfo.phone || '',
        birthDate: storedUserInfo.birthDate || '',
        schoolName: storedUserInfo.school || '',
        educationLevel: '고등학교',
        grade: storedUserInfo.grade?.replace('학년', '') || '',
        classNumber: storedUserInfo.class?.replace('반', '') || '',
        attendanceNumber: '1', // 임시값
        teacherName: '담임교사' // 임시값
      };
      

      setProfileUpdateData(newProfileData);
      
    } catch (error) {
      console.error('회원정보 조회 오류:', error);
      Alert.alert('오류', '회원정보를 불러오는데 실패했습니다.');
    }
  };

  // 학교 검색 함수
  const searchSchools = async (query: string) => {
    try {
      if (!query || query.length < 2) {
        setSchoolSearchResults([]);
        return;
      }


      const response = await fetch(`https://godingpick.com/api/schools/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      

      
      if (data.success && data.schools) {
        setSchoolSearchResults(data.schools);

      } else {
        console.error('학교 검색 API 오류:', data);
        setSchoolSearchResults([]);
      }
    } catch (error) {
      console.error('학교 검색 오류:', error);
      setSchoolSearchResults([]);
    }
  };

  // 교사 검색 함수
  const searchTeachers = async (query: string) => {
    try {
      if (!query || query.length < 2) {
        setTeacherSearchResults([]);
        return;
      }

      // 임시로 하드코딩된 교사 데이터 사용
      const mockTeachers = [
        { id: 1, name: '김선생님', subject: '수학' },
        { id: 2, name: '이선생님', subject: '국어' },
        { id: 3, name: '박선생님', subject: '영어' },
        { id: 4, name: '최선생님', subject: '과학' },
        { id: 5, name: '정선생님', subject: '사회' },
      ].filter(teacher => 
        teacher.name.includes(query) || teacher.subject.includes(query)
      );
      
      setTeacherSearchResults(mockTeachers);
    } catch (error) {
      console.error('교사 검색 오류:', error);
    }
  };

  // 회원정보 변경 저장 함수 수정
  const handleProfileUpdate = async () => {
    try {

      
      // AsyncStorage에서 현재 사용자 정보 가져오기
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (!userInfoStr) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
      
      const currentUserInfo = JSON.parse(userInfoStr);
      
      // 업데이트된 사용자 정보 생성
      const updatedUserInfo = {
        ...currentUserInfo,
        name: profileUpdateData.name,
        phone: profileUpdateData.phone,
        birthDate: profileUpdateData.birthDate,
        school: profileUpdateData.schoolName,
        grade: `${profileUpdateData.grade}학년`,
        class: `${profileUpdateData.classNumber}반`
      };
      

      
      // AsyncStorage에 업데이트된 정보 저장
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      
      // 로컬 상태 업데이트
      setUserInfo(prev => ({
        ...prev,
        name: profileUpdateData.name,
        school: profileUpdateData.schoolName,
        grade: `${profileUpdateData.grade}학년`,
        class: `${profileUpdateData.classNumber}반`
      }));
      
      // TODO: 실제 API 호출로 변경 (현재는 AsyncStorage만 사용)
      // const response = await fetch(`https://godingpick.com/api/users/${currentUserInfo.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileUpdateData)
      // });
      
      setShowProfileUpdateModal(false);
      Alert.alert('성공', '회원정보가 성공적으로 변경되었습니다.');
      

      
    } catch (error) {
      console.error('회원정보 변경 오류:', error);
      Alert.alert('오류', '회원정보 변경 중 오류가 발생했습니다.');
    }
  };

  // 설정 메뉴 항목들
  const settingsMenuItems = [
    {
      title: '프로필 수정',
      icon: '👤',
      onPress: () => setShowProfileModal(true)
    },
    {
      title: '회원정보 변경',
      icon: '📝',
      onPress: () => {
        fetchUserProfile(); // 기존 데이터 불러오기
        setShowProfileUpdateModal(true);
      }
    },
    {
      title: '알림 설정',
      icon: '🔔',
      onPress: () => Alert.alert('알림 설정', '알림 설정 기능은 추후 개발 예정입니다.')
    },
    {
      title: '개인정보 처리방침',
      icon: '📋',
      onPress: () => Alert.alert('개인정보 처리방침', '개인정보 처리방침은 추후 개발 예정입니다.')
    },
    {
      title: '이용약관',
      icon: '📄',
      onPress: () => Alert.alert('이용약관', '이용약관은 추후 개발 예정입니다.')
    },
    {
      title: '앱 정보',
      icon: 'ℹ️',
      onPress: () => Alert.alert('앱 정보', '고딩픽 v1.0.0\n고교학점제 지원 앱')
    }
  ];

  // 로그아웃 처리
  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: async () => {
            try {
              // AsyncStorage에서 사용자 정보 및 토큰만 삭제 (아이디 기억은 유지)
              await AsyncStorage.removeItem('userInfo');
              await AsyncStorage.removeItem('authToken');
              // await AsyncStorage.removeItem('savedEmail'); // 아이디 기억을 위해 주석 처리
              // await AsyncStorage.removeItem('rememberEmail'); // 아이디 기억을 위해 주석 처리
              
              // 로그인 화면으로 이동
              router.replace('/login');
            } catch (error) {
              console.error('로그아웃 오류:', error);
              // 오류 발생 시에도 로그인 화면으로 이동
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  // 프로필 수정 저장
  const handleSaveProfile = () => {
    setUserInfo(prev => ({
      ...prev,
      name: editProfile.name
    }));
    setShowProfileModal(false);
    Alert.alert('성공', '프로필이 수정되었습니다.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 - 완전히 초록색으로 통일 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>고딩픽</Text>
          <Text style={styles.headerSubtitle}>고등학생을 위한 모든 것</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 사용자 정보 카드 */}
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{userInfo.name}</Text>
              <Text style={styles.userDetails}>
                {userInfo.school} • {userInfo.grade} {userInfo.class}
              </Text>
              <Text style={styles.userEmail}>{userInfo.email}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setShowProfileModal(true)}
            >
              <Text style={styles.editProfileButtonText}>수정</Text>
            </TouchableOpacity>
          </View>

          {/* 환영 메시지 */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>안녕하세요! 👋</Text>
            <Text style={styles.welcomeText}>오늘도 고딩픽과 함께 즐거운 하루를 보내세요!</Text>
          </View>

          {/* 오늘의 팁 */}
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>오늘의 팁 💡</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>효율적인 공부법</Text>
              <Text style={styles.tipText}>
                포모도로 기법을 활용해보세요! 25분 집중 공부 후 5분 휴식을 반복하면 
                집중력과 효율성을 높일 수 있어요.
              </Text>
            </View>
          </View>

          {/* 설정 메뉴 */}
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>설정 ⚙️</Text>
            {settingsMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingsMenuItem}
                onPress={item.onPress}
              >
                <Text style={styles.settingsMenuIcon}>{item.icon}</Text>
                <Text style={styles.settingsMenuText}>{item.title}</Text>
                <Text style={styles.settingsMenuArrow}>›</Text>
              </TouchableOpacity>
            ))}
            
            {/* 로그아웃 버튼 */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>🚪 로그아웃</Text>
            </TouchableOpacity>
          </View>

          {/* 최근 활동 */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>최근 활동 📱</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>📚</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>수학 과제 완료</Text>
                  <Text style={styles.activityTime}>2시간 전</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🏃</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>체육 시간 참여</Text>
                  <Text style={styles.activityTime}>4시간 전</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>🎨</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>미술 작품 업로드</Text>
                  <Text style={styles.activityTime}>1일 전</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 프로필 수정 모달 */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>프로필 수정</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>이름</Text>
              <TextInput
                style={styles.textInput}
                value={editProfile.name}
                onChangeText={(text) => setEditProfile(prev => ({ ...prev, name: text }))}
                placeholder="이름을 입력하세요"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>전화번호</Text>
              <TextInput
                style={styles.textInput}
                value={editProfile.phone}
                onChangeText={(text) => setEditProfile(prev => ({ ...prev, phone: text }))}
                placeholder="전화번호를 입력하세요"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>생년월일</Text>
              <TextInput
                style={styles.textInput}
                value={editProfile.birthDate}
                onChangeText={(text) => setEditProfile(prev => ({ ...prev, birthDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 회원정보 변경 모달 */}
      <Modal
        visible={showProfileUpdateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>회원정보 변경</Text>
              <TouchableOpacity onPress={() => setShowProfileUpdateModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.name}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, name: text }))}
                  placeholder="이름을 입력하세요"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.phone}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, phone: text }))}
                  placeholder="전화번호를 입력하세요"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>생년월일</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.birthDate}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, birthDate: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              
              {/* 학교명 검색 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학교명</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    value={profileUpdateData.schoolName}
                    onChangeText={(text) => {
                      setProfileUpdateData(prev => ({ ...prev, schoolName: text }));
                      searchSchools(text);
                    }}
                    placeholder="학교명을 입력하세요"
                  />
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => searchSchools(profileUpdateData.schoolName)}
                  >
                    <Text style={styles.searchButtonText}>검색</Text>
                  </TouchableOpacity>
                </View>
                {schoolSearchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {schoolSearchResults.slice(0, 3).map((school) => (
                      <TouchableOpacity
                        key={school.id}
                        style={styles.searchResultItem}
                        onPress={() => {
                          setProfileUpdateData(prev => ({ ...prev, schoolName: school.name }));
                          setSchoolSearchResults([]);
                        }}
                      >
                        <Text style={styles.searchResultText}>{school.name}</Text>
                        <Text style={styles.searchResultSubtext}>{school.province} • {school.district}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>교육단계</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.educationLevel}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, educationLevel: text }))}
                  placeholder="교육단계를 입력하세요"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학년</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.grade}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, grade: text }))}
                  placeholder="학년을 입력하세요"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>반</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.classNumber}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, classNumber: text }))}
                  placeholder="반을 입력하세요"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>출석번호</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileUpdateData.attendanceNumber}
                  onChangeText={(text) => setProfileUpdateData(prev => ({ ...prev, attendanceNumber: text }))}
                  placeholder="출석번호를 입력하세요"
                  keyboardType="numeric"
                />
              </View>
              
              {/* 교사명 검색 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>교사명</Text>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={profileUpdateData.teacherName}
                    onChangeText={(text) => {
                      setProfileUpdateData(prev => ({ ...prev, teacherName: text }));
                      searchTeachers(text);
                    }}
                    placeholder="담임교사명을 입력하세요"
                  />
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => searchTeachers(profileUpdateData.teacherName)}
                  >
                    <Text style={styles.searchButtonText}>검색</Text>
                  </TouchableOpacity>
                </View>
                {teacherSearchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {teacherSearchResults.slice(0, 3).map((teacher) => (
                      <TouchableOpacity
                        key={teacher.id}
                        style={styles.searchResultItem}
                        onPress={() => {
                          setProfileUpdateData(prev => ({ ...prev, teacherName: teacher.name }));
                          setTeacherSearchResults([]);
                        }}
                      >
                        <Text style={styles.searchResultText}>{teacher.name}</Text>
                        <Text style={styles.searchResultSubtext}>{teacher.subject} 담당</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowProfileUpdateModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleProfileUpdate}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  contentArea: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    paddingTop: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: '#999',
  },
  editProfileButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  tipSection: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsMenuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  settingsMenuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  settingsMenuArrow: {
    fontSize: 18,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  recentSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 14,
    color: '#999',
  },
  // 모달 스타일
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 검색 관련 스타일
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchResults: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    maxHeight: 120,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchResultSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
