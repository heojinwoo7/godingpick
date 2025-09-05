import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FindIdScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleFindId = () => {
    // TODO: 아이디 찾기 API 연동
    Alert.alert('아이디 찾기 결과', '가입된 이메일: example@email.com');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>
      <TextInput placeholder="이름" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="전화번호" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleFindId}>
        <Text style={styles.buttonText}>아이디 찾기</Text>
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
