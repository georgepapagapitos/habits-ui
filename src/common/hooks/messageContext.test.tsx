import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import { MessageProvider, useMessages } from "./messageContext";
import * as useMessageManagerModule from "./useMessageManager";

// Mock the useMessageManager hook
vi.mock("./useMessageManager", () => ({
  default: vi.fn(),
}));

// Create a test component that uses the message context
const TestComponent = () => {
  const { messages, addMessage, clearAllMessages } = useMessages();

  return (
    <div>
      <button
        data-testid="add-message"
        onClick={() => addMessage("Test message")}
      >
        Add Message
      </button>
      <button data-testid="clear-messages" onClick={clearAllMessages}>
        Clear Messages
      </button>
      <ul>
        {messages.map((message) => (
          <li key={message.id} data-testid="message-item">
            {message.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe("MessageContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides message state and functions from useMessageManager", () => {
    // Prepare mock implementation
    const mockAddMessage = vi.fn().mockReturnValue("message-id-1");
    const mockClearAllMessages = vi.fn();

    // Mock the return value of useMessageManager
    (
      useMessageManagerModule.default as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      messages: [{ id: "message-id-1", text: "Test message" }],
      addMessage: mockAddMessage,
      removeMessage: vi.fn(),
      clearAllMessages: mockClearAllMessages,
    });

    // Render the test component with the provider
    render(
      <MessageProvider>
        <TestComponent />
      </MessageProvider>
    );

    // Check if message is displayed
    const messageItems = screen.getAllByTestId("message-item");
    expect(messageItems).toHaveLength(1);
    expect(messageItems[0]).toHaveTextContent("Test message");

    // Test add message functionality
    fireEvent.click(screen.getByTestId("add-message"));
    expect(mockAddMessage).toHaveBeenCalledWith("Test message");

    // Test clear messages functionality
    fireEvent.click(screen.getByTestId("clear-messages"));
    expect(mockClearAllMessages).toHaveBeenCalled();
  });

  it("passes custom options to useMessageManager", () => {
    // Render the test component with the provider and custom options
    render(
      <MessageProvider maxMessages={5} defaultDuration={5000}>
        <TestComponent />
      </MessageProvider>
    );

    // Check if the options were passed correctly
    expect(useMessageManagerModule.default).toHaveBeenCalledWith({
      maxMessages: 5,
      defaultDuration: 5000,
    });
  });
});
