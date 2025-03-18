import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1.5rem;
    max-width: 100%;
    box-shadow: none;
  }
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.75rem;
  font-weight: 600;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  width: 100%;
`;

interface LabelProps {
  required?: boolean;
}

export const Label = styled.label<LabelProps>`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;

  ${({ required, theme }) =>
    required &&
    `
    &:after {
      content: " *";
      color: ${theme.colors.error};
    }
  `}
`;

export const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textLight};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryFocus};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    opacity: 0.7;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledBackground};
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryFocus};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.primaryActive};
    transform: translateY(1px);
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin: 0.75rem 0;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border-left: 3px solid ${({ theme }) => theme.colors.error};
`;

export const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const StyledLink = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:focus {
    outline: none;
    text-decoration: none;
    background-color: ${({ theme }) => theme.colors.primaryFocus};
    padding: 0 0.25rem;
    border-radius: 2px;
  }
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

export const FormDivider = styled.div`
  position: relative;
  margin: 1.5rem 0;
  text-align: center;

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
    z-index: 1;
  }

  span {
    position: relative;
    background-color: ${({ theme }) => theme.colors.surface};
    padding: 0 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
    z-index: 2;
  }
`;
