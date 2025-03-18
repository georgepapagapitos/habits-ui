import { RegisterForm } from "@auth/components";
import { Header } from "@layout/components";
import { BrandingText, Content, PageContainer } from "./registerPage.styles";

export const RegisterPage = () => {
  return (
    <PageContainer>
      <Header title="Create Account" />
      <Content>
        <RegisterForm />
        <BrandingText>Track your habits and achieve your goals!</BrandingText>
      </Content>
    </PageContainer>
  );
};
