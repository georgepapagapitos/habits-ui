import { useCallback, useEffect, useRef, useState } from "react";

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

  // Keep track of active timeouts so we can clean them up
  const timeoutRefs = useRef<{ [key: string]: number }>({});

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

      // Clear any existing timeout for this ID (shouldn't happen, but just in case)
      if (timeoutRefs.current[id]) {
        clearTimeout(timeoutRefs.current[id]);
      }

      // Set up automatic removal after duration
      const timeoutId = window.setTimeout(() => {
        removeMessage(id);
        delete timeoutRefs.current[id]; // Clean up reference
      }, newMessage.duration);

      // Store the timeout ID
      timeoutRefs.current[id] = timeoutId;

      return id;
    },
    [defaultDuration, maxMessages, removeMessage]
  );

  // Clean up all timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts when component unmounts
      Object.values(timeoutRefs.current).forEach((id) => clearTimeout(id));
      timeoutRefs.current = {};
    };
  }, []);

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
