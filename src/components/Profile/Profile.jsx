/*
    Profile.jsx
    User profile page
    If no userId specified, shows current logged in user and allows for updating profile
    Otherwise, shows the public profile for the matching user
*/

import "./Profile.css";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { useLoadMonitor } from "../../hooks/useLoadMonitor";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import PageContext from "../../contexts/PageContext";
import PreLoader from "../PreLoader/PreLoader";
import NotFound from "../NotFound/NotFound";
import ProfileForm from "../ProfileForm/ProfileForm";
import UserAvatar from "../UserAvatar/UserAvatar";
import SearchResults from "../SearchResults/SearchResults";

function Profile({ onSubmit, onReceiveOAuthCallback, onConfirmRevokeOAuth }) {
  const { username } = useParams();
  const navigate = useNavigate();

  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const { authAPI, groupAPI } = useContext(PageContext);

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const { onFetchError, ErrorUI } = useErrorHandler(
    typeof username !== "undefined",
  ); // Only process 404 errors when username is present (viewing a public profile page)

  const handleEditProfile = (values, onSuccess, onError) => {
    onSubmit(values, onSuccess, onError);
  };

  /**
   * Loading Monitor for Profile Data
   */
  async function fetchUserProfile() {
    setIsProfileLoading(true);
    try {
      const user = await authAPI.getUserProfile({ username });
      return user || {};
    } catch (err) {
      onFetchError(err);
      return {};
    }
  }

  const {
    isProfileLoading,
    setIsProfileLoading,
    profileData,
    setProfileData,
    getUserProfile,
  } = useLoadMonitor({
    variableName: "isProfileLoading",
    variableSetterName: "setIsProfileLoading",
    initialValue: true,
    loadingFunction: fetchUserProfile,
    resultVariableName: "profileData",
    resultVariableSetterName: "setProfileData",
    initialResultValue: {},
    functionName: "getUserProfile",
  });

  /**
   * Loading Monitor for GM Groups
   */
  async function fetchUserGroupsAsGM(userId = profileData._id) {
    try {
      const data = await groupAPI.getGroups({ owner: userId });
      return data?.groups || [];
    } catch (err) {
      onFetchError(err);
    }
    return [];
  }

  const {
    isGMGroupListLoading,
    setIsGMGroupListLoading,
    userGroupsAsGM,
    setUserGroupsAsGM,
    getUserGroupsAsGM,
  } = useLoadMonitor({
    variableName: "isGMGroupListLoading",
    variableSetterName: "setIsGMGroupListLoading",
    initialValue: true,
    loadingFunction: fetchUserGroupsAsGM,
    resultVariableName: "userGroupsAsGM",
    resultVariableSetterName: "setUserGroupsAsGM",
    initialResultValue: {},
    functionName: "getUserGroupsAsGM",
  });

  /**
   * Loading Monitor for Member Groups
   */
  async function fetchUserGroupsAsMember(userId = profileData._id) {
    try {
      const data = await groupAPI.getGroups({ member: userId });
      return data?.groups || [];
    } catch (err) {
      onFetchError(err);
    }
    return [];
  }
  const {
    isMemberGroupListLoading,
    setIsMemberGroupListLoading,
    userGroupsAsMember,
    setUserGroupsAsMember,
    getUserGroupsAsMember,
  } = useLoadMonitor({
    variableName: "isMemberGroupListLoading",
    variableSetterName: "setIsMemberGroupListLoading",
    initialValue: true,
    loadingFunction: fetchUserGroupsAsMember,
    resultVariableName: "userGroupsAsMember",
    resultVariableSetterName: "setUserGroupsAsMember",
    initialResultValue: {},
    functionName: "getUserGroupsAsMember",
  });

  useEffect(() => {
    if (!isLoggedIn) {
      if (username) {
        // Not logged in, viewing public profile
        setIsOwnProfile(false);
        getUserProfile();
      } else {
        // Not logged in, on /profile, redirect to login (ProtectedRoute should handle this but just in case)
        navigate("/login");
      }
    } else if (username) {
      if (username === currentUser.username) {
        // Viewing own profile via /user/username, redirect to /profile
        navigate("/profile", { replace: true });
      } else {
        // Viewing another user's profile
        setIsOwnProfile(false);
        getUserProfile();
      }
    } else {
      // On /profile, show own profile
      setProfileData(currentUser);
      setIsOwnProfile(true);
      setIsProfileLoading(false);
      setIsGMGroupListLoading(true);
      setIsMemberGroupListLoading(true);
      getUserGroupsAsGM(currentUser._id);
      getUserGroupsAsMember(currentUser._id);
    }
  }, [username, currentUser, isLoggedIn]);

  // Fetch groups when profileData is loaded (for public profiles)
  useEffect(() => {
    if (profileData._id && !isOwnProfile && !isProfileLoading) {
      setIsGMGroupListLoading(true);
      setIsMemberGroupListLoading(true);
      getUserGroupsAsGM();
      getUserGroupsAsMember();
    }
  }, [profileData._id, isOwnProfile, isProfileLoading]);

  return (
    ErrorUI || (
      <div className="profile">
        {isProfileLoading ? (
          <PreLoader fill />
        ) : !profileData.username ? (
          <NotFound message={"User not found"} />
        ) : (
          <>
            <aside className="sidebar sidebar__profile">
              <UserAvatar avatarClass="profile" user={profileData} />
              <h1 className="profile__username">{profileData.username}</h1>
            </aside>
            <main className="profile__content">
              {isOwnProfile && (
                <ProfileForm
                  userInfo={currentUser}
                  onSubmit={handleEditProfile}
                  onReceiveOAuthCallback={onReceiveOAuthCallback}
                  onConfirmRevokeOAuth={onConfirmRevokeOAuth}
                />
              )}
              <div className="profile__groups_gm">
                <h2 className="profile__subtitle">Groups I GM For</h2>
                {isGMGroupListLoading ? (
                  <PreLoader fill />
                ) : (
                  <SearchResults
                    results={userGroupsAsGM}
                    className="profile__results"
                  />
                )}
              </div>
              <div className="profile__groups_member">
                <h2 className="profile__subtitle">Groups as a Member</h2>
                {isMemberGroupListLoading ? (
                  <PreLoader fill />
                ) : (
                  <SearchResults
                    results={userGroupsAsMember}
                    className="profile__results"
                  />
                )}
              </div>
            </main>
          </>
        )}
      </div>
    )
  );
}

export default Profile;
