import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.10:5000/api",
  timeout: 10000,
});


const BASE_URL = "http://192.168.1.10:5000/api"; 
// ⚠️ GANTI IP sesuai laptop kamu (bukan localhost)

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

export const getMe = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};
export default API;