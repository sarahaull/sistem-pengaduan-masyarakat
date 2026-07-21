import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import API from "../../../services/api";

const API_BASE_URL = "http://10.245.149.207:5000";

interface LaporanChat {
  id: number;
  judul: string;
  status: string;
  foto?: string | null;
  deskripsi?: string;
}

export default function ChatListScreen() {
  const router = useRouter();
  const [laporanList, setLaporanList] = useState<LaporanChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLaporan = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/laporan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("DATA LAPORAN CHAT:", res.data);
      setLaporanList(res.data || []);
    } catch (error) {
      console.log("fetchLaporan error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLaporan();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLaporan();
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "pending":
        return { bg: "#FEF3C7", text: "#B45309", label: "Menunggu", icon: "time-outline" };
      case "diproses":
        return { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses", icon: "sync-outline" };
      case "selesai":
        return { bg: "#DCFCE7", text: "#059669", label: "Selesai", icon: "checkmark-done-circle-outline" };
      case "ditolak":
        return { bg: "#FEE2E2", text: "#DC2626", label: "Ditolak", icon: "close-circle-outline" };
      default:
        return { bg: "#E5E7EB", text: "#374151", label: status || "Tidak diketahui", icon: "help-circle-outline" };
    }
  };

  const canChat = (status: string) => {
    return status?.toLowerCase() === "diproses";
  };

  const handlePressChat = (item: LaporanChat) => {
    if (canChat(item.status)) {
      router.push({
        pathname: "/chat/[id]",
        params: { id: item.id.toString() },
      });
    } else {
      if (item.status?.toLowerCase() === "pending") {
        Alert.alert("Belum Bisa Chat", "Laporan Anda masih menunggu diproses. Chat akan aktif setelah status menjadi 'Diproses'.");
      } else if (item.status?.toLowerCase() === "selesai") {
        Alert.alert("Chat Ditutup", "Laporan ini sudah selesai. Chat tidak dapat diakses.");
      } else if (item.status?.toLowerCase() === "ditolak") {
        Alert.alert("Laporan Ditolak", "Laporan Anda ditolak. Tidak dapat melakukan chat.");
      } else {
        Alert.alert("Tidak Tersedia", "Chat belum tersedia untuk laporan ini.");
      }
    }
  };

  const renderItem = ({ item }: { item: LaporanChat }) => {
    const statusStyle = getStatusStyle(item.status);
    const isChatDisabled = !canChat(item.status);

    return (
      <TouchableOpacity
        style={[styles.card, isChatDisabled && styles.cardDisabled]}
        onPress={() => handlePressChat(item)}
        activeOpacity={isChatDisabled ? 0.9 : 0.7}
        disabled={isChatDisabled}
      >
        {item.foto ? (
          <Image
            source={{ uri: `${API_BASE_URL}/uploads/${item.foto}` }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={24} color="#CBD5E1" />
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.judul}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Ionicons name={statusStyle.icon as any} size={12} color={statusStyle.text} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>

          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.deskripsi || "Tidak ada deskripsi"}
          </Text>

          <View style={styles.cardFooter}>
            <Ionicons
              name={isChatDisabled ? "lock-closed-outline" : "chatbubble-ellipses-outline"}
              size={16}
              color={isChatDisabled ? "#94A3B8" : "#D32F2F"}
            />
            <Text style={[styles.chatHint, isChatDisabled && styles.chatHintDisabled]}>
              {isChatDisabled
                ? statusStyle.label === "Menunggu"
                  ? "Menunggu diproses"
                  : statusStyle.label === "Selesai"
                  ? "Chat ditutup"
                  : "Tidak dapat chat"
                : "Chat sekarang"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B0000" />
      <LinearGradient colors={["#8B0000", "#5C0000"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>💬 Chat Petugas</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          Diskusikan laporan Anda dengan petugas
        </Text>
      </LinearGradient>

      {laporanList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={80} color="#D32F2F" />
          <Text style={styles.emptyText}>Belum ada laporan</Text>
          <Text style={styles.emptySubText}>Buat laporan terlebih dahulu untuk memulai chat</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/tambah-laporan")}
          >
            <Text style={styles.createButtonText}>+ Buat Laporan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={laporanList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D32F2F" colors={["#D32F2F"]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA" },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#FFDADA",
    marginTop: 8,
    marginLeft: 44,
  },
  listContent: { padding: 16, paddingBottom: 30 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  cardDisabled: {
    opacity: 0.75,
  },
  cardImage: {
    width: 100,
    height: 100,
    backgroundColor: "#F1F5F9",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chatHint: {
    fontSize: 12,
    color: "#D32F2F",
    fontWeight: "500",
  },
  chatHintDisabled: {
    color: "#94A3B8",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#6C757D",
    marginTop: 8,
    textAlign: "center",
  },
  createButton: {
    marginTop: 24,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});