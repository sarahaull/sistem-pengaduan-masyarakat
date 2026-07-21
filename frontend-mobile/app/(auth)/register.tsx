import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import API from "../../services/api";

export default function RegisterScreen() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (loading) return;

    if (!nama.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      const loginRes = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      await AsyncStorage.setItem("token", loginRes.data?.token);

      Alert.alert("Sukses", "Akun berhasil dibuat");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Gagal", error?.response?.data?.msg || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* BACK BUTTON */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.animatedBox,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add-outline" size={42} color="#fff" />
              </View>

              <Text style={styles.title}>Daftar Akun</Text>
              <Text style={styles.subtitle}>Buat akun untuk melanjutkan</Text>
            </View>

            {/* CARD */}
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={20} color="#8B0000" />
                <TextInput
                  placeholder="Nama Lengkap"
                  value={nama}
                  onChangeText={setNama}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color="#8B0000" />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color="#8B0000" />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#8B0000"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.btn}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Daftar</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#7A0000",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  animatedBox: {
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 8,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  iconCircle: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    color: "#FFD6D6",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 20,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    fontSize: 14,
  },

  btn: {
    backgroundColor: "#8B0000",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});