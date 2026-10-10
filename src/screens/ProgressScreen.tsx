import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../lib/AppState";
import { buildRoutine } from "../data/workoutData";
import { getStats, formatTime } from "../lib/stats";
import { C, Page, Pill, S, WeekStrip } from "../components/ui";

export default function ProgressScreen() {
  const { profile, sessions } = useApp();
  const stats = getStats(sessions);
  const plan = buildRoutine(profile, sessions);
  const week = plan.week;

  return (
    <Page>
      <View style={{ gap: 6 }}>
        <Text style={S.title}>Movement journal</Text>
        <Text style={S.body}>
          Consistency builds gently—one 20-minute session at a time.
        </Text>
      </View>

      {/* 3-Column Tabular KPI Strip */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={[
            S.card,
            {
              flex: 1,
              backgroundColor: C.skyDark,
              borderColor: C.skyDark,
              padding: 16,
              gap: 6,
            },
          ]}
        >
          <Ionicons name="checkmark-done" size={18} color={C.skyLight} />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 28,
              lineHeight: 34,
              fontWeight: "700",
              letterSpacing: -0.6,
              fontVariant: ["tabular-nums"],
            }}
          >
            {stats.total}
          </Text>
          <Text style={{ color: "#BDD6EE", fontSize: 12, fontWeight: "600" }}>
            Full sessions
          </Text>
        </View>

        <View style={[S.card, { flex: 1, padding: 16, gap: 6 }]}>
          <Ionicons name="time-outline" size={18} color={C.sky} />
          <Text
            style={{
              color: C.ink,
              fontSize: 28,
              lineHeight: 34,
              fontWeight: "700",
              letterSpacing: -0.6,
              fontVariant: ["tabular-nums"],
            }}
          >
            {stats.minutes}
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, fontWeight: "600" }}>
            Minutes moved
          </Text>
        </View>

        <View style={[S.card, { flex: 1, padding: 16, gap: 6 }]}>
          <Ionicons name="flame-outline" size={18} color={C.coral} />
          <Text
            style={{
              color: C.ink,
              fontSize: 28,
              lineHeight: 34,
              fontWeight: "700",
              letterSpacing: -0.6,
              fontVariant: ["tabular-nums"],
            }}
          >
            {stats.streak}
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, fontWeight: "600" }}>
            Day streak
          </Text>
        </View>
      </View>

      {/* 7-Day Consistency Calendar */}
      <View style={S.card}>
        <View style={S.row}>
          <View style={{ gap: 2 }}>
            <Text style={S.heading}>Last 7 days</Text>
            <Text style={S.small}>Completed 20-minute sessions</Text>
          </View>
          <Pill tone={stats.weekCount > 0 ? "recovery" : "default"}>
            {`${stats.weekCount} / 7 COMPLETED`}
          </Pill>
        </View>
        <WeekStrip days={stats.week} />
      </View>

      {/* 4-Week Progressive Pacing Card */}
      <View style={S.card}>
        <View style={S.row}>
          <View style={{ gap: 2 }}>
            <Text style={S.heading}>Four-week progression</Text>
            <Text style={S.small}>
              Strength {plan.strengthWork}s / {30 - plan.strengthWork}s rest · Cardio{" "}
              {plan.cardioWork}s / {60 - plan.cardioWork}s rest
            </Text>
          </View>
          <Pill>{`WEEK ${week} OF 4`}</Pill>
        </View>

        <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
          {[1, 2, 3, 4].map((w) => {
            const completedCycle = stats.total >= w * 3;
            const currentCycle = w === week;
            return (
              <View key={w} style={{ flex: 1, gap: 6 }}>
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: completedCycle
                      ? C.recovery
                      : currentCycle
                        ? C.sky
                        : C.line,
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: currentCycle ? "700" : "600",
                    color: completedCycle
                      ? C.recovery
                      : currentCycle
                        ? C.sky
                        : C.muted,
                    textAlign: "center",
                  }}
                >
                  Week {w}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={S.small}>
          {stats.total >= 12
            ? "You’ve completed all four progression tiers. Your daily 20 continues adapting to your recovery feedback."
            : `${3 - (stats.total % 3)} more full ${3 - (stats.total % 3) === 1 ? "session" : "sessions"} to unlock ${week === 4 ? "your full four-week milestone" : `Week ${week + 1} pacing`}.`}
        </Text>
      </View>

      {/* Session History List */}
      <View style={{ gap: 10 }}>
        <View style={S.row}>
          <Text style={S.heading}>Recent sessions</Text>
          {sessions.length > 0 && (
            <Text style={[S.small, { fontVariant: ["tabular-nums"] }]}>
              {sessions.length} {sessions.length === 1 ? "entry" : "entries"}
            </Text>
          )}
        </View>

        {sessions.length === 0 ? (
          <View
            style={[
              S.card,
              { alignItems: "center", paddingVertical: 28, gap: 8 },
            ]}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: C.ice,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="journal-outline" size={24} color={C.sky} />
            </View>
            <Text style={S.heading}>No sessions logged yet</Text>
            <Text style={[S.small, { textAlign: "center", maxWidth: 300 }]}>
              Finish a workout in the Move tab and your completed or shortened sessions will appear here.
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={[S.card, S.row, { paddingVertical: 14 }]}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: session.completed
                    ? C.recoverySoft
                    : C.coralPale,
                  borderWidth: 1,
                  borderColor: session.completed
                    ? C.recoveryBorder
                    : C.coralBorder,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={session.completed ? "checkmark-sharp" : "time-outline"}
                  size={18}
                  color={session.completed ? C.recovery : C.coral}
                />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{ color: C.ink, fontSize: 15, fontWeight: "700" }}
                >
                  {session.completed
                    ? "Daily 20 · Completed"
                    : "Shortened session"}
                </Text>
                <Text style={S.small}>
                  {new Date(session.date).toLocaleDateString("en", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {session.feedback
                    ? ` · ${
                        session.feedback === "right"
                          ? "Felt just right"
                          : session.feedback === "hard"
                            ? "Challenging"
                            : "Felt easy"
                      }`
                    : ""}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: C.cardSubtle,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: C.inkSecondary,
                    fontWeight: "700",
                    fontSize: 13,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {formatTime(session.durationSeconds)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </Page>
  );
}
