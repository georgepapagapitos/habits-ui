import { Dialog } from "./Dialog";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@tests/utils";
import { vi } from "vitest";

describe("Dialog Component", () => {
  const onCloseMock = vi.fn();
  const title = "Test Dialog";
  const content = "Dialog content here";
  const footerContent = "Footer actions";

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  test("renders dialog when isOpen is true", () => {
    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} title={title}>
        {content}
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  test("does not render dialog when isOpen is false", () => {
    renderWithProviders(
      <Dialog isOpen={false} onClose={onCloseMock} title={title}>
        {content}
      </Dialog>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText(title)).not.toBeInTheDocument();
    expect(screen.queryByText(content)).not.toBeInTheDocument();
  });

  test("renders footer when provided", () => {
    renderWithProviders(
      <Dialog
        isOpen={true}
        onClose={onCloseMock}
        title={title}
        footer={footerContent}
      >
        {content}
      </Dialog>
    );

    expect(screen.getByText(footerContent)).toBeInTheDocument();
  });

  test("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} title={title}>
        {content}
      </Dialog>
    );

    const closeButton = screen.getByRole("button", { name: /close dialog/i });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when clicking outside and closeOnOutsideClick is true", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} closeOnOutsideClick={true}>
        {content}
      </Dialog>
    );

    // Click on the overlay (the parent of the dialog)
    const overlay = screen.getByRole("dialog").parentElement;
    await user.click(overlay!);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("does not call onClose when clicking outside and closeOnOutsideClick is false", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} closeOnOutsideClick={false}>
        {content}
      </Dialog>
    );

    // Click on the overlay (the parent of the dialog)
    const overlay = screen.getByRole("dialog").parentElement;
    await user.click(overlay!);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test("calls onClose when Escape key is pressed and closeOnEscape is true", async () => {
    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} closeOnEscape={true}>
        {content}
      </Dialog>
    );

    // Simulate pressing the Escape key
    await userEvent.keyboard("{Escape}");

    // Wait for the event to be processed
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  test("does not call onClose when Escape key is pressed and closeOnEscape is false", async () => {
    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} closeOnEscape={false}>
        {content}
      </Dialog>
    );

    // Simulate pressing the Escape key
    await userEvent.keyboard("{Escape}");

    // Give some time for any potential event handling
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  test("renders with different sizes", () => {
    // We can't test for class names directly with styled-components because they generate random class names
    // Instead, we'll test that the component renders with different sizes

    // Test small size
    const { unmount: unmountSmall } = renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} size="small">
        {content}
      </Dialog>
    );

    // Dialog container should be in the document
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    unmountSmall();

    // Test large size
    const { unmount: unmountLarge } = renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock} size="large">
        {content}
      </Dialog>
    );

    // Dialog container should be in the document
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    unmountLarge();

    // Test default (medium) size
    renderWithProviders(
      <Dialog isOpen={true} onClose={onCloseMock}>
        {content}
      </Dialog>
    );

    // Dialog container should be in the document
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
