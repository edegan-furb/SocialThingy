import User from "../models/User.js";

// Obter usuário pelo seu ID no banco de dados.
export const findById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (err) {
    throw new Error(`Error while finding user by ID: ${err.message}`);
  }
};

// Atualizar os dados do usuário e salvar as alterações
export const updateAndSave = async (user) => {
  try {
    await user.save();
  } catch (err) {
    throw new Error(`Error while updating user: ${err.message}`);
  }
};