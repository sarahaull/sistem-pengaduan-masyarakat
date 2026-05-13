import Chat from "../models/chat.js";

export const getChat = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Chat.getByLaporanId(id);

    res.json(data || []);
  } catch (err) {
    console.log(err);
    res.status(500).json([]);
  }
};

export const createChat = async (req, res) => {
  try {
    const { laporan_id, sender, message } = req.body;

    if (!laporan_id || !sender || !message) {
      return res.status(400).json({
        msg: "Data tidak lengkap",
      });
    }

    const user_id = req.user.id;

    const chat = await Chat.create(
      laporan_id,
      user_id,
      sender,
      message
    );

    res.json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};