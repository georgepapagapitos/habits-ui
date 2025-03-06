import styled from "styled-components";
import { LoginForm } from "@auth/components";
import { Header } from "@layout/components";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export const LoginPage = () => {
  return (
    <PageContainer>
      <Header title="Login" />
      <Content>
        <LoginForm />
      </Content>
    </PageContainer>
  );
};
