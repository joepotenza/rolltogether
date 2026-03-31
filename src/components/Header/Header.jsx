/*
  Header.jsx
  Site Header
*/

import { useState, useContext } from "react";
import { Link, useLocation } from "react-router";
import "./Header.css";
import logo from "../../images/logo.svg";
import menuBtn from "../../images/menu_button.png";
import closeMenuBtn from "../../images/close_icon_black.svg";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import UserAvatar from "../UserAvatar/UserAvatar";

function Header({ /*signupHandler,*/ loginHandler, logoutHandler }) {
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  const [isMobileMenuOpened, setIsMobileMenuOpened] = useState(false);
  const [isProfileMenuOpened, setIsProfileMenuOpened] = useState(false);

  const currentLocation = useLocation().pathname;

  function toggleMobileMenu() {
    setIsMobileMenuOpened(!isMobileMenuOpened);
  }
  function toggleProfileMenu(evt) {
    evt.preventDefault();
    setIsProfileMenuOpened(!isProfileMenuOpened);
  }
  /*
  function handleSignupButton(evt) {
    setIsMobileMenuOpened(false);
    signupHandler(evt);
  } */
  function handleLoginButton(evt) {
    setIsMobileMenuOpened(false);
    loginHandler(evt);
  }

  function handleProfileLink(evt) {
    setIsProfileMenuOpened(false);
  }

  function handleLogoutLink(evt) {
    evt.preventDefault();
    setIsProfileMenuOpened(false);
    logoutHandler(evt);
  }

  return (
    <header
      className={`header ${isMobileMenuOpened ? "header_menu_open" : ""}`}
    >
      <Link to="/" className="header__logo">
        <img className="logo__icon" src={logo} />
        <span className="logo__text">RollTogether</span>
      </Link>
      <div className="header__menu">
        <img
          src={closeMenuBtn}
          alt="Close Menu"
          className="header__menu-close-btn"
          onClick={toggleMobileMenu}
        />
        {isLoggedIn ? (
          <Link className="header__create-group" to="/addgroup">
            Create Group
          </Link>
        ) : (
          ""
        )}

        <div
          className={`header__user-container ${isLoggedIn ? `header__user-container_loggedIn_true` : ""}`}
        >
          {isLoggedIn ? (
            <>
              <div
                className={`header__profile-menu ${isProfileMenuOpened ? "header__profile-menu_open" : ""}`}
              >
                <Link
                  to="/profile"
                  className="profile-menu__link profile-menu__link_profile"
                  onClick={handleProfileLink}
                  reloadDocument
                >
                  Edit Profile
                </Link>
                <Link
                  to="/logout"
                  className="profile-menu__link profile-menu__link_logout"
                  onClick={handleLogoutLink}
                >
                  Logout
                </Link>
              </div>

              <Link
                to="/profile"
                className="header__user-name"
                onClick={toggleProfileMenu}
                reloadDocument
              >
                {currentUser.name}
              </Link>
              <Link
                to="/profile"
                className="header__avatar"
                onClick={toggleProfileMenu}
                reloadDocument
              >
                <UserAvatar />
              </Link>
            </>
          ) : (
            <>
              {currentLocation != "/signup" ? (
                /*<button
                  className="header__user-signup"
                  onClick={handleSignupButton}
                >
                  Sign Up
                </button>*/
                <Link to="/signup" className="header__user-signup">
                  Sign Up
                </Link>
              ) : (
                ""
              )}
              {currentLocation !== "/login" ? (
                <button
                  className="header__user-login"
                  onClick={handleLoginButton}
                >
                  Log In
                </button>
              ) : (
                /*<Link to="/login" className="header__user-login">
                  Log In
                </Link>*/
                ""
              )}
            </>
          )}
        </div>
      </div>
      <img
        src={menuBtn}
        alt="Menu"
        className="header__menu-btn"
        onClick={toggleMobileMenu}
      />
    </header>
  );
}

export default Header;
