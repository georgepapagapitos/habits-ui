import { useAuth } from "@auth/hooks";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ErrorMessage,
  Form,
  FormGroup,
  Input,
  Label,
  LinkText,
  StyledLink,
  Title,
} from "../LoginForm/loginForm.styles";

export const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { register, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    // Basic validation
    if (!username || !email || !password) {
      setFormError("Please fill out all fields");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    try {
      await register({ username, email, password });
      // If registration is successful, navigate to home
      navigate("/");
    } catch {
      // Error is handled in the auth context
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Create Account</Title>

      <FormGroup>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
        />
      </FormGroup>

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
          placeholder="Create a password"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
        />
      </FormGroup>

      {(formError || error) && (
        <ErrorMessage>{formError || error}</ErrorMessage>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Register"}
      </Button>

      <LinkText>
        Already have an account?{" "}
        <StyledLink onClick={handleLoginClick}>Login</StyledLink>
      </LinkText>
    </Form>
  );
};
