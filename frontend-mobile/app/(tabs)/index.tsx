import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    Alert.alert("Logout berhasil");
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>🏠 Dashboard Pengguna</Text>

      <Text style={styles.subtitle}>
        Selamat datang 👋, silakan pilih menu di bawah ini
      </Text>

      {/* MENU */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>📝 Buat Laporan</Text>
          <Text style={styles.cardText}>Laporkan keluhan Anda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>📊 Status Laporan</Text>
          <Text style={styles.cardText}>Lihat progres laporan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>👤 Profil</Text>
          <Text style={styles.cardText}>Data akun pengguna</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 40,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },

  menuContainer: {
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  cardText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});