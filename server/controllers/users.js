import User from "../models/User.js";
import Notification from "../models/Notification.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* READ */
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UDPATE */
export const sendFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (id === friendId) {
      return res
        .status(400)
        .json({ message: "You can't send a friend request to yourself" });
    }

    if (user.friendRequests.includes(friend._id)) {
      return res
        .status(400)
        .json({ message: "Friend request already sent to this user" });
    }

    user.friendRequests.push(friend._id);
    friend.pendingFriendRequests.push(user._id); // Add to recipient's array
    const notificationContent = `${user.firstName} ${user.lastName} sent you a friend request.`;
    const newNotification = new Notification({
      userId: friend._id,
      type: "friend_request",
      content: notificationContent,
    });
    await newNotification.save();
    friend.notifications.push(newNotification._id);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred." });
  }
};

/* UDPATE */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const user = await User.findById(id);
    const requester = await User.findById(requestId);

    if (!user.friendRequests.includes(requester._id)) {
      return res.status(400).json({
        message: "You have not received a friend request from this user",
      });
    }

    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requester._id.toString()
    );
    user.friends.push(requester._id);
    requester.friends.push(user._id);

    const notificationContent = `${user.firstName} ${user.lastName} accepted your friend request.`;
    const newNotification = new Notification({
      userId: requester._id,
      type: "friend_request_accepted",
      content: notificationContent,
    });
    await newNotification.save();
    requester.notifications.push(newNotification._id);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred." });
  }
};

/* DELETE */
export const declineFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Remove the declined friend request from the recipient's pending requests
    friend.pendingFriendRequests = friend.pendingFriendRequests.filter(
      (requestId) => requestId.toString() !== user._id.toString()
    );
    await friend.save();

    // Remove the declined friend request from the user's friend requests
    user.friendRequests = user.friendRequests.filter(
      (requestId) => requestId.toString() !== friend._id.toString()
    );
    await user.save();

    // Create a notification for the declined request
    const notificationContent = `${user.firstName} ${user.lastName} declined your friend request.`;
    const newNotification = new Notification({
      userId: friend._id,
      type: "friend_request_declined",
      content: notificationContent,
    });
    await newNotification.save();
    friend.notifications.push(newNotification._id);
    await friend.save();

    res.status(200).json({ message: "Friend request declined successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred." });
  }
};
/* UPDATE */
// export const addRemoveFriend = async (req, res) => {
//   try {
//     const { id, friendId } = req.params;
//     const user = await User.findById(id);
//     const friend = await User.findById(friendId);

//     if (id === friendId) {
//       return res
//         .status(404)
//         .json({ message: "You can't add yourself as a friend" });
//     }
//     const friendIndex = user.friends.indexOf(friendId);
//     if (friendIndex !== -1) {
//       user.friends.splice(friendIndex, 1);

//       const notificationContent = `${friend.firstName} ${friend.lastName} is no longer your friend.`;
//       const newNotification = new Notification({
//         userId: id,
//         type: "friend_removed",
//         content: notificationContent,
//       });
//       await newNotification.save();
//       user.notifications.push(newNotification._id);
//     } else {
//       user.friends.push(friendId);

//       const notificationContent = `You are now friends with ${friend.firstName} ${friend.lastName}.`;
//       const newNotification = new Notification({
//         userId: id,
//         type: "friend_added",
//         content: notificationContent,
//       });
//       await newNotification.save();
//       user.notifications.push(newNotification._id);
//     }

//     await user.save();

//     const friends = await Promise.all(
//       user.friends.map((id) => User.findById(id))
//     );
//     const formattedFriends = friends.map(
//       ({ _id, firstName, lastName, occupation, location, picturePath }) => {
//         return { _id, firstName, lastName, occupation, location, picturePath };
//       }
//     );

//     res.status(200).json(formattedFriends);
//   } catch (err) {
//     res.status(500).json({ message: "An error occurred." });
//   }
// };
