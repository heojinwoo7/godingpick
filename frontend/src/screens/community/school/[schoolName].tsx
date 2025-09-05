import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  school: string;
  schoolName: string;
  schoolId: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  isAnonymous?: boolean; // 익명 여부
}

export default function SchoolCommunityScreen() {
  const router = useRouter();
  const { schoolName } = useLocalSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 글쓰기 모달 관련 상태
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [anonymousNickname, setAnonymousNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true); // 익명 여부

  // 익명 닉네임 생성 함수
  const generateAnonymousNickname = (): string => {
    const foods = [
      '마라탕', '마라샹궈', '꿔바로우', '탕후루', '샤브샤브',
      '떡볶이', '김밥', '순대', '닭갈비', '삼겹살', '불고기',
      '된장찌개', '김치찌개', '순두부찌개', '부대찌개',
      '피자', '햄버거', '치킨', '핫도그', '타코', '파스타',
      '스테이크', '샌드위치', '샐러드', '도넛', '마카롱',
      '크로아상', '바게트', '프레첼', '베이글',
      '아이스크림', '케이크', '쿠키', '초콜릿', '젤리',
      '티라미수', '크레페', '팬케이크', '와플',
      '버블티', '밀크티', '에이드', '스무디', '프라페',
      '라면', '라멘', '우동', '소바', '스파게티',
      '국수', '칼국수', '잡채', '쫄면', '비빔면',
      '콜라', '사이다', '주스', '커피', '라떼',
      '아메리카노', '에스프레소', '카푸치노', '모카'
    ];
    
    const suffixes = [
      '러버', '마스터', '킹', '퀸', '프린스', '프린세스',
      '헌터', '워리어', '닌자', '마법사', '기사', '드래곤',
      '팬', '매니아', '전문가', '달인', '고수', '챔피언'
    ];
    
    const food = foods[Math.floor(Math.random() * foods.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${food}${suffix}${number}`;
  };

  // 사용자 정보 로드
  useEffect(() => {
    console.log('학교 커뮤니티 화면 로드:', { schoolName });
    
    // 화면 진입 시 데이터 완전 초기화
    setPosts([]);
    setLoading(true);
    
    loadUserInfo();
  }, [schoolName]);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr);
        setUserInfo(user);
        checkAccessPermission(user);
      }
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
      setLoading(false);
    }
  };

  // 접근 권한 확인
  const checkAccessPermission = async (user: UserInfo) => {
    try {
      if (!user.schoolName) {
        Alert.alert('오류', '학교 정보가 없습니다.');
        setLoading(false);
        return;
      }

      console.log('=== 학교 커뮤니티 접근 권한 확인 ===');
      console.log('사용자 학교:', user.schoolName);
      console.log('목표 학교:', schoolName);
      
      // 같은 학교 학생만 접근 가능
      const canAccess = user.schoolName === schoolName;
      console.log('접근 가능 여부:', canAccess);
      
      if (canAccess) {
        loadPosts();
      } else {
        Alert.alert('접근 제한', '같은 학교 학생만 이 커뮤니티에 접근할 수 있습니다.');
        setLoading(false);
      }
    } catch (error) {
      console.error('접근 권한 확인 오류:', error);
      setLoading(false);
    }
  };

  // 게시글 로드
  const loadPosts = async () => {
    try {
      console.log('학교 게시글 로드 시작:', schoolName);
      
      // 학교 커뮤니티: location_level1으로 검색 (데이터베이스 구조에 맞춤)
      const apiUrl = `https://godingpick.com/api/community/posts?location_level1=${encodeURIComponent(schoolName as string)}&category=자유선언`;
      console.log('학교 커뮤니티 API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('학교 게시글 로드 성공:', data);
        console.log('로드된 게시글 수:', data.posts ? data.posts.length : 0);
        
        // 게시글 데이터 포맷팅 및 익명 여부 추가
        const formattedPosts = (data.posts || []).map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.anonymous_nickname || post.author_name || '익명',
          createdAt: new Date(post.created_at).toLocaleDateString('ko-KR'),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          isAnonymous: !!post.anonymous_nickname
        }));
        
        setPosts(formattedPosts);
      } else {
        console.error('학교 게시글 로드 실패:', response.status);
        setPosts([]);
      }
      
      setLoading(false);
      console.log('학교 커뮤니티 로딩 완료, 현재 게시글 수:', posts.length);
    } catch (error) {
      console.error('게시글 로드 오류:', error);
      setPosts([]);
      setLoading(false);
    }
  };

  // 익명 사용자 생성
  const createAnonymousUser = async (): Promise<string | null> => {
    try {
      if (!userInfo) {
        Alert.alert('오류', '사용자 정보가 없습니다.');
        return null;
      }

      const response = await fetch('https://godingpick.com/api/community/create-anonymous-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userInfo.id,
          nickname: generateAnonymousNickname()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('익명 사용자 생성 성공:', data);
        return data.anonymous_user.nickname;
      } else {
        console.error('익명 사용자 생성 실패:', response.status);
        Alert.alert('오류', '익명 사용자 생성에 실패했습니다.');
        return null;
      }
    } catch (error) {
      console.error('익명 사용자 생성 오류:', error);
      Alert.alert('오류', '익명 사용자 생성 중 오류가 발생했습니다.');
      return null;
    }
  };

  // 새 게시글 작성
  const handleNewPost = async () => {
    try {
      const nickname = await createAnonymousUser();
      if (!nickname) {
        return;
      }

      setAnonymousNickname(nickname);
      setShowWriteModal(true);
      setIsAnonymous(true); // 기본값은 익명
      
    } catch (error) {
      console.error('글쓰기 오류:', error);
      Alert.alert('오류', '글쓰기 중 오류가 발생했습니다.');
    }
  };

  // 게시글 제출
  const handleSubmitPost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      Keyboard.dismiss();
      
      console.log('=== 학교 커뮤니티 게시글 저장 요청 ===');
      console.log('학교명:', schoolName);
      console.log('제목:', postTitle);
      console.log('내용:', postContent);
      console.log('저장될 데이터:', {
        title: postTitle.trim(),
        content: postContent.trim(),
        category: "자유선언",
        location: schoolName, // 학교명으로 저장
        location_level1: "",
        location_level2: "",
        location_level3: null
      });
      console.log('=====================================');

              const response = await fetch(`https://godingpick.com/api/community/posts?user_id=${userInfo?.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: postTitle.trim(),
            content: postContent.trim(),
            category: "자유선언",
            location_level1: schoolName, // 학교명을 location_level1에 저장
            location_level2: "",
            location_level3: null,
            is_anonymous: isAnonymous // 익명 여부 추가
          })
        });

      if (response.ok) {
        const result = await response.json();
        console.log('게시글 저장 성공:', result);
        
        const newPost: Post = {
          id: result.id || Date.now(),
          title: postTitle.trim(),
          content: postContent.trim(),
          author: isAnonymous ? anonymousNickname : userInfo?.name || '알 수 없음',
          createdAt: new Date().toLocaleDateString('ko-KR'),
          likes: 0,
          comments: 0
        };
        
        // 게시글 저장 후 즉시 새로고침하여 최신 데이터 로드
        console.log('게시글 저장 완료, 새로고침 시작...');
        await loadPosts();
        
        Alert.alert('성공', '게시글이 작성되었습니다!', [
          {
            text: '확인',
            onPress: () => {
              setShowWriteModal(false);
              setPostTitle('');
              setPostContent('');
              setAnonymousNickname('');
            }
          }
        ]);
      } else {
        const errorData = await response.json();
        console.error('게시글 저장 실패:', errorData);
        Alert.alert('오류', `게시글 저장에 실패했습니다: ${errorData.detail || '알 수 없는 오류'}`);
      }
      
    } catch (error) {
      console.error('게시글 제출 중 오류:', error);
      Alert.alert('오류', '게시글 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    Keyboard.dismiss();
    setShowWriteModal(false);
    setPostTitle('');
    setPostContent('');
  };

  // 게시글 클릭
  const handlePostPress = (post: Post) => {
    Alert.alert('게시글', `${post.title}\n\n${post.content}\n\n작성자: ${post.author}`);
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPosts();
      console.log('새로고침 완료');
    } catch (error) {
      console.error('새로고침 오류:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{schoolName} 커뮤니티</Text>
      </View>

      {/* 학교 커뮤니티 정보 */}
      <View style={styles.communityInfo}>
        <Text style={styles.communityTypeText}>
          🏫 같은 학교 학생들만 이용 가능한 커뮤니티입니다.
        </Text>
      </View>

      {/* 게시글 목록 */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postItem}
              onPress={() => handlePostPress(post)}
            >
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={2}>
                {post.content}
              </Text>
              <View style={styles.postMeta}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.postAuthor}>{post.author}</Text>
                  {post.isAnonymous && (
                    <View style={styles.anonymousBadge}>
                      <Text style={styles.anonymousBadgeText}>익명</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.postDate}>{post.createdAt}</Text>
                <Text style={styles.postStats}>👍 {post.likes} 💬 {post.comments}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 학교 게시글이 없습니다.</Text>
            <Text style={styles.emptySubtext}>같은 학교 친구들과 첫 번째 게시글을 작성해보세요!</Text>
          </View>
        )}
      </ScrollView>

      {/* 글쓰기 버튼 */}
      <TouchableOpacity 
        style={styles.writeButton}
        onPress={handleNewPost}
      >
        <Text style={styles.writeButtonText}>✏️ 글쓰기</Text>
      </TouchableOpacity>

      {/* 글쓰기 모달 */}
      <Modal
        visible={showWriteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>새 게시글 작성</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* 익명 토글 */}
              <View style={styles.anonymousToggleContainer}>
                <TouchableOpacity 
                  style={[styles.anonymousToggle, isAnonymous && styles.anonymousToggleActive]}
                  onPress={() => setIsAnonymous(!isAnonymous)}
                >
                  <Text style={[styles.anonymousToggleText, isAnonymous && styles.anonymousToggleTextActive]}>
                    {isAnonymous ? '✓' : '○'} 익명
                  </Text>
                </TouchableOpacity>
                
                {isAnonymous && (
                  <View style={styles.anonymousBadge}>
                    <Text style={styles.anonymousBadgeText}>익명</Text>
                  </View>
                )}
              </View>
              
              <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력하세요"
                value={postTitle}
                onChangeText={setPostTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{postTitle.length}/100</Text>
              
              <TextInput
                style={styles.contentInput}
                placeholder="내용을 입력하세요"
                value={postContent}
                onChangeText={setPostContent}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{postContent.length}/1000</Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSubmitPost}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? '저장 중...' : '저장'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  communityInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  communityTypeText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  postItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postStats: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 10,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  writeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    fontSize: 24,
    color: '#4CAF50',
    padding: 5,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 5,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    height: 200,
    marginBottom: 5,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 20,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  anonymousBadge: {
    backgroundColor: '#81C784',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  anonymousBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  anonymousToggleActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  anonymousToggleText: {
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  anonymousToggleTextActive: {
    color: '#2E7D32',
  },
  anonymousToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
});
