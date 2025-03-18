import { useAuth } from "@auth/hooks";
import { Spinner } from "@components/Spinner";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ErrorMessage,
  LoadingContainer,
  StatCard,
  StatsContainer,
  StatsHeader,
  StatTitle,
  StatValue,
} from "./stats.styles";

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
    return (
      <LoadingContainer>
        <Spinner label="Loading statistics" />
      </LoadingContainer>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!stats) {
    return <ErrorMessage>No statistics available</ErrorMessage>;
  }

  return (
    <>
      <StatsHeader data-testid="stats-header">
        <h2>Your Progress</h2>
        <p>
          Track your habit journey with these key insights into your consistency
          and achievements
        </p>
      </StatsHeader>
      <StatsContainer data-testid="stats-container">
        <StatCard data-testid="stat-total-habits">
          <StatTitle>Total Habits</StatTitle>
          <StatValue>
            <span data-testid="total-habits-value">{stats.totalHabits}</span>{" "}
            habits created
          </StatValue>
        </StatCard>

        <StatCard data-testid="stat-total-completions">
          <StatTitle>Total Completions</StatTitle>
          <StatValue>
            <span data-testid="total-completions-value">
              {stats.totalCompletions}
            </span>{" "}
            total check-ins
          </StatValue>
        </StatCard>

        <StatCard data-testid="stat-longest-streak">
          <StatTitle>Longest Streak</StatTitle>
          <StatValue>
            {stats.longestStreak.habit ? (
              <>
                <span data-testid="longest-streak-value">
                  {stats.longestStreak.streak}
                </span>{" "}
                days
                <br />
                <small data-testid="longest-streak-habit">
                  {stats.longestStreak.habit.name}
                </small>
              </>
            ) : (
              "No streaks yet"
            )}
          </StatValue>
        </StatCard>

        <StatCard data-testid="stat-most-consistent">
          <StatTitle>Most Consistent</StatTitle>
          <StatValue>
            {stats.mostConsistent.habit ? (
              <>
                <span data-testid="most-consistent-value">
                  {stats.mostConsistent.percentage}%
                </span>{" "}
                completion
                <br />
                <small data-testid="most-consistent-habit">
                  {stats.mostConsistent.habit.name}
                </small>
              </>
            ) : (
              "No data yet"
            )}
          </StatValue>
        </StatCard>

        <StatCard data-testid="stat-most-completed">
          <StatTitle>Most Completed</StatTitle>
          <StatValue>
            {stats.mostCompletedHabit.habit ? (
              <>
                <span data-testid="most-completed-value">
                  {stats.mostCompletedHabit.count}
                </span>{" "}
                times
                <br />
                <small data-testid="most-completed-habit">
                  {stats.mostCompletedHabit.habit.name}
                </small>
              </>
            ) : (
              "No completions yet"
            )}
          </StatValue>
        </StatCard>

        <StatCard data-testid="stat-average-streak">
          <StatTitle>Average Streak</StatTitle>
          <StatValue>
            <span data-testid="average-streak-value">
              {stats.averageStreak}
            </span>{" "}
            days
          </StatValue>
        </StatCard>
      </StatsContainer>
    </>
  );
};
