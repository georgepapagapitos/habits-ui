import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Button } from "./Button";
import { ThemeProvider } from "styled-components";
import { theme } from "../../theme";

describe("Button", () => {
  const renderButton = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <Button {...props}>Click Me</Button>
      </ThemeProvider>
    );
  };

  test("renders button with text", () => {
    renderButton();
    expect(screen.getByRole("button", { name: /click me/i })).toBeDefined();
  });

  test("calls onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    renderButton({ onClick: handleClick });

    await userEvent.click(screen.getByRole("button", { name: /click me/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("is disabled when disabled prop is true", () => {
    renderButton({ disabled: true });

    expect(screen.getByRole("button", { name: /click me/i })).toBeDisabled();
  });

  test("renders primary variant by default", () => {
    renderButton();
    const button = screen.getByRole("button", { name: /click me/i });

    // Check for primary button styling
    expect(button).toHaveStyle("background-color: rgb(101, 59, 129)");
  });

  test("renders secondary variant", () => {
    renderButton({ variant: "secondary" });
    const button = screen.getByRole("button", { name: /click me/i });

    // Check for secondary button styling
    expect(button).toHaveStyle("background-color: rgba(0, 0, 0, 0)");
    expect(button).toHaveStyle("border: 1px solid #a15fcd");
  });

  test("renders danger variant", () => {
    renderButton({ variant: "danger" });
    const button = screen.getByRole("button", { name: /click me/i });

    // Check for danger button styling
    expect(button).toHaveStyle("background-color: rgb(244, 67, 54)");
  });

  test("renders icon variant", () => {
    renderButton({ variant: "icon" });
    const button = screen.getByRole("button", { name: /click me/i });

    // Check for icon button styling
    expect(button).toHaveStyle("border-radius: 50%");
  });

  test("renders with left icon", () => {
    render(
      <ThemeProvider theme={theme}>
        <Button leftIcon={<span data-testid="left-icon">🔍</span>}>
          Search
        </Button>
      </ThemeProvider>
    );

    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toHaveTextContent(
      "🔍"
    );
  });

  test("renders with right icon", () => {
    render(
      <ThemeProvider theme={theme}>
        <Button rightIcon={<span data-testid="right-icon">➡️</span>}>
          Next
        </Button>
      </ThemeProvider>
    );

    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toHaveTextContent(
      "➡️"
    );
  });

  test("applies full width style when isFullWidth is true", () => {
    renderButton({ isFullWidth: true });
    const button = screen.getByRole("button", { name: /click me/i });

    expect(button).toHaveStyle("width: 100%");
  });
});
