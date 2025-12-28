// controllers/chats.js
const Chat = require("../models/chat");
const Listing = require("../models/listing");

/* ============================================================
   0️⃣ INBOX — All chats for current user (host or guest)
   URL: GET /chat/inbox
============================================================ */
module.exports.listUserChats = async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({
    $or: [{ guest: userId }, { host: userId }]
  })
    .populate({
      path: "listing",
      populate: { path: "owner" }
    })
    .populate("guest")
    .populate("host")
    .sort({ updatedAt: -1 });

  return res.render("chat/inbox", {
    chats,
    currentUserId: userId
  });
};

/* ============================================================
   1️⃣ OPEN or CREATE Inquiry Chat (guest → host)
   URL: GET /chat/:listingId
   Used when GUEST clicks “Ask Host a Question”
============================================================ */
module.exports.openInquiryChat = async (req, res) => {
  const listingId = req.params.listingId;

  const listing = await Listing.findById(listingId).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const currentUserId = req.user._id;
  const hostId = listing.owner._id;

  // 🔹 We still treat this as: "chat between host & *this* user"
  let chat = await Chat.findOne({
    listing: listingId,
    guest: currentUserId
  })
    .populate("messages.sender")
    .populate("guest")
    .populate("host");

  // 🔹 Create if not exists
  if (!chat) {
    chat = new Chat({
      listing: listingId,
      guest: currentUserId,
      host: hostId,
      unreadForHost: 0,
      unreadForGuest: 0
    });
    await chat.save();
    await chat.populate("guest");
    await chat.populate("host");
  }

  // 🔹 Reset unread for whoever is opening now
  if (currentUserId.toString() === chat.host._id.toString()) {
    // Host opened via listing (rare but safe)
    chat.unreadForHost = 0;
  } else {
    // Normal case: guest opened from listing
    chat.unreadForGuest = 0;
  }
  await chat.save();

  return res.render("chat/chatRoom", {
    chat,
    listing,
    currentUserId,
    mode: "inquiry"
  });
};

/* ============================================================
   2️⃣ SEND MESSAGE — Inquiry (guest usually)
   URL: POST /chat/:listingId/send
============================================================ */
module.exports.sendInquiryMessage = async (req, res) => {
  const listingId = req.params.listingId;
  const { message } = req.body;

  const currentUserId = req.user._id;

  let chat = await Chat.findOne({
    listing: listingId,
    guest: currentUserId
  });

  // 🔹 Create chat if it doesn't exist
  if (!chat) {
    const listing = await Listing.findById(listingId).populate("owner");
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    chat = new Chat({
      listing: listingId,
      guest: currentUserId,
      host: listing.owner._id,
      unreadForHost: 0,
      unreadForGuest: 0
    });
  }

  // 🔹 Add message
  chat.messages.push({
    sender: currentUserId,
    text: message,
    timestamp: new Date()
  });

  // 🔹 Notification logic:
  // if current user is guest → notify host
  // if somehow host used this route → notify guest
  if (currentUserId.toString() === chat.host.toString()) {
    chat.unreadForGuest = (chat.unreadForGuest || 0) + 1;
  } else {
    chat.unreadForHost = (chat.unreadForHost || 0) + 1;
  }

  await chat.save();

  // ✅ Always go to THREAD view after sending
  return res.redirect(`/chat/thread/${chat._id}`);
};

/* ============================================================
   3️⃣ OPEN Chat Thread (host or guest)
   URL: GET /chat/thread/:chatId
============================================================ */
module.exports.openChatThread = async (req, res) => {
  const chatId = req.params.chatId;

  const chat = await Chat.findById(chatId)
    .populate({
      path: "listing",
      populate: { path: "owner" }
    })
    .populate("guest")
    .populate("host")
    .populate("messages.sender");

  if (!chat) {
    req.flash("error", "Chat not found");
    return res.redirect("/chat/inbox");
  }

  const currentUserId = req.user._id.toString();

  // 🔹 Reset unread for whoever opened
  if (currentUserId === chat.host._id.toString()) {
    chat.unreadForHost = 0;
  } else if (currentUserId === chat.guest._id.toString()) {
    chat.unreadForGuest = 0;
  }
  await chat.save();

  return res.render("chat/chatRoom", {
    chat,
    listing: chat.listing || null, // safe if listing deleted
    currentUserId: req.user._id,
    mode: "thread"
  });
};

/* ============================================================
   4️⃣ SEND MESSAGE inside thread (host or guest)
   URL: POST /chat/thread/:chatId/send
============================================================ */
module.exports.sendThreadMessage = async (req, res) => {
  const chatId = req.params.chatId;
  const { message } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    req.flash("error", "Chat not found");
    return res.redirect("/chat/inbox");
  }

  const currentUserId = req.user._id.toString();
  const hostId = chat.host.toString();
  const guestId = chat.guest.toString();

  // 🔹 Add message
  chat.messages.push({
    sender: req.user._id,
    text: message,
    timestamp: new Date()
  });

  // 🔹 Notify opposite side
  if (currentUserId === hostId) {
    chat.unreadForGuest = (chat.unreadForGuest || 0) + 1;
  } else if (currentUserId === guestId) {
    chat.unreadForHost = (chat.unreadForHost || 0) + 1;
  }

  await chat.save();

  // ✅ Stay in thread
  return res.redirect(`/chat/thread/${chatId}`);
};
