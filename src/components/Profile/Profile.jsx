/*
    Profile.jsx
    User profile page
    If no userId specified, shows current logged in user and allows for updating profile
    Otherwise, shows the public profile for the matching user
*/

import "./Profile.css";

import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import PreLoader from "../PreLoader/PreLoader";
import NotFound from "../NotFound/NotFound";
import ProfileForm from "../ProfileForm/ProfileForm";
import UserAvatar from "../UserAvatar/UserAvatar";
import SearchResults from "../SearchResults/SearchResults";

function Profile({ authAPI, groupAPI, onSubmit, onFetchError }) {
  const { username } = useParams();
  const navigate = useNavigate();

  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const [profileData, setProfileData] = useState({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [isGMGroupListLoading, setIsGMGroupListLoading] = useState(true);
  const [userGroupsAsGM, setUserGroupsAsGM] = useState([]);

  const [isMemberGroupListLoading, setIsMemberGroupListLoading] =
    useState(true);
  const [userGroupsAsMember, setUserGroupsAsMember] = useState([]);

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const handleEditProfile = (values, onSuccess, onError) => {
    onSubmit(values, onSuccess, onError);
  };

  const getUserProfile = () => {
    setIsProfileLoading(true);
    authAPI
      .getUserProfile({ username })
      .then((user) => {
        setProfileData(user);
        setIsProfileLoading(false);
      })
      .catch(onFetchError);
  };

  const getUserGroupsAsGM = (userId = profileData._id) => {
    groupAPI
      .getGroups({ owner: userId })
      .then((data) => {
        if (data.groups) setUserGroupsAsGM(data.groups);
        setIsGMGroupListLoading(false);
      })
      .catch(onFetchError);
  };

  const getUserGroupsAsMember = (userId = profileData._id) => {
    groupAPI
      .getGroups({ member: userId })
      .then((data) => {
        if (data.groups) {
          setUserGroupsAsMember(data.groups);
        }
        setIsMemberGroupListLoading(false);
      })
      .catch(onFetchError);
  };

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
  }, [profileData, isOwnProfile, isProfileLoading]);

  return (
    <div className="profile">
      {/*<PreLoader />*/}
      {isProfileLoading ? (
        <></>
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
              />
            )}
            <div className="profile__groups_gm">
              {isGMGroupListLoading ? (
                <></>
              ) : (
                <>
                  <h2 className="profile__subtitle">Groups as GM</h2>
                  <SearchResults
                    results={userGroupsAsGM}
                    className="profile__results"
                  />
                </>
              )}
            </div>
            <div className="profile__groups_member">
              {isMemberGroupListLoading ? (
                <></>
              ) : (
                <>
                  <h2 className="profile__subtitle">Groups as Member</h2>
                  <SearchResults
                    results={userGroupsAsMember}
                    className="profile__results"
                  />
                </>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default Profile;
