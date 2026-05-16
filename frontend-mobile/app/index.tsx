import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>📢 Layanan Pengaduan Masyarakat</Text>

      <Text style={styles.subtitle}>
        Laporkan keluhan, aspirasi, dan masalah lingkungan Anda dengan mudah dan cepat.
      </Text>

      {/* CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Fitur Aplikasi</Text>
        <Text style={styles.cardText}>• Lapor keluhan online</Text>
        <Text style={styles.cardText}>• Pantau status laporan</Text>
        <Text style={styles.cardText}>• Respon cepat dari petugas</Text>
      </View>

      {/* BUTTON LOGIN */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.buttonText}>Login Sekarang</Text>
      </TouchableOpacity>

      {/* FOOTER */}
      <Text style={styles.footer}>
        © 2026 Sistem Pengaduan Masyarakat
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  footer: {
    marginTop: 25,
    textAlign: "center",
    fontSize: 12,
    color: "#999",
  },
});