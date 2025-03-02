import { ReactNode, useEffect, useRef } from "react";
import {
  DialogOverlay,
  DialogContainer,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  CloseButton,
} from "./dialog.styles";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  size?: "small" | "medium" | "large";
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  size = "medium",
}: DialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <DialogOverlay onClick={handleOverlayClick}>
      <DialogContainer
        $size={size}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
      >
        <DialogContent>
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            <CloseButton onClick={onClose} aria-label="Close dialog">
              ✕
            </CloseButton>
          </DialogHeader>

          <DialogBody>{children}</DialogBody>

          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </DialogContainer>
    </DialogOverlay>
  );
};

export const DialogActions = DialogFooter;
