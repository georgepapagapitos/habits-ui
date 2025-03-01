import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.overlay};
  display: flex;
  justify-content: center;
  align-items: center; /* Center modal vertically */
  z-index: 2000; /* Highest z-index to appear above everything */

  /* Prevent any touch events from reaching elements behind the overlay */
  touch-action: none;
`;

export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  width: 90%; /* Slightly less than full width */
  max-width: 500px; /* Cap the width on larger screens */
  max-height: 80vh; /* Prevent taking up the full height */
  border-radius: ${({ theme }) =>
    theme.borderRadius.large}; /* Rounded corners on all sides */
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto; /* Allow scrolling within the modal if content is tall */
  box-shadow: ${({ theme }) => theme.shadows.large};

  /* Add safe area padding at the bottom */
  padding-bottom: calc(
    ${({ theme }) => theme.spacing.lg} + env(safe-area-inset-bottom, 0px)
  );

  /* Prevent the modal from being too close to the top or bottom on small screens */
  margin: ${({ theme }) => theme.spacing.md} 0;
`;
