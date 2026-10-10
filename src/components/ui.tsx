import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

export const C = {
  // Neutral Studio Canvas & Surfaces
  studioWall: "#C6DDF1",
  studioGlow: "#EBF3FA",
  bg: "#F4F7FA",
  card: "#FFFFFF",
  cardSubtle: "#ECF2F8",
  ink: "#0F2036",
  inkSecondary: "#2E4765",
  muted: "#56708E",
  line: "#DCE6F0",
  lineStrong: "#C2D4E6",

  // Primary Studio Azure
  sky: "#1B64AC",
  skyDark: "#0E2640",
  skyLight: "#58A6F2",
  skyVibrant: "#1E6BB8",
  ice: "#E8F1FA",
  iceBorder: "#C5DBEF",

  // Semantic Recovery Sage (for rest intervals & completion accents)
  recovery: "#166E48",
  recoverySoft: "#E6F4EC",
  recoveryBorder: "#BCE0CC",

  // Semantic Warm Amber (for streaks & attention)
  coral: "#C85212",
  coralPale: "#FDF1E8",
  coralBorder: "#F6D0B6",
  white: "#FFFFFF",

  // Semantic aliases for screen compatibility
  green: "#1B64AC",
  greenDark: "#0E2640",
  greenLight: "#58A6F2",
  mint: "#E8F1FA",
  mintBorder: "#C5DBEF",
  lime: "#7CC0FF",
  orange: "#C85212",
  pale: "#FDF1E8",
};

export const S = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
    gap: 18,
    maxWidth: 620,
    width: "100%",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: "600",
    color: C.muted,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontSize: 30,
    lineHeight: 36,
    color: C.ink,
    letterSpacing: -0.6,
    fontWeight: "700",
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.3,
  },
  body: {
    color: C.inkSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  small: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  // Flat bordered surface (elevation declared once via crisp border)
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.line,
    gap: 12,
  },
  // Focal elevated surface (elevation declared via directional shadow)
  cardElevated: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#0E2640",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 8px 24px rgba(14, 38, 64, 0.07)",
      } as any,
    }),
  },
  divider: {
    height: 1,
    backgroundColor: C.line,
  },
  pill: {
    backgroundColor: C.ice,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.iceBorder,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.sky,
    letterSpacing: 0.3,
  },
  error: {
    color: "#A8201A",
    backgroundColor: "#FDF0EF",
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: "#F5C6C3",
  },
});

export function Page({
  children,
  fullSafe = false,
}: {
  children: React.ReactNode;
  fullSafe?: boolean;
}) {
  return (
    <SafeAreaView
      edges={
        fullSafe ? ["top", "left", "right", "bottom"] : ["top", "left", "right"]
      }
      style={S.page}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.content}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Button({
  title,
  onPress,
  secondary,
  busy,
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  busy?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(disabled || busy), busy: Boolean(busy) }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        paddingHorizontal: 20,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: secondary ? C.ice : C.sky,
        borderWidth: secondary ? 1 : 0,
        borderColor: secondary ? C.iceBorder : "transparent",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        opacity: disabled || busy ? 0.48 : pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? C.sky : "#FFFFFF"} />
      ) : (
        <>
          <Text
            style={{
              color: secondary ? C.sky : "#FFFFFF",
              fontWeight: "700",
              fontSize: 15,
              letterSpacing: -0.2,
            }}
          >
            {title}
          </Text>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={secondary ? C.sky : "#FFFFFF"}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  onPress,
  active,
  style,
}: {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: active ? C.ice : C.card,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: active ? C.iceBorder : C.line,
          opacity: pressed ? 0.78 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons
        name={name}
        size={20}
        color={active ? C.sky : C.inkSecondary}
      />
    </Pressable>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: string;
  tone?: "default" | "recovery" | "warm";
}) {
  const palette =
    tone === "recovery"
      ? { bg: C.recoverySoft, border: C.recoveryBorder, text: C.recovery }
      : tone === "warm"
        ? { bg: C.coralPale, border: C.coralBorder, text: C.coral }
        : { bg: C.ice, border: C.iceBorder, text: C.sky };
  return (
    <View
      style={[
        S.pill,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <Text style={[S.pillText, { color: palette.text }]}>{children}</Text>
    </View>
  );
}

export function WeekStrip({
  days,
}: {
  days: {
    key: string;
    label: string;
    dayNum?: number;
    done: boolean;
    today: boolean;
  }[];
}) {
  return (
    <View style={[S.row, { paddingTop: 2, gap: 6 }]}>
      {days.map((day) => (
        <View key={day.key} style={{ alignItems: "center", gap: 6, flex: 1 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: day.today ? "700" : "600",
              color: day.today ? C.sky : C.muted,
            }}
          >
            {day.label}
          </Text>
          <View
            accessibilityLabel={`${day.today ? "Today" : day.label}${day.dayNum ? ` ${day.dayNum}` : ""}: ${day.done ? "workout completed" : "no completed workout"}`}
            style={{
              width: "100%",
              maxWidth: 42,
              height: 44,
              borderRadius: 12,
              backgroundColor: day.done
                ? C.sky
                : day.today
                  ? C.ice
                  : C.cardSubtle,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: day.today && !day.done ? 1.5 : 1,
              borderColor: day.done
                ? C.sky
                : day.today
                  ? C.sky
                  : C.line,
            }}
          >
            {day.done ? (
              <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
            ) : day.dayNum !== undefined ? (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: day.today ? "700" : "600",
                  color: day.today ? C.sky : C.inkSecondary,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {day.dayNum}
              </Text>
            ) : (
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: day.today ? C.sky : C.lineStrong,
                }}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

export function Orbit({ small = false }: { small?: boolean }) {
  const size = small ? 76 : 112;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: "rgba(88, 166, 242, 0.28)",
          backgroundColor: "rgba(88, 166, 242, 0.08)",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size * 0.74,
          height: size * 0.74,
          borderRadius: (size * 0.74) / 2,
          borderWidth: 1,
          borderColor: "rgba(88, 166, 242, 0.42)",
        }}
      />
      <View
        style={{
          width: size * 0.46,
          height: size * 0.46,
          borderRadius: (size * 0.46) / 2,
          backgroundColor: C.skyLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="water" size={small ? 18 : 26} color={C.skyDark} />
      </View>
    </View>
  );
}

export function ExerciseVideo({
  source,
  playing,
  aspectRatio = 1.62,
  borderRadius = 14,
  muted = false,
  badge,
}: {
  source: number;
  playing: boolean;
  aspectRatio?: number;
  borderRadius?: number;
  muted?: boolean;
  badge?: string;
}) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = true;
    instance.muted = muted;
  });
  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);
  useEffect(() => {
    if (playing) player.play();
    else player.pause();
  }, [player, playing]);
  return (
    <View
      style={{
        borderRadius,
        overflow: "hidden",
        backgroundColor: C.studioWall,
        borderWidth: 1,
        borderColor: C.lineStrong,
        width: "100%",
        aspectRatio,
        position: "relative",
      }}
    >
      <VideoView
        player={player}
        nativeControls={false}
        contentFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
      {badge ? (
        <View
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(14, 38, 64, 0.78)",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.2,
            }}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
