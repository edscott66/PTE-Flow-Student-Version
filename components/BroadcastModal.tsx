import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface BroadcastModalProps {
  visible: boolean;
  broadcast: any | null;
  onJoin: () => void;
  onClose: () => void;
}

export default function BroadcastModal({
  visible,
  broadcast,
  onJoin,
  onClose
}: BroadcastModalProps) {
  if (!broadcast) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{broadcast.moduleTitle || "New Drill"}</Text>

          {broadcast.message && (
            <Text style={styles.message}>{broadcast.message}</Text>
          )}

          {broadcast.timerSeconds && (
            <Text style={styles.timer}>
              ⏱ {broadcast.timerSeconds} seconds
            </Text>
          )}

          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Text style={styles.joinText}>Join Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    elevation: 10
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center"
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16
  },
  timer: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#d9534f",
    fontWeight: "600"
  },
  joinButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  joinText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600"
  },
  closeButton: {
    paddingVertical: 10
  },
  closeText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555"
  }
});