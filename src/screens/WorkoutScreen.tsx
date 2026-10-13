import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useKeepAwake } from "expo-keep-awake";
import type { Tabs } from "../../App";
import { buildRoutine } from "../data/workoutData";
import { exerciseVideos } from "../data/exerciseVideos";
import { useApp } from "../lib/AppState";
import {
  advance,
  initialTimer,
  remainingSeconds,
  skip,
  TimerState,
} from "../lib/timer";
import { formatTime } from "../lib/stats";
import { getYouTubeUrlForExercise, openYouTubeLink } from "../data/exerciseLinks";
import { Button, C, ExerciseVideo, Pill, S } from "../components/ui";
import CompleteWorkoutScreen from "./CompleteWorkoutScreen";

function WakeLock() {
  useKeepAwake("fitflow-workout", { suppressDeactivateWarnings: true });
  return null;
}

const PHASES = ["Warm-up", "Strength", "Cardio", "Core", "Cool-down"] as const;

export default function WorkoutScreen({
  navigation,
}: BottomTabScreenProps<Tabs, "Workout">) {
  const { profile, sessions, updateProfile } = useApp();
  const [plan, setPlan] = useState(() => buildRoutine(profile, sessions));
  const [timer, setTimer] = useState(() => initialTimer(plan.steps));
  const current = useRef(timer);
  const lastTick = useRef(0);
  const [sessionId, setSessionId] = useState(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [finishedDate, setFinishedDate] = useState("");
  const [sound, setSound] = useState(() => profile?.soundBeeps !== false);
  const [ambientMusic, setAmbientMusic] = useState(() =>
    Boolean(profile?.ambientMusic),
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    () => profile?.hapticsEnabled !== false,
  );
  const [audioError, setAudioError] = useState("");
  const [alternative, setAlternative] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showFormDetails, setShowFormDetails] = useState(false);
  const [notice, setNotice] = useState("");
  const player = useAudioPlayer(require("../../assets/countdown-beep.wav"));
  const musicPlayer = useAudioPlayer(require("../../assets/rising-forest.mp3"));

  // Keep sensory settings synchronized when updated from Settings tab
  useEffect(() => {
    setSound(profile?.soundBeeps !== false);
    setAmbientMusic(Boolean(profile?.ambientMusic));
    setHapticsEnabled(profile?.hapticsEnabled !== false);
  }, [profile?.soundBeeps, profile?.ambientMusic, profile?.hapticsEnabled]);

  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" | "success" = "light") => {
      if (!hapticsEnabled || Platform.OS === "web") return;
      try {
        if (type === "success") {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
        } else if (type === "heavy") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
            () => {},
          );
        } else if (type === "medium") {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {},
          );
        } else {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => {},
          );
        }
      } catch (_) {}
    },
    [hapticsEnabled],
  );

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isManualLandscape, setIsManualLandscape] = useState(false);
  const isLandscape = isManualLandscape || width > height;

  const enterLandscape = useCallback(async () => {
    setIsManualLandscape(true);
    triggerHaptic("medium");
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    } catch {}
  }, [triggerHaptic]);

  const exitLandscape = useCallback(async () => {
    setIsManualLandscape(false);
    triggerHaptic("medium");
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    } catch {}
  }, [triggerHaptic]);

  // Clean up orientation lock when leaving Workout screen
  useEffect(() => {
    return () => {
      void ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => {});
    };
  }, []);

  // Sync orientation changes (e.g. physical device rotation)
  useEffect(() => {
    const sub = ScreenOrientation.addOrientationChangeListener((evt) => {
      const o = evt.orientationInfo.orientation;
      const isNowLandscape =
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      if (!isNowLandscape && isManualLandscape) {
        setIsManualLandscape(false);
      }
    });
    return () => {
      sub.remove();
    };
  }, [isManualLandscape]);

  const update = useCallback((value: TimerState) => {
    current.current = value;
    setTimer(value);
  }, []);

  const pause = useCallback(() => {
    const t = current.current;
    if (!t.running) return;
    const now = performance.now();
    update({
      ...advance(t, Math.max(0, now - lastTick.current), plan.steps),
      running: false,
    });
    lastTick.current = now;
  }, [plan.steps, update]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        pause();
        void exitLandscape();
      };
    }, [pause, exitLandscape]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active" && current.current.running) {
        pause();
        setNotice("Session paused while you were away.");
      }
    });
    return () => sub.remove();
  }, [pause]);

  useEffect(() => {
    if (
      !current.current.running &&
      current.current.activeMs === 0 &&
      current.current.index === 0 &&
      !current.current.finished
    ) {
      const next = buildRoutine(profile, sessions);
      setPlan(next);
      update(initialTimer(next.steps));
    }
  }, [profile, sessions, update]);

  useEffect(() => {
    if (!timer.running) return;
    lastTick.current = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      update(advance(current.current, delta, plan.steps));
    }, 100);
    return () => clearInterval(interval);
  }, [timer.running, plan.steps, update]);

  useEffect(() => {
    setAlternative(false);
    if (timer.running && timer.index > 0) {
      triggerHaptic("medium");
    }
  }, [timer.index, timer.running, triggerHaptic]);

  useEffect(() => {
    if (timer.finished && !finishedDate) {
      setFinishedDate(new Date().toISOString());
      triggerHaptic("success");
    }
  }, [timer.finished, finishedDate, triggerHaptic]);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "duckOthers",
      shouldPlayInBackground: false,
    }).catch(() =>
      setAudioError("Audio cues unavailable. Visual timer active."),
    );
  }, []);

  useEffect(() => {
    musicPlayer.loop = true;
    musicPlayer.volume = 0.35;
    player.volume = 0.65;
  }, [musicPlayer, player]);

  useEffect(() => {
    if (ambientMusic && sound && timer.running) musicPlayer.play();
    else musicPlayer.pause();
    return () => musicPlayer.pause();
  }, [musicPlayer, ambientMusic, sound, timer.running]);

  const seconds = Math.ceil(timer.remainingMs / 1000);

  useEffect(() => {
    // Duck ambient soundtrack during final 5-second countdown beeps
    musicPlayer.volume =
      ambientMusic && timer.running && seconds > 0 && seconds <= 5
        ? 0.08
        : 0.35;
  }, [musicPlayer, seconds, ambientMusic, timer.running]);

  useEffect(() => {
    let active = true;
    if (timer.running && seconds > 0 && seconds <= 5) {
      if (sound) {
        player
          .seekTo(0)
          .then(() => {
            if (active) player.play();
          })
          .catch(() => {
            if (active) setAudioError("Audio cue error. Timer continuing.");
          });
      }
      triggerHaptic("light");
    }
    if (!timer.running || !sound) player.pause();
    return () => {
      active = false;
    };
  }, [seconds, timer.running, sound, triggerHaptic, player]);

  function reset() {
    void exitLandscape();
    pause();
    player.pause();
    musicPlayer.pause();
    const next = buildRoutine(profile, sessions);
    setPlan(next);
    update(initialTimer(next.steps));
    setSessionId(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setFinishedDate("");
    setAlternative(false);
    setNotice("");
    setConfirm(false);
    setShowFormDetails(false);
  }

  function toggle() {
    triggerHaptic("medium");
    if (timer.running) pause();
    else {
      lastTick.current = performance.now();
      update({ ...current.current, running: true });
      setNotice("");
    }
  }

  function skipCurrent() {
    triggerHaptic("light");
    const wasRunning = current.current.running;
    const now = performance.now();
    const fresh = advance(
      current.current,
      wasRunning ? now - lastTick.current : 0,
      plan.steps,
    );
    lastTick.current = now;
    update(skip(fresh, plan.steps));
  }

  function restartCurrentStep() {
    triggerHaptic("light");
    const currentStep = plan.steps[current.current.index];
    if (!currentStep) return;
    lastTick.current = performance.now();
    update({
      ...current.current,
      remainingMs: currentStep.duration * 1000,
    });
  }

  function toggleAmbientMusic() {
    triggerHaptic("light");
    const nextVal = !ambientMusic;
    setAmbientMusic(nextVal);
    void updateProfile({ ambientMusic: nextVal }).catch(() => undefined);
  }

  function toggleSoundBeeps() {
    triggerHaptic("light");
    const nextVal = !sound;
    setSound(nextVal);
    void updateProfile({ soundBeeps: nextVal }).catch(() => undefined);
  }

  if (timer.finished) {
    if (isLandscape) {
      void exitLandscape();
    }
    return (
      <CompleteWorkoutScreen
        key={sessionId}
        session={{
          id: sessionId,
          userId: "local",
          date: finishedDate || new Date().toISOString(),
          durationSeconds: Math.floor(timer.activeMs / 1000),
          skippedSteps: timer.skipped,
          completed:
            timer.skipped === 0 &&
            timer.index === plan.steps.length - 1 &&
            timer.remainingMs === 0,
        }}
        onRestart={reset}
        onHome={() => {
          reset();
          navigation.navigate("Home");
        }}
      />
    );
  }

  const step = plan.steps[timer.index];
  const next = plan.steps[timer.index + 1];
  const shown = alternative && step.alternative ? step.alternative : step;

  // Resolve video for both original and alternative movements; during recovery intervals, preview the upcoming movement
  const directVideo = exerciseVideos[shown.label] ?? exerciseVideos[step.label];
  const recoveryPreviewVideo =
    step.recovery && next ? exerciseVideos[next.label] : undefined;
  const video = directVideo ?? recoveryPreviewVideo;
  const videoBadge =
    step.recovery && recoveryPreviewVideo && next
      ? `UP NEXT · ${next.label.toUpperCase()}`
      : alternative
        ? "GENTLER VARIATION"
        : undefined;

  const done = 1 - remainingSeconds(timer, plan.steps) / plan.totalSeconds;
  const intervalProgress = Math.max(
    0,
    Math.min(100, (1 - timer.remainingMs / (step.duration * 1000)) * 100),
  );
  const currentPhaseIndex = PHASES.indexOf(step.category);

  return (
    <SafeAreaView
      edges={
        isLandscape
          ? ["top", "left", "right", "bottom"]
          : ["top", "left", "right"]
      }
      style={{ flex: 1, backgroundColor: isLandscape ? "#0A1B2E" : C.bg }}
    >
      <WakeLock />

      {isLandscape ? (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            paddingTop: Math.max(insets.top, 8),
            paddingBottom: Math.max(insets.bottom, 8),
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
            gap: 16,
          }}
        >
          {/* Left Column: Widescreen Visual / Video Stage */}
          <View
            style={{
              flex: 1.25,
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {video ? (
              <ExerciseVideo
                key={`${step.id}-${shown.label}-landscape`}
                source={video}
                playing={timer.running}
                aspectRatio={null}
                style={{ width: "100%", height: "100%", borderRadius: 16 }}
                borderRadius={16}
                muted={!sound || ambientMusic}
                badge={videoBadge}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  backgroundColor: step.recovery
                    ? "rgba(22, 110, 72, 0.25)"
                    : "rgba(255, 255, 255, 0.06)",
                  borderWidth: 1,
                  borderColor: step.recovery
                    ? "rgba(74, 222, 128, 0.35)"
                    : "rgba(255, 255, 255, 0.12)",
                  padding: 24,
                }}
              >
                <Ionicons
                  name={step.recovery ? "leaf-outline" : "body-outline"}
                  size={36}
                  color={step.recovery ? "#4ADE80" : "#38BDF8"}
                />
                <Text
                  style={{
                    color: step.recovery ? "#4ADE80" : "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {step.recovery ? "Breathe deeply & reset" : shown.label}
                </Text>
                <Text
                  numberOfLines={3}
                  style={{
                    color: "rgba(255, 255, 255, 0.75)",
                    fontSize: 13,
                    lineHeight: 18,
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  {shown.detail}
                </Text>
              </View>
            )}
          </View>

          {/* Right Column: High-Visibility Essential Dashboard */}
          <View
            style={{
              flex: 1,
              height: "100%",
              justifyContent: "space-between",
              paddingVertical: 4,
            }}
          >
            {/* 1. Header: Phase pill, step count, and PROMINENT EXIT BUTTON */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 1,
                }}
              >
                <Pill tone={step.recovery ? "recovery" : "default"}>
                  {step.recovery
                    ? "RECOVERY"
                    : step.category.toUpperCase()}
                </Pill>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.65)",
                    fontSize: 12,
                    fontWeight: "600",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {timer.index + 1}/{plan.steps.length}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Exit landscape mode"
                onPress={() => {
                  void exitLandscape();
                }}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.16)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={15}
                  color="#FFFFFF"
                />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: "700",
                  }}
                >
                  Exit
                </Text>
              </Pressable>
            </View>

            {/* 2. Movement Title & Gentler Alternative Switch */}
            <View style={{ gap: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 22,
                    lineHeight: 26,
                    fontWeight: "800",
                    color: "#FFFFFF",
                    letterSpacing: -0.4,
                    flex: 1,
                  }}
                >
                  {shown.label}
                </Text>

                {step.alternative && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      alternative
                        ? `Switch back to ${step.label}`
                        : `Switch to gentler option: ${step.alternative.label}`
                    }
                    onPress={() => {
                      triggerHaptic("light");
                      setAlternative(!alternative);
                    }}
                    style={({ pressed }) => ({
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: alternative
                        ? "rgba(56, 189, 248, 0.25)"
                        : "rgba(255, 255, 255, 0.12)",
                      borderWidth: 1,
                      borderColor: alternative
                        ? "#38BDF8"
                        : "rgba(255, 255, 255, 0.2)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={13}
                      color="#7DD3FC"
                    />
                    <Text
                      style={{
                        color: "#7DD3FC",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {alternative ? "Standard" : "Gentler"}
                    </Text>
                  </Pressable>
                )}
              </View>

              <Text
                numberOfLines={2}
                style={{
                  color: "rgba(255, 255, 255, 0.72)",
                  fontSize: 12,
                  lineHeight: 16,
                  fontWeight: "500",
                }}
              >
                {shown.detail}
              </Text>
            </View>

            {/* 3. High-Contrast Countdown Console & Up Next Preview */}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.12)",
                gap: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 44,
                      lineHeight: 46,
                      fontWeight: "700",
                      fontVariant: ["tabular-nums"],
                      color: step.recovery ? "#4ADE80" : "#FFFFFF",
                      letterSpacing: -1.2,
                    }}
                  >
                    {formatTime(seconds)}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.55)",
                      fontSize: 13,
                      fontWeight: "700",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    / {step.duration}s
                  </Text>
                </View>

                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.55)",
                    fontSize: 11,
                    fontWeight: "600",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {formatTime(remainingSeconds(timer, plan.steps))} left
                </Text>
              </View>

              {/* Interval Progress Bar */}
              <View
                style={{
                  width: "100%",
                  height: 5,
                  borderRadius: 99,
                  backgroundColor: "rgba(255, 255, 255, 0.14)",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 5,
                    borderRadius: 99,
                    backgroundColor: step.recovery ? "#4ADE80" : "#38BDF8",
                    width: `${intervalProgress}%`,
                  }}
                />
              </View>

              {/* Up Next Bar */}
              {next ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: "rgba(255, 255, 255, 0.72)",
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  Up next:{" "}
                  <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                    {next.label}
                  </Text>{" "}
                  ({next.duration}s)
                </Text>
              ) : (
                <Text
                  style={{
                    color: "#4ADE80",
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  Final movement interval
                </Text>
              )}
            </View>

            {/* 4. Essential Transport Row (Only important icons and buttons) */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Restart current interval"
                onPress={restartCurrentStep}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons name="refresh" size={19} color="#FFFFFF" />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  timer.running
                    ? "Pause workout"
                    : timer.activeMs > 0
                      ? "Resume workout"
                      : "Start workout"
                }
                onPress={toggle}
                style={({ pressed }) => ({
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: timer.running ? "#0284C7" : "#0EA5E9",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.88 : 1,
                })}
              >
                <Ionicons
                  name={timer.running ? "pause" : "play"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {timer.running
                    ? "Pause"
                    : timer.activeMs > 0
                      ? "Resume"
                      : "Start"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip interval"
                onPress={skipCurrent}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name="play-skip-forward"
                  size={19}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  sound ? "Mute countdown sound" : "Unmute countdown sound"
                }
                onPress={toggleSoundBeeps}
                style={({ pressed }) => ({
                  width: 44,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: sound
                    ? "rgba(56, 189, 248, 0.22)"
                    : "rgba(255, 255, 255, 0.12)",
                  borderWidth: 1,
                  borderColor: sound
                    ? "#38BDF8"
                    : "rgba(255, 255, 255, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name={sound ? "volume-high" : "volume-mute-outline"}
                  size={18}
                  color={sound ? "#38BDF8" : "rgba(255, 255, 255, 0.5)"}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Watch movement on YouTube"
                onPress={() => {
                  pause();
                  void openYouTubeLink(
                    getYouTubeUrlForExercise(shown.label),
                  );
                }}
                style={({ pressed }) => ({
                  width: 44,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(224, 36, 36, 0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(224, 36, 36, 0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name="logo-youtube"
                  size={18}
                  color="#FF6B6B"
                />
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: 14,
          gap: 12,
          maxWidth: 520,
          width: "100%",
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP HUD & PHASE PROGRESS */}
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flexShrink: 1,
              }}
            >
              <Pill tone={step.recovery ? "recovery" : "default"}>
                {step.recovery ? "RECOVERY BREATH" : step.category.toUpperCase()}
              </Pill>
              <Text
                style={{
                  color: C.muted,
                  fontSize: 12,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {timer.index + 1} / {plan.steps.length}
              </Text>
            </View>

            {/* 44x44pt Tactile Quick Controls */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  ambientMusic ? "Mute ambient music" : "Play ambient music"
                }
                accessibilityState={{ selected: ambientMusic }}
                hitSlop={4}
                onPress={toggleAmbientMusic}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: ambientMusic ? C.ice : C.card,
                  borderWidth: 1,
                  borderColor: ambientMusic ? C.iceBorder : C.line,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name={
                    ambientMusic ? "musical-notes" : "musical-notes-outline"
                  }
                  size={18}
                  color={ambientMusic ? C.sky : C.muted}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  sound ? "Mute countdown beeps" : "Unmute countdown beeps"
                }
                accessibilityState={{ selected: sound }}
                hitSlop={4}
                onPress={toggleSoundBeeps}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: sound ? C.ice : C.card,
                  borderWidth: 1,
                  borderColor: sound ? C.iceBorder : C.line,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name={sound ? "volume-high" : "volume-mute-outline"}
                  size={18}
                  color={sound ? C.sky : C.muted}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Switch to widescreen landscape mode"
                hitSlop={4}
                onPress={() => {
                  void enterLandscape();
                }}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: C.card,
                  borderWidth: 1,
                  borderColor: C.line,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons
                  name="phone-landscape-outline"
                  size={18}
                  color={C.inkSecondary}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="End workout session early"
                hitSlop={4}
                onPress={() => {
                  pause();
                  setConfirm(true);
                }}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: C.card,
                  borderWidth: 1,
                  borderColor: C.line,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Ionicons name="close" size={20} color={C.inkSecondary} />
              </Pressable>
            </View>
          </View>

          {/* 5-Phase Segmented Progress & Total Remaining Time */}
          <View style={{ gap: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              {PHASES.map((phase, idx) => {
                const isPast = idx < currentPhaseIndex;
                const isCurrent = idx === currentPhaseIndex;
                return (
                  <View
                    key={phase}
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 99,
                      backgroundColor: isPast
                        ? C.sky
                        : isCurrent
                          ? C.iceBorder
                          : C.line,
                      overflow: "hidden",
                    }}
                  >
                    {isCurrent && (
                      <View
                        style={{
                          height: 5,
                          width: `${Math.max(15, Math.min(100, done * 100))}%`,
                          backgroundColor: step.recovery ? C.recovery : C.sky,
                        }}
                      />
                    )}
                  </View>
                );
              })}
            </View>
            <View style={S.row}>
              <Text style={{ color: C.muted, fontSize: 11, fontWeight: "600" }}>
                Phase {currentPhaseIndex + 1} of 5 · {step.category}
              </Text>
              <Text
                style={{
                  color: C.inkSecondary,
                  fontSize: 12,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatTime(remainingSeconds(timer, plan.steps))} remaining
              </Text>
            </View>
          </View>
        </View>

        {/* 2. EXERCISE HEADER, ALTERNATIVE SWITCH & READABLE COACHING CUE */}
        <View style={{ gap: 6 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontSize: 23,
                lineHeight: 28,
                fontWeight: "700",
                color: C.ink,
                letterSpacing: -0.5,
                flex: 1,
              }}
            >
              {shown.label}
            </Text>

            {step.alternative && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  alternative
                    ? `Switch back to ${step.label}`
                    : `Switch to gentler alternative: ${step.alternative.label}`
                }
                onPress={() => {
                  triggerHaptic("light");
                  setAlternative(!alternative);
                }}
                style={({ pressed }) => ({
                  minHeight: 38,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: alternative ? C.ice : C.card,
                  borderWidth: 1,
                  borderColor: alternative ? C.sky : C.lineStrong,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  opacity: pressed ? 0.78 : 1,
                })}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={14}
                  color={C.sky}
                />
                <Text
                  style={{ color: C.sky, fontSize: 12, fontWeight: "700" }}
                >
                  {alternative ? "Standard move" : "Gentler option"}
                </Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Watch ${shown.label} on YouTube`}
              onPress={() => {
                pause();
                void openYouTubeLink(getYouTubeUrlForExercise(shown.label));
              }}
              style={({ pressed }) => ({
                minHeight: 38,
                paddingHorizontal: 11,
                paddingVertical: 7,
                borderRadius: 10,
                backgroundColor: C.card,
                borderWidth: 1,
                borderColor: C.lineStrong,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <Ionicons name="logo-youtube" size={15} color="#E02424" />
              <Text
                style={{ color: C.ink, fontSize: 12, fontWeight: "700" }}
              >
                YouTube
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Coaching cue: ${shown.detail}. Tap for form guide`}
            onPress={() => {
              pause();
              setShowFormDetails(true);
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              backgroundColor: C.card,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <Text
              numberOfLines={2}
              style={{
                color: C.inkSecondary,
                fontSize: 13,
                lineHeight: 19,
                fontWeight: "500",
                flex: 1,
              }}
            >
              {shown.detail}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: C.ice,
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 8,
              }}
            >
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={C.sky}
              />
              <Text style={{ color: C.sky, fontSize: 11, fontWeight: "700" }}>
                Form
              </Text>
            </View>
          </Pressable>
        </View>

        {/* 3. VIDEO STAGE (Plays active move, alternative move, or recovery next-up preview) */}
        {video ? (
          <View style={{ position: "relative" }}>
            <ExerciseVideo
              key={`${step.id}-${shown.label}`}
              source={video}
              playing={timer.running}
              aspectRatio={1.62}
              borderRadius={14}
              muted={!sound || ambientMusic}
              badge={videoBadge}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch to widescreen landscape mode"
              onPress={() => {
                void enterLandscape();
              }}
              style={({ pressed }) => ({
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "rgba(14, 38, 64, 0.78)",
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons
                name="phone-landscape-outline"
                size={13}
                color="#FFFFFF"
              />
              <Text
                style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}
              >
                Landscape
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              aspectRatio: 1.62,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: step.recovery ? C.recoverySoft : C.cardSubtle,
              borderWidth: 1,
              borderColor: step.recovery ? C.recoveryBorder : C.line,
              padding: 20,
              position: "relative",
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Switch to widescreen landscape mode"
              onPress={() => {
                void enterLandscape();
              }}
              style={({ pressed }) => ({
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "rgba(14, 38, 64, 0.78)",
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons
                name="phone-landscape-outline"
                size={13}
                color="#FFFFFF"
              />
              <Text
                style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}
              >
                Landscape
              </Text>
            </Pressable>
            <Ionicons
              name={step.recovery ? "leaf-outline" : "body-outline"}
              size={30}
              color={step.recovery ? C.recovery : C.sky}
            />
            <Text
              style={{
                color: step.recovery ? C.recovery : C.ink,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {step.recovery ? "Breathe deeply & reset" : shown.label}
            </Text>
            <Text
              style={{
                color: C.inkSecondary,
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {shown.detail}
            </Text>
          </View>
        )}

        {/* 4. INTERVAL COUNTDOWN CONSOLE */}
        <View
          style={{
            backgroundColor: step.recovery ? C.recoverySoft : C.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: step.recovery ? C.recoveryBorder : C.line,
            paddingVertical: 14,
            paddingHorizontal: 18,
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}
          >
            <Text
              accessibilityLabel={`${seconds} seconds remaining in this interval`}
              style={{
                fontSize: 48,
                lineHeight: 52,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
                color: step.recovery ? C.recovery : C.ink,
                letterSpacing: -1.4,
              }}
            >
              {formatTime(seconds)}
            </Text>
            <Text
              style={{
                color: step.recovery ? C.recovery : C.muted,
                fontSize: 13,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              / {step.duration}s
            </Text>
          </View>

          {/* Interval Progress Line */}
          <View
            style={{
              width: "100%",
              height: 6,
              borderRadius: 99,
              backgroundColor: step.recovery
                ? "rgba(22, 110, 72, 0.16)"
                : C.cardSubtle,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 6,
                borderRadius: 99,
                backgroundColor: step.recovery ? C.recovery : C.sky,
                width: `${intervalProgress}%`,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: step.recovery
                ? C.recovery
                : timer.running
                  ? C.inkSecondary
                  : C.muted,
            }}
          >
            {timer.running
              ? step.recovery
                ? "Slow your breath · prepare for the next movement"
                : seconds <= 5
                  ? "Final seconds · finish with steady control"
                  : "Steady pace · move within a comfortable range"
              : timer.activeMs > 0
                ? "Session paused · tap Resume when ready"
                : "Tap Start Move whenever you’re in position"}
          </Text>
        </View>

        {/* 5. ERGONOMIC 54PT TRANSPORT CONTROLS */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Restart current movement interval"
            onPress={restartCurrentStep}
            style={({ pressed }) => ({
              width: 54,
              height: 54,
              borderRadius: 14,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.line,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Ionicons name="refresh" size={20} color={C.inkSecondary} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              timer.running
                ? "Pause workout"
                : timer.activeMs > 0
                  ? "Resume workout"
                  : "Start workout"
            }
            onPress={toggle}
            style={({ pressed }) => ({
              flex: 1,
              height: 54,
              borderRadius: 14,
              backgroundColor: timer.running ? C.skyDark : C.sky,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <Ionicons
              name={timer.running ? "pause" : "play"}
              size={20}
              color="#FFFFFF"
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: 16,
                letterSpacing: -0.2,
              }}
            >
              {timer.running
                ? "Pause"
                : timer.activeMs > 0
                  ? "Resume"
                  : "Start Move"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip to next movement interval"
            onPress={skipCurrent}
            style={({ pressed }) => ({
              height: 54,
              paddingHorizontal: 18,
              borderRadius: 14,
              backgroundColor: C.card,
              borderWidth: 1,
              borderColor: C.line,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Ionicons
              name="play-skip-forward"
              size={18}
              color={C.inkSecondary}
            />
            <Text
              style={{
                color: C.inkSecondary,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              Skip
            </Text>
          </Pressable>
        </View>

        {/* 6. UP NEXT BAR */}
        {next ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: C.cardSubtle,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderWidth: 1,
              borderColor: C.line,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: C.muted,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Up next:
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: C.ink,
                  fontSize: 13,
                  fontWeight: "700",
                  flex: 1,
                }}
              >
                {next.label}
              </Text>
            </View>
            <Text
              style={{
                color: C.inkSecondary,
                fontSize: 12,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {next.duration}s
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: C.recoverySoft,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderWidth: 1,
              borderColor: C.recoveryBorder,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: C.recovery, fontSize: 12, fontWeight: "700" }}
            >
              Final interval of today’s session
            </Text>
          </View>
        )}

        {notice ? (
          <Text style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>
            {notice}
          </Text>
        ) : null}
        {audioError ? (
          <Text style={{ color: C.coral, fontSize: 12, textAlign: "center" }}>
            {audioError}
          </Text>
        ) : null}
      </ScrollView>
      )}

      {/* FORM & VARIATION GUIDE MODAL */}
      <Modal
        visible={showFormDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFormDetails(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(14, 38, 64, 0.55)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={[
              S.cardElevated,
              { maxWidth: 440, alignSelf: "center", width: "100%", gap: 16 },
            ]}
          >
            <View style={S.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[S.heading, { fontSize: 20 }]}>
                  {shown.label}
                </Text>
                <Text style={S.small}>
                  {step.category} · {step.duration} seconds
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close form guide"
                hitSlop={8}
                onPress={() => setShowFormDetails(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: C.cardSubtle,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={C.inkSecondary} />
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: C.cardSubtle,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: C.line,
                gap: 6,
              }}
            >
              <Text
                style={{
                  color: C.ink,
                  fontSize: 15,
                  lineHeight: 22,
                  fontWeight: "500",
                }}
              >
                {shown.detail}
              </Text>
            </View>

            {step.alternative && (
              <View
                style={{
                  backgroundColor: C.ice,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: C.iceBorder,
                  gap: 4,
                }}
              >
                <Text
                  style={{ color: C.sky, fontSize: 12, fontWeight: "700" }}
                >
                  Gentler option: {step.alternative.label}
                </Text>
                <Text style={S.small}>{step.alternative.detail}</Text>
              </View>
            )}

            {/* YouTube Breakdown & Feedback */}
            <View
              style={{
                backgroundColor: C.cardSubtle,
                borderRadius: 12,
                padding: 14,
                borderWidth: 1,
                borderColor: C.line,
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: "#FFF0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#FFD0D0",
                  }}
                >
                  <Ionicons name="logo-youtube" size={20} color="#E02424" />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text
                    style={{ color: C.ink, fontSize: 14, fontWeight: "700" }}
                  >
                    Watch form video & comment
                  </Text>
                  <Text style={[S.small, { fontSize: 11 }]}>
                    Like the video, ask questions, or share tips on @FitFlowWorld.
                  </Text>
                </View>
              </View>

              <Button
                secondary
                title="Watch on YouTube"
                icon="open-outline"
                onPress={() => {
                  setShowFormDetails(false);
                  void openYouTubeLink(getYouTubeUrlForExercise(shown.label));
                }}
              />
            </View>

            <Button
              title="Back to movement"
              onPress={() => setShowFormDetails(false)}
            />
          </View>
        </View>
      </Modal>

      {/* END SESSION EARLY CONFIRMATION MODAL */}
      <Modal
        visible={confirm}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(14, 38, 64, 0.55)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={[
              S.cardElevated,
              { maxWidth: 440, alignSelf: "center", width: "100%", gap: 16 },
            ]}
          >
            <View style={{ gap: 6 }}>
              <Text style={S.heading}>Wrap up today’s session early?</Text>
              <Text style={S.body}>
                {timer.activeMs >= 1000
                  ? `We’ll log ${formatTime(Math.floor(timer.activeMs / 1000))} of active movement in your journal as a shortened session.`
                  : "You haven’t recorded movement time yet, so ending now won’t add an empty entry to your journal."}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <Button
                title={
                  timer.activeMs >= 1000
                    ? "Finish & save session"
                    : "Exit session"
                }
                onPress={() => {
                  setConfirm(false);
                  void exitLandscape();
                  update({
                    ...current.current,
                    finished: true,
                    running: false,
                    skipped:
                      current.current.skipped +
                      plan.steps.length -
                      current.current.index,
                  });
                }}
              />
              <Button
                secondary
                title="Keep moving"
                onPress={() => setConfirm(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
