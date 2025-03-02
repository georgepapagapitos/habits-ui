import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../common/components/Button";
import {
  Error,
  Form,
  Group,
  Label,
  Title,
} from "../../../../common/components/Form";
import { Input } from "../../../../common/components/Input";
import { useAuth } from "../../hooks";
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

      {(formError || error) && <Error>{formError || error}</Error>}

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
