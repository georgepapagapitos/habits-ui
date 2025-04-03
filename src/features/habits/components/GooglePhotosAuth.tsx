import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { habitApi } from "../services/habitApi";
import { logger } from "@utils/logger";
import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1.5rem;
`;

export const GooglePhotosAuth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const code = searchParams.get("code");
        if (code) {
          // Handle the callback
          await habitApi.handleGooglePhotosCallback(code);
          navigate("/rewards");
        } else {
          // Get the auth URL and redirect
          const authUrl = await habitApi.getGooglePhotosAuthUrl();
          window.location.href = authUrl;
        }
      } catch (err) {
        logger.error("Error in Google Photos auth:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <Container>
        <Title>Authorizing Google Photos</Title>
        <Message>Please wait while we connect to Google Photos...</Message>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Authorization Error</Title>
        <ErrorMessage>{error}</ErrorMessage>
        <button onClick={() => navigate("/rewards")}>Back to Rewards</button>
      </Container>
    );
  }

  return null;
};
