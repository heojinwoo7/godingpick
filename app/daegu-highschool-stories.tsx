import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Story {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  category: string;
  school?: string;
}

export default function DaeguHighschoolStoriesScreen() {
  const router = useRouter();
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');

  // 하드코딩된 대구 고딩 이야기 데이터
  const stories: Story[] = [
    {
      id: 1,
      title: "대구고등학교 수학 수업이 정말 재미있어요!",
      content: "오늘 수학 시간에 미적분을 배웠는데, 선생님이 정말 재미있게 가르쳐주세요. 특히 실생활 예시를 들어가며 설명해주셔서 이해하기 쉬웠어요. 다른 학교 친구들도 비슷한 경험 있나요?",
      author: "대구고 수학러버",
      createdAt: "2025.04.15",
      likes: 45,
      comments: 23,
      category: "수업",
      school: "대구고등학교"
    },
    {
      id: 2,
      title: "경북고등학교 급식 메뉴 추천",
      content: "오늘 급식이 김치찌개, 제육볶음, 계란말이였는데 정말 맛있었어요! 특히 김치찌개가 집에서 먹는 것보다 맛있었어요. 다른 학교 급식도 궁금해요. 어떤 메뉴가 나오나요?",
      author: "경북고 급식러버",
      createdAt: "2025.04.14",
      likes: 67,
      comments: 31,
      category: "급식",
      school: "경북고등학교"
    },
    {
      id: 3,
      title: "대구여고 체육대회 후기",
      content: "어제 체육대회가 있었는데 정말 재미있었어요! 우리 반이 줄다리기에서 1등했어요. 특히 마지막 결승전이 정말 치열했는데, 팀워크가 승리의 열쇠였어요. 다른 학교도 체육대회 있나요?",
      author: "대구여고 체육러버",
      createdAt: "2025.04.13",
      likes: 89,
      comments: 42,
      category: "학교행사",
      school: "대구여자고등학교"
    },
    {
      id: 4,
      title: "대구외고 영어 스피치 대회",
      content: "영어 스피치 대회에 참가했는데 정말 긴장됐어요. 하지만 연습할 때보다 훨씬 잘했어요! 다른 친구들도 영어 대회나 경시대회에 도전해보세요. 실력이 많이 늘어요!",
      author: "대구외고 영어러버",
      createdAt: "2025.04.12",
      likes: 56,
      comments: 28,
      category: "학습활동",
      school: "대구외국어고등학교"
    },
    {
      id: 5,
      title: "대구과학고 실험실 후기",
      content: "오늘 화학 실험실에서 산화환원 반응 실험을 했어요. 색깔 변화가 정말 신기했고, 실험 결과도 예상대로 나왔어요. 과학고라서 실험 기구도 많고 선생님들도 전문적이에요!",
      author: "대구과학고 화학러버",
      createdAt: "2025.04.11",
      likes: 78,
      comments: 35,
      category: "실험",
      school: "대구과학고등학교"
    },
    {
      id: 6,
      title: "대구예고 미술 수업",
      content: "미술 시간에 유화화를 그렸는데 정말 재미있었어요. 색깔을 섞는 게 어려웠지만, 선생님이 차근차근 가르쳐주셔서 잘 그렸어요. 다른 학교도 미술 수업 재미있나요?",
      author: "대구예고 미술러버",
      createdAt: "2025.04.10",
      likes: 34,
      comments: 19,
      category: "예술",
      school: "대구예술고등학교"
    }
  ];

  const handleWriteStory = () => {
    if (newStoryTitle.trim() && newStoryContent.trim()) {
      // 새 이야기 추가 로직 (하드코딩이므로 실제로는 추가되지 않음)
      setShowWriteModal(false);
      setNewStoryTitle('');
      setNewStoryContent('');
      // 실제 구현 시에는 stories 배열에 추가
    }
  };

  const handleLike = (storyId: number) => {
    // 좋아요 로직 (하드코딩이므로 실제로는 작동하지 않음)
    console.log(`Story ${storyId} liked`);
  };

  const handleComment = (storyId: number) => {
    // 댓글 로직 (하드코딩이므로 실제로는 작동하지 않음)
    console.log(`Comment on story ${storyId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>대구 고딩 이야기 🏫</Text>
          <Text style={styles.headerSubtitle}>대구 지역 고등학생들의 학교생활 이야기를 나누어보세요</Text>
        </View>

        {/* 콘텐츠 영역 */}
        <View style={styles.contentArea}>
          {/* 이야기 목록 */}
          {stories.map((story) => (
            <View key={story.id} style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{story.category}</Text>
                </View>
                <Text style={styles.storyDate}>{story.createdAt}</Text>
              </View>
              
              {story.school && (
                <View style={styles.schoolBadge}>
                  <Text style={styles.schoolText}>{story.school}</Text>
                </View>
              )}
              
              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyContent}>{story.content}</Text>
              
              <View style={styles.storyFooter}>
                <Text style={styles.storyAuthor}>{story.author}</Text>
                <View style={styles.storyActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLike(story.id)}
                  >
                    <Text style={styles.actionButtonText}>👍 {story.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleComment(story.id)}
                  >
                    <Text style={styles.actionButtonText}>💬 {story.comments}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* 안내 카드 */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 이야기 작성 안내</Text>
            <Text style={styles.infoContent}>
              • 대구 지역 학교생활에 대한 이야기를 자유롭게 작성해주세요{'\n'}
              • 다른 학교 친구들의 경험담을 읽고 공감을 나누어보세요{'\n'}
              • 건전하고 유익한 대화를 만들어가요{'\n'}
              • 익명으로 작성되므로 편하게 이야기해주세요
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 글쓰기 버튼 */}
      <TouchableOpacity 
        style={styles.writeButton}
        onPress={() => setShowWriteModal(true)}
      >
        <Text style={styles.writeButtonText}>✏️</Text>
      </TouchableOpacity>

      {/* 글쓰기 모달 */}
      <Modal
        visible={showWriteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWriteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새로운 이야기 작성</Text>
            
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력하세요"
              value={newStoryTitle}
              onChangeText={setNewStoryTitle}
              maxLength={50}
            />
            
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요"
              value={newStoryContent}
              onChangeText={setNewStoryContent}
              multiline
              maxLength={500}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWriteModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleWriteStory}
              >
                <Text style={styles.submitButtonText}>작성</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: 'transparent',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -20,
  },
  storyCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 15,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  storyDate: {
    fontSize: 12,
    color: '#999',
  },
  schoolBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  schoolText: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 24,
  },
  storyContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyAuthor: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  storyActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  writeButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  writeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});




