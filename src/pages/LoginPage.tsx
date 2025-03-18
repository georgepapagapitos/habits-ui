import { LoginForm } from "@auth/components";
import { Header } from "@layout/components";
import { BrandingText, Content, PageContainer } from "./loginPage.styles";

export const LoginPage = () => {
  return (
    <PageContainer>
      <Header title="Login" />
      <Content>
        <LoginForm />
        <BrandingText>Track your habits and achieve your goals!</BrandingText>
      </Content>
    </PageContainer>
  );
};
