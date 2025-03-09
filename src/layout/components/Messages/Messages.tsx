import { useMessages } from "@common/hooks";
import { MessageContainer, MessagesWrapper } from "./messages.styles";

export const Messages: React.FC = () => {
  const { messages } = useMessages();

  if (!messages || messages.length === 0) return null;

  return (
    <MessagesWrapper>
      {messages.map((message) => (
        <MessageContainer key={message.id.toString()}>
          {message.text}
        </MessageContainer>
      ))}
    </MessagesWrapper>
  );
};
