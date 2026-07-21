import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import API from "../../services/api";
import * as Location from "expo-location";

interface Category {
  id: number;
  nama: string;
}

export default function TambahLaporan() {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState<Category[]>([]);
  const [kategoriId, setKategoriId] = useState<number | "">("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [alamat, setAlamat] = useState<string>(""); // ✅ state untuk alamat
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    fetchKategori();
    // Tidak otomatis ambil lokasi, biar user klik tombol
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await API.get("/categories");
      setKategori(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Fungsi untuk ambil lokasi + reverse geocode
  const requestLocationPermissionAndGet = async () => {
    setLoadingLocation(true);
    setLocationError(null);
    setAlamat("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Izin lokasi ditolak");
        Alert.alert("Izin Diperlukan", "Aktifkan izin lokasi di pengaturan.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);

      // Reverse geocode untuk mendapatkan alamat lengkap
      const reverse = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      let fullAddress = "";
      if (reverse && reverse.length > 0) {
        const addr = reverse[0];
        const parts = [
          addr.name,
          addr.street,
          addr.district,
          addr.city,
          addr.region,
          addr.postalCode,
        ].filter(Boolean);
        fullAddress = parts.length > 0 ? parts.join(", ") : `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      } else {
        fullAddress = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      }
      setAlamat(fullAddress);
      setLocationError(null);
      Alert.alert("Lokasi Terdeteksi", `Alamat: ${fullAddress}`);
    } catch (error: any) {
      console.log(error);
      let errorMsg = "Gagal mengambil lokasi";
      if (error.message?.toLowerCase().includes("unavailable")) {
        errorMsg = "Lokasi tidak tersedia. Nyalakan GPS.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      setLocationError(errorMsg);
      Alert.alert("Error Lokasi", errorMsg);
    } finally {
      setLoadingLocation(false);
    }
  };

  const getLocation = async () => {
    await requestLocationPermissionAndGet();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const submit = async () => {
    if (!judul.trim()) {
      Alert.alert("Error", "Judul laporan harus diisi");
      return;
    }
    if (!deskripsi.trim()) {
      Alert.alert("Error", "Deskripsi laporan harus diisi");
      return;
    }
    if (!kategoriId) {
      Alert.alert("Error", "Pilih kategori laporan");
      return;
    }
    if (!location) {
      Alert.alert("Perhatian", "Lokasi belum diambil. Silakan klik 'Ambil Lokasi'.");
      return;
    }
    if (!alamat) {
      Alert.alert("Perhatian", "Alamat tidak lengkap. Silakan ambil lokasi ulang.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("judul", judul.trim());
      formData.append("deskripsi", deskripsi.trim());
      formData.append("kategori_id", kategoriId.toString());

      // ✅ Field foto harus "foto" (bukan "file") sesuai backend
      if (image) {
        const filename = image.uri.split("/").pop() || `laporan_${Date.now()}.jpg`;
        const ext = filename.split(".").pop();
        formData.append("foto", {
          uri: Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri,
          name: filename,
          type: `image/${ext}`,
        } as any);
      }

      // ✅ Kirim latitude, longitude, dan alamat
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("alamat", alamat);

      // Debug: cek formData (opsional)
      console.log("Submitting laporan with alamat:", alamat);

      await API.post("/laporan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Sukses", "Laporan berhasil dibuat");
      // Reset form
      setJudul("");
      setDeskripsi("");
      setKategoriId("");
      setImage(null);
      setLocation(null);
      setAlamat("");
      router.back();
    } catch (error: any) {
      const errorMsg = error.response?.data?.msg || "Terjadi kesalahan, silakan coba lagi";
      Alert.alert("Gagal", errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="light-content" backgroundColor="#5C0000" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <LinearGradient
            colors={["#8B0000", "#5C0000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: 20,
              paddingBottom: 28,
              paddingHorizontal: 20,
              borderBottomLeftRadius: 28,
              borderBottomRightRadius: 28,
            }}
          >
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFF", marginBottom: 4 }}>
              Buat Laporan
            </Text>
            <Text style={{ fontSize: 14, color: "#FFE5E5" }}>Isi form di bawah untuk melaporkan keluhan</Text>
          </LinearGradient>

          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <View
              style={{
                backgroundColor: "#FFF",
                borderRadius: 28,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text style={{ fontWeight: "600", marginBottom: 6, color: "#374151", fontSize: 14 }}>Judul Laporan</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F9FAFB",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 16,
                  marginBottom: 18,
                }}
              >
                <Ionicons name="document-text-outline" size={20} color="#8B0000" />
                <TextInput
                  placeholder="Contoh: Jalan Rusak di RW 03"
                  placeholderTextColor="#9CA3AF"
                  value={judul}
                  onChangeText={setJudul}
                  style={{ flex: 1, marginLeft: 12, fontSize: 16, paddingVertical: 14, color: "#1F2937" }}
                />
              </View>

              <Text style={{ fontWeight: "600", marginBottom: 6, color: "#374151", fontSize: 14 }}>Deskripsi</Text>
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 16,
                  marginBottom: 18,
                }}
              >
                <TextInput
                  placeholder="Jelaskan secara detail..."
                  placeholderTextColor="#9CA3AF"
                  value={deskripsi}
                  onChangeText={setDeskripsi}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ fontSize: 16, paddingVertical: 14, color: "#1F2937", minHeight: 100 }}
                />
              </View>

              <Text style={{ fontWeight: "600", marginBottom: 6, color: "#374151", fontSize: 14 }}>Kategori</Text>
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  overflow: "hidden",
                  marginBottom: 18,
                }}
              >
                <Picker selectedValue={kategoriId} onValueChange={(value) => setKategoriId(value)} dropdownIconColor="#8B0000">
                  <Picker.Item label="Pilih Kategori" value="" />
                  {kategori.map((item) => (
                    <Picker.Item key={item.id} label={item.nama} value={item.id} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity
                onPress={pickImage}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F9FAFB",
                  padding: 12,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  marginBottom: 18,
                  gap: 8,
                }}
              >
                <Ionicons name="image-outline" size={24} color="#8B0000" />
                <Text style={{ color: "#8B0000", fontWeight: "500" }}>{image ? "Ganti Gambar" : "Pilih Gambar"}</Text>
              </TouchableOpacity>

              {image && (
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: "100%", height: 200, borderRadius: 20, marginBottom: 20 }}
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity
                onPress={getLocation}
                disabled={loadingLocation}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F9FAFB",
                  padding: 12,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  marginBottom: 8,
                  gap: 8,
                }}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#8B0000" />
                ) : (
                  <>
                    <Ionicons name="location-outline" size={24} color="#8B0000" />
                    <Text style={{ color: "#8B0000", fontWeight: "500" }}>
                      {location ? "✅ Lokasi Didapat" : "📍 Ambil Lokasi"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {alamat !== "" && (
                <View
                  style={{
                    backgroundColor: "#F0FDF4",
                    padding: 10,
                    borderRadius: 12,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: "#86EFAC",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#166534", textAlign: "center" }}>
                    📍 {alamat}
                  </Text>
                </View>
              )}

              {locationError && !location && (
                <View
                  style={{
                    backgroundColor: "#FEF2F2",
                    padding: 10,
                    borderRadius: 12,
                    marginBottom: 18,
                    borderWidth: 1,
                    borderColor: "#FCA5A5",
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#991B1B", textAlign: "center" }}>
                    ⚠️ {locationError}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={submit}
                disabled={loading}
                style={{
                  backgroundColor: "#8B0000",
                  paddingVertical: 16,
                  borderRadius: 40,
                  alignItems: "center",
                  shadowColor: "#8B0000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>Kirim Laporan</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}