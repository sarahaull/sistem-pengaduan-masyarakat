import express from "express";
import auth from "../middleware/auth.js";
import {
  sendChat,
  getChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/:id", auth, getChat);
router.post("/", auth, sendChat);

export default router;