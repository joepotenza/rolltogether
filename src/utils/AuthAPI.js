/*
  AuthAPI.js
  
*/
import APIBase from "./APIBase.js";

export default class AuthAPI extends APIBase {
  // User Signup
  registerUser({ name, avatar, username, email, password }) {
    return this._makeAPICall({
      endpoint: "/signup",
      method: "POST",
      body: JSON.stringify({ name, avatar, username, email, password }),
    });
  }

  // User Login
  loginUser({ username, password }) {
    return this._makeAPICall({
      endpoint: "/signin",
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  // Edit user profile
  editUserProfile({ name, avatar }) {
    return this._makeAPICall({
      endpoint: "/users/me",
      method: "PATCH",
      body: JSON.stringify({ name, avatar }),
      requireToken: true,
    });
  }

  // Verify User Token
  getCurrentUser() {
    return this._makeAPICall({
      endpoint: "/users/me",
      method: "GET",
      requireToken: true,
    });
  }

  // Get user's public profile
  getUserProfile({ username }) {
    return this._makeAPICall({
      endpoint: `/users/${username}`,
      method: "GET",
    });
  }
}
