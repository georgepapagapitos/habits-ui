import React, { createContext, ReactNode, useContext } from "react";
import useMessageManager, { Message } from "./useMessageManager";

type MessageContextType = {
  messages: Message[];
  addMessage: (text: string, duration?: number) => string;
  removeMessage: (id: string) => void;
  clearAllMessages: () => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({
  children,
  maxMessages = 3,
  defaultDuration = 3000,
}: {
  children: ReactNode;
  maxMessages?: number;
  defaultDuration?: number;
}) => {
  const messageManager = useMessageManager({
    maxMessages,
    defaultDuration,
  });

  return (
    <MessageContext.Provider value={messageManager}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
