import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import API from "../../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token) {
        Alert.alert("Login gagal", "Token tidak ditemukan");
        return;
      }

      await AsyncStorage.setItem("token", token);

      if (user) {
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      Alert.alert("Berhasil", "Login berhasil");

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log(error?.response?.data);

      Alert.alert(
        "Login gagal",
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#6B0000", "#8B1A1A", "#A52A2A"]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6B0000"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.content}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={30}
                color="#FFF"
              />
            </TouchableOpacity>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim,
                  },
                ],
              }}
            >
              <View style={styles.header}>
                <View style={styles.logoCircle}>
                  <Ionicons
                    name="people"
                    size={40}
                    color="#FFF"
                  />
                </View>

                <Text style={styles.title}>
                  Selamat Datang
                </Text>

                <Text style={styles.subtitle}>
                  Masuk ke akun Anda
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#A52A2A"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#AAA"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#A52A2A"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#AAA"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={20}
                      color="#A52A2A"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Info",
                      "Hubungi admin untuk reset password"
                    )
                  }
                >
                  <Text style={styles.forgotText}>
                    Lupa password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.loginBtnText}>
                      Masuk
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>
                    Belum punya akun?
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      router.push("/register")
                    }
                  >
                    <Text style={styles.registerLink}>
                      Daftar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFF",
  },

  subtitle: {
    color: "#FFDCDC",
    marginTop: 8,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 24,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
  },

  forgotText: {
    textAlign: "right",
    color: "#A52A2A",
    marginTop: 4,
  },

  loginBtn: {
    backgroundColor: "#A52A2A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },

  loginBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  registerText: {
    color: "#666",
  },

  registerLink: {
    color: "#A52A2A",
    fontWeight: "bold",
    marginLeft: 4,
  },
});