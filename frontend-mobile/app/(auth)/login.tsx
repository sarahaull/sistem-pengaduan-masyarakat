import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // 🧠 validasi sederhana
    if (!email || !password) {
      Alert.alert("Error", "Email dan password wajib diisi");
      return;
    }

    // 🔥 nanti ini diganti API backend
    console.log("LOGIN DATA:", { email, password });

    Alert.alert("Login berhasil");

    // 🚀 redirect ke dashboard (di luar tabs)
    router.replace("/dashboard");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Login
      </Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      {/* PASSWORD */}
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          marginBottom: 20,
          padding: 10,
          borderRadius: 8,
        }}
      />

      {/* BUTTON LOGIN */}
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "black",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}