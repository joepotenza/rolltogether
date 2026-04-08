/*
  Header.jsx
  Site Header
*/

import { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router";
import "./Header.css";
import logo from "../../images/logo.svg";
import menuBtn from "../../images/menu_button.png";
import closeMenuBtn from "../../images/close_icon_black.svg";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import UserAvatar from "../UserAvatar/UserAvatar";

function Header({ loginHandler, logoutHandler }) {
  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  const [isMobileMenuOpened, setIsMobileMenuOpened] = useState(false);
  const [dropdowns, setDropDowns] = useState({
    groups: { isOpen: false },
    profile: { isOpen: false },
  });

  const currentLocation = useLocation().pathname;

  function toggleMobileMenu(forceOff = false) {
    if (forceOff) {
      setIsMobileMenuOpened(false);
    } else {
      setIsMobileMenuOpened(!isMobileMenuOpened);
    }
  }
  function toggleDropdown(menu, onOff) {
    setDropDowns((prev) => ({
      ...prev,
      [menu]: { isOpen: onOff },
    }));
  }

  function handleLoginButton(evt) {
    setIsMobileMenuOpened(false);
    loginHandler(evt);
  }

  function handleLogoutLink(evt) {
    evt.preventDefault();
    toggleMobileMenu(true);
    logoutHandler(evt);
  }

  return (
    <>
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
            <div
              className={`dropdown__container ${dropdowns.groups.isOpen ? "dropdown__container_open" : ""}`}
              onMouseEnter={() => toggleDropdown("groups", true)}
              onMouseLeave={() => toggleDropdown("groups", false)}
            >
              <button
                className="dropdown__top dropdown__top_type_groups"
                onClick={(evt) => {
                  evt.preventDefault();
                  toggleDropdown("groups", !dropdowns.groups.isOpen);
                }}
              >
                Groups
              </button>
              <div className="dropdown__menu">
                <Link
                  className="dropdown__link dropdown__link_has-icon dropdown__link_type_search"
                  to="/"
                  onClick={() => toggleMobileMenu(true)}
                >
                  Find Groups
                </Link>
                <Link
                  className="dropdown__link dropdown__link_has-icon dropdown__link_type_groups"
                  to="/profile"
                  onClick={() => toggleMobileMenu(true)}
                >
                  My Groups
                </Link>
                <Link
                  className="dropdown__link dropdown__link_has-icon dropdown__link_type_create"
                  to="/addgroup"
                  onClick={() => toggleMobileMenu(true)}
                >
                  New Group
                </Link>
              </div>
            </div>
          ) : (
            ""
          )}

          {isLoggedIn ? (
            <div
              className={`dropdown__container ${dropdowns.profile.isOpen ? "dropdown__container_open" : ""}`}
              onMouseEnter={() => toggleDropdown("profile", true)}
              onMouseLeave={() => toggleDropdown("profile", false)}
            >
              <div
                className={`header__user-container  ${isLoggedIn ? `header__user-container_loggedIn_true` : ""}`}
              >
                <Link
                  to="/profile"
                  className="header__user-name"
                  reloadDocument
                  onClick={(evt) => {
                    if (!isMobileMenuOpened) evt.preventDefault();
                    toggleDropdown("profile", !dropdowns.profile.isOpen);
                  }}
                >
                  {currentUser.username}
                </Link>
                <Link
                  to="/profile"
                  className="header__avatar"
                  reloadDocument
                  onClick={(evt) => {
                    if (!isMobileMenuOpened) evt.preventDefault();
                    toggleDropdown("profile", !dropdowns.profile.isOpen);
                  }}
                >
                  <UserAvatar />
                </Link>
              </div>
              <div className={`dropdown__menu`}>
                <Link
                  to="/profile"
                  className="dropdown__link dropdown__link_has-icon dropdown__link_type_profile"
                  reloadDocument
                  onClick={() => toggleMobileMenu(true)}
                >
                  My Profile
                </Link>
                <Link
                  to="/logout"
                  className="dropdown__link dropdown__link_has-icon dropdown__link_type_logout"
                  onClick={handleLogoutLink}
                >
                  Logout
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={`header__user-container  ${isLoggedIn ? `header__user-container_loggedIn_true` : ""}`}
            >
              {currentLocation != "/signup" && (
                <Link
                  to="/signup"
                  className="header__link header__link_type_signup"
                >
                  Sign Up
                </Link>
              )}
              {currentLocation !== "/login" && (
                <button
                  className="header__link header__link_type_login"
                  onClick={handleLoginButton}
                >
                  Log In
                </button>
              )}
            </div>
          )}
        </div>
        <img
          src={menuBtn}
          alt="Menu"
          className="header__menu-btn"
          onClick={() => toggleMobileMenu(false)}
        />
      </header>
      {isLoggedIn && currentUser.isGoogleRevoked && (
        <div className="alert alert__google">
          <Link to="/profile" reloadDocument>
            We've lost access to your Google Calendar. Click here to re-connect
          </Link>
        </div>
      )}
    </>
  );
}

export default Header;
