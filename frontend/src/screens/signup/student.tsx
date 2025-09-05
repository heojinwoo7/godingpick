// app/signup/student.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
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


export default function StudentSignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // 기본 정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // 학생 정보
  const [schoolName, setSchoolName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [grade, setGrade] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [attendanceNumber, setAttendanceNumber] = useState('');
  const [teacherName, setTeacherName] = useState('');
  
  // 학교 검색 관련
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  
  // 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [under14GuardianAgreed, setUnder14GuardianAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const educationLevels = ['초등학교', '중학교', '고등학교'];

  // 동적 학년 옵션 생성
  const getGradeOptions = (level: string) => {
    switch (level) {
      case '초등학교':
        return ['1', '2', '3', '4', '5', '6'];
      case '중학교':
        return ['1', '2', '3'];
      case '고등학교':
        return ['1', '2', '3'];
      default:
        return ['1', '2', '3'];
    }
  };



  // 학교 검색 함수
  const searchSchools = async (query: string) => {
    if (query.length < 2) {
      setFilteredSchools([]);
      return;
    }
    
    try {
      // ECS에서 학교 검색 API 호출
      const response = await fetch(`https://godingpick.com/api/schools/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('API 호출 실패');
      }
      
      const data = await response.json();
      console.log('학교 검색 응답:', data);
      
      if (data.success && data.schools) {
        setFilteredSchools(data.schools);
        console.log('학교 검색 결과:', data.schools.length, '개');
      } else {
        console.error('학교 검색 API 오류:', data);
        setFilteredSchools([]);
      }
    } catch (error) {
      console.error('학교 검색 오류:', error);
      // API 호출 실패 시 임시 더미 데이터 사용
      const dummySchools = [
        { id: 1, name: '서울고등학교', province: '서울특별시', district: '강남구' },
        { id: 2, name: '서울중학교', province: '서울특별시', district: '강남구' },
        { id: 3, name: '서울초등학교', province: '서울특별시', district: '강남구' },
      ];
      
      const filtered = dummySchools.filter(school => 
        school.name.includes(query) || 
        school.province.includes(query) || 
        school.district.includes(query)
      );
      
      setFilteredSchools(filtered);
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

  // 유효성 검사 함수들
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // 최소 8자, 영문/숫자/특수문자 조합
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone: string) => {
    // 한국 전화번호 형식 (010-1234-5678, 01012345678 등)
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone);
  };

  const validateBirthDate = (birthDate: string) => {
    // YYYYMMDD 형식 검증 (8자리 숫자)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(birthDate)) return false;
    
    const year = parseInt(birthDate.substring(0, 4));
    const month = parseInt(birthDate.substring(4, 6));
    const day = parseInt(birthDate.substring(6, 8));
    
    // 1900년 이전 또는 100세 이상은 유효하지 않음
    const today = new Date();
    const age = today.getFullYear() - year;
    if (year < 1900 || age > 100) return false;
    
    // 월과 일 범위 검증
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;
    
    // 실제 존재하는 날짜인지 확인
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const validateClassNumber = (classNumber: string) => {
    // 숫자만 허용
    const numberRegex = /^\d+$/;
    if (!numberRegex.test(classNumber)) return false;
    
    const num = parseInt(classNumber);
    // 1-50 범위 내의 숫자만 허용
    return num >= 1 && num <= 50;
  };

  const validateAttendanceNumber = (attendanceNumber: string) => {
    if (!attendanceNumber) return true; // 선택사항이므로 빈 값 허용
    // 숫자만 허용
    const numberRegex = /^\d+$/;
    return numberRegex.test(attendanceNumber);
  };

  // 폼 검증 함수 추가
  const validateForm = () => {
    if (!email) return "이메일을 입력해주세요";
    if (!password) return "비밀번호를 입력해주세요";
    if (!passwordConfirm) return "비밀번호 확인을 입력해주세요";
    if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다";
    if (!name) return "이름을 입력해주세요";
    if (!phone) return "전화번호를 입력해주세요";
    if (!birthDate) return "생년월일을 입력해주세요";
    if (!schoolName) return "학교를 선택해주세요";
    if (!educationLevel) return "교육과정을 선택해주세요";
    if (!grade) return "학년을 선택해주세요";
    if (!classNumber) return "반을 선택해주세요";
    if (!attendanceNumber) return "출석번호를 입력해주세요";
    if (!termsAgreed) return "이용약관에 동의해주세요";
    if (!privacyAgreed) return "개인정보처리방침에 동의해주세요";
    return null;
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // 회원가입 제출
      handleSignUp();
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await fetch('https://godingpick.com/api/auth/signup/student', {
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
          educationLevel,
          grade,
          classNumber,
          attendanceNumber
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

  // 제출 버튼 활성화 조건 수정
  const canSubmit = termsAgreed && privacyAgreed && under14GuardianAgreed;


  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>약관 동의</Text>
      
      <View style={styles.agreementItem}>
        <Switch
          value={termsAgreed}
          onValueChange={setTermsAgreed}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
        />
        <Text style={styles.agreementText}>
          이용약관 동의 <Text style={styles.required}>*</Text>
        </Text>
      </View>
      
      <View style={styles.agreementItem}>
        <Switch
          value={privacyAgreed}
          onValueChange={setPrivacyAgreed}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
        />
        <Text style={styles.agreementText}>
          개인정보 수집·이용 동의 <Text style={styles.required}>*</Text>
        </Text>
      </View>
      
      <View style={styles.agreementItem}>
        <Switch
          value={under14GuardianAgreed}
          onValueChange={setUnder14GuardianAgreed}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
        />
        <Text style={styles.agreementText}>
          만 14세 미만 법정대리인 동의 <Text style={styles.required}>*</Text>
        </Text>
      </View>
      
      <View style={styles.agreementItem}>
        <Switch
          value={marketingAgreed}
          onValueChange={setMarketingAgreed}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
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
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>이메일 *</Text>
        <TextInput
          placeholder="이메일을 입력하세요"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, email && !validateEmail(email) && styles.inputError]}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {email && !validateEmail(email) && (
          <Text style={styles.errorText}>올바른 이메일 형식을 입력해주세요.</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>비밀번호 *</Text>
        <TextInput
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, password && !validatePassword(password) && styles.inputError]}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {password && !validatePassword(password) && (
          <Text style={styles.errorText}>최소 8자, 영문/숫자/특수문자 포함</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>비밀번호 확인 *</Text>
        <TextInput
          placeholder="비밀번호를 다시 입력하세요"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          style={[styles.input, passwordConfirm && password !== passwordConfirm && styles.inputError]}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {passwordConfirm && password !== passwordConfirm && (
          <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>이름 *</Text>
        <TextInput
          placeholder="이름을 입력하세요"
          value={name}
          onChangeText={setName}
          style={[styles.input, name && name.trim().length < 2 && styles.inputError]}
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {name && name.trim().length < 2 && (
          <Text style={styles.errorText}>이름을 2자 이상 입력해주세요.</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>전화번호 *</Text>
        <TextInput
          placeholder="010-1234-5678"
          value={phone}
          onChangeText={setPhone}
          style={[styles.input, phone && !validatePhone(phone) && styles.inputError]}
          keyboardType="phone-pad"
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {phone && !validatePhone(phone) && (
          <Text style={styles.errorText}>올바른 전화번호 형식을 입력해주세요.</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>생년월일 *</Text>
        <TextInput
          placeholder="20000101"
          value={birthDate}
          onChangeText={setBirthDate}
          style={[styles.input, birthDate && !validateBirthDate(birthDate) && styles.inputError]}
          keyboardType="numeric"
          maxLength={8}
          returnKeyType="done"
          blurOnSubmit={true}
        />
        {birthDate && !validateBirthDate(birthDate) && (
          <Text style={styles.errorText}>YYYYMMDD 형식으로 입력해주세요. (예: 20000101)</Text>
        )}
      </View>

      <Text style={styles.stepTitle}>학생 정보</Text>
      
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
        {selectedSchool && (
          <Text style={styles.selectedSchoolInfo}>
            {selectedSchool.province} {selectedSchool.district}
          </Text>
        )}
      </View>

      {/* 교육단계 선택 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>교육단계 *</Text>
        <View style={styles.listPickerContainer}>
          {educationLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.listPickerOption,
                educationLevel === level && styles.listPickerOptionSelected
              ]}
              onPress={() => {
                setEducationLevel(level);
                // 교육단계 변경 시 학년과 반 초기화
                setGrade('');
                setClassNumber('');
              }}
            >
              <Text style={[
                styles.listPickerOptionText,
                educationLevel === level && styles.listPickerOptionTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 학년 선택 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>학년 *</Text>
        <View style={styles.listPickerContainer}>
          {getGradeOptions(educationLevel).map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.listPickerOption,
                grade === g && styles.listPickerOptionSelected
              ]}
              onPress={() => setGrade(g)}
            >
              <Text style={[
                styles.listPickerOptionText,
                grade === g && styles.listPickerOptionTextSelected
              ]}>
                {g}학년
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 반 선택 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>반 *</Text>
        <TextInput
          placeholder="반 번호를 입력하세요 (1-50)"
          value={classNumber}
          onChangeText={setClassNumber}
          style={[styles.input, classNumber && !validateClassNumber(classNumber) && styles.inputError]}
          keyboardType="numeric"
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {classNumber && !validateClassNumber(classNumber) && (
          <Text style={styles.errorText}>1-50 사이의 숫자만 입력 가능합니다.</Text>
        )}
      </View>

      {/* 출석번호 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>출석번호 *</Text>
        <TextInput
          placeholder="출석번호를 입력하세요"
          value={attendanceNumber}
          onChangeText={setAttendanceNumber}
          style={[styles.input, attendanceNumber && !validateAttendanceNumber(attendanceNumber) && styles.inputError]}
          keyboardType="numeric"
          returnKeyType="next"
          blurOnSubmit={false}
        />
        {attendanceNumber && !validateAttendanceNumber(attendanceNumber) && (
          <Text style={styles.errorText}>숫자만 입력 가능합니다.</Text>
        )}
      </View>

      {/* 담임교사명 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>담임교사명</Text>
        <TextInput
          placeholder="담임교사명을 입력하세요"
          value={teacherName}
          onChangeText={setTeacherName}
          style={styles.input}
          returnKeyType="done"
          blurOnSubmit={true}
        />
      </View>


    </View>
  );

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



  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>학생 회원가입</Text>
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
            style={[styles.button, styles.buttonPrimary, canSubmit && styles.buttonEnabled]} 
            onPress={canSubmit ? handleNext : undefined}
            disabled={!canSubmit}
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {step === 2 ? '가입완료' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* 학교 검색 모달 */}
      {renderSchoolSearchModal()}
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  rowContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
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
  smallPickerOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
    minWidth: 60,
  },
  pickerOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#4CAF50',
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
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  verticalPickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  verticalPickerOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  gridPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridPickerOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  gridPickerOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  gridPickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  gridPickerOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  interestsContainer: {
    marginBottom: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#fafafa',
  },
  interestOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  interestOptionText: {
    fontSize: 14,
    color: '#666',
  },
  interestOptionTextSelected: {
    color: '#4CAF50',
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
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonEnabled: {
    opacity: 1,
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


  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedSchoolInfo: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  listPickerOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  listPickerOptionTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // 유효성 검사 관련 스타일
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
});