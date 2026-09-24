import { simulateRequest, ApiError } from "./api/apiClient.js";
import { USERS } from "../data/users.js";

function fakeToken(userId) {
  return btoa(`${userId}:${Date.now()}`);
}

export const authService = {
  async login(email, password) {
    return simulateRequest(() => {
      const user = USERS.find((u) => u.email === email);
      if (!user || user.password !== password) {
        throw new ApiError("Invalid email or password.", 401);
      }
      const { password: _omit, ...profile } = user;
      return { token: fakeToken(user.id), profile };
    });
  },

  async signup(name, email, password) {
    return simulateRequest(() => {
      if (USERS.some((u) => u.email === email)) {
        throw new ApiError("An account with this email already exists.", 409);
      }
      const newUser = { id: `u${USERS.length + 1}`, name, email, password };
      USERS.push(newUser);
      const { password: _omit, ...profile } = newUser;
      return { token: fakeToken(newUser.id), profile };
    });
  },
};
