import User from "../models/User.js";
import Notification from "../models/Notification.js";

// Obter perfil de usuario
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Obter lista de amigos do usuário
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    // Buscar informações detalhadas sobre os amigos do usuário
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    // Formatar dados dos amigos para a resposta
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
        .status(400)
        .json({ message: "You can't add yourself as a friend" });
    }

    const friendIndex = user.friends.indexOf(friendId);
    if (friendIndex !== -1) {
      user.friends.splice(friendIndex, 1);

      const userNotificationContent = `${friend.firstName} ${friend.lastName} is no longer your friend.`;
      const userNotification = new Notification({
        userId: id,
        type: "friend_removed",
        content: userNotificationContent,
      });
      await userNotification.save();
      user.notifications.push(userNotification._id);

      const friendNotificationContent = `${user.firstName} ${user.lastName} removed you as a friend.`;
      const friendNotification = new Notification({
        userId: friendId,
        type: "friend_removed",
        content: friendNotificationContent,
      });
      await friendNotification.save();
      friend.notifications.push(friendNotification._id);
    } else {
      user.friends.push(friendId);

      const userNotificationContent = `You are now friends with ${friend.firstName} ${friend.lastName}.`;
      const userNotification = new Notification({
        userId: id,
        type: "friend_added",
        content: userNotificationContent,
      });
      await userNotification.save();
      user.notifications.push(userNotification._id);

      const friendNotificationContent = `${user.firstName} ${user.lastName} added you as a friend.`;
      const friendNotification = new Notification({
        userId: friendId,
        type: "friend_added",
        content: friendNotificationContent,
      });
      await friendNotification.save();
      friend.notifications.push(friendNotification._id);
    }

    await user.save();
    await friend.save();

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
