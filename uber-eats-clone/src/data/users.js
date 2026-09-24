/**
 * Mock user "database". In a real app this never ships to the client —
 * password checks happen server-side. Here it exists only so authService.js
 * has something to validate against while simulating a real API.
 */
export const USERS = [
  { id: "u1", name: "Alex Rivera", email: "alex@example.com", password: "Password1!" },
];
