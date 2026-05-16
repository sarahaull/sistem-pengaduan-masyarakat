import API from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// REGISTER
export const registerUser = async (data: {
  nama: string;
  email: string;
  password: string;
}) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

// LOGIN
export const loginUser = async (email: string, password: string) => {
  const res = await API.post("/auth/login", {
    email,
    password,
  });

  const token = res.data.token;

  await AsyncStorage.setItem("token", token);

  return res.data;
};

// LOGOUT
export const logoutUser = async () => {
  await AsyncStorage.removeItem("token");
};