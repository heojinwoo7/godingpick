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
  schoolProvince?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export default function GuCommunityScreen() {
  const router = useRouter();
  const { guName } = useLocalSearchParams();
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
    console.log('구 커뮤니티 화면 로드:', { guName });
    loadUserInfo();
  }, [guName]);

  const loadUserInfo = async () => {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const user = JSON.parse(userInfoStr);
        
        // 테스트용으로 schoolProvince 설정
        if (user.schoolName && user.schoolName.includes('테스트')) {
          user.schoolProvince = '서울특별시';
        }
        
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

      console.log('=== 구 커뮤니티 접근 권한 확인 ===');
      console.log('사용자 학교:', user.schoolName);
      console.log('목표 구:', guName);
      console.log('사용자 학교 도:', user.schoolProvince);
      
      // 서울특별시 학생만 구 커뮤니티 접근 가능
      const isSeoulStudent = user.schoolProvince === '서울특별시';
      const canAccess = isSeoulStudent;
      
      console.log('서울 학생 여부:', isSeoulStudent);
      console.log('접근 가능 여부:', canAccess);
      
      if (canAccess) {
        loadPosts();
      } else {
        Alert.alert('접근 제한', '서울특별시 학생만 이 커뮤니티에 접근할 수 있습니다.');
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
      console.log('구 게시글 로드 시작:', guName);
      
      const apiUrl = `https://godingpick.com/api/community/posts?location_level3=${encodeURIComponent(guName as string)}&category=자유선언`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('게시글 로드 성공:', data);
        setPosts(data.posts || []);
      } else {
        console.error('게시글 로드 실패:', response.status);
        setPosts([]);
      }
      
      setLoading(false);
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
      
      console.log('구 게시글 저장 요청:', { guName, postTitle, postContent });

      const response = await fetch(`https://godingpick.com/api/community/posts?user_id=${userInfo?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          content: postContent.trim(),
          category: "자유선언",
          location: "", // 구는 location_level3 사용
          location_level1: "서울특별시", // 특별시
          location_level2: "", // 구는 location_level3 사용
          location_level3: guName // 구명
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('게시글 저장 성공:', result);
        
        const newPost: Post = {
          id: result.id || Date.now(),
          title: postTitle.trim(),
          content: postContent.trim(),
          author: anonymousNickname,
          createdAt: new Date().toLocaleDateString('ko-KR'),
          likes: 0,
          comments: 0
        };
        
        setPosts(prevPosts => [newPost, ...prevPosts]);
        
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
    await loadPosts();
    setRefreshing(false);
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
        <Text style={styles.headerTitle}>{guName} 커뮤니티</Text>
      </View>

      {/* 구 커뮤니티 정보 */}
      <View style={styles.communityInfo}>
        <Text style={styles.communityTypeText}>
          🏙️ 서울특별시 {guName}에 위치한 모든 학교 학생들이 이용 가능한 커뮤니티입니다.
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
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postDate}>{post.createdAt}</Text>
                <Text style={styles.postStats}>👍 {post.likes} 💬 {post.comments}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 구 게시글이 없습니다.</Text>
            <Text style={styles.emptySubtext}>같은 구 친구들과 첫 번째 게시글을 작성해보세요!</Text>
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  communityInfo: {
    backgroundColor: '#fff3e0',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  communityTypeText: {
    fontSize: 14,
    color: '#e65100',
    lineHeight: 20,
    textAlign: 'center',
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
    color: '#999',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postStats: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  writeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#ff9800',
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
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
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
    color: '#999',
    marginBottom: 20,
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
    backgroundColor: '#ff9800',
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
});





