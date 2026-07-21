import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import API from "../../services/api";

interface User {
  id: number;
  nama: string;
  email: string;
  role?: string;
  foto?: string | null;
}

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

const API_BASE_URL = "http://10.91.81.207:5000";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [riwayat, setRiwayat] = useState<Laporan[]>([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await API.get("/users/profile");
      const data = response.data;
      if (data) {
        const userData: User = {
          id: data.id,
          nama: data.nama,
          email: data.email,
          role: data.role,
          foto: data.foto || null,
        };
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.log(error);
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } finally {
      setLoading(false);
    }
  };

  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const res = await API.get("/laporan");
      setRiwayat(res.data || []);
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setLoadingRiwayat(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchRiwayat();
  }, []);

  const onRefreshRiwayat = () => {
    setRefreshing(true);
    fetchRiwayat();
  };

  const logout = async () => {
    Alert.alert("Logout", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          router.replace("/");
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (user) {
      setEditNama(user.nama);
      setEditEmail(user.email);
      setEditPassword("");
      setEditModalVisible(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editNama.trim() || !editEmail.trim()) {
      Alert.alert("Error", "Nama dan email tidak boleh kosong");
      return;
    }
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const payload: any = { nama: editNama, email: editEmail };
      if (editPassword.trim()) payload.password = editPassword;
      await API.put("/user/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...user, nama: editNama, email: editEmail };
      setUser(updatedUser as User);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      Alert.alert("Sukses", "Profil berhasil diperbarui");
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.msg || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const pickAndUploadPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Izin diperlukan", "Berikan akses galeri untuk mengubah foto profil");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      await uploadPhoto(asset);
    }
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingFoto(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      const filename = asset.uri.split("/").pop() || "profile.jpg";
      const ext = filename.split(".").pop();
      formData.append("foto", {
        uri: asset.uri,
        name: filename,
        type: `image/${ext}`,
      } as any);
      const response = await fetch(`${API_BASE_URL}/api/users/upload-foto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Upload gagal");
      await fetchUserProfile();
      Alert.alert("Sukses", "Foto profil berhasil diperbarui");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message || "Upload gagal");
    } finally {
      setUploadingFoto(false);
    }
  };

  // Fungsi untuk mendapatkan teks lokasi (alamat atau koordinat)
  const getLocationText = (item: Laporan) => {
    if (item.alamat) return item.alamat;
    let lat = item.latitude;
    let lng = item.longitude;
    if (lat && lng) {
      const latNum = typeof lat === "number" ? lat : parseFloat(lat);
      const lngNum = typeof lng === "number" ? lng : parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        return `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`;
      }
    }
    return null;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const config: Record<string, { color: string; bg: string; label: string }> = {
      pending: { color: "#F59E0B", bg: "#FEF3C7", label: "Pending" },
      diproses: { color: "#10B981", bg: "#D1FAE5", label: "Diproses" },
      proses: { color: "#10B981", bg: "#D1FAE5", label: "Diproses" },
      ditolak: { color: "#EF4444", bg: "#FEE2E2", label: "Ditolak" },
      selesai: { color: "#8B5CF6", bg: "#EDE9FE", label: "Selesai" },
    };
    const c = config[status.toLowerCase()] || { color: "#6B7280", bg: "#F3F4F6", label: status };
    return (
      <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
        <Text style={[styles.statusText, { color: c.color }]}>{c.label}</Text>
      </View>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const renderRiwayatItem = ({ item }: { item: Laporan }) => {
    const locationText = getLocationText(item);
    return (
      <TouchableOpacity
        style={styles.riwayatCard}
        onPress={() => router.push(`/detail-laporan/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.riwayatHeader}>
          <Text style={styles.riwayatJudul} numberOfLines={1}>
            {item.judul}
          </Text>
          {getStatusBadge(item.status)}
        </View>
        <Text style={styles.riwayatDeskripsi} numberOfLines={2}>
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
        <View style={styles.riwayatFooter}>
          <View style={styles.riwayatFooterLeft}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.riwayatTanggal}>{formatDate(item.created_at)}</Text>
          </View>
          {item.kategori && (
            <View style={styles.riwayatFooterLeft}>
              <Ionicons name="folder-outline" size={12} color="#9CA3AF" />
              <Text style={styles.riwayatKategori}>{item.kategori}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#8B0000", "#5C0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickAndUploadPhoto} disabled={uploadingFoto}>
          <View style={styles.avatarContainer}>
            {user?.foto ? (
              <Image source={{ uri: `${API_BASE_URL}/uploads/${user.foto}` }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={70} color="#FFF" />
              </View>
            )}
            <View style={styles.editAvatarIcon}>
              {uploadingFoto ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="camera" size={20} color="#FFF" />}
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.nama}>{user?.nama || "User"}</Text>
        <Text style={styles.email}>{user?.email || "-"}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || "user"}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshRiwayat} tintColor="#8B0000" />
        }
      >
        <View style={styles.card}>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="pencil-outline" size={22} color="#8B0000" />
            <Text style={styles.editButtonText}>Edit Profil</Text>
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={20} color="#8B0000" />
            </View>
            <Text style={styles.infoText}>{user?.nama}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={20} color="#8B0000" />
            </View>
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#8B0000" />
            </View>
            <Text style={styles.infoText}>ID: {user?.id}</Text>
          </View>
        </View>

        <View style={styles.riwayatSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={22} color="#8B0000" />
            <Text style={styles.sectionTitle}>Riwayat Laporan</Text>
          </View>
          {loadingRiwayat && riwayat.length === 0 ? (
            <ActivityIndicator color="#8B0000" style={{ marginVertical: 20 }} />
          ) : riwayat.length === 0 ? (
            <View style={styles.emptyRiwayat}>
              <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyRiwayatText}>Belum ada laporan</Text>
            </View>
          ) : (
            riwayat.map((item) => <View key={item.id}>{renderRiwayatItem({ item })}</View>)
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profil</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8B0000" />
                <TextInput
                  style={styles.input}
                  value={editNama}
                  onChangeText={setEditNama}
                  placeholder="Nama lengkap"
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#8B0000" />
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.inputLabel}>Password Baru (opsional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8B0000" />
                <TextInput
                  style={styles.input}
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholder="Kosongkan jika tidak ingin mengganti"
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Simpan Perubahan</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { paddingTop: 50, paddingBottom: 30, alignItems: "center", borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 1 },
  avatarWrapper: { marginTop: 20 },
  avatarContainer: { position: "relative" },
  avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: "rgba(255,255,255,0.5)", backgroundColor: "#FFF" },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.5)" },
  editAvatarIcon: { position: "absolute", bottom: 5, right: 5, backgroundColor: "#8B0000", borderRadius: 20, width: 34, height: 34, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
  nama: { fontSize: 26, fontWeight: "bold", color: "#FFF", marginTop: 16 },
  email: { fontSize: 15, color: "#FFE5E5", marginTop: 4 },
  roleBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  roleText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  card: { backgroundColor: "#FFF", borderRadius: 28, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  editButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FEE2E2", paddingVertical: 12, borderRadius: 40, marginBottom: 24, gap: 8 },
  editButtonText: { color: "#8B0000", fontWeight: "600", fontSize: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginRight: 12 },
  infoText: { fontSize: 16, color: "#374151", flex: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#8B0000", borderRadius: 40, paddingVertical: 14, marginTop: 24, marginBottom: 40, gap: 8 },
  logoutText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { backgroundColor: "#FFF", margin: 20, borderRadius: 32, padding: 24, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#8B0000" },
  inputLabel: { fontWeight: "600", marginBottom: 6, color: "#374151", fontSize: 14, marginTop: 12 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFB", borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 16, marginBottom: 8 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, paddingVertical: 14, color: "#1F2937" },
  saveButton: { backgroundColor: "#8B0000", paddingVertical: 14, borderRadius: 40, alignItems: "center", marginTop: 24 },
  saveButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  riwayatSection: { marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  riwayatCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  riwayatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  riwayatJudul: { fontSize: 15, fontWeight: "bold", color: "#1F2937", flex: 1, marginRight: 8 },
  riwayatDeskripsi: { fontSize: 13, color: "#6B7280", lineHeight: 18, marginBottom: 10 },
  locationBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginBottom: 10, gap: 8 },
  locationText: { fontSize: 12, color: "#B91C1C", flex: 1, lineHeight: 16 },
  riwayatFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  riwayatFooterLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  riwayatTanggal: { fontSize: 11, color: "#9CA3AF", marginLeft: 4 },
  riwayatKategori: { fontSize: 11, color: "#9CA3AF", marginLeft: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: "bold" },
  emptyRiwayat: { alignItems: "center", paddingVertical: 30 },
  emptyRiwayatText: { fontSize: 14, color: "#9CA3AF", marginTop: 8 },
});