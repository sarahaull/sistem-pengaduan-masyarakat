import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { router } from "expo-router";

interface LaporanCardProps {
  item: {
    id: number | string;
    judul: string;
    deskripsi: string;
  };
}

export default function LaporanCard({
  item,
}: LaporanCardProps) {
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/detail-laporan/[id]",
          params: {
            id: String(item.id),
          },
        })
      }
      style={{
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 5,
        }}
      >
        {item.judul}
      </Text>

      <Text>
        {item.deskripsi}
      </Text>
    </TouchableOpacity>
  );
}