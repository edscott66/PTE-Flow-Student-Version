import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface BroadcastBannerProps {
broadcast: any | null;
remainingTime: number | null;
onPress: () => void;
}

export default function BroadcastBanner({ broadcast, remainingTime, onPress }: BroadcastBannerProps) {
if (!broadcast) return null;

return (
<TouchableOpacity onPress={onPress} activeOpacity={0.8}>
<View style={styles.banner}>
<Text style={styles.text}>
🔴 LIVE DRILL — {broadcast.moduleTitle || "Module"}
</Text>

{remainingTime !== null && (
<Text style={styles.timer}>
⏱ {remainingTime}s
</Text>
)}
</View>
</TouchableOpacity>
);
}

const styles = StyleSheet.create({
banner: {
width: "100%",
backgroundColor: "#d9534f",
paddingVertical: 8,
paddingHorizontal: 12,
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center"
},
text: {
color: "#fff",
fontWeight: "700",
fontSize: 15
},
timer: {
color: "#fff",
fontWeight: "600",
fontSize: 14
}
});