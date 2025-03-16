import { useEffect, useState } from "react";
import {
  StatsContainer,
  StatCard,
  StatTitle,
  StatValue,
  ErrorMessage,
  LoadingSpinner,
} from "./stats.styles";
import { useAuth } from "@auth/hooks";
import axios from "axios";

interface StatsData {
  totalHabits: number;
  longestStreak: {
    habit: { name: string; id: string } | null;
    streak: number;
  };
  mostConsistent: {
    habit: { name: string; id: string } | null;
    percentage: number;
  };
  mostCompletedHabit: {
    habit: { name: string; id: string } | null;
    count: number;
  };
  totalCompletions: number;
  averageStreak: number;
}

export const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      // Only fetch if we have a token
      if (!token) {
        setError("Please log in to view your statistics");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the /api/habits/stats endpoint
        const response = await axios.get(`/api/habits/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError("Failed to fetch statistics");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);

        // Check if it's an authentication error
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("Your session has expired. Please log in again");
        } else {
          setError("An error occurred while fetching statistics");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!stats) {
    return <ErrorMessage>No statistics available</ErrorMessage>;
  }

  return (
    <StatsContainer>
      <StatCard>
        <StatTitle>Total Habits</StatTitle>
        <StatValue>{stats.totalHabits}</StatValue>
      </StatCard>

      <StatCard>
        <StatTitle>Total Completions</StatTitle>
        <StatValue>{stats.totalCompletions}</StatValue>
      </StatCard>

      <StatCard>
        <StatTitle>Longest Streak</StatTitle>
        <StatValue>
          {stats.longestStreak.habit
            ? `${stats.longestStreak.streak} days (${stats.longestStreak.habit.name})`
            : "No streaks yet"}
        </StatValue>
      </StatCard>

      <StatCard>
        <StatTitle>Most Consistent Habit</StatTitle>
        <StatValue>
          {stats.mostConsistent.habit
            ? `${stats.mostConsistent.percentage}% (${stats.mostConsistent.habit.name})`
            : "No data yet"}
        </StatValue>
      </StatCard>

      <StatCard>
        <StatTitle>Most Completed Habit</StatTitle>
        <StatValue>
          {stats.mostCompletedHabit.habit
            ? `${stats.mostCompletedHabit.count} times (${stats.mostCompletedHabit.habit.name})`
            : "No completions yet"}
        </StatValue>
      </StatCard>

      <StatCard>
        <StatTitle>Average Streak</StatTitle>
        <StatValue>{stats.averageStreak} days</StatValue>
      </StatCard>
    </StatsContainer>
  );
};
