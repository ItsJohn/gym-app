import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

interface GymLogoProps {
  width?: number;
  height?: number;
}

export default function GymLogo({ width = 290, height = 178 }: GymLogoProps) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
        }}
        style={styles.image}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -145 }, { translateY: -89 }],
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
});
