import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import API from "../../services/api";

interface Laporan {
  id: number;
  judul: string;
  deskripsi: string;
  foto?: string | null;
  status?: string;
  kategori?: string;
  created_at?: string;
  alamat?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export default function LaporanScreen() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("semua");

  const fetchLaporan = async () => {
    try {
      const res = await API.get("/laporan");
      setLaporan(res.data || []);
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
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

  const filteredLaporan = useMemo(() => {
    let filtered = [...laporan];
    if (activeFilter !== "semua") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.judul.toLowerCase().includes(q) ||
          item.deskripsi.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [laporan, activeFilter, searchQuery]);

  const getStatusConfig = (status?: string) => {
    if (!status) return { color: "#6B7280", bgLight: "#F3F4F6", label: "Tidak diketahui", icon: "help-circle-outline" };
    const map: Record<string, any> = {
      pending: { color: "#B45309", bgLight: "#FEF3C7", label: "Menunggu", icon: "time-outline" },
      diproses: { color: "#1E40AF", bgLight: "#DBEAFE", label: "Diproses", icon: "sync-outline" },
      proses: { color: "#1E40AF", bgLight: "#DBEAFE", label: "Diproses", icon: "sync-outline" },
      ditolak: { color: "#991B1B", bgLight: "#FEE2E2", label: "Ditolak", icon: "close-circle-outline" },
      selesai: { color: "#065F46", bgLight: "#D1FAE5", label: "Selesai", icon: "checkmark-circle-outline" },
    };
    return map[status.toLowerCase()] || { color: "#6B7280", bgLight: "#F3F4F6", label: status, icon: "help-circle-outline" };
  };

  const formatTanggal = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const getLocationText = (item: Laporan) => {
    // Prioritas: gunakan alamat dari backend
    if (item.alamat) return item.alamat;
    // Fallback ke koordinat jika ada
    let lat = item.latitude;
    let lng = item.longitude;
    if (lat && lng) {
      const latNum = typeof lat === 'number' ? lat : parseFloat(lat);
      const lngNum = typeof lng === 'number' ? lng : parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        return `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`;
      }
    }
    return null;
  };

  const renderItem = ({ item }: { item: Laporan }) => {
    const status = getStatusConfig(item.status);
    const locationText = getLocationText(item);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/detail-laporan/${item.id}`)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.judul}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bgLight }]}>
            <Ionicons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.categoryRow}>
          <Ionicons name="folder-outline" size={13} color="#94A3B8" />
          <Text style={styles.categoryText}>{item.kategori || "Umum"}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.deskripsi}
        </Text>

        {locationText && (
          <View style={styles.locationBox}>
            <Ionicons name="location-outline" size={14} color="#B91C1C" />
            <Text style={styles.locationText} numberOfLines={2}>
              {locationText}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
          <Text style={styles.dateText}>{formatTanggal(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Tidak ada laporan</Text>
      <Text style={styles.emptySub}>
        {searchQuery || activeFilter !== "semua"
          ? "Coba ubah filter atau kata kunci"
          : "Belum ada laporan yang dibuat"}
      </Text>
    </View>
  );

  const filters = [
    { key: "semua", label: "Semua", icon: "apps-outline" },
    { key: "pending", label: "Menunggu", icon: "time-outline" },
    { key: "diproses", label: "Diproses", icon: "sync-outline" },
    { key: "selesai", label: "Selesai", icon: "checkmark-circle-outline" },
    { key: "ditolak", label: "Ditolak", icon: "close-circle-outline" },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#5C0000" />
      <LinearGradient colors={["#8B0000", "#5C0000"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Riwayat Laporan</Text>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Cari judul atau deskripsi..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={isActive ? "#FFF" : "#6B7280"}
              />
              <Text
                style={[styles.chipLabel, isActive && styles.chipLabelActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredLaporan}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={EmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B0000"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8F9FA" },
  header: { paddingTop: 16, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF", flex: 1 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 44, paddingHorizontal: 18, paddingVertical: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: "#1E293B", paddingVertical: 4 },
  chipsContainer: { paddingHorizontal: 16, paddingVertical: 16, gap: 10, flexDirection: "row" },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 40, marginRight: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  chipActive: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  chipLabel: { fontSize: 13, fontWeight: "500", color: "#4B5563", marginLeft: 6 },
  chipLabelActive: { color: "#FFF", fontWeight: "600" },
  listContent: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: "#F0F2F5" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1E293B", marginRight: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 30, gap: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  categoryText: { fontSize: 12, color: "#64748B" },
  description: { fontSize: 14, color: "#475569", lineHeight: 20, marginBottom: 10 },
  locationBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginBottom: 10, gap: 8 },
  locationText: { fontSize: 12, color: "#B91C1C", flex: 1, lineHeight: 16 },
  footer: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  dateText: { fontSize: 12, color: "#94A3B8" },
  emptyContainer: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#6B7280", textAlign: "center" },
});