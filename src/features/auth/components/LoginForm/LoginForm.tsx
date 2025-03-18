import { useAuth } from "@auth/hooks";
import { FormEvent, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ErrorMessage,
  Form,
  FormGroup,
  Input,
  InputContainer,
  Label,
  LinkText,
  PasswordToggle,
  StyledLink,
  Title,
} from "./loginForm.styles";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Title>Login</Title>

      <FormGroup>
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
          aria-describedby={formError || error ? "login-error" : undefined}
          autoComplete="email"
          autoFocus
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password" required>
          Password
        </Label>
        <InputContainer>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            aria-describedby={formError || error ? "login-error" : undefined}
            autoComplete="current-password"
          />
          <PasswordToggle
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </PasswordToggle>
        </InputContainer>
      </FormGroup>

      {(formError || error) && (
        <ErrorMessage id="login-error" data-testid="form-error">
          {formError || error}
        </ErrorMessage>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <LinkText>
        Don't have an account?{" "}
        <StyledLink onClick={handleRegisterClick} tabIndex={0}>
          Register
        </StyledLink>
      </LinkText>
    </Form>
  );
};
