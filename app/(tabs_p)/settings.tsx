// app/(tabs_p)/settings.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ParentSettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // 더미 데이터 (하드코딩)
  const [profileData, setProfileData] = useState({
    name: '학부모',
    email: 'parent@test.com',
    phone: '010-8765-4321',
    children: ['김학생', '이학생']
  });

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // AsyncStorage에서 사용자 정보 및 토큰 삭제
              await AsyncStorage.removeItem('userInfo');
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('savedEmail');
              await AsyncStorage.removeItem('rememberEmail');
              
              // 로그인 화면으로 이동
              router.replace('/login');
            } catch (error) {
              console.error('로그아웃 오류:', error);
              // 오류 발생 시에도 로그인 화면으로 이동
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  const handleProfileEdit = () => {
    setEditingProfile(!editingProfile);
  };

  const handleProfileSave = () => {
    // TODO: 실제 API 호출로 프로필 저장
    setEditingProfile(false);
    Alert.alert('성공', '프로필이 저장되었습니다.');
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>프로필 정보</Text>
        <TouchableOpacity onPress={handleProfileEdit}>
          <Text style={styles.editButton}>
            {editingProfile ? '저장' : '수정'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>이름</Text>
        {editingProfile ? (
          <TextInput
            style={styles.profileInput}
            value={profileData.name}
            onChangeText={(text) => setProfileData({...profileData, name: text})}
          />
        ) : (
          <Text style={styles.profileValue}>{profileData.name}</Text>
        )}
      </View>

      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>이메일</Text>
        {editingProfile ? (
          <TextInput
            style={styles.profileInput}
            value={profileData.email}
            onChangeText={(text) => setProfileData({...profileData, email: text})}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.profileValue}>{profileData.email}</Text>
        )}
      </View>

      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>연락처</Text>
        {editingProfile ? (
          <TextInput
            style={styles.profileInput}
            value={profileData.phone}
            onChangeText={(text) => setProfileData({...profileData, phone: text})}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.profileValue}>{profileData.phone}</Text>
        )}
      </View>

      <View style={styles.profileItem}>
        <Text style={styles.profileLabel}>자녀</Text>
        <View style={styles.childrenContainer}>
          {profileData.children.map((child, index) => (
            <View key={index} style={styles.childTag}>
              <Text style={styles.childText}>{child}</Text>
            </View>
          ))}
        </View>
      </View>

      {editingProfile && (
        <TouchableOpacity style={styles.saveButton} onPress={handleProfileSave}>
          <Text style={styles.saveButtonText}>프로필 저장</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderNotificationSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>알림 설정</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>푸시 알림</Text>
        </View>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: '#767577', true: '#ffb366' }}
          thumbColor={notifications ? '#FF6B35' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="mail" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>이메일 알림</Text>
        </View>
        <Switch
          value={emailNotifications}
          onValueChange={setEmailNotifications}
          trackColor={{ false: '#767577', true: '#ffb366' }}
          thumbColor={emailNotifications ? '#FF6B35' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="chatbubble" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>SMS 알림</Text>
        </View>
        <Switch
          value={smsNotifications}
          onValueChange={setSmsNotifications}
          trackColor={{ false: '#767577', true: '#ffb366' }}
          thumbColor={smsNotifications ? '#FF6B35' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderAppSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>앱 설정</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="moon" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>다크 모드</Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#767577', true: '#ffb366' }}
          thumbColor={darkMode ? '#FF6B35' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="language" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>언어 설정</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="help-circle" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>도움말</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="information-circle" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>앱 정보</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>계정</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="key" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>비밀번호 변경</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="shield-checkmark" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>개인정보 보호</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="download" size={24} color="#FF6B35" />
          <Text style={styles.settingLabel}>데이터 내보내기</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
        <Text style={styles.headerSubtitle}>앱 및 계정 설정</Text>
      </View>

      {/* 프로필 섹션 */}
      {renderProfileSection()}

      {/* 알림 설정 섹션 */}
      {renderNotificationSection()}

      {/* 앱 설정 섹션 */}
      {renderAppSection()}

      {/* 계정 섹션 */}
      {renderAccountSection()}

      {/* 로그아웃 버튼 */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {/* 앱 버전 정보 */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>앱 버전 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
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
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    width: 80,
  },
  profileValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  profileInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  childrenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  childTag: {
    backgroundColor: '#FFE6D6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  childText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutSection: {
    margin: 15,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});



