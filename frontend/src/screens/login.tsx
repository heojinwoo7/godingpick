// app/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  // 화면이 포커스될 때마다 맨 위로 스크롤하고 저장된 이메일 불러오기
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      
      // 저장된 이메일과 아이디 기억하기 설정 불러오기
      loadSavedEmail();
    }, [])
  );

  // 저장된 이메일 불러오기
  const loadSavedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedRememberEmail = await AsyncStorage.getItem('rememberEmail');
      
      if (savedEmail && savedRememberEmail === 'true') {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    } catch (error) {
      console.error('저장된 이메일 불러오기 오류:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('오류', '이메일과 비밀번호를 모두 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      
      // 환경에 따른 서버 URL 설정
      const serverUrl = 'https://godingpick.com';
      
      const response = await fetch(`${serverUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // 사용자 타입별 동적 라우팅
        const userType = data.user.user_type; // 백엔드 응답 구조에 맞게 수정
        
        // 사용자 타입 판단 로직
        let finalUserType = userType;
        
        // 이메일로 사용자 타입 판단 (백엔드 응답이 없거나 불확실한 경우)
        if (!userType || userType === 'unknown') {
          if (email.includes('teacher') || email.includes('교사')) {
            finalUserType = 'teacher';
          } else if (email.includes('parent') || email.includes('부모')) {
            finalUserType = 'parent';
          } else {
            finalUserType = 'student';
          }
        }
        
        // 사용자 정보를 AsyncStorage에 저장
        const userInfo = {
          id: data.user.id, // 사용자 ID 추가!
          name: data.user.name,
          email: data.user.email,
          school: data.additionalInfo?.school_name || '학교 정보 없음',  // 수정: data.additionalInfo
          grade: `${data.additionalInfo?.grade || '?'}학년`,  // 수정: data.additionalInfo
          class: `${data.additionalInfo?.class_number || '?'}반`,  // 수정: data.additionalInfo
          phone: data.user.phone || '',
          birthDate: data.user.birthDate || '',
          userType: finalUserType, // 최종 사용자 타입 사용
          // 학교 정보 단순화
          schoolName: data.additionalInfo?.school_name || null,
          schoolId: data.additionalInfo?.school_id || null
        };
        
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        await AsyncStorage.setItem('authToken', 'dummy-token'); // 실제로는 JWT 토큰 사용
        
        // 아이디 기억하기가 체크되어 있으면 이메일 저장
        if (rememberEmail) {
          await AsyncStorage.setItem('savedEmail', email);
          await AsyncStorage.setItem('rememberEmail', 'true');
        } else {
          // 체크 해제되어 있으면 저장된 이메일 삭제
          await AsyncStorage.removeItem('savedEmail');
          await AsyncStorage.removeItem('rememberEmail');
        }
        
        // 사용자 타입에 따라 다른 화면으로 이동
        switch (finalUserType) {
          case 'teacher':
            router.replace('/(tabs_t)');
            break;
          case 'parent':
            router.replace('/(tabs_p)');
            break;
          case 'student':
          default:
            router.replace('/(tabs)');
            break;
        }
      } else {
        Alert.alert('로그인 실패', data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      
      // 네트워크 오류 상세 처리
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        Alert.alert(
          '네트워크 오류', 
          '서버에 연결할 수 없습니다.\n\n1. 인터넷 연결을 확인해주세요\n2. 서버가 실행 중인지 확인해주세요\n3. 다시 시도해주세요'
        );
      } else {
        Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={false}
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="on-drag"
        >


          {/* 메인 콘텐츠 */}
          <View style={styles.content}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>안녕하세요!</Text>
              <Text style={styles.welcomeSubtitle}>고딩픽에 오신 것을 환영합니다</Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  blurOnSubmit={true}
                />
              </View>

              {/* 아이디 기억하기 체크박스 */}
              <View style={styles.rememberContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setRememberEmail(!rememberEmail)}
                >
                  <View style={[styles.checkbox, rememberEmail && styles.checkboxChecked]}>
                    {rememberEmail && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>아이디 기억하기</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity style={styles.socialLoginButton}>
                <Text style={styles.socialLoginText}>Google로 로그인</Text>
              </TouchableOpacity>
            </View>

            {/* 링크 섹션 */}
            <View style={styles.linkSection}>
              <View style={styles.linkRow}>
                <TouchableOpacity onPress={() => router.push('/find-id')}>
                  <Text style={styles.link}>아이디 찾기</Text>
                </TouchableOpacity>
                <View style={styles.linkDivider} />
                <TouchableOpacity onPress={() => router.push('/find-password')}>
                  <Text style={styles.link}>비밀번호 찾기</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.signupSection}>
                <Text style={styles.signupText}>아직 계정이 없으신가요? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.signupLink}>회원가입</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // 하단 여백 줄임
    justifyContent: 'flex-start', // 맨 위부터 시작하도록 변경
  },

  // 메인 콘텐츠
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // 일관된 상단 여백
    paddingBottom: 10,
  },
  welcomeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 10, // 좌우 여백 추가
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false, // Android 폰트 패딩 제거
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false, // Android 폰트 패딩 제거
  },
  // 폼 컨테이너
  formContainer: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    height: 52,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  // 로그인 버튼
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 52,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  // 구분선
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 20,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // 소셜 로그인
  socialLoginButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialLoginText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  // 링크 섹션
  linkSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: '100%',
  },
  link: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  linkDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  signupSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  signupLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  // 아이디 기억하기
  rememberContainer: {
    marginBottom: 20,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
});
