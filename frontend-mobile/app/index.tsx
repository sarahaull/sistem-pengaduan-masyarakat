import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const heroTranslate = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const stats = [
    { value: "12K+", label: "Laporan" },
    { value: "9K+", label: "Selesai" },
    { value: "95%", label: "Kepuasan" },
    { value: "24/7", label: "Monitoring" },
  ];

  const features = [
    {
      icon: "camera",
      title: "Upload Bukti",
      desc: "Lampirkan foto kondisi lapangan.",
    },
    {
      icon: "location",
      title: "Lokasi Otomatis",
      desc: "Lokasi pengaduan lebih akurat.",
    },
    {
      icon: "notifications",
      title: "Realtime",
      desc: "Notifikasi setiap perkembangan.",
    },
    {
      icon: "chatbubble",
      title: "Komunikasi",
      desc: "Diskusi langsung dengan petugas.",
    },
    {
      icon: "analytics",
      title: "Tracking",
      desc: "Pantau progres laporan.",
    },
    {
      icon: "shield-checkmark",
      title: "Transparan",
      desc: "Data aman dan terpercaya.",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* HERO */}
        <Animated.View
          style={{
            transform: [{ translateY: heroTranslate }],
          }}
        >
          <ImageBackground
            source={require("../assets/images/wpp.jpg")}
            style={styles.hero}
          >
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.6)",
                "rgba(127,0,0,0.65)",
                "rgba(0,0,0,0.85)",
              ]}
              style={styles.overlay}
            />

            <Animated.View
              style={[
                styles.heroContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.badge}>
                Sistem Pengaduan Masyarakat
              </Text>

              <Text style={styles.heroTitle}>
                Suara Anda,
                {"\n"}
                Perubahan Dimulai
                {"\n"}
                Dari Sini.
              </Text>

              <Text style={styles.heroSubtitle}>
                Laporkan jalan rusak, sampah,
                banjir, lampu mati dan berbagai
                masalah lingkungan dengan cepat.
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => router.push("/(auth)/register")}
                >
                  <Text style={styles.primaryBtnText}>
                    Buat Laporan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text style={styles.secondaryBtnText}>
                    Masuk
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.floatingCard,
                {
                  transform: [{ translateY: floatAnim }],
                },
              ]}
            >
              <BlurView intensity={25} style={styles.glass}>
                <Ionicons
                  name="megaphone"
                  size={34}
                  color="#fff"
                />
                <Text style={styles.floatTitle}>
                  Laporan Cepat
                </Text>
              </BlurView>
            </Animated.View>
          </ImageBackground>
        </Animated.View>

        {/* STATISTIK */}
        <View style={styles.statsContainer}>
          {stats.map((item, index) => (
            <BlurView
              intensity={30}
              key={index}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>
                {item.value}
              </Text>
              <Text style={styles.statLabel}>
                {item.label}
              </Text>
            </BlurView>
          ))}
        </View>

        {/* FITUR */}
        <View style={styles.section}>
          <Text style={styles.sectionTag}>
            FITUR UNGGULAN
          </Text>

          <Text style={styles.sectionTitle}>
            Semua yang dibutuhkan warga
            untuk membuat pengaduan.
          </Text>

          <View style={styles.featureGrid}>
            {features.map((item, index) => (
              <BlurView
                key={index}
                intensity={25}
                style={styles.featureCard}
              >
                <Ionicons
                  name={item.icon as any}
                  size={30}
                  color="#8B0000"
                />

                <Text style={styles.featureTitle}>
                  {item.title}
                </Text>

                <Text style={styles.featureDesc}>
                  {item.desc}
                </Text>
              </BlurView>
            ))}
          </View>
        </View>

        {/* CTA */}
        <LinearGradient
          colors={["#7F0000", "#B22222"]}
          style={styles.cta}
        >
          <Text style={styles.ctaTitle}>
            Siap Membuat Lingkungan
            Lebih Baik?
          </Text>

          <Text style={styles.ctaSubtitle}>
            Bergabung bersama ribuan warga
            yang aktif melaporkan masalah.
          </Text>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() =>
              router.push("/(auth)/register")
            }
          >
            <Text style={styles.ctaBtnText}>
              Mulai Sekarang
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F7",
  },

  hero: {
    height: height * 0.9,
    justifyContent: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  heroContent: {
    paddingHorizontal: 30,
    marginTop: 80,
  },

  badge: {
    backgroundColor: "#FFDADA",
    color: "#8B0000",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 40,
    fontWeight: "700",
  },

  heroTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: "#fff",
    marginTop: 20,
    lineHeight: 58,
  },

  heroSubtitle: {
    color: "#fff",
    fontSize: 17,
    marginTop: 20,
    lineHeight: 28,
    width: "90%",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 30,
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 40,
  },

  primaryBtnText: {
    color: "#8B0000",
    fontWeight: "700",
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 40,
  },

  secondaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  floatingCard: {
    position: "absolute",
    right: 20,
    bottom: 80,
  },

  glass: {
    width: 130,
    height: 130,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  floatTitle: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "700",
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 20,
    marginTop: -40,
  },

  statCard: {
    width: "48%",
    padding: 25,
    borderRadius: 25,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.8)",
  },

  statValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#8B0000",
  },

  statLabel: {
    color: "#666",
    marginTop: 5,
  },

  section: {
    padding: 25,
  },

  sectionTag: {
    color: "#8B0000",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 25,
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  featureCard: {
    width: "48%",
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    overflow: "hidden",
  },

  featureTitle: {
    marginTop: 12,
    fontWeight: "700",
    fontSize: 16,
  },

  featureDesc: {
    marginTop: 8,
    color: "#666",
    lineHeight: 20,
  },

  cta: {
    margin: 20,
    padding: 30,
    borderRadius: 30,
    alignItems: "center",
  },

  ctaTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  ctaSubtitle: {
    color: "#FFE4E4",
    marginTop: 10,
    textAlign: "center",
  },

  ctaBtn: {
    backgroundColor: "#fff",
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 40,
  },

  ctaBtnText: {
    color: "#8B0000",
    fontWeight: "700",
  },
});