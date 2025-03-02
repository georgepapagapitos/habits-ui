import styled from "styled-components";
import { RegisterForm } from "../features/auth";
import { Header } from "../layout/components";

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

export const RegisterPage = () => {
  return (
    <PageContainer>
      <Header title="Create Account" />
      <Content>
        <RegisterForm />
      </Content>
    </PageContainer>
  );
};
