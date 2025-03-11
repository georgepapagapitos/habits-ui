import { useAuth } from "@auth/hooks";
import { Button, Form, Group, Input, Label, Title } from "@components";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinkText, StyledLink } from "./loginForm.styles";

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
    } catch {
      // Error is handled in the auth context
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Login</Title>

      <Group>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </Group>

      <Group>
        <Label htmlFor="password" required>
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </Group>

      {(formError || error) && (
        <div data-testid="form-error">{formError || error}</div>
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
