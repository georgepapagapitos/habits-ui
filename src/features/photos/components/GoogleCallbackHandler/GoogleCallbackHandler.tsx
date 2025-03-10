import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { photoApi } from "../../services/photoApi";
import { useMessages } from "@hooks";
import { styled } from "styled-components";

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 50vh;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: var(--color-primary);
`;

const Message = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const ProgressIndicator = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const GoogleCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const { addMessage } = useMessages();

  useEffect(() => {
    // Extract code or error from URL parameters
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    const processAuthCode = async () => {
      try {
        if (error) {
          console.error("Error from Google Auth:", error);
          setStatus("error");
          setErrorMessage(error);
          addMessage(`Google Photos authentication failed: ${error}`);

          // Navigate back to rewards page after a short delay
          setTimeout(() => {
            navigate("/");
          }, 3000);
          return;
        }

        if (!code) {
          setStatus("error");
          setErrorMessage("No authorization code received from Google");
          addMessage(
            "Google Photos authentication failed: No authorization code received"
          );

          // Navigate back to rewards page after a short delay
          setTimeout(() => {
            navigate("/");
          }, 3000);
          return;
        }

        // Process the authorization code and state
        const state = searchParams.get("state");
        const result = await photoApi.handleAuthCallback(
          code,
          state || undefined
        );
        console.log("Auth callback result:", result);

        setStatus("success");
        addMessage("Successfully connected to Google Photos!");

        // Navigate back to rewards page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        console.error("Error processing auth code:", err);
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : String(err));
        addMessage(
          `Failed to connect to Google Photos: ${err instanceof Error ? err.message : String(err)}`
        );

        // Navigate back to rewards page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    processAuthCode();
  }, [searchParams, navigate, addMessage]);

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <ProgressIndicator />
            <Title>Processing Google Photos Authorization</Title>
            <Message>
              Please wait while we complete your connection to Google Photos...
            </Message>
          </>
        );
      case "success":
        return (
          <>
            <Title>Connection Successful!</Title>
            <Message>
              Your Google Photos account has been successfully connected.
              Redirecting you back to the rewards page...
            </Message>
          </>
        );
      case "error":
        return (
          <>
            <Title>Connection Failed</Title>
            <Message>
              There was a problem connecting to Google Photos: {errorMessage}
              <br />
              Redirecting you back to the rewards page...
            </Message>
          </>
        );
      default:
        return null;
    }
  };

  return <Container>{renderContent()}</Container>;
};
