import React, { useRef, useCallback, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/useTheme";

const ACTION_WIDTH = 72;
const TOTAL_ACTIONS_WIDTH = ACTION_WIDTH * 2;
const SNAP_THRESHOLD = 40;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };

interface SwipeableRowProps {
  children: React.ReactNode;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SwipeableRow({ children, onPress, onEdit, onDelete }: SwipeableRowProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const isOpen = useRef(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const hasMoved = useRef(false);
  const currentTranslate = useRef(0);

  const close = useCallback(() => {
    translateX.value = withSpring(0, SPRING_CONFIG);
    isOpen.current = false;
    currentTranslate.current = 0;
  }, []);

  const handleEdit = useCallback(() => {
    close();
    setTimeout(() => onEdit(), 200);
  }, [onEdit, close]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    close();
    setTimeout(() => onDelete(), 200);
  }, [onDelete, close]);

  const handleTouchStart = useCallback((e: any) => {
    const touch = e.nativeEvent;
    touchStartX.current = touch.pageX ?? touch.locationX ?? 0;
    touchStartY.current = touch.pageY ?? touch.locationY ?? 0;
    touchStartTime.current = Date.now();
    hasMoved.current = false;
  }, []);

  const handleTouchMove = useCallback((e: any) => {
    const touch = e.nativeEvent;
    const currentX = touch.pageX ?? touch.locationX ?? 0;
    const currentY = touch.pageY ?? touch.locationY ?? 0;
    const dx = currentX - touchStartX.current;
    const dy = currentY - touchStartY.current;

    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      hasMoved.current = true;
    }

    if (hasMoved.current) {
      const base = isOpen.current ? -TOTAL_ACTIONS_WIDTH : 0;
      const newVal = base + dx;
      const clamped = Math.min(0, Math.max(-TOTAL_ACTIONS_WIDTH - 20, newVal));
      translateX.value = clamped;
      currentTranslate.current = clamped;
    }
  }, []);

  const handleTouchEnd = useCallback((e: any) => {
    if (hasMoved.current) {
      const val = currentTranslate.current;
      if (val < -SNAP_THRESHOLD) {
        translateX.value = withSpring(-TOTAL_ACTIONS_WIDTH, SPRING_CONFIG);
        isOpen.current = true;
        currentTranslate.current = -TOTAL_ACTIONS_WIDTH;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        isOpen.current = false;
        currentTranslate.current = 0;
      }
    } else {
      if (isOpen.current) {
        close();
      } else {
        onPress();
      }
    }
    hasMoved.current = false;
  }, [onPress, close]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const editActionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      -translateX.value,
      [0, TOTAL_ACTIONS_WIDTH],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: progress,
      transform: [{ scale: interpolate(progress, [0, 1], [0.5, 1], Extrapolation.CLAMP) }],
    };
  });

  const deleteActionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      -translateX.value,
      [0, TOTAL_ACTIONS_WIDTH],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: progress,
      transform: [{ scale: interpolate(progress, [0, 0.5, 1], [0.3, 0.8, 1], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.actionsContainer}>
        <Animated.View style={[styles.actionBtn, editActionStyle]}>
          <Pressable
            onPress={handleEdit}
            style={[styles.actionPressable, { backgroundColor: theme.tint }]}
          >
            <Feather name="edit-2" size={20} color="#FFF" />
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.actionBtn, deleteActionStyle]}>
          <Pressable
            onPress={handleDelete}
            style={[styles.actionPressable, { backgroundColor: "#EF4444" }]}
          >
            <Feather name="trash-2" size={20} color="#FFF" />
          </Pressable>
        </Animated.View>
      </View>
      <Animated.View
        style={[styles.contentRow, rowStyle]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...(Platform.OS === "web" ? {
          onStartShouldSetResponder: () => true,
          onMoveShouldSetResponder: () => true,
          onResponderGrant: handleTouchStart,
          onResponderMove: handleTouchMove,
          onResponderRelease: handleTouchEnd,
        } : {})}
      >
        <View pointerEvents="none">
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    marginBottom: 10,
  },
  actionsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    paddingRight: 4,
    justifyContent: "flex-end",
  },
  actionBtn: {
    width: ACTION_WIDTH - 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionPressable: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  contentRow: {
    zIndex: 1,
  },
});
