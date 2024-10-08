import { Image, StyleSheet, Platform, Text } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">EnglishScore Hack!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Open tab Camera</ThemedText>
        <ThemedText>Enjoy with app, have fun !!!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">
          Step 2: Donate for me <HelloWave />{" "}
        </ThemedText>
        <ThemedText type="link">
          <Link href="https://me.momo.vn/lDIWugilUNfXCOI2fKCV">
            https://me.momo.vn/lDIWugilUNfXCOI2fKCV
          </Link>
        </ThemedText>
        <ThemedView
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/images/momo.png")}
            style={styles.momo}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView
        style={{
          ...styles.stepContainer,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThemedText type="defaultSemiBold">Author : Đỗ Tiến Phong</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  momo: {
    height: 150,
    width: 150,
  },
});
