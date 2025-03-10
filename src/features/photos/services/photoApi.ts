import axios from "axios";

// Types for response data
interface Album {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoBaseUrl?: string;
  coverPhotoMediaItemId?: string;
}

interface Photo {
  id: string;
  baseUrl: string;
  productUrl: string;
  mimeType: string;
  filename: string;
  mediaMetadata?: {
    creationTime: string;
    width: string;
    height: string;
  };
}

// Base URL for the API - using environment variables
const API_URL = `${import.meta.env.VITE_API_URL || "/api"}/photos`;

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

// The main API object
const photoApi = {
  // Get the Google authorization URL
  getAuthUrl: async (): Promise<{ authUrl: string; redirectUri: string }> => {
    try {
      const response = await axios.get(`${API_URL}/auth-url`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error getting auth URL:", err.response?.data || err);
      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to get authorization URL"
      );
    }
  },

  // Handle the OAuth callback (post code from redirect)
  handleAuthCallback: async (
    code: string,
    state?: string
  ): Promise<{ message: string }> => {
    try {
      // Include state parameter if available for proper OAuth flow validation
      const response = await axios.post(
        `${API_URL}/auth-callback`,
        { code, ...(state ? { state } : {}) },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error handling auth callback:", err.response?.data || err);
      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to complete Google authentication"
      );
    }
  },

  // Get all user albums
  getAlbums: async (): Promise<Album[]> => {
    try {
      const response = await axios.get(`${API_URL}/albums`, {
        headers: getAuthHeaders(),
      });

      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "albums" in response.data
      ) {
        // Some APIs nest the albums array in an 'albums' property
        return Array.isArray(response.data.albums) ? response.data.albums : [];
      } else {
        console.warn("Unexpected albums response format:", response.data);
        return []; // Return empty array as fallback
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: { error?: string; message?: string };
          status?: number;
        };
        message?: string;
      };

      // Handle authentication errors differently
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error(
          "Authentication error getting albums:",
          err.response.data
        );
        return []; // Return empty array instead of throwing
      }

      console.error("Error getting albums:", err.response?.data || err);
      throw (
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to get Google Photos albums"
      );
    }
  },

  // Get photos from a specific album
  getAlbumPhotos: async (albumId: string): Promise<Photo[]> => {
    try {
      const response = await axios.get(`${API_URL}/albums/${albumId}/photos`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error getting album photos:", err.response?.data || err);
      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to get photos from this album"
      );
    }
  },

  // Select an album for rewards
  selectAlbum: async (albumId: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post(
        `${API_URL}/select-album`,
        { albumId },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error selecting album:", err.response?.data || err);
      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to select album for rewards"
      );
    }
  },

  // Get a random photo reward
  getRewardPhoto: async (): Promise<
    Photo | { notConnected: true; message: string }
  > => {
    try {
      const response = await axios.get(`${API_URL}/reward`, {
        headers: getAuthHeaders(),
      });

      console.log("API reward photo response:", response);
      console.log("API reward photo data:", response.data);

      // Extract the photo object from the nested response
      // The API returns { photo: { id, baseUrl, etc. } }
      const photoData = response.data.photo;

      // Check if we received a valid Photo object
      if (!photoData || !photoData.id || !photoData.baseUrl) {
        console.warn(
          "API response missing required photo fields:",
          response.data
        );
        return { notConnected: true, message: "Invalid photo data received" };
      }

      return photoData;
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
          };
          status?: number;
        };
        message?: string;
      };

      // Check for album selection errors (400 status)
      if (err.response?.status === 400) {
        const errorMessage =
          err.response.data?.message || err.response.data?.error || String(err);

        // Check if error is related to no album selected
        if (errorMessage.includes("album") || errorMessage.includes("Album")) {
          console.warn("No album selected:", errorMessage);
          return { notConnected: true, message: errorMessage };
        }
      }

      // Check for auth errors (401 or 403 status)
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error("Authentication error:", err.response.data);
        return {
          notConnected: true,
          message: "Not authenticated with Google Photos",
        };
      }

      console.error("Error getting reward photo:", err.response?.data || err);
      throw (
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to get reward photo"
      );
    }
  },

  // Disconnect from Google Photos by clearing tokens
  disconnectGooglePhotos: async (): Promise<{ message: string }> => {
    try {
      const response = await axios.post(
        `${API_URL}/disconnect`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error(
        "Error disconnecting Google Photos:",
        err.response?.data || err
      );
      throw (
        err.response?.data?.error ||
        err.message ||
        "Failed to disconnect Google Photos"
      );
    }
  },
};

// Export the types and API object
export type { Album, Photo };
export { photoApi };
