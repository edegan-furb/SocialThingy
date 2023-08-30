import * as userRepository from "../repositories/userRepository.js";
import * as notificationRepository from "../repositories/notificationRepository.js";

// Obter o usuário por ID do repository.
export const getUserById = async (id) => {
  try {
    const user = await userRepository.findById(id);
    return user;
  } catch (err) {
    throw new Error(`Error while fetching user: ${err.message}`);
  }
};

// Recuperar lista de amigos de um usuário com informações detalhadas.
export const getUserFriends = async (userId) => {
  try {
    // Buscar dados do usuário no repository.
    const user = await userRepository.findById(userId);

    // Obter informações detalhadas de amigos usando Promises.
    const friends = await Promise.all(
      user.friends.map((friendId) => userRepository.findById(friendId))
    );
    // Formatar e retornar a lista de amigos.
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    return formattedFriends;
  } catch (err) {
    throw new Error(`Error while fetching user friends: ${err.message}`);
  }
};

// Enviar uma solicitação de amizade para outro usuário.
export const sendFriendRequest = async (userId, friendId) => {
  try {
    // Buscar usuário e amigo do repository.
    const user = await userRepository.findById(userId);
    const friend = await userRepository.findById(friendId);

    // Verificar se o remetente e o destinatário não são o mesmo usuário.
    if (userId === friendId) {
      throw new Error("You can't send a friend request to yourself");
    }
    // Verificar se o pedido de amizade já foi enviado
    if (user.friendRequests.includes(friend._id)) {
      throw new Error("Friend request already sent to this user");
    }
    // Atualizar matrizes de solicitação de amizade do remetente e destinatário
    user.friendRequests.push(friend._id);
    friend.pendingFriendRequests.push(user._id);

    // Criar uma notificação para o pedido de amizade
    const notificationContent = `${user.firstName} ${user.lastName} sent you a friend request.`;
    const newNotification = await notificationRepository.createNotification({
      userId: friend._id,
      type: "friend_request",
      content: notificationContent,
    });
    friend.notifications.push(newNotification._id);

    // Salvar as alterações no repositório
    await userRepository.updateAndSave(user);
    await userRepository.updateAndSave(friend);

    return "Friend request sent successfully";
  } catch (err) {
    throw new Error(`Error while sending friend request: ${err.message}`);
  }
};

// Aceitar um pedido de amizade de outro usuário
export const acceptFriendRequest = async (userId, requestId) => {
  try {
    // Buscar usuário e solicitante do repository
    const user = await userRepository.findById(userId);
    const requester = await userRepository.findById(requestId);

    // Verificar se a solicitação de amizade existe na lista do usuário
    if (!user.friendRequests.includes(requester._id)) {
      throw new Error("You have not received a friend request from this user");
    }
    // Remover solicitação de amizade das solicitações do usuário
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requester._id.toString()
    );
    // Remover pedido de amizade da lista de amigos pendentes
    friend.pendingFriendRequests = friend.pendingFriendRequests.filter(
      (requestId) => requestId.toString() !== user._id.toString()
    );
    // Adicionar como amigo
    user.friends.push(requester._id);
    requester.friends.push(user._id);

    // Criar uma notificação para o pedido de amizade aceito
    const notificationContent = `${user.firstName} ${user.lastName} accepted your friend request.`;
    const newNotification = await notificationRepository.createNotification({
      userId: requester._id,
      type: "friend_request_accepted",
      content: notificationContent,
    });
    requester.notifications.push(newNotification._id);

    // Salvar as alterações no repository
    await userRepository.updateAndSave(user);
    await userRepository.updateAndSave(requester);

    return "Friend request accepted successfully";
  } catch (err) {
    throw new Error(`Error while accepting friend request: ${err.message}`);
  }
};

// Recusar um pedido de amizade de outro usuário
export const declineFriendRequest = async (userId, friendId) => {
  try {
    // Buscar usuário e amigo do repositório
    const user = await userRepository.findById(userId);
    const friend = await userRepository.findById(friendId);
    // Remover pedido de amizade recusado da lista de amigos pendentes
    friend.pendingFriendRequests = friend.pendingFriendRequests.filter(
      (requestId) => requestId.toString() !== user._id.toString()
    );
    await friend.save();
    // Remover solicitação de amizade recusada das solicitações do usuário
    user.friendRequests = user.friendRequests.filter(
      (requestId) => requestId.toString() !== friend._id.toString()
    );
    await user.save(); 

    // Criar uma notificação para o pedido de amizade recusado
    const notificationContent = `${user.firstName} ${user.lastName} declined your friend request.`;
    const newNotification = await notificationRepository.createNotification({
      userId: friend._id,
      type: "friend_request_declined",
      content: notificationContent,
    });

    friend.notifications.push(newNotification._id);
    await userRepository.updateAndSave(friend);

    return "Friend request declined successfully";
  } catch (err) {
    throw new Error(`Error while declining friend request: ${err.message}`);
  }
};
