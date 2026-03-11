import express from "express";
import {
  getMessages,
  createMessage,
  getMessage,
  updateMessageStatus,
  deleteMessage,
} from "../controllers/contactController.js";

const router = express.Router();

router.get("/", getMessages);
router.get("/:id", getMessage);
router.post("/", createMessage);
router.put("/:id", updateMessageStatus);
router.delete("/:id", deleteMessage);

export default router;
