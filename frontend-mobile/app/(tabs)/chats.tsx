// // app/(user)/chats.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API from '../../services/api';

// interface UserChatItem {
//   id: number;               // id laporan
//   judul: string;            // judul laporan
//   last_message: string;     // pesan terakhir
//   created_at: string;       // waktu terakhir update
//   status: string;           // pending, diproses, selesai, ditolak
// }

// export default function UserChatListScreen() {
//   const [chats, setChats] = useState<UserChatItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchChats = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       // Endpoint untuk mengambil daftar laporan user beserta pesan terakhir
//       const response = await API.get('/user/chats', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setChats(response.data);
//     } catch (error) {
//       console.error('Gagal memuat daftar chat user:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchChats();
//   }, []);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchChats();
//   };

//   const formatTime = (dateStr: string) => {
//     const date = new Date(dateStr);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const getStatusBadge = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'diproses':
//         return { label: 'Diproses', color: '#10B981', bg: '#D1FAE5' };
//       case 'pending':
//         return { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' };
//       case 'selesai':
//         return { label: 'Selesai', color: '#3B82F6', bg: '#DBEAFE' };
//       case 'ditolak':
//         return { label: 'Ditolak', color: '#EF4444', bg: '#FEE2E2' };
//       default:
//         return { label: status, color: '#6B7280', bg: '#F3F4F6' };
//     }
//   };

//   const renderItem = ({ item }: { item: UserChatItem }) => {
//     const status = getStatusBadge(item.status);
//     return (
//       <TouchableOpacity
//         style={styles.chatItem}
//         activeOpacity={0.7}
//         onPress={() =>
//           router.push({
//             pathname: '/chat',
//             params: { laporanId: item.id, laporanJudul: item.judul },
//           })
//         }
//       >
//         <View style={styles.avatarContainer}>
//           <View style={styles.avatar}>
//             <Ionicons name="document-text-outline" size={24} color="#FFF" />
//           </View>
//         </View>
//         <View style={styles.contentContainer}>
//           <View style={styles.headerRow}>
//             <Text style={styles.reportTitle} numberOfLines={1}>
//               {item.judul}
//             </Text>
//             <Text style={styles.time}>{formatTime(item.created_at)}</Text>
//           </View>
//           <View style={styles.messageRow}>
//             <Text style={styles.lastMessage} numberOfLines={1}>
//               {item.last_message || 'Belum ada pesan'}
//             </Text>
//             <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
//               <Text style={[styles.statusText, { color: status.color }]}>
//                 {status.label}
//               </Text>
//             </View>
//           </View>
//         </View>
//         <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <ActivityIndicator size="large" color="#D32F2F" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Chat Saya</Text>
//         <Text style={styles.headerSubtitle}>Daftar pengaduan Anda</Text>
//       </View>

//       {chats.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="chatbubble-ellipses-outline" size={60} color="#CBD5E1" />
//           <Text style={styles.emptyText}>Belum ada percakapan</Text>
//           <Text style={styles.emptySubtext}>
//             Kirim laporan terlebih dahulu untuk memulai chat
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={chats}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//         />
//       )}

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>
//           Klik salah satu laporan untuk membuka percakapan
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E9ECEF',
//     backgroundColor: '#FFF',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1A1A1A',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6C757D',
//     marginTop: 4,
//   },
//   listContent: {
//     paddingBottom: 80,
//   },
//   chatItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   avatarContainer: {
//     marginRight: 12,
//   },
  
// avatar: {
//   width: 50,
//   height: 50,
//   borderRadius: 25,
//   backgroundColor: '#D32F2F', // MERAH
//   justifyContent: 'center',
//   alignItems: 'center',
// },
// contentContainer: {
//   flex: 1,
//   backgroundColor: '#FFF5F5', // merah muda pucat
//   borderRadius: 12,
//   padding: 8,
// },
//   reportTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1A1A1A',
//     flex: 1,
//   },
//   time: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     marginLeft: 8,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'baseline',
//     marginBottom: 4,
//   },
//   messageRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   lastMessage: {
//     fontSize: 14,
//     color: '#6C757D',
//     flex: 1,
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     marginLeft: 8,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyText: {
//     marginTop: 16,
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#4B5563',
//   },
//   emptySubtext: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#9CA3AF',
//     textAlign: 'center',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#FFF',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#E9ECEF',
//     alignItems: 'center',
//   },
//   footerText: {
//     fontSize: 12,
//     color: '#9CA3AF',
//   },
// });