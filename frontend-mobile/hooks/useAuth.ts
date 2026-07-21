import {
  useEffect,
  useState,
} from "react";

import {
  getToken,
} from "../utils/storage";

export default function useAuth() {
  const [loading,
    setLoading] =
    useState(true);

  const [isLoggedIn,
    setIsLoggedIn] =
    useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth =
    async () => {
      const token =
        await getToken();

      setIsLoggedIn(
        !!token
      );

      setLoading(false);
    };

  return {
    loading,
    isLoggedIn,
  };
}