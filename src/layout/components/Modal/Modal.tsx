import { lockScroll, unlockScroll } from "@utils/scrollLock";
import { ReactNode, useEffect } from "react";
import { ModalContent, Overlay } from "./modal.styles";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
}: ModalProps) => {
  // Lock scroll when modal opens, unlock when it closes
  useEffect(() => {
    // Lock scroll when the component mounts
    lockScroll();

    // Unlock scroll when the component unmounts
    return () => {
      unlockScroll();
    };
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Add event listener for ESC key
    document.addEventListener("keydown", handleEscKey);

    // Clean up event listener
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </Overlay>
  );
};
