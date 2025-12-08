import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, COMMON_STYLES } from '../../constants';
import { apiService } from '../../services/api';
import { Book } from '../../types';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedBooks?: Book[];
  timestamp: Date;
}

interface ChatbotProps {
  visible: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI giúp bạn tìm sách. Bạn muốn tìm sách trong danh mục nào?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await apiService.chatWithAI(inputText.trim(), conversationHistory);

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.message,
          suggestedBooks: response.data.suggestedBooks || [],
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookPress = async (book: Book) => {
    try {
      await AsyncStorage.setItem('shouldReopenChatbot', 'true');
    } catch (e) {
      // Silently handle error
    }
    onClose();
    router.push(`/book-detail/${book.id}`);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content || ''}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatarContainer}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
        )}
      </View>
    );
  };

  const renderSuggestedBooks = (books: Book[] | undefined) => {
    if (!books || !Array.isArray(books) || books.length === 0) return null;

    return (
      <View style={styles.suggestedBooksContainer}>
        <Text style={styles.suggestedBooksTitle}>📚 Sách đề xuất:</Text>
        <FlatList
          data={books}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => {
            if (!item) return null;
            return (
            <TouchableOpacity
              style={styles.bookCard}
              onPress={() => handleBookPress(item)}
              activeOpacity={0.7}
            >
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={styles.bookImage} />
              ) : (
                <View style={[styles.bookImage, styles.bookImagePlaceholder]}>
                  <Ionicons name="book" size={24} color={COLORS.gray400} />
                </View>
              )}
              <Text style={styles.bookTitle} numberOfLines={2}>
                {item.title || 'Không có tiêu đề'}
              </Text>
              {item.description && (
                <Text style={styles.bookDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.rating && typeof item.rating === 'number' && item.rating > 0 && (
                <View style={styles.bookRating}>
                  <Ionicons name="star" size={12} color={COLORS.ratingGold} />
                  <Text style={styles.bookRatingText}>{Number(item.rating).toFixed(1)}</Text>
                </View>
              )}
            </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Trợ lý tìm sách AI</Text>
              <Text style={styles.headerSubtitle}>Hỏi tôi về bất kỳ cuốn sách nào</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View key={message.id}>
              {renderMessage({ item: message })}
              {message.suggestedBooks && Array.isArray(message.suggestedBooks) && message.suggestedBooks.length > 0 && (
                <View style={styles.suggestedBooksWrapper}>
                  {renderSuggestedBooks(message.suggestedBooks)}
                </View>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang suy nghĩ...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : SIZES.spacing.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...COMMON_STYLES.shadow,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: SIZES.spacing.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SIZES.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: SIZES.font.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  suggestedBooksContainer: {
    marginTop: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  suggestedBooksWrapper: {
    marginLeft: 44,
  },
  suggestedBooksTitle: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  bookCard: {
    width: 120,
    marginRight: SIZES.spacing.sm,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookImage: {
    width: '100%',
    height: 120,
    borderRadius: SIZES.borderRadius.sm,
    marginBottom: SIZES.spacing.xs,
  },
  bookImagePlaceholder: {
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs / 2,
  },
  bookDescription: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  bookRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookRatingText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.md,
  },
  loadingText: {
    marginLeft: SIZES.spacing.sm,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    fontSize: SIZES.font.md,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginRight: SIZES.spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray300,
    opacity: 0.5,
  },
});

export default Chatbot;

