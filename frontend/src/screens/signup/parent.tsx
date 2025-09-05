// app/signup/parent.tsx
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

export default function ParentSignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // 기본 정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // 학부모 정보
  const [relationship, setRelationship] = useState('');
  const [childrenCount, setChildrenCount] = useState('1');
  
  // 자식 선택 관련
  const [showChildSearch, setShowChildSearch] = useState(false);
  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [filteredChildren, setFilteredChildren] = useState<Array<{
    id: number;
    name: string;
    email: string;
    grade: number;
    class_number: number;
    school_name: string;
  }>>([]);
  const [selectedChildren, setSelectedChildren] = useState<Array<{
    id: number;
    name: string;
    email: string;
    grade: number;
    class_number: number;
    school_name: string;
  }>>([]);
  const [currentChildIndex, setCurrentChildIndex] = useState<number>(0);
  
  // 약관 동의
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const relationships = ['부', '모', '기타'];

  // 자식 검색 함수
  const searchChildren = async (query: string) => {
    if (query.length < 2) {
      setFilteredChildren([]);
      return;
    }
    
    try {
      // 학생 사용자 검색 API 호출
      const response = await fetch(`https://godingpick.com/api/users/search/students?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('API 호출 실패');
      }
      
      const data = await response.json();
      
      if (data.success && data.students) {
        setFilteredChildren(data.students);
      } else {
        setFilteredChildren([]);
      }
    } catch (error) {
      console.error('자식 검색 오류:', error);
      setFilteredChildren([]);
    }
  };

  // 자식 선택 함수
  const selectChild = (child: any) => {
    // 현재 인덱스에 자녀 할당
    const newSelectedChildren = [...selectedChildren];
    newSelectedChildren[currentChildIndex] = child;
    setSelectedChildren(newSelectedChildren);
    
    setShowChildSearch(false);
    setChildSearchQuery('');
    setFilteredChildren([]);
  };

  // 자식 제거 함수
  const removeChild = (childId: number) => {
    const newSelectedChildren = selectedChildren.filter(c => c.id !== childId);
    setSelectedChildren(newSelectedChildren);
  };

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
      
      // 학부모 정보 검사
      if (!relationship) {
        Alert.alert('오류', '보호자 관계를 선택해주세요.');
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
      const response = await fetch('https://godingpick.com/api/auth/signup/parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          relationship
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
        returnKeyType="done"
        blurOnSubmit={true}
      />

      <Text style={styles.stepTitle}>학부모 정보</Text>
      
      {/* 보호자 관계 선택 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>보호자 관계 *</Text>
        <View style={styles.verticalPickerContainer}>
          {relationships.map((rel) => (
            <TouchableOpacity
              key={rel}
              style={[
                styles.verticalPickerOption,
                relationship === rel && styles.verticalPickerOptionSelected
              ]}
              onPress={() => setRelationship(rel)}
            >
              <Text style={[
                styles.verticalPickerOptionText,
                relationship === rel && styles.verticalPickerOptionTextSelected
              ]}>
                {rel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 자녀 수 입력 */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>자녀 수</Text>
        <TextInput
          placeholder="자녀 수를 입력하세요"
          value={childrenCount}
          onChangeText={setChildrenCount}
          style={styles.input}
          keyboardType="numeric"
          returnKeyType="done"
          blurOnSubmit={true}
        />
        <Text style={styles.inputSubLabel}>자녀의 수에 맞게 입력하세요</Text>
      </View>

      {/* 자녀 검색 결과 표시 */}
      {parseInt(childrenCount) > 0 && (
        <View style={styles.childrenContainer}>
          <Text style={styles.inputLabel}>자녀 정보</Text>
          {Array.from({ length: parseInt(childrenCount) }, (_, index) => (
            <View key={index} style={styles.childSearchItem}>
              <Text style={styles.childSearchLabel}>자녀 {index + 1}</Text>
              {selectedChildren[index] ? (
                <View style={styles.selectedChildInfo}>
                  <Text style={styles.selectedChildName}>{selectedChildren[index].name}</Text>
                  <Text style={styles.selectedChildDetails}>
                    {selectedChildren[index].school_name} {selectedChildren[index].grade}학년 {selectedChildren[index].class_number}반
                  </Text>
                  <TouchableOpacity
                    style={styles.removeChildButton}
                    onPress={() => removeChild(selectedChildren[index].id)}
                  >
                    <Text style={styles.removeChildButtonText}>제거</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.selectChildButton}
                  onPress={() => {
                    setShowChildSearch(true);
                    // 현재 선택할 자녀 인덱스 저장
                    setCurrentChildIndex(index);
                  }}
                >
                  <Text style={styles.selectChildButtonText}>자녀 선택</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // 자녀 검색 모달 렌더링
  const renderChildSearchModal = () => (
    <Modal
      visible={showChildSearch}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowChildSearch(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>자녀 검색</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowChildSearch(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            placeholder="학생 이름을 입력하세요"
            value={childSearchQuery}
            onChangeText={(text) => {
              setChildSearchQuery(text);
              searchChildren(text);
            }}
            style={styles.searchInput}
            autoFocus={true}
          />
          
          {/* 주의사항 */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>동명이인에 주의하세요!</Text>
          </View>
          
          <FlatList
            data={filteredChildren}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.childItem}
                onPress={() => selectChild(item)}
              >
                <Text style={styles.childItemText}>{item.name}</Text>
                <Text style={styles.childItemSubText}>
                  {item.school_name} {item.grade}학년 {item.class_number}반
                </Text>
              </TouchableOpacity>
            )}
            style={styles.childList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {childSearchQuery.length < 2 
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
          <Text style={styles.title}>학부모 회원가입</Text>
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
      </ScrollView>
      
      {/* 자녀 검색 모달 */}
      {renderChildSearchModal()}
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
    backgroundColor: '#FF9800',
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
    backgroundColor: '#FF9800',
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
    gap: 10,
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
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#FF9800',
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
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  verticalPickerContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  verticalPickerOption: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  verticalPickerOptionSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  verticalPickerOptionText: {
    fontSize: 16,
    color: '#666',
  },
  verticalPickerOptionTextSelected: {
    color: '#FF9800',
    fontWeight: '600',
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  searchButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  childrenContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  childSearchItem: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  childSearchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  selectedChildInfo: {
    backgroundColor: '#e0f2f7',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedChildName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  selectedChildDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  removeChildButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeChildButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectChildButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectChildButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 모달 관련 스타일
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
  childList: {
    maxHeight: 300,
  },
  childItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  childItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  childItemSubText: {
    fontSize: 12,
    color: '#666',
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
  // 주의사항 스타일
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
});