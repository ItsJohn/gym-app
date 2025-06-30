import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";

interface ExerciseDescriptionProps {
  description: string;
  isVisible: boolean;
  videoUrl?: string | null;
}

// Helper function to extract YouTube video ID and create embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // Handle different YouTube URL formats including Shorts
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/, // YouTube Shorts pattern
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?modestbranding=1&rel=0&showinfo=0`;
    }
  }

  return null;
};

export default function ExerciseDescription({
  description,
  isVisible,
  videoUrl,
}: ExerciseDescriptionProps) {
  if (!isVisible) return null;

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
  const screenWidth = Dimensions.get("window").width;
  const videoHeight = (screenWidth - 32) * 0.56; // 16:9 aspect ratio with padding

  const handleOpenYouTube = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl);
    }
  };

  return (
    <ThemedView style={styles.descriptionContainer}>
      {embedUrl && (
        <ThemedView style={[styles.videoContainer, { height: videoHeight }]}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </ThemedView>
      )}

      {videoUrl && (
        <TouchableOpacity
          style={styles.youtubeLink}
          onPress={handleOpenYouTube}
        >
          <Ionicons
            name="open-outline"
            size={16}
            color="#4A90E2"
            style={styles.linkIcon}
          />
          <ThemedText style={styles.youtubeLinkText}>
            View on YouTube
          </ThemedText>
        </TouchableOpacity>
      )}

      <ThemedText style={styles.descriptionText}>{description}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  descriptionContainer: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  videoContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 12,
  },
  webview: {
    flex: 1,
  },
  youtubeLink: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.2)",
  },
  linkIcon: {
    marginRight: 6,
  },
  youtubeLinkText: {
    fontSize: 13,
    color: "#4A90E2",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "white",
    fontSize: 14,
    opacity: 0.7,
  },
  fallbackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    marginBottom: 12,
  },
  fallbackButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 14,
  },
});
