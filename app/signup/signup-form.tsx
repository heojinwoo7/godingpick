import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const roles = [
    {
      id: 'student',
      title: '학생',
      subtitle: '재학생/졸업생',
      icon: 'school',
      color: '#4CAF50',
      description: '학교 정보, 학년/반, 관심 과목 등'
    },
    {
      id: 'teacher',
      title: '교사',
      subtitle: '담임/교과/상담',
      icon: 'person',
      color: '#2196F3',
      description: '직책, 담당 과목, 교원 인증 등'
    },
    {
      id: 'parent',
      title: '학부모',
      subtitle: '보호자',
      icon: 'people',
      color: '#FF9800',
      description: '자녀 연결, 보호자 관계 등'
    }
  ];

  const handleRoleSelect = (role: string) => {
    router.push(`/signup/${role}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>가입하실 계정 유형을 선택해주세요</Text>
      </View>

      <View style={styles.roleContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, { borderColor: role.color }]}
            onPress={() => handleRoleSelect(role.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
              <Ionicons name={role.icon as any} size={32} color="white" />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  roleContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    gap: 50,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },

});
