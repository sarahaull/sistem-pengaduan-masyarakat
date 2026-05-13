import express from "express";
import auth from "../middleware/auth.js";

import {
  createChat,
  getChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/:id", auth, getChat);
router.post("/", auth, createChat);

export default router;