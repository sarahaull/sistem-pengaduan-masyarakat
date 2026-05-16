import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { registerUser } from "../../services/auth";

export default function Register({ navigation }: any) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await registerUser({ nama, email, password });

      Alert.alert("Register sukses");
      navigation.replace("login");
    } catch (err) {
      Alert.alert("Register gagal");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 80 }}>
      <Text>Register</Text>

      <TextInput placeholder="Nama" onChangeText={setNama} />
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <TouchableOpacity onPress={handleRegister}>
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
}