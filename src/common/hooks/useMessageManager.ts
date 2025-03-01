import { useCallback, useState } from "react";

export interface Message {
  id: string;
  text: string;
  duration?: number;
}

interface MessageManagerOptions {
  maxMessages?: number;
  defaultDuration?: number;
}

export default function useMessageManager(options: MessageManagerOptions = {}) {
  const {
    maxMessages = 3,
    defaultDuration = 3000, // 3 seconds by default
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);

  // Remove a message by its ID
  const removeMessage = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  // Add a new message
  const addMessage = useCallback(
    (text: string, duration?: number) => {
      const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: Message = {
        id,
        text,
        duration: duration || defaultDuration,
      };

      // Add the new message, potentially removing oldest if we exceed maxMessages
      setMessages((current) => {
        const updatedMessages = [...current, newMessage];
        return updatedMessages.slice(-maxMessages); // Keep only the last 'maxMessages'
      });

      // Set up automatic removal after duration
      setTimeout(() => {
        removeMessage(id);
      }, newMessage.duration);

      return id;
    },
    [defaultDuration, maxMessages, removeMessage]
  );

  // Clear all messages
  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    removeMessage,
    clearAllMessages,
  };
}
