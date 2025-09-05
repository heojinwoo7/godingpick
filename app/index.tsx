import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // 앱 시작 시 로그인 상태 확인
    checkLoginStatus();
  }, [router]);

  const checkLoginStatus = async () => {
    try {
      // AsyncStorage에서 로그인 정보 확인
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      if (userInfo) {
        // 로그인 정보가 있으면 사용자 타입에 따라 적절한 화면으로 이동
        const user = JSON.parse(userInfo);
        
        if (user.userType === 'teacher') {
          router.replace('/(tabs_t)');
        } else if (user.userType === 'parent') {
          router.replace('/(tabs_p)');
        } else {
          router.replace('/(tabs)'); // 학생
        }
      } else {
        // 로그인 정보가 없으면 로그인 화면으로 이동
        router.replace('/login');
      }
      
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      // 오류 발생 시 로그인 화면으로 이동
      router.replace('/login');
    }
  };
  
  // 로딩 화면 표시
  return (
    <View style={styles.container}>
      <Text style={styles.title}>고딩픽</Text>
      <Text style={styles.subtitle}>로딩 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
});
