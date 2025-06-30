export class YouTubeVerificationService {
  private static readonly FALLBACK_VIDEO_URL =
    "https://www.youtube.com/watch?v=IODxDxX7oi4"; // Generic exercise video
  private static readonly FALLBACK_PLAYLIST_URL =
    "https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e"; // Generic workout playlist

  /**
   * Verifies if a YouTube URL is valid and accessible
   */
  static async verifyYouTubeUrl(url: string): Promise<boolean> {
    try {
      // Extract video ID from various YouTube URL formats
      const videoId = this.extractYouTubeVideoId(url);
      if (!videoId) return false;

      // Use YouTube oEmbed API to verify video exists (no API key required)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

      const response = await fetch(oembedUrl);
      return response.ok;
    } catch (error) {
      console.error("Error verifying YouTube URL:", url, error);
      return false;
    }
  }

  /**
   * Extracts video ID from various YouTube URL formats
   */
  private static extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Verifies and removes invalid YouTube URLs in a workout array
   */
  static async verifyAndCleanWorkoutUrls(workouts: any[]): Promise<any[]> {
    for (const workout of workouts) {
      // Verify and remove invalid playlist URL
      if (workout.suggested_playlist) {
        const isValidPlaylist = await this.verifyYouTubeUrl(
          workout.suggested_playlist,
        );
        if (!isValidPlaylist) {
          console.warn(
            `Invalid playlist URL found: ${workout.suggested_playlist}, removing`,
          );
          delete workout.suggested_playlist;
        }
      }

      // Verify and remove invalid exercise video URLs
      if (workout.exercises && Array.isArray(workout.exercises)) {
        for (const exercise of workout.exercises) {
          if (exercise.video_url) {
            const isValidVideo = await this.verifyYouTubeUrl(
              exercise.video_url,
            );
            if (!isValidVideo) {
              console.warn(
                `Invalid video URL found for exercise "${exercise.name}": ${exercise.video_url}, removing`,
              );
              delete exercise.video_url;
            }
          }
        }
      }
    }

    return workouts;
  }

  /**
   * Get fallback URLs for when verification fails
   */
  static getFallbackUrls() {
    return {
      video: this.FALLBACK_VIDEO_URL,
      playlist: this.FALLBACK_PLAYLIST_URL,
    };
  }

  /**
   * Batch verify multiple URLs (useful for performance optimization)
   */
  static async batchVerifyUrls(
    urls: string[],
  ): Promise<{ [url: string]: boolean }> {
    const results: { [url: string]: boolean } = {};

    // Process URLs in parallel for better performance
    const verificationPromises = urls.map(async (url) => {
      const isValid = await this.verifyYouTubeUrl(url);
      results[url] = isValid;
    });

    await Promise.all(verificationPromises);
    return results;
  }
}
