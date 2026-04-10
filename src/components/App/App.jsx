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
import Privacy from "../Privacy/Privacy";
import TermsOfService from "../TermsOfService/TermsOfService";
import NotFound from "../NotFound/NotFound";
import ErrorPage from "../ErrorPage/ErrorPage";

// define API options and create APIs for Authentication and Group management
const baseUrl = import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001";
const apiOptions = {
  baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
};
import AuthAPI from "../../utils/AuthAPI.js";
const authAPI = new AuthAPI(apiOptions);
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
    if (!isCheckingAuth) setActiveModal("user-login");
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
  function handleSignupComplete(data) {
    handleLoginSubmit({ username: data.username, password: data.password });
  }

  // User Login
  // data is the form data, afterSubmit is called when done to clean up in LoginModal
  // and onError is called if there is an error such as invalid username/password or server error
  async function handleLoginSubmit(data, onError) {
    await authAPI
      .loginUser(data)
      .then(async (data) => {
        // User logged in successfully, set token and close modal
        localStorage.setItem(TOKEN_KEY, data.token);
        authAPI.setUserToken(data.token);
        groupAPI.setUserToken(data.token);
        // set current user data and set isLoggedIn state

        await getCurrentUserData(handleCloseModal);
      })
      .catch(onError);
  }

  // User logout
  function handleUserLogout() {
    setCurrentUser(emptyUserInfo);
    setIsLoggedIn(false);
    authAPI.setUserToken("");
    groupAPI.setUserToken("");
    localStorage.clear();
  }

  // Edit User Profile: update current user for Context
  function handleEditProfileSuccess(user) {
    setCurrentUser((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }));
    handleCloseModal();
  }

  // Get Current user data from API and validate before setting state and context variables
  async function getCurrentUserData(onFinish) {
    await authAPI
      .getCurrentUser()
      .then((user) => {
        if (!user || !user._id) {
          localStorage.clear();
          authAPI.setUserToken("");
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
        if (typeof onFinish === "function") onFinish();
        setIsCheckingAuth(false);
      });
  }

  /* Global fetch error handler
  Since every page has at least one db call, this handles fetch connection errors cleanly to update
  state and show a clean error page instead of breaking the site design
  (If the initial requests succeed but a request further into the page fail, they may be handled individually by their components)
   */
  function handleFetchError(err) {
    if (err.statusCode && err.statusCode === 404) {
      setHas404Error(true);
    } else {
      setHasFetchError(true);
    }
    console.error(err);
  }

  function getPrettierErrorMessage(err) {
    const msg = err?.message || err.toString();
    if (msg === "Failed to fetch") {
      return "There was an error contacting the database. Please try again.";
    } else if (err.validation) {
      return err.validation.body.message;
    }
    return msg;
  }

  /*
    handleReceiveOAuthCallback
    Handle the response from Google OAuth integration
    Sends code to back end for verification and then filters that down to the UI
  */
  function handleReceiveOAuthCallback(response, scope, onComplete) {
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
        authAPI
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
  }

  /*
    handleConfirmRevokeOAuth
    Tells the back-end to revoke Google Account access
  */
  function handleConfirmRevokeOAuth(onError) {
    authAPI
      .revokeOAuthAccess()
      .then((response) => {
        handleCloseModal();
        getCurrentUserData(); // update user data, which should filter down to update the display
      })
      .catch(onError);
  }

  // runs on mount
  useEffect(() => {
    // Check local storage for user token
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      authAPI.setUserToken(token);
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
        authAPI,
        groupAPI,
        getPrettierErrorMessage,
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
              <Routes>
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile
                        onEditProfile={handleEditProfileSuccess}
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
                      <Signup onSignup={handleSignupComplete} />
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

                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<TermsOfService />} />

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
