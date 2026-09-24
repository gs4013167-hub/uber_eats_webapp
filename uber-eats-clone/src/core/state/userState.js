import { Store } from "./Store.js";
import { eventBus, EVENTS } from "../../utils/eventBus.js";

const STORAGE_KEY = "ue_user";

const initialState = {
  isAuthenticated: false,
  token: null,
  profile: null, // { id, name, email }
};

const userStore = new Store(initialState, STORAGE_KEY);

export const UserState = {
  subscribe: userStore.subscribe.bind(userStore),
  getState: userStore.getState.bind(userStore),

  login(token, profile) {
    userStore.setState({ isAuthenticated: true, token, profile });
    eventBus.emit(EVENTS.AUTH_CHANGED, userStore.getState());
  },

  logout() {
    userStore.setState(initialState);
    eventBus.emit(EVENTS.AUTH_CHANGED, userStore.getState());
  },

  isAuthenticated() {
    return userStore.getState().isAuthenticated;
  },
};
