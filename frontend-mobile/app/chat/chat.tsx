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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../services/api";

const API_BASE_URL = "http://10.245.149.207:5000";

interface LaporanChat {
  id: number;
  judul: string;
  status: string;
  foto?: string | null;
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
      setLaporanList(res.data || []);
    } catch (error) {
      console.log(error);
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
    switch (status?.toLowerCase()) {
      case "pending":
        return { bg: "#FEF3C7", text: "#B45309", label: "Menunggu" };
      case "diproses":
        return { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses" };
      case "selesai":
        return { bg: "#DCFCE7", text: "#059669", label: "Selesai" };
      case "ditolak":
        return { bg: "#FEE2E2", text: "#DC2626", label: "Ditolak" };
      default:
        return { bg: "#E5E7EB", text: "#374151", label: status };
    }
  };

  const renderItem = ({ item }: { item: LaporanChat }) => {
    const statusStyle = getStatusStyle(item.status);
    const isChatClosed = item.status?.toLowerCase() === "selesai";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (!isChatClosed) {
            router.push({
              pathname: "/chat/[id]",
              params: { id: item.id.toString() },
            });
          }
        }}
        activeOpacity={0.7}
      >
        {item.foto && (
          <Image
            source={{ uri: `${API_BASE_URL}/uploads/${item.foto}` }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.judul}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <Ionicons name="chatbubble-outline" size={14} color="#6C757D" />
            <Text style={styles.chatHint}>
              {isChatClosed ? "Chat ditutup" : "Klik untuk chat"}
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
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Percakapan</Text>
      </View>
      {laporanList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={80} color="#D32F2F" />
          <Text style={styles.emptyText}>Belum ada laporan</Text>
          <Text style={styles.emptySubText}>Buat laporan untuk memulai chat</Text>
        </View>
      ) : (
        <FlatList
          data={laporanList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D32F2F" />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    backgroundColor: "#FFF",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A" },
  listContent: { padding: 16, paddingBottom: 30 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
  },
  cardImage: { width: 80, height: 80, backgroundColor: "#F0F0F0" },
  cardContent: { flex: 1, padding: 12, justifyContent: "center" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#1A1A1A", flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  chatHint: { fontSize: 12, color: "#6C757D" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A", marginTop: 16 },
  emptySubText: { fontSize: 14, color: "#6C757D", marginTop: 8, textAlign: "center" },
});