import * as userService from "../services/userService.js";

// Obter o perfil do usuário por ID e enviar resposta.
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Chamar o service para buscar o usuário.
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Obter lista de amigos do usuário por ID e enviar resposta.
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    // Chamar o service para buscar e formatar a lista de amigos.
    const formattedFriends = await userService.getUserFriends(id);
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Enviar uma solicitação de amizade para outro usuário e enviar uma resposta
export const sendFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    // Chamar o service para enviar o pedido de amizade
    const result = await userService.sendFriendRequest(id, friendId);
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Aceitar um pedido de amizade de outro usuário e enviaa uma resposta
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    // Chamar o service para aceitar o pedido de amizade
    const result = await userService.acceptFriendRequest(id, requestId);
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const declineFriendRequest = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    //Chame o service para recusar o pedido de amizade
    const result = await userService.declineFriendRequest(id, friendId);
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
