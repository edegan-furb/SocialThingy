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

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (id === friendId) {
      return res
        .status(404)
        .json({ message: "You can't add yourself as a friend" });
    }
    const friendIndex = user.friends.indexOf(friendId);
    if (friendIndex !== -1) {
      user.friends.splice(friendIndex, 1);

      const notificationContent = `${friend.firstName} ${friend.lastName} is no longer your friend.`;
      const newNotification = new Notification({
        userId: id,
        type: "friend_removed",
        content: notificationContent,
      });
      await newNotification.save();
      user.notifications.push(newNotification._id);
    } else {
      user.friends.push(friendId);

      const notificationContent = `You are now friends with ${friend.firstName} ${friend.lastName}.`;
      const newNotification = new Notification({
        userId: id,
        type: "friend_added",
        content: notificationContent,
      });
      await newNotification.save();
      user.notifications.push(newNotification._id);
    }

    await user.save();

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
    res.status(500).json({ message: "An error occurred." });
  }
};
