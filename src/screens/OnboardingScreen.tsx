import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../lib/AppState";
import {
  goals,
  levels,
  goalLabels,
  goalSummaries,
  levelLabels,
  UserProfile,
} from "../types/workout";
import { Button, C, IconButton, Orbit, Page, S } from "../components/ui";

export default function OnboardingScreen({
  editing = false,
  onComplete,
}: {
  editing?: boolean;
  onComplete?: () => void;
}) {
  const { profile, updateProfile } = useApp();
  const [draft, setDraft] = useState<UserProfile>({
    goal: "general-health",
    fitnessLevel: "beginner",
    lowImpact: true,
    ...profile,
  });
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const titles = [
    "What brings you to the mat?",
    "Choose your starting pace.",
    "Tailor movement to your body.",
  ];
  const descriptions = [
    "Select your primary focus. Your daily 20-minute routine adapts its strength, cardio, and mobility balance around it.",
    "Sets your initial work-to-recovery ratio. You can change this anytime in Settings.",
    "Enable joint and space adaptations so every movement feels safe and sustainable.",
  ];

  async function next() {
    if (busy) return;
    if (
      step === 2 &&
      age.trim() &&
      (!/^\d+$/.test(age.trim()) || Number(age) < 13 || Number(age) > 120)
    ) {
      setError("Enter a whole-number age from 13 to 120, or leave it blank.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (!editing || step === 2)
        await updateProfile({
          ...draft,
          age: age.trim() ? Number(age) : undefined,
          onboardingComplete: step === 2,
        });
      if (step === 2) onComplete?.();
      else setStep(step + 1);
    } catch {
      setError("Your preferences couldn’t be saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Page fullSafe>
        <View style={S.row}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
              <Text
                style={[
                  S.heading,
                  { fontSize: 22, fontWeight: "800", letterSpacing: -0.8 },
                ]}
              >
                fitflow
              </Text>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: C.sky,
                }}
              />
            </View>
            <Text style={S.small}>· Step {step + 1} of 3</Text>
          </View>
          {editing && (
            <IconButton
              name="close"
              label="Cancel editing preferences"
              onPress={() => onComplete?.()}
            />
          )}
        </View>

        {/* Stepper Progress Bar */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                height: 5,
                flex: 1,
                borderRadius: 99,
                backgroundColor: i <= step ? C.sky : C.line,
              }}
            />
          ))}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={S.title}>{titles[step]}</Text>
          <Text style={S.body}>{descriptions[step]}</Text>
        </View>

        {/* Step 0: Goal Selection */}
        {step === 0 && (
          <View style={{ gap: 10 }}>
            {goals.map((goal, i) => {
              const selected = draft.goal === goal;
              return (
                <Pressable
                  key={goal}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setDraft({ ...draft, goal })}
                  style={({ pressed }) => [
                    S.card,
                    S.row,
                    {
                      backgroundColor: selected ? C.ice : C.card,
                      borderColor: selected ? C.sky : C.line,
                      borderWidth: selected ? 1.5 : 1,
                      padding: 16,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: selected ? C.card : C.cardSubtle,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name={
                        (
                          [
                            "sunny-outline",
                            "barbell-outline",
                            "pulse-outline",
                            "body-outline",
                            "flame-outline",
                          ] as const
                        )[i]
                      }
                      size={20}
                      color={C.sky}
                    />
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        color: C.ink,
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {goalLabels[goal]}
                    </Text>
                    <Text style={S.small}>{goalSummaries[goal]}</Text>
                  </View>

                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={selected ? C.sky : C.lineStrong}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Step 1: Fitness Level */}
        {step === 1 && (
          <View style={{ gap: 12 }}>
            {levels.map((fitnessLevel, i) => {
              const selected = draft.fitnessLevel === fitnessLevel;
              return (
                <Pressable
                  key={fitnessLevel}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setDraft({ ...draft, fitnessLevel })}
                  style={({ pressed }) => [
                    S.card,
                    {
                      backgroundColor: selected ? C.ice : C.card,
                      borderColor: selected ? C.sky : C.line,
                      borderWidth: selected ? 1.5 : 1,
                      gap: 6,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View style={S.row}>
                    <Text style={S.heading}>{levelLabels[fitnessLevel]}</Text>
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={selected ? C.sky : C.lineStrong}
                    />
                  </View>
                  <Text style={S.small}>
                    {
                      [
                        "20s strength / 10s rest · 30s cardio / 30s easy march · Standing-first movements.",
                        "22s strength / 8s rest · 40s cardio / 20s easy march · Balanced full-body intervals.",
                        "25s strength / 5s rest · 40s+ cardio / 20s easy march · Longer active intervals.",
                      ][i]
                    }
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Step 2: Adaptations & Age */}
        {step === 2 && (
          <View style={{ gap: 16 }}>
            <View style={S.card}>
              {(
                [
                  {
                    key: "lowImpact",
                    title: "Keep it low impact",
                    detail:
                      "Gentle marching and controlled steps with zero jumping.",
                  },
                  {
                    key: "noFloor",
                    title: "Stay on your feet",
                    detail:
                      "Swaps floor exercises (bridges, planks, dead bugs) for standing variations.",
                  },
                  {
                    key: "noLunges",
                    title: "Skip deep lunges",
                    detail:
                      "Substitutes reverse lunges with knee-friendly side-to-side weight shifts.",
                  },
                ] as const
              ).map((item, idx) => (
                <View
                  key={item.key}
                  style={[
                    S.row,
                    {
                      paddingVertical: 8,
                      borderTopWidth: idx > 0 ? 1 : 0,
                      borderColor: C.line,
                    },
                  ]}
                >
                  <View style={{ flex: 1, gap: 2, paddingRight: 10 }}>
                    <Text
                      style={{ color: C.ink, fontSize: 15, fontWeight: "700" }}
                    >
                      {item.title}
                    </Text>
                    <Text style={S.small}>{item.detail}</Text>
                  </View>
                  <Switch
                    accessibilityLabel={item.title}
                    value={Boolean(draft[item.key])}
                    onValueChange={(value) =>
                      setDraft({ ...draft, [item.key]: value })
                    }
                    trackColor={{ false: C.line, true: C.sky }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>

            <View style={[S.card, { gap: 8 }]}>
              <Text style={S.heading}>Your age (optional)</Text>
              <TextInput
                accessibilityLabel="Age, optional"
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 42 (or leave blank)"
                placeholderTextColor={C.muted}
                keyboardType="number-pad"
                maxLength={3}
                style={{
                  backgroundColor: C.cardSubtle,
                  borderWidth: 1,
                  borderColor: C.line,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  color: C.ink,
                  fontSize: 16,
                  fontWeight: "600",
                  fontVariant: ["tabular-nums"],
                }}
              />
              <Text style={S.small}>
                Ages 55+ automatically receive extra recovery breathing time between intervals; ages 65+ also default to knee-friendly standing variations.
              </Text>
            </View>
          </View>
        )}

        {error ? (
          <Text accessibilityRole="alert" style={S.error}>
            {error}
          </Text>
        ) : null}

        <View style={{ gap: 10 }}>
          <Button
            title={
              step === 2
                ? editing
                  ? "Save preferences"
                  : "Start my daily 20"
                : "Continue"
            }
            busy={busy}
            onPress={() => void next()}
            icon="arrow-forward"
          />

          {step > 0 && (
            <Button
              secondary
              title="Back"
              disabled={busy}
              onPress={() => {
                setError("");
                setStep(step - 1);
              }}
            />
          )}
        </View>

        {step === 0 && !editing && (
          <View style={{ alignItems: "center", gap: 8, paddingTop: 6 }}>
            <Orbit small />
            <Text style={[S.small, { textAlign: "center" }]}>
              No accounts or cloud tracking. Everything stays on your device.
            </Text>
          </View>
        )}
      </Page>
    </KeyboardAvoidingView>
  );
}
