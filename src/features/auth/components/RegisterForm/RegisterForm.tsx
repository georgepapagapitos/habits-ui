import { useAuth } from "@auth/hooks";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
} from "./registerForm.styles";

export const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    // Basic validation
    if (!username || !email || !password) {
      setFormError("Please fill out all required fields");
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <Form onSubmit={handleSubmit} data-testid="register-form">
      <Title>Create Account</Title>

      <FormGroup>
        <Label htmlFor="username" required>
          Username
        </Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
          aria-describedby={formError || error ? "register-error" : undefined}
          autoComplete="username"
          autoFocus
        />
      </FormGroup>

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
          aria-describedby={formError || error ? "register-error" : undefined}
          autoComplete="email"
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
            placeholder="Create a password (min. 6 characters)"
            required
            aria-describedby={formError || error ? "register-error" : undefined}
            autoComplete="new-password"
            minLength={6}
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

      <FormGroup>
        <Label htmlFor="confirmPassword" required>
          Confirm Password
        </Label>
        <InputContainer>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            aria-describedby={formError || error ? "register-error" : undefined}
            autoComplete="new-password"
          />
          <PasswordToggle
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </PasswordToggle>
        </InputContainer>
      </FormGroup>

      {(formError || error) && (
        <ErrorMessage id="register-error" data-testid="form-error">
          {formError || error}
        </ErrorMessage>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <LinkText>
        Already have an account?{" "}
        <StyledLink onClick={handleLoginClick} tabIndex={0}>
          Login
        </StyledLink>
      </LinkText>
    </Form>
  );
};
