export async function fetchWithAuth(endpoint, token) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("API Error " + res.status);
  }

  return res.json();
}



