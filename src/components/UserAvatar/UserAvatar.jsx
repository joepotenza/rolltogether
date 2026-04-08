/*
  UserAvatar.js: Display User Avatar
  This displays a user's avatar and if the image breaks it falls back to a default with the first
  letter of their name

  Defaults to the current user

  This is separate from Avatar.js which uses the avatar APIs to generate new avatars
*/

import { useContext, useState } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import isSvg from "is-svg";

function UserAvatar({
  avatarClass = "header",
  user = { username: "", avatar: "" },
}) {
  const { currentUser } = useContext(CurrentUserContext);
  const userInfo = user.username ? user : currentUser;
  const [isAvatarValid, setIsAvatarValid] = useState(isSvg(userInfo.avatar));

  //If the avatar doesn't load for some reason, we fall back to the default display
  function handleAvatarLoadError() {
    setIsAvatarValid(false);
  }
  return (
    <>
      {isAvatarValid ? (
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(userInfo.avatar)}`}
          alt={userInfo.username}
          className={`avatar avatar_type_image ${avatarClass}__avatar ${avatarClass}__avatar_type_image`}
          onError={handleAvatarLoadError}
        />
      ) : (
        <div
          className={`avatar avatar_type_default ${avatarClass}__avatar ${avatarClass}__avatar_type_default`}
        >
          {userInfo.username.substr(0, 1).toUpperCase()}
        </div>
      )}
    </>
  );
}

export default UserAvatar;
