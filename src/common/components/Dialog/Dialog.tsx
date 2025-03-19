import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CloseButton,
  DialogBody,
  DialogContainer,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
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

  // When dialog opens, block scrolling on body
  useEffect(() => {
    if (isOpen) {
      // Only store the original if we're actually changing it
      // This prevents conflicts when multiple components try to change overflow
      const originalStyle = window.getComputedStyle(document.body).overflow;

      // Add a class instead of directly changing style to better control when overlapping components are present
      document.body.classList.add("dialog-open");

      // Only set overflow if it's not already set by another component
      if (originalStyle !== "hidden") {
        document.body.style.overflow = "hidden";
      }

      return () => {
        // Clean up by removing class and restoring original style
        document.body.classList.remove("dialog-open");

        // Only reset if there are no other dialogs still open
        if (!document.querySelector(".dialog-open")) {
          document.body.style.overflow = originalStyle;
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const dialog = (
    <DialogOverlay onClick={handleOverlayClick} style={{ zIndex: 20000 }}>
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

  // Use createPortal to render the dialog at the root level
  return createPortal(dialog, document.body);
};

export const DialogActions = DialogFooter;
