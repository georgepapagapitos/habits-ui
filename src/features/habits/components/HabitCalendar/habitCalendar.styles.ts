import styled from "styled-components";

export const CalendarContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.surface};
`;

export const DayHeader = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textLight};
  padding: ${({ theme }) => theme.spacing.xs};
`;

export const DateCell = styled.div<{
  $isToday: boolean;
  $isCompleted: boolean;
  $isDue: boolean;
  $isPast: boolean;
  $isFuture: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: ${(props) =>
    props.$isDue && !props.$isFuture ? "pointer" : "default"};
  opacity: ${(props) => {
    // Full opacity for dates that are due and not in the future
    if (props.$isDue && !props.$isFuture) return 1;
    // Medium opacity for completed dates (even if they weren't scheduled)
    if (props.$isCompleted) return 0.8;
    // Lower opacity for other dates
    return 0.5;
  }};
  background-color: ${(props) => {
    // If completed, always show success color (regardless of if it was scheduled)
    if (props.$isCompleted) return props.theme.colors.successLight;

    // Today's date gets special background if not completed
    if (props.$isToday && !props.$isCompleted)
      return props.theme.colors.backgroundAlt;

    // Past due dates that weren't completed get error color
    if (props.$isDue && props.$isPast && !props.$isCompleted)
      return props.theme.colors.errorLight;

    // Days that are scheduled get purple background to make them stand out
    if (props.$isDue) return props.theme.colors.transparent.primary10;

    // Not scheduled days get default background
    return props.theme.colors.background;
  }};
  border: ${(props) => {
    // Today gets primary border
    if (props.$isToday) return `2px solid ${props.theme.colors.primary}`;
    // Scheduled days get a subtle border to distinguish them
    if (props.$isDue && !props.$isCompleted)
      return `1px solid ${props.theme.colors.borderLight}`;
    return "none";
  }};
  color: ${(props) =>
    props.$isCompleted ? props.theme.colors.success : props.theme.colors.text};
  font-weight: ${(props) => (props.$isToday ? "bold" : "normal")};

  &:hover {
    background-color: ${(props) => {
      // Clickable dates (due and not in future) get hover effect
      if (props.$isDue && !props.$isFuture) {
        return props.$isCompleted
          ? props.theme.colors.success // Completed - darker success color on hover
          : props.theme.colors.primaryLight; // Not completed - primary light color on hover
      }

      // Non-clickable dates keep their normal color
      if (props.$isCompleted) return props.theme.colors.successLight;
      if (props.$isDue) return props.theme.colors.transparent.primary10; // Scheduled days
      return props.theme.colors.background; // Not scheduled days - default background
    }};
  }
`;

export const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const MonthTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
`;

export const NavigationButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primaryText};
  }
`;

export const Legend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const LegendSwatch = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${(props) => props.$color};
`;
