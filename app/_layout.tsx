import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ActivityIndicator, View } from "react-native";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { LeadsProvider } from "@/lib/leads-context";
import { TerritoriesProvider } from "@/lib/territories-context";
import LoginScreen from "@/app/login";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0f192f" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <LeadsProvider>
      <TerritoriesProvider>
        <Stack screenOptions={{ headerBackTitle: "Back" }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="lead-detail"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="lead-form"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="map-picker"
            options={{ headerShown: false, presentation: "fullScreenModal" }}
          />
          <Stack.Screen
            name="territory-editor"
            options={{ headerShown: false, presentation: "fullScreenModal" }}
          />
          <Stack.Screen
            name="product-detail"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="admin"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="login"
            options={{ headerShown: false }}
          />
        </Stack>
      </TerritoriesProvider>
    </LeadsProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  if (!appReady) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppNavigator />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
