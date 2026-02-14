import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { MapPickerNative } from "@/components/MapPickerNative";

export default function MapPickerScreen() {
  const params = useLocalSearchParams<{
    initialLat?: string;
    initialLng?: string;
  }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const webTopInset = isWeb ? 67 : 0;

  if (isWeb) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8 + webTopInset }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Pick Location</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.webFallback}>
          <Feather name="map-pin" size={48} color={theme.textSecondary} />
          <Text style={[styles.webText, { color: theme.textSecondary }]}>
            Map picker available on mobile via Expo Go
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapPickerNative
        initialLat={params.initialLat}
        initialLng={params.initialLng}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  webFallback: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  webText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
