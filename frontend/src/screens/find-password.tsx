import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FindPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleFindPassword = () => {
    // TODO: 비밀번호 재설정 이메일 보내기 API 연동
    Alert.alert('이메일 발송 완료', '비밀번호 재설정 링크가 이메일로 전송되었습니다.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 찾기</Text>
      <TextInput placeholder="가입한 이메일" value={email} onChangeText={setEmail} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleFindPassword}>
        <Text style={styles.buttonText}>이메일 발송</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
