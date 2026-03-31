/*
  App.js
  Main App Controller
*/

import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import "./App.css";
import { TOKEN_KEY } from "../../utils/constants.js";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import Header from "../Header/Header";
import Main from "../Main/Main";
import Footer from "../Footer/Footer";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import Login from "../Login/Login";
import LoginModal from "../LoginModal/LoginModal";
import Signup from "../Signup/Signup.jsx";
import Profile from "../Profile/Profile";
import Group from "../Group/Group";
import GroupForm from "../GroupForm/GroupForm";
import NotFound from "../NotFound/NotFound";
import ErrorPage from "../ErrorPage/ErrorPage";

/*import RegisterModal from "../RegisterModal/RegisterModal";
 */

const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.rolltogether.online"
    : "http://localhost:3001";
const apiOptions = {
  baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
};

import AuthAPI from "../../utils/AuthAPI.js";
const auth = new AuthAPI(apiOptions);
import GroupAPI from "../../utils/GroupAPI.js";
const groupAPI = new GroupAPI(apiOptions);

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const emptyUserInfo = {
    _id: "",
    name: "",
    username: "",
    email: "",
    avatar: "",
  };

  const [activeModal, setActiveModal] = useState("");
  const [currentUser, setCurrentUser] = useState(emptyUserInfo);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasFetchError, setHasFetchError] = useState(false);

  // Handler to display "log in" modal
  function handleOpenLoginModal() {
    setActiveModal("user-login");
  }

  // Handler to close any active modal
  function handleCloseModal() {
    setActiveModal("");
  }

  // User Signup
  // After successful signup, we submit the login in the background
  function handleSignupSubmit(data, afterSubmit, onError) {
    auth
      .registerUser(data)
      .then(() => {
        // User registered successfully, handle login (be sure to use properties of "data" to get password)
        handleLoginSubmit(
          { username: data.username, password: data.password },
          afterSubmit,
        );
      })
      .catch(onError);
  }

  // User Login
  // data is the form data, afterSubmit is called when done to clean up in LoginModal
  // and onError is called if there is an error such as invalid username/password or server error
  function handleLoginSubmit(data, afterSubmit, onError) {
    auth
      .loginUser(data)
      .then((data) => {
        // User logged in successfully, set token and close modal
        localStorage.setItem(TOKEN_KEY, data.token);
        auth.setUserToken(data.token);
        groupAPI.setUserToken(data.token);
        // set current user data and set isLoggedIn state
        getCurrentUserData();
        handleCloseModal();
        afterSubmit();
      })
      .catch(onError);
  }

  // User logout
  function handleUserLogout() {
    setCurrentUser(emptyUserInfo);
    setIsLoggedIn(false);
    auth.setUserToken("");
    groupAPI.setUserToken("");
    localStorage.clear();
  }

  // Edit User Profile: update current user for Context
  function handleEditProfileSubmit(data, afterSubmit, onError) {
    auth
      .editUserProfile(data)
      .then((user) => {
        // User profile updated
        setCurrentUser((prev) => ({
          ...prev,
          name: user.name,
          avatar: user.avatar,
        }));
        handleCloseModal();
        afterSubmit();
      })
      .catch(onError);
  }

  // Get Current user data from API and validate before setting state and context variables
  const getCurrentUserData = () => {
    auth
      .getCurrentUser()
      .then((user) => {
        if (!user || !user._id) {
          localStorage.clear();
          auth.setUserToken("");
          groupAPI.setUserToken("");
          setCurrentUser(emptyUserInfo);
          setIsLoggedIn(false);
        } else {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }
      })
      .catch(handleFetchError)
      .finally(() => {
        setIsCheckingAuth(false);
      });
  };

  /* Global fetch error handler
  Since every page has at least one db call, this handles fetch connection errors cleanly to update
  state and show a clean error page instead of breaking the site design
  Set hasFetchError = true to override Routes handling, and log the error to the console
  (If the initial requests succeed but a request further into the page fail, they can be handled individually by their components)
   */
  const handleFetchError = (err) => {
    setHasFetchError(true);
    console.error(err);
  };

  // runs on render
  useEffect(() => {
    // Check local storage for user token
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      auth.setUserToken(token);
      groupAPI.setUserToken(token);
      getCurrentUserData();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, isLoggedIn, isCheckingAuth }}
    >
      <div className="page">
        <div className="page__content">
          <Header
            loginHandler={handleOpenLoginModal}
            logoutHandler={handleUserLogout}
          />
          {hasFetchError ? (
            <ErrorPage type="ConnectionError" />
          ) : (
            <Routes>
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile
                      authAPI={auth}
                      groupAPI={groupAPI}
                      onSubmit={handleEditProfileSubmit}
                      onFetchError={handleFetchError}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user/:username"
                element={
                  <ProtectedRoute>
                    <Profile
                      authAPI={auth}
                      groupAPI={groupAPI}
                      onFetchError={handleFetchError}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <ProtectedRoute anonymous>
                    <Login onSubmit={handleLoginSubmit} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <ProtectedRoute anonymous>
                    <Signup onSubmit={handleSignupSubmit} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addgroup"
                element={
                  <ProtectedRoute>
                    <GroupForm api={groupAPI} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/editgroup/:groupId"
                element={
                  <ProtectedRoute>
                    <GroupForm api={groupAPI} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/group/:groupId"
                element={
                  <Group api={groupAPI} onFetchError={handleFetchError} />
                }
              />

              <Route
                path="/"
                element={
                  <Main groupAPI={groupAPI} onFetchError={handleFetchError} />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
          <Footer />
        </div>
      </div>
      <LoginModal
        isOpen={activeModal === "user-login"}
        onClose={handleCloseModal}
        onSubmit={handleLoginSubmit}
        signupHandler={() => {
          handleCloseModal();
          navigate("/signup");
        }}
      ></LoginModal>
    </CurrentUserContext.Provider>
  );
}
export default App;
