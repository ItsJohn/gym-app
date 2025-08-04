import { YouTubeVerificationService } from "../youtubeVerificationService";

// Mock fetch globally
global.fetch = jest.fn();

describe("YouTubeVerificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyYouTubeUrl", () => {
    it("should return true for valid YouTube video URL", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json",
      );
    });

    it("should return false for invalid YouTube URL", async () => {
      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://invalid-url.com",
      );

      expect(result).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should return false when fetch throws an error", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );

      expect(result).toBe(false);
    });

    it("should return false when YouTube API returns error response", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      );

      expect(result).toBe(false);
    });

    it("should handle youtu.be short URLs", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://youtu.be/dQw4w9WgXcQ",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json",
      );
    });

    it("should handle YouTube embed URLs", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json",
      );
    });

    it("should handle URLs with additional parameters", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&feature=share",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json",
      );
    });
  });

  describe("verifyYouTubePlaylistUrl", () => {
    it("should return true for valid YouTube playlist URL", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubePlaylistUrl(
        "https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e&format=json",
      );
    });

    it("should return false for invalid playlist URL", async () => {
      const result = await YouTubeVerificationService.verifyYouTubePlaylistUrl(
        "https://invalid-url.com",
      );

      expect(result).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should return false when fetch throws an error", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await YouTubeVerificationService.verifyYouTubePlaylistUrl(
        "https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e",
      );

      expect(result).toBe(false);
    });

    it("should return false when YouTube API returns error response", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubePlaylistUrl(
        "https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e",
      );

      expect(result).toBe(false);
    });

    it("should handle playlist URLs with additional parameters", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubePlaylistUrl(
        "https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e&index=1",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e&format=json",
      );
    });

    it("should handle watch URLs with playlist parameter", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubePlaylistUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e&format=json",
      );
    });
  });

  describe("verifyAndCleanWorkoutUrls", () => {
    it("should remove invalid playlist URL from workout", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const workouts = [
        {
          name: "Test Workout",
          suggested_playlist: "https://www.youtube.com/playlist?list=invalid",
          exercises: [],
        },
      ];

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].suggested_playlist).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Invalid playlist URL found: https://www.youtube.com/playlist?list=invalid, removing",
      );

      consoleSpy.mockRestore();
    });

    it("should remove invalid video URL from exercise", async () => {
      const mockResponse = { ok: false };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const workouts = [
        {
          name: "Test Workout",
          exercises: [
            {
              name: "Push-ups",
              video_url: "https://www.youtube.com/watch?v=invalid",
            },
          ],
        },
      ];

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].exercises[0].video_url).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid video URL found for exercise "Push-ups": https://www.youtube.com/watch?v=invalid, removing',
      );

      consoleSpy.mockRestore();
    });

    it("should keep valid URLs", async () => {
      // Mock playlist verification
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true }) // playlist verification
        .mockResolvedValueOnce({ ok: true }); // video verification

      const workouts = [
        {
          name: "Test Workout",
          suggested_playlist: "https://www.youtube.com/playlist?list=valid",
          exercises: [
            {
              name: "Push-ups",
              video_url: "https://www.youtube.com/watch?v=valid",
            },
          ],
        },
      ];

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].suggested_playlist).toBe(
        "https://www.youtube.com/playlist?list=valid",
      );
      expect(result[0].exercises[0].video_url).toBe(
        "https://www.youtube.com/watch?v=valid",
      );
    });

    it("should handle workouts without suggested_playlist", async () => {
      const workouts = [
        {
          name: "Test Workout",
          exercises: [],
        },
      ];

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].suggested_playlist).toBeUndefined();
    });

    it("should handle workouts without exercises", async () => {
      const workouts = [
        {
          name: "Test Workout",
          suggested_playlist: "https://www.youtube.com/playlist?list=valid",
        },
      ];

      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].suggested_playlist).toBe(
        "https://www.youtube.com/playlist?list=valid",
      );
    });

    it("should handle exercises without video_url", async () => {
      const workouts = [
        {
          name: "Test Workout",
          exercises: [
            {
              name: "Push-ups",
              // no video_url
            },
          ],
        },
      ];

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].exercises[0].video_url).toBeUndefined();
    });

    it("should handle mixed valid and invalid URLs", async () => {
      const mockResponses = [
        { ok: true }, // playlist
        { ok: false }, // first video
        { ok: true }, // second video
      ];
      let callIndex = 0;
      (fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockResponses[callIndex++]),
      );

      const workouts = [
        {
          name: "Test Workout",
          suggested_playlist: "https://www.youtube.com/playlist?list=valid",
          exercises: [
            {
              name: "Push-ups",
              video_url: "https://www.youtube.com/watch?v=invalid",
            },
            {
              name: "Squats",
              video_url: "https://www.youtube.com/watch?v=valid",
            },
          ],
        },
      ];

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result =
        await YouTubeVerificationService.verifyAndCleanWorkoutUrls(workouts);

      expect(result[0].suggested_playlist).toBe(
        "https://www.youtube.com/playlist?list=valid",
      );
      expect(result[0].exercises[0].video_url).toBeUndefined();
      expect(result[0].exercises[1].video_url).toBe(
        "https://www.youtube.com/watch?v=valid",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getFallbackUrls", () => {
    it("should return fallback URLs", () => {
      const fallbackUrls = YouTubeVerificationService.getFallbackUrls();

      expect(fallbackUrls).toEqual({
        video: "https://www.youtube.com/watch?v=IODxDxX7oi4",
        playlist:
          "https://www.youtube.com/playlist?list=PLwHPDVxB8ZaK7B-JLyqVXM3kOZfCFCz-e",
      });
    });
  });

  describe("batchVerifyUrls", () => {
    it("should verify multiple URLs in parallel", async () => {
      const mockResponses = [{ ok: true }, { ok: false }, { ok: true }];
      let callIndex = 0;
      (fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve(mockResponses[callIndex++]),
      );

      const urls = [
        "https://www.youtube.com/watch?v=valid1",
        "https://www.youtube.com/watch?v=invalid",
        "https://www.youtube.com/watch?v=valid2",
      ];

      const result = await YouTubeVerificationService.batchVerifyUrls(urls);

      expect(result).toEqual({
        "https://www.youtube.com/watch?v=valid1": true,
        "https://www.youtube.com/watch?v=invalid": false,
        "https://www.youtube.com/watch?v=valid2": true,
      });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("should handle empty URL array", async () => {
      const result = await YouTubeVerificationService.batchVerifyUrls([]);

      expect(result).toEqual({});
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should handle fetch errors in batch verification", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ ok: false });

      const urls = [
        "https://www.youtube.com/watch?v=valid",
        "https://www.youtube.com/watch?v=error",
        "https://www.youtube.com/watch?v=invalid",
      ];

      const result = await YouTubeVerificationService.batchVerifyUrls(urls);

      expect(result).toEqual({
        "https://www.youtube.com/watch?v=valid": true,
        "https://www.youtube.com/watch?v=error": false,
        "https://www.youtube.com/watch?v=invalid": false,
      });
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle malformed YouTube URLs", async () => {
      const malformedUrls = [
        "https://youtube.com/watch",
        "https://youtube.com/watch?v=",
        "https://youtu.be/",
        "not-a-url",
        "",
        null as any,
        undefined as any,
      ];

      for (const url of malformedUrls) {
        const result = await YouTubeVerificationService.verifyYouTubeUrl(url);
        expect(result).toBe(false);
      }
    });

    it("should handle URLs with special characters in video ID", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await YouTubeVerificationService.verifyYouTubeUrl(
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s",
      );

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&format=json",
      );
    });

    it("should handle very long URLs", async () => {
      const mockResponse = { ok: true };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const longUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ&${"param=value&".repeat(100)}`;

      const result = await YouTubeVerificationService.verifyYouTubeUrl(longUrl);

      expect(result).toBe(true);
    });
  });
});
