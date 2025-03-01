import React from "react";
import { MessageContainer, MessagesWrapper } from "./messages.styles";

type Message = {
  id: number;
  text: string;
};

interface MessagesProps {
  messages: Message[];
}

export const Messages: React.FC<MessagesProps> = ({
  messages,
}: MessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <MessagesWrapper>
      {messages.map((message) => (
        <MessageContainer key={message.id}>{message.text}</MessageContainer>
      ))}
    </MessagesWrapper>
  );
};
