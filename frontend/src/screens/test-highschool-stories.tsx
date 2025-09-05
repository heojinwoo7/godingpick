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
}

export default function TestHighschoolStoriesScreen() {
  const router = useRouter();
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');

  // 하드코딩된 테스트고딩 이야기 데이터
  const stories: Story[] = [
    {
      id: 1,
      title: "고딩테스트 결과가 정말 신기했어요!",
      content: "Carl Jung 테스트에서 INTJ가 나왔는데, 정말 정확한 것 같아요. 전략적 사고를 하는 편이라 계획을 세우는 게 좋다고 나왔는데, 맞는 것 같아요. 다른 친구들도 테스트해보세요!",
      author: "익명의 전략가",
      createdAt: "2025.04.15",
      likes: 23,
      comments: 8,
      category: "Carl Jung"
    },
    {
      id: 2,
      title: "RIASEC 결과로 진로를 정했어요",
      content: "Investigative가 가장 높게 나왔는데, 과학자나 연구원이 적성에 맞는다고 해요. 실제로 실험실에서 일하는 게 재미있을 것 같아요. 비슷한 결과가 나온 친구 있나요?",
      author: "미래의 과학자",
      createdAt: "2025.04.14",
      likes: 18,
      comments: 12,
      category: "RIASEC"
    },
    {
      id: 3,
      title: "Big Five 성격검사로 나를 더 알게 됐어요",
      content: "개방성이 높게 나왔는데, 새로운 경험을 시도하는 게 좋다고 해요. 창의적인 분야로 진로를 정하는 게 좋을 것 같아요. 다른 성격 특성도 궁금해요!",
      author: "창의적인 고딩",
      createdAt: "2025.04.13",
      likes: 31,
      comments: 15,
      category: "Big Five"
    },
    {
      id: 4,
      title: "고딩테스트 후 과목 추천 받았어요",
      content: "테스트 결과를 바탕으로 자연공학 계열 과목을 추천받았어요. 수학, 물리, 화학이 적성에 맞는다고 해서 정말 기뻤어요. 비슷한 경험 있는 친구들?",
      author: "자연공학 지망생",
      createdAt: "2025.04.12",
      likes: 27,
      comments: 9,
      category: "과목 추천"
    },
    {
      id: 5,
      title: "입시 컨설팅 받은 후기",
      content: "고딩테스트와 과목 추천 결과를 바탕으로 입시 컨설팅을 받았어요. 정말 체계적이고 맞춤형이었어요. 다른 친구들도 한번 받아보시길 추천해요!",
      author: "입시 준비생",
      createdAt: "2025.04.11",
      likes: 42,
      comments: 18,
      category: "입시 컨설팅"
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
          <Text style={styles.headerTitle}>테스트고딩 이야기 🧠</Text>
          <Text style={styles.headerSubtitle}>고딩테스트와 진로에 대한 이야기를 나누어보세요</Text>
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
              • 고딩테스트 결과와 진로에 대한 이야기를 자유롭게 작성해주세요{'\n'}
              • 다른 친구들의 경험담을 읽고 공감을 나누어보세요{'\n'}
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




