import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks";
import {
  Form,
  Title,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  LinkText,
  StyledLink,
} from "./loginForm.styles";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { login, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    // Basic validation
    if (!email || !password) {
      setFormError("Please enter both email and password");
      return;
    }

    try {
      await login({ email, password });
      // If login is successful, navigate to home
      navigate("/");
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Login</Title>

      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </FormGroup>

      {(formError || error) && (
        <ErrorMessage>{formError || error}</ErrorMessage>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <LinkText>
        Don't have an account?{" "}
        <StyledLink onClick={handleRegisterClick}>Register</StyledLink>
      </LinkText>
    </Form>
  );
};
