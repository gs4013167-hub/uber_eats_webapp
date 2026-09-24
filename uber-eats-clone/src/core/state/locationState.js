import { Store } from "./Store.js";

const STORAGE_KEY = "ue_location";

const initialState = {
  address: "1455 Market St, San Francisco, CA",
  lat: 37.7765,
  lng: -122.4184,
};

const locationStore = new Store(initialState, STORAGE_KEY);

export const LocationState = {
  subscribe: locationStore.subscribe.bind(locationStore),
  getState: locationStore.getState.bind(locationStore),
  setAddress(address, lat, lng) {
    locationStore.setState({ address, lat, lng });
  },
};
