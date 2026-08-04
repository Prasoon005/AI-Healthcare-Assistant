import { createUser, findUserByEmail } from "../repositories/auth.repository";
import { hashPassword } from "../utils/hash";
import { RegisterInput } from "../validations/auth.validation";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await createUser(
    data.name,
    data.email,
    hashedPassword
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};