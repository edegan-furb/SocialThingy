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

// Enviar um pedido de amizade para outro usuário
export const sendFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Verificar se o remetente e o destinatário são o mesmo usuário
    if (id === friendId) {
      return res
        .status(400)
        .json({ message: "You can't send a friend request to yourself" });
    }

    // Verificar se o pedido de amizade já foi enviado
    if (user.friendRequests.includes(friend._id)) {
      return res
        .status(400)
        .json({ message: "Friend request already sent to this user" });
    }

    // Atualizar arrays de pedidos de amizade do remetente e do destinatário
    user.friendRequests.push(friend._id);
    friend.pendingFriendRequests.push(user._id); 
    
    //Criar uma notificação para o pedido de amizade
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

// Aceitar um pedido de amizade de outro usuário
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const user = await User.findById(id);
    const requester = await User.findById(requestId);

    // Verificar se o pedido de amizade existe na lista de usuário
    if (!user.friendRequests.includes(requester._id)) {
      return res.status(400).json({
        message: "You have not received a friend request from this user",
      });
    }

    // Remover pedido de amizade da lista do remetente e adicionar como amigo
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requester._id.toString()
    );
    user.friends.push(requester._id);
    requester.friends.push(user._id);

    // Criar notificação para pedido de amizade aceito
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

// Recusar um pedido de amizade de outro usuário
export const declineFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // Remover pedido de amizade recusado da lista de pedidos do destinatário
    friend.pendingFriendRequests = friend.pendingFriendRequests.filter(
      (requestId) => requestId.toString() !== user._id.toString()
    );
    await friend.save();

    // Remover pedido de amizade recusado da lista de pedidos do remetente
    user.friendRequests = user.friendRequests.filter(
      (requestId) => requestId.toString() !== friend._id.toString()
    );
    await user.save();

    // Criar notificação para o pedido de amizade recusado
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
