import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// ------------------ 타입 정의 ------------------
interface UserInfo {
  id: number;
  name: string;
  email: string;
  school: string;
  schoolName: string; 
  schoolId: number;   
  userType: string;
}

interface School {
  id: number;
  name: string;
  province: string;
  district: string;
  actual_district: string;
  address: string;
  school_type: string;
}

interface Community {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  icon: string;
  route: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  category: string;
  location: string;
}

// ------------------ 메인 화면 ------------------
export default function CommunityScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schoolLoading, setSchoolLoading] = useState(false);

  // ------------------ 사용자 정보 로드 ------------------
  useEffect(() => {
    loadUserInfo();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 학교 데이터가 변경될 때만 커뮤니티 생성
  useEffect(() => {
    if (schoolData && communities.length === 0) {
      console.log("🏗️ 학교 데이터 변경으로 커뮤니티 재생성");
      const generatedCommunities = generateCommunities(schoolData);
      setCommunities(generatedCommunities);
      console.log("✅ 커뮤니티 생성 완료:", generatedCommunities);
    }
  }, [schoolData]); // schoolData가 변경될 때만 실행

  const loadUserInfo = async () => {
    try {
      console.log("👤 사용자 정보 로드 시작");
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr);
        setUserInfo(user);
        console.log("✅ 로드된 유저 정보:", user);
        console.log("🏫 학교 ID:", user.schoolId);
        console.log("🏫 학교명:", user.schoolName);

        // 학교 데이터는 자유선언 클릭 시에만 가져오기
        console.log("📚 학교 데이터는 자유선언 클릭 시에 가져옵니다.");
        setLoading(false);
      } else {
        console.log("⚠️ AsyncStorage에 사용자 정보가 없음");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ 사용자 정보 로드 오류:", error);
      setLoading(false);
    }
  };

  // ------------------ DB에서 학교 데이터 가져오기 ------------------
  const fetchSchoolData = async (schoolId: number) => {
    try {
      // EC2 서버 사용 (로컬 개발 환경에서도)
      const serverUrl = 'https://godingpick.com';
      console.log("🚀 학교 데이터 요청 시작 - schoolId:", schoolId);
      console.log("🌐 서버 URL:", serverUrl);
      
      // API 서버 연결 테스트
      console.log("🔍 API 서버 연결 테스트 중...");
      const testRes = await fetch(`${serverUrl}/health`, { 
        method: 'GET'
      }).catch((error) => {
        console.log("❌ API 서버 연결 실패:", error.message);
        return null;
      });
      
      if (!testRes) {
        throw new Error("API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      }
      
      console.log("✅ API 서버 연결 성공");
      
      const res = await fetch(`${serverUrl}/api/schools/${schoolId}`);
      
      console.log("📡 API 응답 상태:", res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`학교 데이터 가져오기 실패: ${res.status} - ${res.statusText}`);
      }
      
      const data: School = await res.json();
      console.log("✅ 불러온 학교 데이터:", data);
      console.log("📍 지역 정보 상세:");
      console.log("  - province:", data.province);
      console.log("  - district:", data.district);
      console.log("  - actual_district:", data.actual_district);
      console.log("  - address:", data.address);
      
      setSchoolData(data);
      console.log("✅ 학교 데이터 설정 완료 - 커뮤니티는 useEffect에서 자동 생성됨");
      // 학교 데이터 로딩 완료
      setLoading(false);
    } catch (error) {
      console.error("❌ 학교 정보 API 오류:", error);
      
      // API 오류 시 기본 커뮤니티 생성 (테스트용)
      if (userInfo?.schoolName) {
        console.log("⚠️ API 서버 연결 실패로 기본 커뮤니티만 표시됩니다.");
        console.log("💡 해결 방법:");
        console.log("   1. 터미널에서 api_py 폴더로 이동");
        console.log("   2. 'python main.py' 실행");
        console.log("   3. API 서버가 실행 중인지 확인");
        
        const defaultCommunities = generateDefaultCommunities(userInfo.schoolName);
        setCommunities(defaultCommunities);
        console.log("🔄 기본 커뮤니티 생성됨:", defaultCommunities);
        console.log("📝 현재 상태: API 서버 없이 기본 커뮤니티만 표시");
        console.log("🎯 기본 커뮤니티로 테스트 가능");
        
        // 사용자에게 알림
        Alert.alert(
          "API 서버 연결 실패",
          "학교 정보를 가져올 수 없어 기본 커뮤니티만 표시됩니다.\n\nAPI 서버를 실행하고 앱을 새로고침해주세요.",
          [{ text: "확인" }]
        );
      }
      
      // API 오류 시에도 로딩 상태 해제
      setLoading(false);
    }
  };

  // ------------------ 커뮤니티 생성 (2개만) ------------------
  const generateCommunities = (school: School): Community[] => {
    console.log("🏗️ 커뮤니티 생성 시작 - 학교 데이터:", school);
    const communities: Community[] = [];

    // 1. 학교 단위 커뮤니티
    communities.push({
      id: "school",
      name: `${school.name} 이야기`,
      type: "학교",
      location: school.name,
      description: `${school.name} 학생들만 이용 가능한 커뮤니티`,
      icon: "🏫",
      route: `/community/school/${encodeURIComponent(school.name)}`
    });
    console.log("🏫 학교 커뮤니티 추가됨:", `${school.name} 이야기`);

    // 2. 시/군 단위 커뮤니티
    if (school.province.includes("특별시") || school.province.includes("광역시")) {
      // 특별시/광역시의 경우
      communities.push({
        id: "city",
        name: `${school.province}의 이야기`,
        type: "시/도",
        location: school.province,
        description: `${school.province}에 속한 모든 학교 학생들`,
        icon: "🌆",
        route: `/community/district/${encodeURIComponent(school.province)}`
      });
      console.log("🌆 시/도 커뮤니티 추가됨:", `${school.province}의 이야기`);
    } else {
      // 일반 도의 경우 - 시/군으로 구분
      const districtName = school.actual_district || school.district;
      console.log("🏘️ 일반 시/군 처리 - districtName:", districtName);
      if (districtName) {
        communities.push({
          id: "city",
          name: `${school.province} ${districtName}의 이야기`,
          type: "시/군",
          location: districtName,
          description: `${districtName}에 속한 모든 학교 학생들`,
          icon: "🏘️",
          route: `/community/district/${encodeURIComponent(districtName)}`
        });
        console.log("🏘️ 시/군 커뮤니티 추가됨:", `${school.province} ${districtName}의 이야기`);
      } else {
        console.log("⚠️ districtName이 없어서 시/군 커뮤니티 생성 불가");
      }
    }

    console.log("✅ 최종 생성된 커뮤니티 수:", communities.length);
    return communities;
  };

  // ------------------ 기본 커뮤니티 생성 (API 오류 시) ------------------
  const generateDefaultCommunities = (schoolName: string): Community[] => {
    console.log("🔄 기본 커뮤니티 생성 함수 호출됨 - schoolName:", schoolName);
    return [
      {
        id: "school",
        name: `${schoolName} 이야기`,
        type: "학교",
        location: schoolName,
        description: `${schoolName} 학생들만 이용 가능한 커뮤니티`,
        icon: "🏫",
        route: `/community/school/${encodeURIComponent(schoolName)}`
      },
      {
        id: "city",
        name: "우리 지역의 이야기",
        type: "지역",
        location: "지역",
        description: "우리 지역에 속한 모든 학교 학생들",
        icon: "🌆",
        route: `/community/district/지역`
      }
    ];
  };

  // ------------------ 자유선언 클릭 ------------------
  const handleFreeDeclaration = () => {
    console.log("🚀 자유선언 클릭됨!");
    // 새로운 자유선언 선택 화면으로 이동
    router.push('/free-declaration-selection');
  };

  // ------------------ 기존 자유선언 로직 (주석처리) ------------------
  /*
  const handleFreeDeclaration = async () => {
    if (!userInfo) {
      Alert.alert("알림", "로그인이 필요합니다.");
      return;
    }

    console.log("🚀 자유선언 클릭됨!");
    console.log("👤 현재 사용자 정보:", userInfo);
    console.log("🏫 학교 ID:", userInfo.schoolId);
    console.log("🏫 학교명:", userInfo.schoolName);

    // 사용자-학생-학교 정보를 3개 테이블 JOIN으로 가져오기
    if (!schoolData && userInfo.id) {
      console.log("📚 사용자-학생-학교 정보를 가져오는 중...");
      setSchoolLoading(true);
      try {
        const serverUrl = 'https://godingpick.com';
        console.log("🌐 API 서버 URL:", serverUrl);
        console.log("🔗 API 엔드포인트:", `/api/community/user-school-info/${userInfo.id}`);
        console.log("📡 API 요청 시작...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
        
        const res = await fetch(`${serverUrl}/api/community/user-school-info/${userInfo.id}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log("📡 API 응답 받음:", res.status, res.statusText);
        
        if (res.ok) {
          const userStudentSchoolInfo = await res.json();
          console.log("✅ 사용자-학생-학교 정보 가져오기 성공:", userStudentSchoolInfo);
        }
      } catch (error) {
        console.error("❌ API 호출 실패:", error);
      } finally {
        setSchoolLoading(false);
      }
    }
  };
  */

  // ------------------ 커뮤니티 선택 ------------------
  const handleCommunitySelect = (community: Community) => {
    setShowCommunityModal(false);
    setSelectedCommunity(community);
    
    console.log("선택된 커뮤니티:", community);
    router.push(community.route as any);
  };

  // ------------------ 커뮤니티 직접 클릭 ------------------
  const handleCommunityClick = (community: Community) => {
    console.log("클릭된 커뮤니티:", community);
    router.push(community.route as any);
  };

  // ------------------ 새로고침 ------------------
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserInfo();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // ------------------ UI ------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>고뮤니티 💬</Text>
          <Text style={styles.headerSubtitle}>고등학생들의 소통 공간</Text>
        </View>

        {/* 콘텐츠 영역 - 흰색 배경으로 분리 */}
        <View style={styles.contentArea}>
          {/* 자유선언 */}
          <TouchableOpacity 
            style={[styles.freeDeclarationButton, schoolLoading && styles.freeDeclarationButtonLoading]} 
            onPress={handleFreeDeclaration}
            disabled={schoolLoading}
          >
            <View style={styles.freeDeclarationContent}>
              <Text style={styles.freeDeclarationTitle}>
                💬 {schoolLoading ? '학교 정보 로딩 중...' : '자유선언'}
              </Text>
              {schoolData?.name && (
                <Text style={styles.schoolInfo}>({schoolData.name})</Text>
              )}
            </View>
            <Text style={styles.freeDeclarationSubtitle}>
              {schoolLoading ? '잠시만 기다려주세요...' : '익명으로 자유롭게 이야기해보세요'}
            </Text>
          </TouchableOpacity>

          {/* 고딩 장터 */}
          <TouchableOpacity style={styles.communityCard}>
            <View style={styles.communityCardContent}>
              <Text style={styles.communityCardTitle}>🛒 고딩 장터</Text>
              <Text style={styles.communityCardSubtitle}>교과서, 참고서 등 중고 물품을 거래해보세요</Text>
            </View>
          </TouchableOpacity>

          {/* 고딩 공구 */}
          <TouchableOpacity style={styles.communityCard}>
            <View style={styles.communityCardContent}>
              <Text style={styles.communityCardTitle}>🔧 고딩 공구</Text>
              <Text style={styles.communityCardSubtitle}>학습 도구와 유용한 앱을 추천해보세요</Text>
            </View>
          </TouchableOpacity>

          {/* 고딩 급식 */}
          <TouchableOpacity style={styles.communityCard}>
            <View style={styles.communityCardContent}>
              <Text style={styles.communityCardTitle}>🍽️ 고딩 급식</Text>
              <Text style={styles.communityCardSubtitle}>오늘의 급식 메뉴와 영양 정보를 확인해보세요</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 모달 */}
      <Modal
        visible={showCommunityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommunityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>자유선언할 커뮤니티 선택</Text>
            <FlatList
              data={communities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.communityItem}
                  onPress={() => handleCommunitySelect(item)}
                >
                  <View style={styles.communityIcon}>
                    <Text style={styles.communityIconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.communityInfo}>
                    <Text style={styles.communityName}>{item.name}</Text>
                    <Text style={styles.communityDescription}>{item.description}</Text>
                  </View>
                  <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCommunityModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ------------------ 스타일 ------------------
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#4CAF50" // 전체 배경을 초록색으로 변경
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#666" },
  scrollView: { flex: 1 },
  header: { 
    backgroundColor: "transparent", // 배경색 제거 (container에서 상속)
    padding: 20, 
    paddingTop: 20, // 상단 여백 조정
    paddingBottom: 30,
    alignItems: "center",
    // marginTop 제거 (불필요)
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.9)" },
  freeDeclarationButton: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  freeDeclarationContent: { flexDirection: "row", alignItems: "center" },
  freeDeclarationTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  schoolInfo: { marginLeft: 5, fontSize: 14, color: "#666" },
  freeDeclarationSubtitle: { fontSize: 14, color: "#999", marginTop: 5 },
  freeDeclarationButtonLoading: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", borderRadius: 15, padding: 20, width: "90%", maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  communityItem: { flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderColor: "#eee" },
  communityIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#4CAF50", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 10 
  },
  communityIconText: { color: "#fff", fontWeight: "bold" },
  communityInfo: { flex: 1 },
  communityName: { fontSize: 16, fontWeight: "bold" },
  communityDescription: { fontSize: 13, color: "#666" },
  arrowText: { fontSize: 20, color: "#666" },
  modalCloseButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center"
  },
  modalCloseButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  noCommunitiesContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10
  },
  noCommunitiesText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8
  },
  noCommunitiesSubtext: {
    fontSize: 14,
    color: "#999"
  },
  communityCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityCardContent: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  communityCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  communityCardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#fff", // 흰색 배경
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -20, // 헤더와 연결
  },
});
