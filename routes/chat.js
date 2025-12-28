const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const chatController = require("../controllers/chats");

/* ===============================
   📌 GLOBAL INBOX PAGE (both host + guest)
   MUST COME FIRST!
================================= */
router.get("/inbox", isLoggedIn, chatController.listUserChats);

/* ===============================
   1️⃣ OPEN Existing Chat by chatId
================================= */
router.get("/thread/:chatId", isLoggedIn, chatController.openChatThread);

router.post("/thread/:chatId/send", isLoggedIn, chatController.sendThreadMessage);

/* ===============================
   2️⃣ CREATE or OPEN Inquiry Chat
================================= */
router.get("/:listingId", isLoggedIn, chatController.openInquiryChat);

router.post("/:listingId/send", isLoggedIn, chatController.sendInquiryMessage);

module.exports = router;
