// app/signup/teacher.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function TeacherSignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // 기본 정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // 교사 정보
  const [schoolName, setSchoolName] = useState('');
  const [position, setPosition] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [certificationVerified, setCertificationVerified] = useState(false);
  
  // 학교 검색 관련
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<Array<{
    id: number;
    name: string;
    province: string;
    district: string;
    school_type: string;
    establishment_type: string;
  }>>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  
  // 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  // 드롭다운 상태
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const positions = ['담임', '교과', '상담', '생활지도', '진로', '특수'];
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  // 과목 목록 불러오기 함수
  const fetchSubjects = async () => {
    try {
      const response = await fetch('https://godingpick.com/api/subjects');
      const data = await response.json();
      
      if (data.success && data.subjects) {
        const subjectNames = data.subjects.map((subject: any) => subject.subject_name);
        setSubjectOptions(subjectNames);
      } else {
        // API 실패 시 기본 과목 목록 사용
        setSubjectOptions([
          '연극', '정보과통신과', '체육과', '융복합지식재산과', '경영금융과', '기계과', '전기전자과', '재료과', 
          '영어과', '국어과', '정보과', '환경안전소방과', '섬유의류과', '식품조리과', '수학과', '사회과', '과학과', 
          '건축토목과', '미용과', '한문과', '기술가정과', '수산해운과', '보건복지과', '예술과', '농림축산과', 
          '교양과', '공통', '제2외국어과', '화학공업과', '문화예술디자인방송과', '관광레저과', '도덕과'
        ]);
      }
    } catch (error) {
      // 오류 발생 시 기본 과목 목록 사용
      setSubjectOptions([
        '연극', '정보과통신과', '체육과', '융복합지식재산과', '경영금융과', '기계과', '전기전자과', '재료과', 
        '영어과', '국어과', '정보과', '환경안전소방과', '섬유의류과', '식품조리과', '수학과', '사회과', '과학과', 
        '건축토목과', '미용과', '한문과', '기술가정과', '수산해운과', '보건복지과', '예술과', '농림축산과', 
        '교양과', '공통', '제2외국어과', '화학공업과', '문화예술디자인방송과', '관광레저과', '도덕과'
      ]);
    }
  };

  // 컴포넌트 마운트 시 과목 목록 불러오기
  React.useEffect(() => {
    fetchSubjects();
  }, []);

  // 학교 검색 함수
  const searchSchools = async (query: string) => {
    if (query.length < 2) {
      setFilteredSchools([]);
      return;
    }
    
    try {
      const response = await fetch(`https://godingpick.com/api/schools/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('API 호출 실패');
      }
      
      const data = await response.json();
      
      if (data.success && data.schools) {
        setFilteredSchools(data.schools);
      } else {
        setFilteredSchools([]);
      }
    } catch (error) {
      console.error('학교 검색 오류:', error);
      setFilteredSchools([]);
    }
  };

  // 학교 선택 함수
  const selectSchool = (school: any) => {
    setSelectedSchool(school);
    setSchoolName(school.name);
    setShowSchoolSearch(false);
    setSchoolSearchQuery('');
    setFilteredSchools([]);
  };

  // 학교 검색 모달 렌더링
  const renderSchoolSearchModal = () => (
    <Modal
      visible={showSchoolSearch}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSchoolSearch(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>학교 검색</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSchoolSearch(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            placeholder="학교명, 지역 등을 입력하세요"
            value={schoolSearchQuery}
            onChangeText={(text) => {
              console.log('학교 검색 입력:', text);
              setSchoolSearchQuery(text);
              searchSchools(text);
            }}
            style={styles.searchInput}
            autoFocus={true}
          />
          
          <FlatList
            data={filteredSchools}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.schoolItem}
                onPress={() => selectSchool(item)}
              >
                <Text style={styles.schoolItemText}>{item.name}</Text>
                <Text style={styles.schoolItemSubText}>
                  {item.province} {item.district}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.schoolList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {schoolSearchQuery.length < 2 
                    ? '두 글자 이상 입력해주세요' 
                    : '검색 결과가 없습니다'}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const handleNext = () => {
    if (step === 1) {
      // 약관 동의 검사
      if (!termsAgreed || !privacyAgreed) {
        Alert.alert('오류', '필수 약관에 동의해주세요.');
        return;
      }
    }
    
    if (step === 2) {
      // 기본 정보 검사
      if (!email || !password || !passwordConfirm || !name) {
        Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
        return;
      }
      if (password !== passwordConfirm) {
        Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
        return;
      }
      
      // 교사 정보 검사
      if (!schoolName || !position || subjects.length === 0) {
        Alert.alert('오류', '모든 필수 항목을 입력해주세요.');
        return;
      }
      
      // 모든 검사 통과 시 회원가입 진행
      handleSignUp();
      return;
    }
    
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await fetch('https://godingpick.com/api/auth/signup/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          birthDate,
          schoolName,
          position,
          subjects
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('회원가입 성공', data.message, [
          {
            text: '확인',
            onPress: () => router.replace('/login')
          }
        ]);
      } else {
        Alert.alert('회원가입 실패', data.error || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const toggleSubject = (subject: string) => {
    if (subjects.includes(subject)) {
      setSubjects(subjects.filter(s => s !== subject));
    } else {
      setSubjects([...subjects, subject]);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>약관 동의</Text>
      
      <View style={styles.agreementItem}>
        <Switch
          value={termsAgreed}
          onValueChange={setTermsAgreed}
          trackColor={{ false: '#ddd', true: '#FF9800' }}
        />
        <Text style={styles.agreementText}>
          이용약관 동의 <Text style={styles.required}>*</Text>
        </Text>
      </View>
      
      <View style={styles.agreementItem}>
        <Switch
          value={privacyAgreed}
          onValueChange={setPrivacyAgreed}
          trackColor={{ false: '#ddd', true: '#FF9800' }}
        />
        <Text style={styles.agreementText}>
          개인정보 수집·이용 동의 <Text style={styles.required}>*</Text>
        </Text>
      </View>
      
      <View style={styles.agreementItem}>
        <Switch
          value={marketingAgreed}
          onValueChange={setMarketingAgreed}
          trackColor={{ false: '#ddd', true: '#FF9800' }}
        />
        <Text style={styles.agreementText}>
          마케팅 수신 동의
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>기본 정보</Text>
      
      <TextInput
        placeholder="이메일 *"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <TextInput
        placeholder="비밀번호 *"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <TextInput
        placeholder="비밀번호 확인 *"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <TextInput
        placeholder="이름 *"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <TextInput
        placeholder="전화번호"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <TextInput
        placeholder="생년월일 (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
        returnKeyType="done"
        blurOnSubmit={true}
      />

      <Text style={styles.stepTitle}>교사 정보</Text>
      
      {/* 학교명 입력 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>학교명 *</Text>
        <TextInput
          placeholder="학교 검색 버튼을 누르세요"
          value={schoolName}
          onChangeText={setSchoolName}
          style={styles.input}
          returnKeyType="done"
          blurOnSubmit={true}
          editable={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSchoolSearch(true)}
        >
          <Text style={styles.searchButtonText}>학교 검색</Text>
        </TouchableOpacity>
      </View>

      {/* 직책 선택 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>직책 *</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowPositionDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {position || '직책을 선택하세요'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* 담당과 선택 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>담당과 *</Text>
        <Text style={styles.inputSubLabel}>담당하는 과를 선택해주세요</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowSubjectDropdown(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {subjects.length > 0 ? `${subjects.length}개 선택됨` : '담당과를 선택하세요'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
        {/* 선택된 담당과 표시 */}
        {subjects.length > 0 && (
          <View style={styles.selectedSubjectsContainer}>
            <Text style={styles.selectedSubjectsTitle}>선택된 담당과:</Text>
            <View style={styles.selectedSubjectsList}>
              {subjects.map((subject, index) => (
                <View key={index} style={styles.selectedSubjectItem}>
                  <Text style={styles.selectedSubjectText}>{subject}</Text>
                  <TouchableOpacity
                    style={styles.removeSubjectButton}
                    onPress={() => setSubjects(subjects.filter(s => s !== subject))}
                  >
                    <Text style={styles.removeSubjectText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 교원 인증 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>교원 인증</Text>
        <View style={styles.agreementItem}>
          <Switch
            value={certificationVerified}
            onValueChange={setCertificationVerified}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
          <Text style={styles.agreementText}>
            교육청/학교 이메일 인증
          </Text>
        </View>
      </View>
    </View>
  );



  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        data={[{ key: 'content' }]}
        renderItem={() => (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.title}>교사 회원가입</Text>
              <View style={styles.placeholder} />
            </View>

            {/* 진행 단계 표시 */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{step}/2</Text>
            </View>

            {/* 단계별 내용 */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}

            {/* 하단 버튼 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, step === 1 && styles.buttonDisabled]} 
                onPress={step > 1 ? () => setStep(step - 1) : undefined}
                disabled={step === 1}
              >
                <Text style={[styles.buttonText, step === 1 && styles.buttonTextDisabled]}>
                  이전
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.buttonPrimary]} 
                onPress={handleNext}
              >
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                  {step === 2 ? '가입완료' : '다음'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      />
      
      {/* 학교 검색 모달 */}
      {renderSchoolSearchModal()}
      
      {/* 직책 선택 모달 */}
      <Modal
        visible={showPositionDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPositionDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPositionDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>직책 선택</Text>
              <TouchableOpacity onPress={() => setShowPositionDropdown(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownModalList} showsVerticalScrollIndicator={false}>
              {positions.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.dropdownModalItem,
                    position === pos && styles.dropdownModalItemSelected
                  ]}
                  onPress={() => {
                    setPosition(pos);
                    setShowPositionDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownModalItemText,
                    position === pos && styles.dropdownModalItemTextSelected
                  ]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* 담당과 선택 모달 */}
      <Modal
        visible={showSubjectDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubjectDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>담당과 선택</Text>
              <TouchableOpacity onPress={() => setShowSubjectDropdown(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownModalList} showsVerticalScrollIndicator={false}>
              {subjectOptions.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.dropdownModalItem,
                    subjects.includes(subject) && styles.dropdownModalItemSelected
                  ]}
                  onPress={() => toggleSubject(subject)}
                >
                  <Text style={[
                    styles.dropdownModalItemText,
                    subjects.includes(subject) && styles.dropdownModalItemTextSelected
                  ]}>
                    {subjects.includes(subject) ? '✓ ' : ''}{subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#2196F3',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pickerOption: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  pickerOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  verticalPickerContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  verticalPickerOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  verticalPickerOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  verticalPickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  verticalPickerOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  subjectsContainer: {
    marginBottom: 20,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedSubjectsContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedSubjectsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  selectedSubjectsList: {
    gap: 8,
  },
  selectedSubjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedSubjectText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  removeSubjectButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSubjectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#fafafa',
  },
  subjectOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  subjectOptionText: {
    fontSize: 14,
    color: '#666',
  },
  subjectOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  agreementText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  required: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#999',
  },
  // 학교 검색 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  searchHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  schoolList: {
    maxHeight: 300,
  },
  schoolItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  schoolItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  schoolItemSubText: {
    fontSize: 12,
    color: '#666',
  },

  searchButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // List 형태 선택 UI 스타일
  listPickerContainer: {
    flexDirection: 'column',
    gap: 8,
    maxHeight: 200,
  },
  listPickerOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 5,
  },
  listPickerOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  listPickerOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  listPickerOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  // 드롭다운 스타일
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fafafa',
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 5,
    maxHeight: 200,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  // Modal 드롭다운 스타일
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dropdownModalList: {
    maxHeight: 300,
  },
  dropdownModalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownModalItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  dropdownModalItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownModalItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
});