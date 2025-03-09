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
  $isCurrentMonth?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: ${(props) =>
    props.$isPast || props.$isToday ? "pointer" : "default"};
  opacity: ${(props) => {
    // Full opacity for past or today dates
    if (props.$isPast || props.$isToday) return 1;
    // Lower opacity for future dates
    return 0.5;
  }};
  background-color: ${(props) => {
    // If completed, show success color with different shade depending on if it was due
    if (props.$isCompleted) {
      return props.$isDue
        ? props.theme.colors.successLight // Regular completion
        : props.theme.colors.infoLight; // Bonus completion
    }

    // Today's date gets special background if not completed
    if (props.$isToday && !props.$isCompleted)
      return props.theme.colors.backgroundAlt;

    // Past due dates that weren't completed get error color
    if (props.$isDue && props.$isPast && !props.$isCompleted)
      return props.theme.colors.errorLight;

    // Days that are scheduled get a prominent purple background
    if (props.$isDue) return props.theme.colors.transparent.primary20;

    // Non-scheduled days get a very light purple background with higher opacity
    return "rgba(161, 95, 205, 0.05)"; // Very light purple (using primary with 5% opacity)
  }};
  border: ${(props) => {
    // Today gets primary border
    if (props.$isToday) return `2px solid ${props.theme.colors.primary}`;
    // Scheduled days get a subtle border to distinguish them
    if (props.$isDue && !props.$isCompleted)
      return `1px solid ${props.theme.colors.borderLight}`;
    return "none";
  }};
  /* Use consistent text colors for better readability across all states */
  color: ${(props) => props.theme.colors.text};
  font-weight: ${(props) => (props.$isToday ? "bold" : "normal")};
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;

  &:hover {
    background-color: ${(props) => {
      // Only apply hover effects to clickable dates
      if (!props.$isPast && !props.$isToday) return;

      // For each state, provide a darker shade of the same color
      if (props.$isCompleted) {
        return props.$isDue
          ? props.theme.colors.successDark // Darker shade of success
          : props.theme.colors.infoDark; // Darker shade of info/bonus
      }

      // Scheduled days that are missed (past due and not completed)
      if (
        props.$isDue &&
        props.$isPast &&
        !props.$isCompleted &&
        !props.$isToday
      )
        return props.theme.colors.errorDark; // Darker shade of error for missed
      // Scheduled days (including today if due)
      else if (props.$isDue)
        return props.theme.colors.primaryLight; // Using lighter primary for better contrast
      // Non-scheduled days - slightly darker light purple
      else return "rgba(161, 95, 205, 0.1)"; // Darker shade of light purple (10% opacity)
    }};
    transform: ${(props) =>
      props.$isPast || props.$isToday ? "scale(1.05)" : "none"};

    /* Change text color on hover for dark backgrounds to improve contrast */
    color: ${(props) => {
      // For dark backgrounds on hover, use white text for better contrast

      // For missed days (past due and not completed)
      if (
        props.$isDue &&
        props.$isPast &&
        !props.$isCompleted &&
        !props.$isToday
      )
        return props.theme.colors.textOnDark; // White text on dark red background
      // For bonus completion days (completed but not due) - infoDark is a dark blue
      else if (props.$isCompleted && !props.$isDue)
        return props.theme.colors.textOnDark; // White text on dark blue background
      // For regular completion days - successDark is dark green
      else if (props.$isCompleted && props.$isDue)
        return props.theme.colors.textOnDark; // White text on dark green background
      else return props.theme.colors.text; // Standard text color for other states
    }};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.focus};
    outline-offset: 2px;
    box-shadow: ${(props) => props.theme.shadows.small};
  }

  &:active {
    transform: ${(props) =>
      props.$isPast || props.$isToday ? "scale(0.98)" : "none"};
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
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primaryText};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:active {
    transform: scale(0.95);
    background-color: ${({ theme }) => theme.colors.primaryDark};
    color: ${({ theme }) => theme.colors.textOnDark};
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
