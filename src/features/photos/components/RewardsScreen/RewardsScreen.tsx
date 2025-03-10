import { Dialog } from "@common/components/Dialog";
import { useHabits } from "@habits/hooks";
import { WeekDay } from "@habits/types";
import { useMessages } from "@hooks";
import { Modal } from "@layout/components";
import { useEffect, useState } from "react";
import type { Album, Photo } from "../../services/photoApi";
import { photoApi } from "../../services/photoApi";
import {
  AlbumCard,
  AlbumCover,
  AlbumGrid,
  AlbumTitle,
  Button,
  Container,
  ExpandedPhotoCaption,
  ExpandedPhotoContainer,
  ExpandedPhotoImage,
  InfoSection,
  Message,
  PhotoCard,
  PhotoContainer,
  PhotoImage,
  PhotoPlaceholder,
  SelectionIndicator,
  Subtitle,
  Title,
} from "./rewardsScreen.styles";

export const RewardsScreen = () => {
  const { addMessage } = useMessages();
  const { habits } = useHabits();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [hasSelectedAlbum, setHasSelectedAlbum] = useState(false);
  const [isSelectingAlbum, setIsSelectingAlbum] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [usingCachedPhotos, setUsingCachedPhotos] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<Photo | null>(null);

  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // Calculate completed habits for today
  const completedHabits = habits.filter((habit) =>
    habit.completedDates?.some((date) => date.startsWith(today))
  );

  // Local storage key for daily photos
  const DAILY_PHOTOS_STORAGE_KEY = "dailyRewardPhotos";

  // Calculate number of rewards earned today
  const rewardsEarned = completedHabits.length;

  // Check if all available habits for today have been completed
  const totalHabitsForToday = habits.filter((habit) => {
    const today = new Date().getDay();
    // Convert JS day number (0-6, starting with Sunday) to WeekDay string
    const daysOfWeek: Array<WeekDay> = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const todayName = daysOfWeek[today];
    return habit.frequency.includes(todayName);
  }).length;

  const allHabitsCompleted =
    rewardsEarned === totalHabitsForToday && totalHabitsForToday > 0;

  // Function to check if stored photos are valid for today
  const getStoredPhotos = (): { date: string; photos: Photo[] } | null => {
    try {
      const storedData = localStorage.getItem(DAILY_PHOTOS_STORAGE_KEY);
      if (!storedData) return null;

      const data = JSON.parse(storedData);
      // Verify data structure and that the date is today
      if (data && data.date === today && Array.isArray(data.photos)) {
        return data;
      }
      return null;
    } catch (e) {
      console.error("Error reading stored photos:", e);
      return null;
    }
  };

  // Function to store photos for today
  const storePhotos = (photos: Photo[]) => {
    try {
      const data = {
        date: today,
        photos: photos,
      };
      localStorage.setItem(DAILY_PHOTOS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error storing photos:", e);
    }
  };

  // Function to fetch reward photos
  const fetchRewardPhotos = async () => {
    setLoading(true);
    try {
      // Check if we have valid stored photos for today
      const storedPhotoData = getStoredPhotos();

      if (storedPhotoData) {
        // If we have stored photos for today, use them
        console.log("Using stored photos from today:", storedPhotoData);
        setUsingCachedPhotos(true);

        // If we need more photos than what's stored (user completed more habits)
        if (storedPhotoData.photos.length < rewardsEarned) {
          // First check user connection and album selection status
          let isConnected = false;
          let hasAlbum = false;

          try {
            // Test if we can get a reward photo
            await photoApi.getRewardPhoto();
            isConnected = true;
            hasAlbum = true;
          } catch (err) {
            const errorMsg = String(err);
            if (
              errorMsg.includes("No album selected") ||
              errorMsg.includes("select an album")
            ) {
              isConnected = true;
              hasAlbum = false;
            }
          }

          setConnected(isConnected);
          setHasSelectedAlbum(hasAlbum);

          // If not connected or no album, use the stored photos we have
          if (!isConnected || !hasAlbum) {
            setPhotos(storedPhotoData.photos);
            setLoading(false);
            return;
          }

          // Otherwise, fetch additional photos
          const newPhotos = [...storedPhotoData.photos];

          // Only fetch the additional photos needed
          for (let i = storedPhotoData.photos.length; i < rewardsEarned; i++) {
            try {
              const response = await photoApi.getRewardPhoto();

              if ("notConnected" in response) {
                break;
              }

              newPhotos.push(response);
            } catch (photoErr) {
              console.warn("Error fetching additional reward photo:", photoErr);
              continue;
            }
          }

          // Store and set the updated photos
          storePhotos(newPhotos);
          setPhotos(newPhotos);
        } else {
          // We have enough or more stored photos than needed
          // Just use the first rewardsEarned photos
          const photosToShow = storedPhotoData.photos.slice(0, rewardsEarned);
          setPhotos(photosToShow);

          // For connection status, we'll assume we're still connected
          // since we successfully fetched photos before
          setConnected(true);
          setHasSelectedAlbum(true);
        }

        setLoading(false);
        return;
      }

      // No stored photos for today, proceed with normal photo fetching
      setUsingCachedPhotos(false);
      // First check if user is connected and has selected an album
      try {
        // Try to get one photo first to check connection/album status
        await photoApi.getRewardPhoto();

        // If successful, we're connected and have an album selected
        setConnected(true);
        setHasSelectedAlbum(true);
      } catch (err) {
        const errorMsg = String(err);

        // Check if the error is about no album selected
        if (
          errorMsg.includes("No album selected") ||
          errorMsg.includes("select an album")
        ) {
          setConnected(true);
          setHasSelectedAlbum(false);
          setLoading(false);
          return;
        }

        // If it's not about album, it might be auth or connection issue
        setConnected(false);
        setHasSelectedAlbum(false);
        setLoading(false);
        return;
      }

      // If we get here, we're connected and have an album, so fetch all rewards
      const newPhotos: Photo[] = [];

      // Only fetch up to the number of completed habits
      for (let i = 0; i < rewardsEarned; i++) {
        try {
          const response = await photoApi.getRewardPhoto();
          console.log("Received photo response:", response);

          if ("notConnected" in response) {
            console.log("Not connected response detected");
            break; // Stop fetching if we get a notConnected response
          }

          // Our getRewardPhoto already extracts the photo object
          // and validates it has the required fields
          newPhotos.push(response);
        } catch (photoErr) {
          // Skip this photo and continue with others
          console.warn("Error fetching a reward photo:", photoErr);
          continue;
        }
      }

      // Store the photos for today
      storePhotos(newPhotos);
      setPhotos(newPhotos);
    } catch (error) {
      console.error("Error in fetchRewardPhotos:", error);
      addMessage("Failed to load reward photos");
    } finally {
      setLoading(false);
    }
  };

  // Fetch the data when component mounts or when state changes
  useEffect(() => {
    fetchRewardPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, rewardsEarned]);

  // Handler for connecting to Google Photos
  const handleConnectGoogle = async () => {
    try {
      const { authUrl } = await photoApi.getAuthUrl();

      // Redirect to Google auth in same window (it will redirect back to our callback)
      window.location.href = authUrl;

      // No need for additional messages since we're redirecting
    } catch (err) {
      console.error("Failed to start Google authentication:", err);
      addMessage("Failed to start Google authentication");
    }
  };

  // Handler for selecting an album
  const handleSelectAlbum = async (albumId: string) => {
    try {
      await photoApi.selectAlbum(albumId);
      setSelectedAlbumId(albumId);
      setIsSelectingAlbum(false);
      setHasSelectedAlbum(true);
      addMessage("Album selected successfully");

      // Refresh the photos
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to select album:", err);
      addMessage("Failed to select album");
    }
  };

  // Handler for opening album selection
  const handleOpenAlbumSelection = async () => {
    try {
      setIsSelectingAlbum(true);
      const fetchedAlbums = await photoApi.getAlbums();

      // Make sure we have an array of albums
      if (Array.isArray(fetchedAlbums)) {
        setAlbums(fetchedAlbums);
      } else {
        console.error("Expected albums array but got:", fetchedAlbums);
        setAlbums([]);
        addMessage("Error loading albums data");
      }
    } catch (error) {
      console.error("Failed to load albums:", error);
      setAlbums([]);
      addMessage("Failed to load albums");
    }
  };

  // Handler for checking connection status
  const handleCheckConnection = () => {
    // Refresh the photos, which will check connection status
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handler for manually refreshing photos (bypassing cache)
  const handleRefreshPhotos = () => {
    // Clear the stored photos to force a fresh fetch
    localStorage.removeItem(DAILY_PHOTOS_STORAGE_KEY);
    setUsingCachedPhotos(false);
    setRefreshTrigger((prev) => prev + 1);
    addMessage("Refreshed photos from Google Photos");
  };

  // Handler for disconnecting from Google Photos
  const handleDisconnectGoogle = async () => {
    try {
      await photoApi.disconnectGooglePhotos();
      addMessage("Disconnected from Google Photos successfully");
      setConnected(false);
      setHasSelectedAlbum(false);
      setPhotos([]);

      // Clear stored photos
      localStorage.removeItem(DAILY_PHOTOS_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to disconnect from Google Photos:", err);
      addMessage("Failed to disconnect from Google Photos");
    }
  };

  // Render expanded photo dialog
  const renderExpandedPhotoDialog = () => (
    <Dialog
      isOpen={!!expandedPhoto}
      onClose={() => setExpandedPhoto(null)}
      size="large"
    >
      <ExpandedPhotoContainer>
        {expandedPhoto?.baseUrl ? (
          <ExpandedPhotoImage
            src={`${expandedPhoto.baseUrl}=w2000`}
            alt={expandedPhoto.filename || "Expanded photo"}
            loading="lazy"
            onError={(e) => {
              console.error("Expanded image failed to load:", e);
              e.currentTarget.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="%23888888">Image unavailable</text></svg>';
            }}
          />
        ) : (
          <PhotoPlaceholder>Image not available</PhotoPlaceholder>
        )}
        {expandedPhoto?.filename && (
          <ExpandedPhotoCaption>{expandedPhoto.filename}</ExpandedPhotoCaption>
        )}
      </ExpandedPhotoContainer>
    </Dialog>
  );

  // Render album selection modal
  const renderAlbumSelectionModal = () => (
    <Modal onClose={() => setIsSelectingAlbum(false)}>
      <Container>
        <Title>Select Photo Album</Title>
        <Message>
          Choose an album to use for your daily rewards. Each completed habit
          will unlock one random photo from this album.
        </Message>
        <AlbumGrid>
          {Array.isArray(albums) ? (
            albums.map((album) => (
              <AlbumCard
                key={album.id}
                $selected={album.id === selectedAlbumId}
                onClick={() => handleSelectAlbum(album.id)}
              >
                {album.coverPhotoBaseUrl ? (
                  <AlbumCover
                    src={`${album.coverPhotoBaseUrl}=w600-h400-c`}
                    alt={album.title}
                    loading="lazy"
                    onError={(e) => {
                      console.error("Album cover failed to load:", e);
                      e.currentTarget.src =
                        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%23888888">No Cover</text></svg>';
                    }}
                  />
                ) : (
                  <PhotoPlaceholder>No Cover</PhotoPlaceholder>
                )}
                <AlbumTitle>{album.title}</AlbumTitle>
                {album.id === selectedAlbumId && (
                  <SelectionIndicator>✓</SelectionIndicator>
                )}
              </AlbumCard>
            ))
          ) : (
            <Message>Error loading albums</Message>
          )}
        </AlbumGrid>
        {Array.isArray(albums) && albums.length === 0 && !loading && (
          <Message>No albums found in your Google Photos</Message>
        )}
        <Button onClick={() => setIsSelectingAlbum(false)}>Cancel</Button>
      </Container>
    </Modal>
  );

  // Render the content based on state
  const renderContent = () => {
    if (loading) {
      return <Message>Loading rewards...</Message>;
    }

    if (!connected) {
      return (
        <InfoSection>
          <Title>Connect to Google Photos</Title>
          <Message>
            Connect to your Google Photos account to unlock daily photo rewards
            for completing your habits.
          </Message>
          <Button onClick={handleConnectGoogle}>
            Connect to Google Photos
          </Button>
          <Button onClick={handleCheckConnection}>Check Connection</Button>
        </InfoSection>
      );
    }

    if (!hasSelectedAlbum) {
      return (
        <InfoSection>
          <Title>Select a Photo Album</Title>
          <Message>
            Choose an album from your Google Photos to use for your daily
            rewards. Each habit you complete will unlock a random photo from
            this album as a reward.
          </Message>
          <Button onClick={handleOpenAlbumSelection}>Select Album</Button>
          <Button onClick={handleDisconnectGoogle}>
            Disconnect Google Photos
          </Button>
        </InfoSection>
      );
    }

    return (
      <>
        <InfoSection>
          <Title>Daily Photo Rewards</Title>
          <Message>
            You've earned {rewardsEarned} photo rewards today by completing your
            habits.
            {!allHabitsCompleted ? (
              <span key="more-habits-message">
                {" "}
                Complete more habits to unlock additional photos!
              </span>
            ) : (
              <span key="congrats-message">
                {" "}
                Congratulations! You've completed all your habits for today.
              </span>
            )}
          </Message>
          <Button onClick={handleOpenAlbumSelection}>Change Photo Album</Button>
          <Button onClick={handleRefreshPhotos}>Get New Photos</Button>
          <Button onClick={handleDisconnectGoogle}>
            Disconnect Google Photos
          </Button>
        </InfoSection>

        {photos.length > 0 ? (
          <>
            <Subtitle>
              Your Rewards ({photos.length})
              {usingCachedPhotos && " (Daily Photos)"}
            </Subtitle>
            <PhotoContainer>
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id || `photo-${Math.random()}`}
                  onClick={() => setExpandedPhoto(photo)}
                  role="button"
                  aria-label={`View ${photo.filename || "photo"} in full size`}
                >
                  {photo.baseUrl ? (
                    <PhotoImage
                      src={`${photo.baseUrl}=w1200`}
                      alt={photo.filename || "Photo reward"}
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                        // Replace with a placeholder on error
                        e.currentTarget.src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%23888888">Image unavailable</text></svg>';
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <PhotoPlaceholder>Image not available</PhotoPlaceholder>
                  )}
                </PhotoCard>
              ))}
            </PhotoContainer>
          </>
        ) : (
          <Message>
            Complete habits to unlock photo rewards. They will appear here!
          </Message>
        )}
      </>
    );
  };

  return (
    <Container>
      {renderContent()}
      {isSelectingAlbum && renderAlbumSelectionModal()}
      {expandedPhoto && renderExpandedPhotoDialog()}
    </Container>
  );
};
