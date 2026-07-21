import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#991B1B",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          position: "absolute",
          left: 15,
          right: 15,
          bottom: 15,

          height: 75,
          backgroundColor: "#fff",

          borderTopWidth: 0,
          borderRadius: 25,

          elevation: 15,

          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.12,
          shadowRadius: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 5,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* LAPORAN */}
      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "document-text"
                  : "document-text-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* TOMBOL PLUS */}
      <Tabs.Screen
        name="tambah-laporan"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 65,
                height: 65,
                borderRadius: 32.5,
                backgroundColor: "#991B1B",

                justifyContent: "center",
                alignItems: "center",

                marginTop: -35,

                shadowColor: "#991B1B",
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
              }}
            >
              <Ionicons
                name="add"
                size={34}
                color="#fff"
              />
            </View>
          ),
        }}
      />

      {/* CHAT (pakai chat/index.tsx) */}
      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "chatbubble"
                  : "chatbubble-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* SEMBUNYIKAN DETAIL CHAT */}
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "person"
                  : "person-outline"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}