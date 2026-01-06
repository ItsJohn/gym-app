import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";

import { SettingsProvider } from "@/contexts/SettingsContext";
import { WorkoutTimerProvider } from "@/contexts/WorkoutTimerContext";
import { initializeDatabase } from "@/database/database";
import { useColorScheme } from "@/hooks/useColorScheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setDbError(
          error instanceof Error
            ? error.message
            : "Database initialization failed",
        );
      }
    };

    initDb();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (!dbInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {dbError ? (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#ff6b6b",
              }}
            >
              Database Error
            </Text>
            <Text style={{ textAlign: "center", color: "#666" }}>
              {typeof dbError === "string" ? dbError : String(dbError)}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Initializing Database...
            </Text>
            <Text style={{ textAlign: "center", color: "#666" }}>
              Setting up your workout data
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <WorkoutTimerProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="workout" options={{ headerShown: false }} />
              <Stack.Screen
                name="workout-editor"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="workout-preview"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WorkoutTimerProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
