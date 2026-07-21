import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

import API from "../../services/api";

const API_BASE_URL = "http://10.245.149.207:5000";
const { width: screenWidth } = Dimensions.get("window");

interface Category {
  id: number;
  nama: string;
}

interface Laporan {
  id: number;
  judul: string;
  deskripsi: string;
  foto?: string | null;
  status?: string;
  kategori?: string;
  created_at?: string;
  updated_at?: string;
  latitude?: number | null;
  longitude?: number | null;
  alamat?: string | null;
}

interface Statistik {
  total: number;
  pending: number;
  diproses: number;
  selesai: number;
  ditolak: number;
}

interface UserData {
  id: number;
  nama: string;
  email: string;
  foto?: string | null;
}

const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return { bg: "#FEF3C7", text: "#B45309", label: "Menunggu", icon: "time-outline" };
    case "diproses":
      return { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses", icon: "refresh-circle" };
    case "selesai":
      return { bg: "#D1FAE5", text: "#065F46", label: "Selesai", icon: "checkmark-done-circle" };
    case "ditolak":
      return { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak", icon: "close-circle" };
    default:
      return { bg: "#E5E7EB", text: "#374151", label: status || "Tidak diketahui", icon: "help-circle" };
  }
};

// Reverse geocode
const getAddressFromCoords = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results && results.length > 0) {
      const addr = results[0];
      const parts = [addr.name, addr.street, addr.district, addr.city, addr.region, addr.postalCode].filter(Boolean);
      if (parts.length > 0) return parts.join(", ");
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    return null;
  } catch (error) {
    console.log("reverse geocode error", error);
    return null;
  }
};

