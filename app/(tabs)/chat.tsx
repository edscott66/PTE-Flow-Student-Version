import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
  Switch
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getPTEChatResponse, synthesizeSpeech } from '../../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: "Hello! I'm your PTE Academic Coach. How can I help you with your preparation today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadPrefs = async () => {
      const autoRead = await AsyncStorage.getItem('pte_chat_auto_read');
      if (autoRead !== null) {
        setIsAutoRead(autoRead === 'true');
      }
    };
    loadPrefs();
  }, []);

  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      // When the screen is focused, do nothing special for now.
      return () => {
        // Automatically switch off the voice if the user leaves the AI Chat page
        Speech.stop();
        setCurrentlySpeakingId(null);
      };
    }, [])
  );

  const toggleAutoRead = async (value: boolean) => {
    setIsAutoRead(value);
    await AsyncStorage.setItem('pte_chat_auto_read', value.toString());
    if (!value) {
      Speech.stop();
      setCurrentlySpeakingId(null);
    }
  };

  const playTTS = async (text: string, id: string) => {
    try {
      if (currentlySpeakingId === id) {
        // Toggle behavior: stop if it's already playing this message
        Speech.stop();
        setCurrentlySpeakingId(null);
        return;
      }

      Speech.stop();
      setCurrentlySpeakingId(id);
      
      const voices = await Speech.getAvailableVoicesAsync();
      let bestVoice = voices.find(v => v.identifier.includes("Daniel") || v.identifier.includes("Arthur")); 
      if (!bestVoice) bestVoice = voices.find(v => v.identifier.includes("rjs-local") || v.identifier.includes("gbd-local"));
      if (!bestVoice) bestVoice = voices.find(v => v.language.includes('en-GB') || v.language.includes('en-UK'));

      Speech.speak(text, {
        voice: bestVoice?.identifier,
        language: 'en-GB',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setCurrentlySpeakingId(null),
        onStopped: () => setCurrentlySpeakingId(null),
        onError: () => setCurrentlySpeakingId(null),
      });
    } catch (error) {
      console.error('TTS Playback error:', error);
      setCurrentlySpeakingId(null);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const history = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await getPTEChatResponse(history);
      const newBotId = (Date.now() + 1).toString();

      const botMessage: Message = {
        id: newBotId,
        role: 'model',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (isAutoRead) {
        playTTS(aiResponse, newBotId);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.role === 'model';
    const isSpeaking = currentlySpeakingId === item.id;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isBot ? colors.surface : colors.primary,
              borderColor: colors.border,
              borderWidth: isBot ? 1 : 0,
            },
            isBot ? styles.botBubble : styles.userBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isBot ? colors.text : '#FFFFFF' },
            ]}
          >
            {item.content}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
            <Text
              style={[
                styles.timestamp,
                { color: isBot ? colors.subtext : 'rgba(255, 255, 255, 0.7)', marginTop: 0 }
              ]}
            >
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isBot && (
              <TouchableOpacity 
                onPress={() => playTTS(item.content, item.id)}
                style={{ marginLeft: 8 }}
              >
                <MaterialCommunityIcons 
                  name={isSpeaking ? "stop-circle-outline" : "volume-high"} 
                  size={16} 
                  color={isSpeaking ? colors.danger || "#EF4444" : colors.primary} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    },
    input: {
      flex: 1,
      backgroundColor: isDark ? '#2D3748' : '#F1F5F9',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      color: colors.text,
      maxHeight: 100,
    },
    sendButton: {
      marginLeft: 10,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
          <Text style={dynamicStyles.headerTitle}>AI PTE Coach</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: colors.subtext, marginRight: 8, fontWeight: '500' }}>Auto-Read</Text>
          <Switch
            value={isAutoRead}
            onValueChange={toggleAutoRead}
            trackColor={{ false: '#CBD5E1', true: colors.primary }}
            ios_backgroundColor="#CBD5E1"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subtext }]}>Coach is thinking...</Text>
          </View>
        )}

        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Ask about PTE modules, tips..."
            placeholderTextColor={colors.subtext}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              dynamicStyles.sendButton,
              { opacity: inputText.trim() === '' || isLoading ? 0.6 : 1 },
            ]}
            onPress={handleSend}
            disabled={inputText.trim() === '' || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  botBubble: {
    borderTopLeftRadius: 4,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  loadingText: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: 'italic',
  },
});
