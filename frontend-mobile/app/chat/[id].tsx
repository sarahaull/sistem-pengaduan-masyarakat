import React, { useState, useRef, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import API from "../../services/api";

const { width } = Dimensions.get("window");
const API_BASE_URL = "http://10.245.149.207:5000";

interface Message {
  id: number;
  message: string;
  sender: string;
  created_at: string;
}

interface LaporanDetail {
  id: number;
  judul: string;
  deskripsi: string;
  status: string;
  kategori: string;
  alamat?: string;
  foto?: string;
  created_at: string;
  nama_user?: string;
}

// Deteksi gambar
const isImageMessage = (text: string): boolean => {
  if (!text) return false;
  if (text.startsWith("data:image")) return true;
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(text) && text.startsWith("http");
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const laporanId = id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [laporanDetail, setLaporanDetail] = useState<LaporanDetail | null>(null);
  const [imageError, setImageError] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFEDED", justifyContent: "center", alignItems: "center", marginRight: 8 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#D32F2F" />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E293B" }}>Detail Laporan</Text>
            <Text style={{ fontSize: 10, color: "#64748B" }} numberOfLines={1}>
              {laporanDetail?.judul?.substring(0, 20) || "Memuat..."}
            </Text>
          </View>
        </View>
      ),
      headerBackTitle: "Kembali",
    });
  }, [navigation, laporanDetail]);

  const fetchLaporanDetail = async () => {
    if (!laporanId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get(`/laporan/${laporanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLaporanDetail(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    if (!laporanId) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await API.get(`/chat/${laporanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = response.data.map((msg: any) => ({
        id: msg.id,
        message: msg.message,
        sender: msg.sender,
        created_at: msg.created_at,
      }));
      setMessages(formatted);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !laporanId) return;
    if (laporanDetail?.status?.toLowerCase() === "selesai") {
      Alert.alert("Chat ditutup", "Tidak bisa mengirim pesan karena laporan sudah selesai.");
      return;
    }
    setSending(true);
    try {
      const token = await AsyncStorage.getItem("token");
      await API.post(
        "/chat/",
        {
          laporan_id: parseInt(laporanId),
          sender: "user",
          message: inputText.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInputText("");
      await fetchMessages();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.msg || "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!laporanId) return;
      const fetchData = async () => {
        await fetchLaporanDetail();
        await fetchMessages();
      };
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }, [laporanId])
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusConfig = (status?: string) => {
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

  // Render konten pesan dengan label "Bukti Penanganan" untuk gambar dari admin
  const renderMessageContent = (message: string, sender: string) => {
    const isImage = isImageMessage(message);
    if (!isImage) {
      return (
        <Text style={{ fontSize: 13, lineHeight: 18, color: "#1E293B" }}>
          {message}
        </Text>
      );
    }

    // Jika gambar dari admin, tampilkan badge "Bukti Penanganan"
    const isAdminImage = sender !== "user" && isImage;
    return (
      <View>
        {isAdminImage && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 4 }}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#059669" }}>Bukti Penanganan</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => setPreviewImage(message)} activeOpacity={0.9}>
          <Image
            source={{ uri: message }}
            style={{ width: 180, height: 180, borderRadius: 12, marginVertical: isAdminImage ? 2 : 4 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === "user";
    const isImage = isImageMessage(item.message);
    const isAdminImage = !isMe && isImage;

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isMe ? "flex-end" : "flex-start",
          marginVertical: 3,
          marginHorizontal: 12,
        }}
      >
        {!isMe && (
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#E9ECEF", marginRight: 6, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="person-outline" size={14} color="#6C757D" />
          </View>
        )}
        <View style={{ maxWidth: isImage ? "85%" : "75%" }}>
          <View
            style={{
              backgroundColor: isMe ? "#D32F2F" : "#F1F3F5",
              borderRadius: 16,
              paddingHorizontal: isImage ? (isAdminImage ? 8 : 0) : 12,
              paddingVertical: isImage ? (isAdminImage ? 8 : 4) : 7,
              borderBottomRightRadius: isMe ? 2 : 16,
              borderBottomLeftRadius: isMe ? 16 : 2,
              overflow: "hidden",
            }}
          >
            {renderMessageContent(item.message, item.sender)}
          </View>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 8,
              marginTop: 2,
              alignSelf: isMe ? "flex-end" : "flex-start",
              marginRight: isMe ? 4 : 0,
              marginLeft: isMe ? 0 : 4,
            }}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
        {isMe && (
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#E9ECEF", marginLeft: 6, justifyContent: "center", alignItems: "center" }}>
            <Ionicons name="person-outline" size={14} color="#6C757D" />
          </View>
        )}
      </View>
    );
  };

  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center" }}>
        <Ionicons name={icon} size={12} color="#B91C1C" />
      </View>
      <Text style={{ fontSize: 11, color: "#64748B", width: 60 }}>{label}</Text>
      <Text style={{ fontSize: 11, color: "#1E293B", flex: 1, fontWeight: "500" }} numberOfLines={2}>{value || "-"}</Text>
    </View>
  );

  if (!laporanId) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="chatbubble-outline" size={60} color="#D32F2F" />
        <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "600" }}>Laporan tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  if (loading || !laporanDetail) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(laporanDetail.status);
  const isChatActive = laporanDetail.status?.toLowerCase() === "diproses";
  const isChatClosed = laporanDetail.status?.toLowerCase() === "selesai";
  const imageUrl = !imageError && laporanDetail.foto ? `${API_BASE_URL}/uploads/${laporanDetail.foto}` : null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          ListHeaderComponent={
            <View style={{ backgroundColor: "#FFF", marginBottom: 4, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 }}>
              <LinearGradient colors={["#FFF", "#FEF2F2"]} style={{ borderRadius: 16, padding: 12 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {imageUrl ? (
                    <TouchableOpacity onPress={() => setPreviewImage(imageUrl)}>
                      <Image source={{ uri: imageUrl }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: "#F1F5F9" }} />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" }}>
                      <Ionicons name="image-outline" size={24} color="#CBD5E1" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 15, fontWeight: "bold", color: "#1E293B", flex: 1 }} numberOfLines={1}>{laporanDetail.judul}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: statusConfig.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 16, gap: 3 }}>
                        <Ionicons name={statusConfig.icon as any} size={10} color={statusConfig.text} />
                        <Text style={{ fontSize: 9, fontWeight: "700", color: statusConfig.text }}>{statusConfig.label}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 15 }} numberOfLines={2}>{laporanDetail.deskripsi}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#F0F2F5" }}>
                  <InfoRow icon="folder-outline" label="Kategori" value={laporanDetail.kategori || "Umum"} />
                  <InfoRow icon="location-outline" label="Alamat" value={laporanDetail.alamat || "Tidak ada"} />
                  <InfoRow icon="calendar-outline" label="Tanggal" value={formatDate(laporanDetail.created_at)} />
                </View>

                <View style={{ backgroundColor: "#FEF2F2", padding: 6, borderRadius: 10, marginTop: 6 }}>
                  <Text style={{ fontSize: 10, color: "#B91C1C", textAlign: "center" }}>
                    {!isChatActive && !isChatClosed && "⏳ Laporan menunggu diproses admin"}
                    {isChatActive && "💬 Pesan Anda akan dibalas petugas"}
                    {isChatClosed && "🔒 Laporan selesai. Chat ditutup"}
                  </Text>
                </View>
              </LinearGradient>

              <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
                <Text style={{ marginHorizontal: 12, fontSize: 10, color: "#94A3B8", fontWeight: "500" }}>💬 Percakapan</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#CBD5E1" />
              <Text style={{ marginTop: 8, fontSize: 12, color: "#94A3B8", textAlign: "center" }}>
                {isChatActive ? "Belum ada pesan. Kirim pesan pertama!" : "Chat akan muncul saat laporan diproses"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#E9ECEF", backgroundColor: "#FFF" }}>
            <TouchableOpacity disabled={!isChatActive} style={{ marginRight: 8 }}>
              <Ionicons name="attach-outline" size={22} color={!isChatActive ? "#CCC" : "#6C757D"} />
            </TouchableOpacity>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: !isChatActive ? "#F8F9FA" : "#F1F3F5",
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
                fontSize: 13,
                maxHeight: 80,
              }}
              placeholder={!isChatActive ? (isChatClosed ? "Chat ditutup" : "Chat belum tersedia") : "Tulis pesan..."}
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={isChatActive}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={sending || !inputText.trim() || !isChatActive}
              style={{
                backgroundColor: isChatActive && inputText.trim() ? "#D32F2F" : "#E9ECEF",
                borderRadius: 24,
                padding: 7,
                marginLeft: 8,
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send-outline" size={20} color={isChatActive && inputText.trim() ? "#FFF" : "#94A3B8"} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {previewImage && (
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}
            activeOpacity={1}
            onPress={() => setPreviewImage(null)}
          >
            <Image source={{ uri: previewImage }} style={{ width: width - 40, height: width - 40, borderRadius: 12 }} resizeMode="contain" />
            <TouchableOpacity style={{ position: "absolute", top: 40, right: 20 }} onPress={() => setPreviewImage(null)}>
              <Ionicons name="close-circle" size={32} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}