// Cache helpers
const getCachedAddress = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const key = `address_cache_${lat}_${lng}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const setCachedAddress = async (lat: number, lng: number, address: string) => {
  try {
    const key = `address_cache_${lat}_${lng}`;
    await AsyncStorage.setItem(key, address);
  } catch (error) {}
};

const getAddressWithCache = async (lat: number, lng: number): Promise<string | null> => {
  const cached = await getCachedAddress(lat, lng);
  if (cached) return cached;
  const address = await getAddressFromCoords(lat, lng);
  if (address) await setCachedAddress(lat, lng, address);
  return address;
};

export default function HomeScreen() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kategori, setKategori] = useState<Category[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [statistik, setStatistik] = useState<Statistik>({
    total: 0,
    pending: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategoriId, setKategoriId] = useState<number | "">("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Location state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [alamatText, setAlamatText] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const filteredLaporan = React.useMemo(() => {
    let result = laporan;
    if (filterStatus !== "all") {
      result = result.filter((item) => item.status?.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchQuery.trim() !== "") {
      result = result.filter((item) => item.judul.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [laporan, filterStatus, searchQuery]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 15) return "Good Afternoon";
    if (hour < 18) return "Good Evening";
    return "Good Night";
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const response = await API.get("/users/profile");
      const data = response.data;
      if (data) {
        const user: UserData = {
          id: data.id,
          nama: data.nama || "Pengguna",
          email: data.email || "",
          foto: data.foto || null,
        };
        setUserData(user);
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
    } catch (error) {
      console.log("fetchUserProfile error", error);
      const stored = await AsyncStorage.getItem("user");
      if (stored) setUserData(JSON.parse(stored));
    }
  };

  const hitungStatistik = (data: Laporan[]) => {
    const stats = { total: data.length, pending: 0, diproses: 0, selesai: 0, ditolak: 0 };
    data.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (status === "pending") stats.pending++;
      else if (status === "diproses") stats.diproses++;
      else if (status === "selesai") stats.selesai++;
      else if (status === "ditolak") stats.ditolak++;
    });
    setStatistik(stats);
  };

  const fetchLaporan = async () => {
    try {
      const res = await API.get("/laporan");
      const data: Laporan[] = res.data || [];

      const initialData = data.map((item) => ({ ...item, alamat: item.alamat || null }));
      setLaporan(initialData);
      hitungStatistik(initialData);
      setLoading(false);

      const itemsWithCoords = data.filter((item) => item.latitude != null && item.longitude != null);
      for (const item of itemsWithCoords) {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          const address = await getAddressWithCache(lat, lng);
          setLaporan((prev) => prev.map((p) => (p.id === item.id ? { ...p, alamat: address } : p)));
        }
      }
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await API.get("/categories");
      setKategori(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLaporan();
      fetchUserProfile();
    }, [])
  );

  useEffect(() => {
    fetchKategori();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Izin gallery dibutuhkan");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const requestLocationPermissionAndGet = async () => {
    setLoadingLocation(true);
    setLocationError(null);
    setAlamatText(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Izin lokasi ditolak");
        Alert.alert("Izin Diperlukan", "Aktifkan izin lokasi di pengaturan untuk menggunakan fitur ini.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      const address = await getAddressFromCoords(coords.latitude, coords.longitude);
      if (address) {
        setAlamatText(address);
        Alert.alert("Lokasi Terdeteksi", `Alamat: ${address}`);
      } else {
        setAlamatText(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        Alert.alert("Lokasi Terdeteksi", `Koordinat: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
      setLocationError(null);
    } catch (error: any) {
      let errorMsg = "Gagal mengambil lokasi";
      if (error.message?.toLowerCase().includes("unavailable")) errorMsg = "Lokasi tidak tersedia. Nyalakan GPS.";
      else if (error.message) errorMsg = error.message;
      setLocationError(errorMsg);
      Alert.alert("Error Lokasi", errorMsg);
    } finally {
      setLoadingLocation(false);
    }
  };

  const getLocation = async () => {
    await requestLocationPermissionAndGet();
  };

  const resetForm = () => {
    setJudul("");
    setDeskripsi("");
    setKategoriId("");
    setImage(null);
    setLocation(null);
    setAlamatText(null);
    setLocationError(null);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleAddLaporan = async () => {
    if (!judul || !deskripsi || !kategoriId) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      formData.append("kategori_id", String(kategoriId));
      if (alamatText) {
        formData.append("alamat", alamatText);
      }
      if (image) {
        const filename = image.uri.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop();
        formData.append("foto", {
          uri: Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri,
          name: filename,
          type: `image/${ext}`,
        } as any);
      }
      if (location) {
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
      }
      const response = await fetch(`${API_BASE_URL}/api/laporan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || "Gagal membuat laporan");
      Alert.alert("Sukses", "Laporan berhasil dibuat");
      resetForm();
      setModalVisible(false);
      fetchLaporan();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: Laporan) => {
    if (item.status?.toLowerCase() !== "pending") {
      Alert.alert("Tidak dapat diedit", "Laporan yang sudah diproses tidak dapat diubah.");
      return;
    }
    setIsEditMode(true);
    setEditId(item.id);
    setJudul(item.judul);
    setDeskripsi(item.deskripsi);
    const found = kategori.find((k) => k.nama === item.kategori);
    setKategoriId(found ? found.id : "");
    setImage(null);
    setLocation(item.latitude && item.longitude ? { latitude: item.latitude, longitude: item.longitude } : null);
    setAlamatText(item.alamat || null);
    setLocationError(null);
    setModalVisible(true);
  };

  const handleEditLaporan = async () => {
    if (!judul || !deskripsi || !kategoriId || !editId) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      formData.append("kategori_id", String(kategoriId));
      if (alamatText) {
        formData.append("alamat", alamatText);
      }
      if (image) {
        const filename = image.uri.split("/").pop() || "photo.jpg";
        const ext = filename.split(".").pop();
        formData.append("foto", {
          uri: Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri,
          name: filename,
          type: `image/${ext}`,
        } as any);
      }
      if (location) {
        formData.append("latitude", location.latitude.toString());
        formData.append("longitude", location.longitude.toString());
      }
      const response = await fetch(`${API_BASE_URL}/api/laporan/update/${editId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || "Gagal update");
      Alert.alert("Sukses", "Laporan berhasil diperbarui");
      resetForm();
      setModalVisible(false);
      fetchLaporan();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, status?: string) => {
    if (status && status.toLowerCase() !== "pending") {
      Alert.alert("Tidak dapat dihapus", "Laporan yang sudah diproses tidak dapat dihapus.");
      return;
    }
    Alert.alert("Konfirmasi Hapus", "Yakin ingin menghapus laporan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/laporan/${id}`);
            fetchLaporan();
            Alert.alert("Sukses", "Laporan berhasil dihapus");
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.msg || "Gagal hapus");
          }
        },
      },
    ]);
  };

  const goToDetailLaporan = (id: number) => {
    router.push(`/detail-laporan/${id}`);
  };

  const handleFilter = (status: string) => {
    setFilterStatus((prev) => (prev === status ? "all" : status));
  };

  const renderLaporanItem = ({ item }: { item: Laporan }) => {
    const statusStyle = getStatusStyle(item.status);
    const isPending = item.status?.toLowerCase() === "pending";
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={() => goToDetailLaporan(item.id)} style={styles.modernCard}>
        <View style={styles.modernHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modernTitle} numberOfLines={1}>{item.judul}</Text>
            <View style={styles.modernCategory}>
              <Ionicons name="folder-open-outline" size={14} color="#991B1B" />
              <Text style={styles.modernCategoryText}>{item.kategori || "Umum"}</Text>
            </View>
          </View>
          <View style={[styles.modernStatus, { backgroundColor: statusStyle.bg }]}>
            <View style={{ width: 7, height: 7, borderRadius: 20, backgroundColor: statusStyle.text }} />
            <Text style={[styles.modernStatusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>
        {item.foto && <Image source={{ uri: `${API_BASE_URL}/uploads/${item.foto}` }} style={styles.modernImage} resizeMode="cover" />}
        <Text style={styles.modernDesc} numberOfLines={3}>{item.deskripsi}</Text>
        {item.alamat && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#64748B" />
            <Text style={{ fontSize: 13, color: "#64748B", flex: 1 }} numberOfLines={2}>{item.alamat}</Text>
          </View>
        )}
        <View style={styles.modernFooter}>
          <View style={styles.dateWrapper}>
            <Ionicons name="time-outline" size={14} color="#94A3B8" />
            <Text style={styles.dateText}>{new Date(item.created_at || "").toLocaleDateString("id-ID")}</Text>
          </View>
          <View style={styles.iconActions}>
            <TouchableOpacity 
              style={[styles.iconBtn, !isPending && styles.iconBtnDisabled]} 
              onPress={() => openEditModal(item)}
              disabled={!isPending}
            >
              <Ionicons name="create-outline" size={18} color={isPending ? "#2563EB" : "#CBD5E1"} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconBtn, !isPending && styles.iconBtnDisabled]} 
              onPress={() => handleDelete(item.id, item.status)}
              disabled={!isPending}
            >
              <Ionicons name="trash-outline" size={18} color={isPending ? "#DC2626" : "#CBD5E1"} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7F0000" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#7F0000", "#B22222", "#5C0000"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.newHeader}>
          {/* header sama seperti sebelumnya */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.goodMorning}>{getGreeting()} 👋</Text>
              <Text style={styles.userTitle}>{userData?.nama || "Pengguna"}</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => router.push("/profile")}>
              {userData?.foto ? <Image source={{ uri: `${API_BASE_URL}/uploads/${userData.foto}` }} style={styles.profileImage} /> : <Ionicons name="person-circle-outline" size={40} color="#fff" />}
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Cari laporan..." placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery !== "" && <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={20} color="#94A3B8" /></TouchableOpacity>}
          </View>
          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Laporkan masalah lingkungan dengan mudah</Text>
              <Text style={styles.heroSubtitle}>Pengaduan cepat, aman, langsung diproses admin</Text>
              <TouchableOpacity style={styles.heroButton} onPress={() => { resetForm(); setIsEditMode(false); setModalVisible(true); }}>
                <Text style={styles.heroButtonText}>Buat Laporan</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroIconWrapper}>
              <Image source={require("../../assets/images/yuhu.png")} style={styles.heroImage} resizeMode="contain" />
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
            <TouchableOpacity style={[styles.categoryChip, filterStatus === "all" && styles.activeChip]} onPress={() => handleFilter("all")}>
              <Ionicons name="document-text-outline" size={16} color={filterStatus === "all" ? "#8B0000" : "#fff"} />
              <Text style={[styles.categoryText, filterStatus === "all" && styles.activeChipText]}>Total {statistik.total}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.categoryChip, filterStatus === "pending" && styles.activeChip]} onPress={() => handleFilter("pending")}>
              <Ionicons name="time-outline" size={16} color={filterStatus === "pending" ? "#8B0000" : "#fff"} />
              <Text style={[styles.categoryText, filterStatus === "pending" && styles.activeChipText]}>Pending {statistik.pending}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.categoryChip, filterStatus === "diproses" && styles.activeChip]} onPress={() => handleFilter("diproses")}>
              <Ionicons name="refresh-circle-outline" size={16} color={filterStatus === "diproses" ? "#8B0000" : "#fff"} />
              <Text style={[styles.categoryText, filterStatus === "diproses" && styles.activeChipText]}>Diproses {statistik.diproses}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.categoryChip, filterStatus === "selesai" && styles.activeChip]} onPress={() => handleFilter("selesai")}>
              <Ionicons name="checkmark-done-circle-outline" size={16} color={filterStatus === "selesai" ? "#8B0000" : "#fff"} />
              <Text style={[styles.categoryText, filterStatus === "selesai" && styles.activeChipText]}>Selesai {statistik.selesai}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.categoryChip, filterStatus === "ditolak" && styles.activeChip]} onPress={() => handleFilter("ditolak")}>
              <Ionicons name="close-circle-outline" size={16} color={filterStatus === "ditolak" ? "#8B0000" : "#fff"} />
              <Text style={[styles.categoryText, filterStatus === "ditolak" && styles.activeChipText]}>Ditolak {statistik.ditolak}</Text>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>

        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setIsEditMode(false); setModalVisible(true); }}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addButtonText}>Buat Laporan Baru</Text>
        </TouchableOpacity>

        {filteredLaporan.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={70} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? `Tidak ada laporan dengan judul "${searchQuery}"` : filterStatus === "all" ? "Belum ada laporan" : `Tidak ada laporan dengan status ${filterStatus}`}
            </Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? "Coba kata kunci lain" : filterStatus === "all" ? "Silakan buat laporan pertama Anda" : "Coba filter lain atau buat laporan baru"}
            </Text>
          </View>
        ) : (
          <FlatList data={filteredLaporan} keyExtractor={(item) => item.id.toString()} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLaporan(); }} />} renderItem={renderLaporanItem} scrollEnabled={false} contentContainerStyle={styles.listContent} />
        )}
      </ScrollView>

      {/* Modal Form Tambah/Edit */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{isEditMode ? "Edit Laporan" : "Tambah Laporan"}</Text>
              <TextInput placeholder="Judul" style={styles.input} value={judul} onChangeText={setJudul} />
              <TextInput placeholder="Deskripsi" style={[styles.input, { height: 100, textAlignVertical: "top" }]} multiline value={deskripsi} onChangeText={setDeskripsi} />
              <View style={styles.pickerContainer}>
                <Picker selectedValue={kategoriId} onValueChange={(v) => setKategoriId(v)}>
                  <Picker.Item label="Pilih kategori" value="" />
                  {kategori.map((item) => <Picker.Item key={item.id} label={item.nama} value={item.id} />)}
                </Picker>
              </View>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image" size={22} color="#8B0000" />
                <Text style={styles.imageButtonText}>{image ? "Ganti Gambar" : "Pilih Gambar"}</Text>
              </TouchableOpacity>
              {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
              <TouchableOpacity onPress={getLocation} disabled={loadingLocation} style={styles.locationButton}>
                {loadingLocation ? <ActivityIndicator size="small" color="#8B0000" /> : <>
                  <Ionicons name="location-outline" size={24} color="#8B0000" />
                  <Text style={styles.locationButtonText}>{location ? "✅ Lokasi Didapat" : "📍 Ambil Lokasi"}</Text>
                </>}
              </TouchableOpacity>
              {alamatText && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>📍 {alamatText}</Text>
                </View>
              )}
              {location && !alamatText && (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>📍 Lat: {location.latitude.toFixed(5)} | Lng: {location.longitude.toFixed(5)}</Text>
                </View>
              )}
              {locationError && !location && (
                <View style={styles.locationErrorBox}>
                  <Text style={styles.locationErrorText}>⚠️ {locationError}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.submitButton} onPress={isEditMode ? handleEditLaporan : handleAddLaporan} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isEditMode ? "Perbarui" : "Kirim"}</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => { resetForm(); setModalVisible(false); }}>
                <Text style={styles.closeText}>Tutup</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  newHeader: { paddingTop: 25, paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  goodMorning: { color: "#FFDADA", fontSize: 15 },
  userTitle: { color: "#fff", fontSize: 28, fontWeight: "bold", marginTop: 2 },
  profileBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  profileImage: { width: 48, height: 48, borderRadius: 24 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 40, paddingHorizontal: 16, marginBottom: 20, marginTop: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#1E293B" },
  heroCard: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 28, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 22 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", lineHeight: 30, marginBottom: 8 },
  heroSubtitle: { color: "#FFE5E5", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  heroButton: { backgroundColor: "#fff", alignSelf: "flex-start", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 30 },
  heroButtonText: { color: "#8B0000", fontWeight: "bold" },
  heroIconWrapper: { marginLeft: 10 },
  heroImage: { width: 120, height: 120 },
  categoryContainer: { gap: 12, paddingRight: 20 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30 },
  categoryText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  activeChip: { backgroundColor: "#FFFFFF" },
  activeChipText: { color: "#8B0000" },
  addButton: { backgroundColor: "#8B0000", marginHorizontal: 20, marginVertical: 20, borderRadius: 60, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, shadowColor: "#8B0000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  emptyContainer: { alignItems: "center", paddingVertical: 50 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#aaa", marginTop: 16 },
  emptySubText: { fontSize: 14, color: "#bbb", marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" },
  modalContainer: { backgroundColor: "#fff", margin: 20, borderRadius: 28, padding: 24, maxHeight: "85%" },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#8B0000", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, padding: 14, marginBottom: 16, fontSize: 16, backgroundColor: "#F9FAFB" },
  pickerContainer: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 16, backgroundColor: "#F9FAFB" },
  imageButton: { backgroundColor: "#F1F5F9", padding: 14, borderRadius: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 12 },
  imageButtonText: { color: "#8B0000", fontWeight: "600" },
  preview: { width: "100%", height: 200, borderRadius: 18, marginTop: 12, backgroundColor: "#E2E8F0", marginBottom: 12 },
  locationButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", padding: 12, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 12, gap: 8 },
  locationButtonText: { color: "#8B0000", fontWeight: "500" },
  locationInfo: { backgroundColor: "#F0FDF4", padding: 10, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#86EFAC" },
  locationText: { fontSize: 12, color: "#166534", textAlign: "center" },
  locationErrorBox: { backgroundColor: "#FEF2F2", padding: 10, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#FCA5A5" },
  locationErrorText: { fontSize: 12, color: "#991B1B", textAlign: "center" },
  submitButton: { backgroundColor: "#8B0000", padding: 16, borderRadius: 60, marginTop: 8, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeButton: { backgroundColor: "#CBD5E1", padding: 14, borderRadius: 60, marginTop: 12, alignItems: "center" },
  closeText: { color: "#1E293B", fontWeight: "600" },
  modernCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 16, marginBottom: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  modernHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  modernTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
  modernCategory: { flexDirection: "row", alignItems: "center", gap: 5 },
  modernCategoryText: { color: "#991B1B", fontWeight: "600", fontSize: 13 },
  modernStatus: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 30 },
  modernStatusText: { fontSize: 12, fontWeight: "700" },
  modernImage: { width: "100%", height: 180, borderRadius: 18, marginBottom: 14 },
  modernDesc: { color: "#475569", fontSize: 14, lineHeight: 24 },
  modernFooter: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateWrapper: { flexDirection: "row", alignItems: "center", gap: 5 },
  dateText: { color: "#94A3B8", fontSize: 12 },
  iconActions: { flexDirection: "row", gap: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  iconBtnDisabled: { opacity: 0.5, backgroundColor: "#F1F5F9" },
});