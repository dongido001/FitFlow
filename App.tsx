import React from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { AppProvider, useApp } from "./src/lib/AppState";
import { validProfile } from "./src/lib/stats";
import { Button, C, Page, S } from "./src/components/ui";

export type Tabs = {
  Home: undefined;
  Workout: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<Tabs>();

function Root() {
  const { profile, ready, error, reload } = useApp();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const tabHeight = 58 + bottomInset;

  if (!ready)
    return (
      <Page fullSafe>
        <View style={[S.card, { alignItems: "center", paddingVertical: 32, gap: 12 }]}>
          <ActivityIndicator color={C.sky} />
          <Text style={S.body}>Preparing your daily routine…</Text>
        </View>
      </Page>
    );

  if (error)
    return (
      <Page fullSafe>
        <View style={S.card}>
          <Text style={S.heading}>Couldn’t load your saved data</Text>
          <Text style={S.error}>{error}</Text>
          <Button title="Try again" onPress={() => void reload()} />
        </View>
      </Page>
    );

  if (!profile?.onboardingComplete || !validProfile(profile))
    return <OnboardingScreen />;

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: C.bg,
          card: C.card,
          text: C.ink,
          primary: C.sky,
          border: C.line,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: C.sky,
          tabBarInactiveTintColor: C.muted,
          tabBarStyle: {
            backgroundColor: C.card,
            borderTopColor: C.line,
            borderTopWidth: 1,
            height: tabHeight,
            paddingTop: 6,
            paddingBottom: bottomInset,
          },
          tabBarItemStyle: {
            minHeight: 48,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.1,
            paddingBottom: 2,
          },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                route.name === "Home"
                  ? focused
                    ? "today"
                    : "today-outline"
                  : route.name === "Workout"
                    ? focused
                      ? "play-circle"
                      : "play-circle-outline"
                    : route.name === "Progress"
                      ? focused
                        ? "stats-chart"
                        : "stats-chart-outline"
                      : focused
                        ? "person-circle"
                        : "person-circle-outline"
              }
              size={22}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Today" }}
        />
        <Tab.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{ title: "Move" }}
        />
        <Tab.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: "Journal" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Settings" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {Platform.OS === "android" && <NavigationBar style="dark" />}
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
