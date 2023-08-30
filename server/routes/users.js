import express from "express";
import {
  getUser,
  getUserFriends,
  sendFriendRequest,
 // addRemoveFriend,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
//router.patch("/:id/:friendId", verifyToken, addRemoveFriend);
router.post("/:id/friend-request/:friendId", sendFriendRequest);



export default router;
