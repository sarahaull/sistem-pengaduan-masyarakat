import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function CommentItem({
  item,
}: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.user}>
        {item.user_name ||
          "User"}
      </Text>

      <Text style={styles.comment}>
        {item.komentar}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#f5f5f5",
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
    },

    user: {
      fontWeight: "bold",
      marginBottom: 4,
    },

    comment: {
      color: "#444",
    },
  });