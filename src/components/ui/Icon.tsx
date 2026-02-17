import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];
type MaterialCommunityIconsName = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

interface IconProps {
  name: IoniconsName | MaterialCommunityIconsName;
  size?: number;
  color?: string;
  family?: "ionicons" | "material-community";
}

export function Icon({
  name,
  size = 24,
  color = "#000",
  family = "ionicons",
}: IconProps) {
  if (family === "material-community") {
    return (
      <MaterialCommunityIcons
        name={name as MaterialCommunityIconsName}
        size={size}
        color={color}
      />
    );
  }

  return <Ionicons name={name as IoniconsName} size={size} color={color} />;
}
