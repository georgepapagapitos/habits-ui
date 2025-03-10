import {
  Habit,
  HabitCreateDTO,
  HabitUpdateDTO,
  PhotoReward,
  HabitWithReward,
} from "../types/habit.types";
import { getUserTimezone } from "../utils/habitUtils";
import axios, { AxiosRequestConfig } from "axios";
import { format } from "date-fns";

// Using HabitWithReward interface imported from types

// Interface for cached photo data
interface CachedPhotoData {
  photo: PhotoReward;
  timestamp: number;
}

// Base URL for the API - using environment variables
const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/habits`;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Setup request headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const habitApi = {
  // Improved photo cache with expiration
  _photoCache: new Map<number, CachedPhotoData>(),

  // Cache TTL in milliseconds (24 hours)
  _photoCacheTTL: 24 * 60 * 60 * 1000,

  // Get a random photo from Google Photos API with better caching
  // If a seed is provided, it's used for a deterministic random photo
  getRandomPhoto: async (seed?: number): Promise<PhotoReward | null> => {
    try {
      // Check cache first if seed is provided - this avoids unnecessary API calls
      if (seed !== undefined && habitApi._photoCache.has(seed)) {
        const cachedData = habitApi._photoCache.get(seed);

        // Check if the cached data is still valid
        if (
          cachedData &&
          Date.now() - cachedData.timestamp < habitApi._photoCacheTTL
        ) {
          return cachedData.photo;
        }

        // If expired, remove from cache
        if (cachedData) {
          habitApi._photoCache.delete(seed);
        }
      }

      // Include the seed as a query parameter if provided
      const url =
        seed !== undefined
          ? `${import.meta.env.VITE_API_URL || "/api"}/photos/random?seed=${seed}`
          : `${import.meta.env.VITE_API_URL || "/api"}/photos/random`;

      // Use throttled request to avoid rate limiting
      interface PhotoResponse {
        data?: PhotoReward;
        url?: string;
        width?: number;
        height?: number;
      }

      const response = await habitApi._throttledGet<PhotoResponse>(url, {
        headers: getAuthHeaders(),
      });

      // Handle response formats - API might return either the photo directly or wrapped in data property
      let photoReward: PhotoReward | null = null;

      if (response) {
        if (response.data && response.data.url) {
          // Response is wrapped in data object
          photoReward = response.data;
        } else if (response.url) {
          // Response is the photo object directly
          photoReward = response;
        }
      }

      // Validate the photo data
      if (photoReward && photoReward.url) {
        // Store in cache if seed provided
        if (seed !== undefined) {
          habitApi._photoCache.set(seed, {
            photo: photoReward,
            timestamp: Date.now(),
          });

          // Prune cache if it gets too large (keep most recent 100 items)
          if (habitApi._photoCache.size > 100) {
            // Convert to array to sort by timestamp
            const cacheEntries = Array.from(habitApi._photoCache.entries());
            cacheEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            // Remove oldest entries
            const entriesToRemove = cacheEntries.slice(
              0,
              cacheEntries.length - 100
            );
            for (const [key] of entriesToRemove) {
              habitApi._photoCache.delete(key);
            }
          }
        }

        return photoReward;
      } else {
        return null;
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string }; status?: number };
        message?: string;
      };

      // Handle rate limiting specifically
      if (err.response?.status === 429) {
        // Return null so the app can continue without blocking on this
        return null;
      } else {
        return null;
      }
    }
  },

  // Reset a habit (clear all completions and streak)
  resetHabit: async (id: string): Promise<Habit> => {
    try {
      const response = await axios.patch(
        `${API_URL}/${id}/reset`,
        {},
        { headers: getAuthHeaders() }
      );

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
            [key: string]: unknown;
          };
          status?: number;
          statusText?: string;
        };
        message?: string;
      };
      console.error(
        `Error resetting habit ${id} [Status: ${err.response?.status} ${err.response?.statusText}]:`,
        err.response?.data || err
      );

      if (err.response?.data) {
        console.error(
          `Server response details:`,
          JSON.stringify(err.response.data, null, 2)
        );
      }

      throw err.response?.data?.error || err.message || "Failed to reset habit";
    }
  },

  // Improved request management with concurrency control
  _requestController: {
    // Last request timestamps by endpoint type
    lastRequestTimes: new Map<string, number>(),
    // Active requests counter to enable concurrency limits
    activeRequests: 0,
    // Maximum concurrent requests
    maxConcurrentRequests: 3,
    // Base delay between requests to the same endpoint in ms
    baseDelay: 500,
    // Requests waiting to be processed
    queue: [] as {
      url: string;
      config: AxiosRequestConfig;
      resolve: (data: unknown) => void;
      reject: (error: unknown) => void;
    }[],
    // Flag to track if we're processing the queue
    processing: false,

    // Add a request to the queue
    enqueue: function (
      url: string,
      config: AxiosRequestConfig,
      resolve: (data: unknown) => void,
      reject: (error: unknown) => void
    ) {
      this.queue.push({ url, config, resolve, reject });

      // Start processing if not already
      if (!this.processing) {
        this.processQueue();
      }
    },

    // Get the endpoint type from a URL for rate limiting purposes
    getEndpointType: function (url: string): string {
      // Extract the endpoint base path for categorization
      const urlObj = new URL(url, window.location.origin);
      const pathParts = urlObj.pathname.split("/");
      // Return the first meaningful segment after /api
      return pathParts[pathParts.indexOf("api") + 1] || "default";
    },

    // Process queue with concurrency and rate limiting
    processQueue: async function () {
      if (this.queue.length === 0) {
        this.processing = false;
        return;
      }

      this.processing = true;

      // Try to process as many requests as allowed by concurrency limit
      while (
        this.queue.length > 0 &&
        this.activeRequests < this.maxConcurrentRequests
      ) {
        const request = this.queue.shift();
        if (!request) continue;

        const { url, config, resolve, reject } = request;
        const endpointType = this.getEndpointType(url);

        // Check if we need to wait before making another request to this endpoint
        const now = Date.now();
        const lastRequestTime = this.lastRequestTimes.get(endpointType) || 0;
        const timeToWait = Math.max(
          0,
          this.baseDelay - (now - lastRequestTime)
        );

        // Increment active requests counter
        this.activeRequests++;

        // Wait if needed then execute
        setTimeout(async () => {
          try {
            // Update last request time for this endpoint
            this.lastRequestTimes.set(endpointType, Date.now());

            // Make the actual request
            const result = await axios.get(url, config);
            resolve(result.data);
          } catch (error) {
            const err = error as { response?: { status?: number } };

            // Handle rate limiting with exponential backoff
            if (err.response?.status === 429) {
              // If rate limited, we'll queue this request again with a longer delay
              this.queue.unshift({ url, config, resolve, reject });

              // We'll schedule the queue to process again after a delay
              setTimeout(() => {
                this.processQueue();
              }, 5000);

              // Don't reject in this case, just return to avoid double handling
              return;
            }

            // For other errors, reject the promise
            reject(error);
          } finally {
            // Always decrement the counter and process the queue
            this.activeRequests--;
            this.processQueue();
          }
        }, timeToWait);
      }

      // If we have unprocessed items but hit concurrency limit, schedule to check again
      if (
        this.queue.length > 0 &&
        this.activeRequests >= this.maxConcurrentRequests
      ) {
        setTimeout(() => this.processQueue(), 100);
      }
    },
  },

  // Throttled axios GET request with improved concurrency and caching
  _throttledGet: async <T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      habitApi._requestController.enqueue(url, config || {}, resolve, reject);
    });
  },

  // Get all habits with rate limiting and retries
  getAllHabits: async (): Promise<Habit[]> => {
    try {
      // Use throttled request to prevent rate limiting
      const response = await habitApi._throttledGet<{ data: Habit[] }>(
        API_URL,
        {
          headers: getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string }; status?: number };
        message?: string;
      };

      // Provide user-friendly error for rate limiting
      if (err.response?.status === 429) {
        console.error(
          "Error fetching habits: Too many requests, please try again later."
        );
        throw "Too many requests, please try again later.";
      } else {
        console.error("Error fetching habits:", err.response?.data || err);
        throw (
          err.response?.data?.error || err.message || "Failed to fetch habits"
        );
      }
    }
  },

  // Get a single habit by ID
  getHabitById: async (id: string): Promise<Habit> => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });

      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(`Error fetching habit ${id}:`, err.response?.data || err);
      throw err.response?.data?.error || err.message || "Failed to fetch habit";
    }
  },

  // Create a new habit
  createHabit: async (habitData: HabitCreateDTO): Promise<Habit> => {
    try {
      console.log("Creating habit with data:", habitData);
      const response = await axios.post(API_URL, habitData, {
        headers: getAuthHeaders(),
      });

      console.log("Create habit response:", response.data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error creating habit:", err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to create habit"
      );
    }
  },

  // Update an existing habit
  updateHabit: async (
    id: string,
    habitData: HabitUpdateDTO
  ): Promise<Habit> => {
    try {
      console.log(`Updating habit ${id} with data:`, habitData);
      const response = await axios.put(`${API_URL}/${id}`, habitData, {
        headers: getAuthHeaders(),
      });

      console.log("Update habit response:", response.data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(`Error updating habit ${id}:`, err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to update habit"
      );
    }
  },

  // Delete a habit (soft delete)
  deleteHabit: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(`Error deleting habit ${id}:`, err.response?.data || err);
      throw (
        err.response?.data?.error || err.message || "Failed to delete habit"
      );
    }
  },

  // Toggle habit completion
  toggleCompletion: async (
    id: string,
    date: Date = new Date(),
    seed?: number
  ): Promise<HabitWithReward> => {
    try {
      // Get user's timezone
      const userTimezone = getUserTimezone();

      // Format date as ISO string
      // This preserves the exact moment in time across timezones
      const isoDate = date.toISOString();

      // Log the request details for debugging
      const requestData = {
        date: isoDate,
        timezone: userTimezone,
        // Include the seed if provided for deterministic photo selection
        ...(seed !== undefined && { seed }),
      };

      console.log(
        `Toggling habit ${id} for date ${format(date, "yyyy-MM-dd")} in timezone ${userTimezone}`,
        `Request body:`,
        requestData
      );

      // Use the throttled request for consistency
      const response = await axios.patch(
        `${API_URL}/${id}/toggle-completion`,
        requestData,
        { headers: getAuthHeaders() }
      );

      console.log(
        "Toggle completion response (full):",
        JSON.stringify(response.data)
      );

      // Check if there's a reward photo in the response
      let rewardPhoto = undefined;

      // Handle reward photo extraction - could be in different places in the response
      if (response.data.rewardPhoto) {
        console.log("Found reward photo at top level");
        rewardPhoto = response.data.rewardPhoto;
      } else if (response.data.data && response.data.data.rewardPhoto) {
        console.log("Found reward photo in nested data");
        rewardPhoto = response.data.data.rewardPhoto;
      }

      // Verify the reward photo has the expected structure
      if (rewardPhoto && !rewardPhoto.url) {
        console.error("Invalid reward photo format:", rewardPhoto);
        rewardPhoto = undefined;
      }

      const habitWithReward: HabitWithReward = {
        ...response.data.data,
        rewardPhoto: rewardPhoto,
      };

      console.log("Processed habit with reward:", {
        habitId: habitWithReward._id,
        habitName: habitWithReward.name,
        hasRewardPhoto: !!habitWithReward.rewardPhoto,
        rewardPhotoDetails: habitWithReward.rewardPhoto,
      });

      return habitWithReward;
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
            [key: string]: unknown;
          };
          status?: number;
          statusText?: string;
        };
        message?: string;
      };

      // Handle rate limiting
      if (err.response?.status === 429) {
        console.error(
          `Rate limited when toggling habit ${id}. Will retry later.`
        );
        throw "Too many requests, please try again later.";
      }

      console.error(
        `Error toggling completion for habit ${id} [Status: ${err.response?.status} ${err.response?.statusText}]:`,
        err.response?.data || err
      );

      // More detailed error for debugging
      if (err.response?.data) {
        console.error(
          `Server response details:`,
          JSON.stringify(err.response.data, null, 2)
        );
      }

      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to toggle habit completion"
      );
    }
  },
};
