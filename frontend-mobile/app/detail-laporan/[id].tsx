// app/detail-laporan/[id].tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";

import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../services/api";

const { width } = Dimensions.get("window");

const UPLOAD_BASE_URL = "http://10.245.149.207:5000";

interface LaporanDetail {
  id: number;
  judul: string;
  deskripsi: string;
  foto?: string | null;
  status: string;
  kategori?: string;
  created_at?: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface Comment {
  id: number;
  komentar: string;
  user_id: number;
  user_nama?: string;
  role?: string;
  created_at: string;
}

export default function DetailLaporanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [laporan, setLaporan] = useState<LaporanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [alamat, setAlamat] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // ================= USER =================
  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ================= REVERSE GEOCODE (untuk alamat) =================
  const getAddressFromCoords = async (lat: any, lng: any) => {
    try {
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (isNaN(latitude) || isNaN(longitude)) return null;
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (!results || results.length === 0) return `${latitude}, ${longitude}`;
      const addr = results[0];
      const parts = [
        addr.name, addr.street, addr.district,
        addr.city, addr.region, addr.postalCode, addr.country,
      ].filter(Boolean);
      return parts.join(", ");
    } catch (err) {
      console.log("reverse geocode error", err);
      return null;
    }
  };

  // ================= FETCH DETAIL =================
  const fetchDetail = async () => {
    try {
      const res = await API.get(`/laporan/${id}`);
      const data = res.data;
      setLaporan(data);

      const rawLat = data?.latitude;
      const rawLng = data?.longitude;

      if (rawLat && rawLng) {
        const lat = Number(rawLat);
        const lng = Number(rawLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          const address = await getAddressFromCoords(lat, lng);
          setAlamat(address);
        } else {
          setAlamat(`${rawLat}, ${rawLng}`);
        }
      } else {
        setAlamat("Lokasi tidak tersedia");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Tidak dapat memuat detail laporan");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH COMMENTS =================
  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get(`/comments?laporan_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= SUBMIT COMMENT =================
  const submitComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Info", "Komentar tidak boleh kosong");
      return;
    }
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await API.post(
        "/comments",
        { laporan_id: Number(id), komentar: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
      Alert.alert("Berhasil", "Komentar berhasil dikirim");
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.msg || "Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE COMMENT =================
  const deleteComment = async (commentId: number) => {
    Alert.alert(
      "Hapus Komentar",
      "Yakin ingin menghapus komentar ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await API.delete(`/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchComments();
            } catch (error) {
              Alert.alert("Error", "Gagal menghapus komentar");
            }
          },
        },
      ]
    );
  };

  // ================= REFRESH =================
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDetail(), fetchComments()]);
    setRefreshing(false);
  };

  // ================= INIT =================
  useEffect(() => {
    const init = async () => {
      await Location.requestForegroundPermissionsAsync();
      if (id) {
        fetchDetail();
        fetchComments();
        getCurrentUser();
      }
    };
    init();
  }, [id]);

  // ================= STATUS =================
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { bg: "#FEF3C7", text: "#B45309", icon: "time-outline", label: "Pending" };
      case "diproses":
        return { bg: "#DBEAFE", text: "#2563EB", icon: "sync-outline", label: "Diproses" };
      case "ditolak":
        return { bg: "#FEE2E2", text: "#DC2626", icon: "close-circle-outline", label: "Ditolak" };
      case "selesai":
        return { bg: "#DCFCE7", text: "#059669", icon: "checkmark-circle-outline", label: "Selesai" };
      default:
        return { bg: "#E5E7EB", text: "#6B7280", icon: "help-circle-outline", label: status };
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // ================= RENDER COMMENT (RAPI) =================
  const renderComment = (item: Comment) => {
    const isOwner = currentUserId === item.user_id;
    const isPetugas = item.role === "petugas" || item.role === "admin";

    return (
      <View style={[styles.commentCard, isOwner && styles.myCommentCard]}>
        <View style={styles.commentHeader}>
          <View style={styles.avatarContainer}>
            {isPetugas ? (
              <LinearGradient colors={["#059669", "#10B981"]} style={styles.avatarGradient}>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
              </LinearGradient>
            ) : (
              <LinearGradient colors={["#991B1B", "#DC2626"]} style={styles.avatarGradient}>
                <Ionicons name="person" size={20} color="#FFF" />
              </LinearGradient>
            )}
          </View>
          <View style={styles.commentInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.commentName}>{item.user_nama || "Pengguna"}</Text>
              {isPetugas && (
                <View style={styles.badgePetugas}>
                  <Text style={styles.badgePetugasText}>Petugas</Text>
                </View>
              )}
            </View>
            <Text style={styles.commentTime}>{formatDate(item.created_at)}</Text>
          </View>
          {isOwner && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteComment(item.id)} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.commentText}>{item.komentar}</Text>
      </View>
    );
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7F1D1D" />
      </SafeAreaView>
    );
  }

  if (!laporan) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Laporan tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  const status = getStatusConfig(laporan.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#450A0A" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7F1D1D" />}
        >
          {/* HEADER */}
          <LinearGradient colors={["#450A0A", "#7F1D1D", "#991B1B"]} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Laporan</Text>
            <Text style={styles.headerSub}>Informasi laporan pengaduan</Text>
          </LinearGradient>

          {/* CONTENT */}
          <View style={styles.content}>
            {laporan.foto && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: `${UPLOAD_BASE_URL}/uploads/${laporan.foto}` }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Ionicons name={status.icon as any} size={15} color={status.text} />
                    <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.card}>
              {alamat && (
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={18} color="#991B1B" />
                  <Text style={styles.infoLabel}>{alamat}</Text>
                </View>
              )}
              <Text style={styles.judul}>{laporan.judul}</Text>
              <View style={styles.infoItem}>
                <Ionicons name="folder-outline" size={18} color="#991B1B" />
                <Text style={styles.infoLabel}>{laporan.kategori || "-"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={18} color="#991B1B" />
                <Text style={styles.infoLabel}>{formatDate(laporan.created_at)}</Text>
              </View>
            </View>

            <View style={styles.descCard}>
              <Text style={styles.sectionTitle}>Deskripsi Laporan</Text>
              <Text style={styles.descText}>{laporan.deskripsi}</Text>
            </View>

            <TouchableOpacity style={styles.chatButton} onPress={() => router.push({ pathname: "/chat", params: { laporanId: laporan.id, laporanJudul: laporan.judul } })}>
              <LinearGradient colors={["#7F1D1D", "#991B1B"]} style={styles.chatGradient}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                <Text style={styles.chatText}>Hubungi Petugas</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* KOMENTAR SECTION */}
            <View style={styles.commentSection}>
              <View style={styles.commentHeaderSection}>
                <Text style={styles.commentTitle}>Komentar</Text>
                <View style={styles.commentCount}>
                  <Text style={styles.commentCountText}>{comments.length}</Text>
                </View>
              </View>

              {comments.length === 0 ? (
                <View style={styles.emptyComment}>
                  <Ionicons name="chatbubble-outline" size={55} color="#CBD5E1" />
                  <Text style={styles.emptyCommentText}>Belum ada komentar</Text>
                </View>
              ) : (
                comments.map((item) => <View key={item.id}>{renderComment(item)}</View>)
              )}

              {/* INPUT KOMENTAR */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Tulis komentar..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!newComment.trim() || submitting) && styles.sendDisabled]}
                  onPress={submitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Ionicons name="send" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 70,
    paddingBottom: 90,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: { color: "#FFF", fontSize: 30, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 15 },
  content: { marginTop: -55, paddingHorizontal: 20, paddingBottom: 50 },
  imageWrapper: {
    position: "relative",
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  image: { width: "100%", height: 260 },
  imageOverlay: { position: "absolute", top: 16, right: 16 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 30 },
  statusText: { fontSize: 13, fontWeight: "700", marginLeft: 6 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    padding: 22,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  judul: { fontSize: 24, fontWeight: "800", color: "#111827", lineHeight: 34, marginBottom: 20 },
  infoItem: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  infoLabel: { marginLeft: 10, color: "#475569", fontSize: 14, flex: 1 },
  descCard: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 16 },
  descText: { color: "#475569", lineHeight: 30, fontSize: 15 },
  chatButton: { marginTop: 24 },
  chatGradient: { borderRadius: 20, paddingVertical: 18, justifyContent: "center", alignItems: "center", flexDirection: "row" },
  chatText: { color: "#FFF", fontSize: 15, fontWeight: "700", marginLeft: 10 },
  commentSection: { marginTop: 30 },
  commentHeaderSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  commentTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  commentCount: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#7F1D1D", justifyContent: "center", alignItems: "center" },
  commentCountText: { color: "#FFF", fontWeight: "700" },
  emptyComment: { backgroundColor: "#FFF", paddingVertical: 40, borderRadius: 30, alignItems: "center" },
  emptyCommentText: { marginTop: 16, fontSize: 15, color: "#64748B", fontWeight: "600" },
  // ======== KOMPONEN KOMENTAR RAPI ========
  commentCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  myCommentCard: { backgroundColor: "#FEF9F9" },
  commentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarContainer: { marginRight: 12 },
  avatarGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  commentInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  commentName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  badgePetugas: { backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 16 },
  badgePetugasText: { fontSize: 10, fontWeight: "800", color: "#059669" },
  commentTime: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  deleteButton: { padding: 8, borderRadius: 20, backgroundColor: "#FEF2F2" },
  commentText: { fontSize: 14, lineHeight: 22, color: "#334155", marginLeft: 56 },
  // ======== INPUT KOMENTAR ========
  inputWrapper: {
    marginTop: 12,
    backgroundColor: "#FFF",
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 15, color: "#111827", maxHeight: 100, lineHeight: 24, paddingHorizontal: 8 },
  sendButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#7F1D1D", justifyContent: "center", alignItems: "center", marginLeft: 12 },
  sendDisabled: { backgroundColor: "#FCA5A5" },
});