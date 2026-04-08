/*
  App.js
  Main App Controller
*/

import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router";
import "./App.css";
import { TOKEN_KEY } from "../../utils/constants.js";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import PageContext from "../../contexts/PageContext";
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

// define API options and create APIs for Authentication and Group management
const baseUrl = import.meta.env.VITE_API_BASE_URL;
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    // If there's no token, we aren't "checking" anything; we're just unauthenticated.
    return !!token;
  });
  const [hasFetchError, setHasFetchError] = useState(false);
  const [has404Error, setHas404Error] = useState(false);

  // Handler to display "log in" modal
  function handleOpenLoginModal() {
    setActiveModal("user-login");
  }
  // Handler to display "session notes" modal
  function handleOpenSessionNotesModal() {
    setActiveModal("session-notes");
  }
  // Handler to display modal for confirming delete action (sessions, revoking google account access)
  function handleOpenDeleteModal() {
    setActiveModal("delete");
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
  (If the initial requests succeed but a request further into the page fail, they may be handled individually by their components)
   */
  const handleFetchError = (err) => {
    if (err.statusCode && err.statusCode === 404) {
      setHas404Error(true);
    } else {
      setHasFetchError(true);
    }
    console.error(err);
  };

  /*
    handleReceiveOAuthCallback
    Handle the response from Google OAuth integration
    Sends code to back end for verification and then filters that down to the UI
  */
  const handleReceiveOAuthCallback = (response, scope, onComplete) => {
    const result = {
      isOk: false,
      message:
        "Unable to authorize your Google Calendar account. Please try again and ensure you allow access to all Google Calendar features.",
    };
    try {
      if (!response || !response.code || !response.scope) {
        onComplete(result); //FAIL
      } else {
        // Make sure all the scopes were approved
        const scopes = scope.split(" ");
        for (let i = 0; i < scopes.length; i++) {
          if (!response.scope.includes(scopes[i])) {
            onComplete(result); //FAIL
            return;
          }
        }
        auth
          .verifyOAuthCallback(response.code)
          .then((data) => {
            result.isOk = true;
            result.message = data.message;
            getCurrentUserData(); // update user data, which should filter down to update the display
            onComplete(result); //SUCCESS
          })
          .catch((err) => {
            console.err(err);
            result.isOk = false;
            result.message = err.message;
            onComplete(result); //FAIL
          });
      }
    } catch (err) {
      console.error(err);
      result.isOk = false;
      result.message = err.message;
      onComplete(result);
    }
  };

  /*
    handleConfirmRevokeOAuth
    Tells the back-end to revoke Google Account access
  */
  const handleConfirmRevokeOAuth = (onError) => {
    auth
      .revokeOAuthAccess()
      .then((response) => {
        handleCloseModal();
        getCurrentUserData(); // update user data, which should filter down to update the display
      })
      .catch(onError);
  };

  // runs on mount
  useEffect(() => {
    // Check local storage for user token
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      auth.setUserToken(token);
      groupAPI.setUserToken(token);
      getCurrentUserData();
    }
  }, []);

  return (
    <PageContext.Provider
      value={{
        activeModal,
        handleOpenSessionNotesModal,
        handleOpenDeleteModal,
        handleCloseModal,
        authAPI: auth,
        groupAPI,
      }}
    >
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
            ) : has404Error ? (
              <NotFound />
            ) : (
              <Routes key={location.pathname}>
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile
                        onSubmit={handleEditProfileSubmit}
                        onFetchError={handleFetchError}
                        onReceiveOAuthCallback={handleReceiveOAuthCallback}
                        onConfirmRevokeOAuth={handleConfirmRevokeOAuth}
                      />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:username"
                  element={
                    <ProtectedRoute>
                      <Profile onFetchError={handleFetchError} />
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
                      <GroupForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/group/:groupId"
                  element={<Group onFetchError={handleFetchError} />}
                />

                <Route
                  path="/"
                  element={<Main onFetchError={handleFetchError} />}
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
    </PageContext.Provider>
  );
}
export default App;
