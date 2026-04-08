/*
  GroupSidebar.jsx
  Sub-component of Group.jsx that shows the game master and players
  On smaller screens this sidebar moves below the GroupDetails component
*/

import { Link } from "react-router";
import UserAvatar from "../UserAvatar/UserAvatar";

function GroupSidebar({ groupInfo }) {
  return (
    <aside className="sidebar group__sidebar">
      <div className="gm__header">Game Master</div>
      <div className="group__gm">
        <Link
          to={`/user/${groupInfo.owner.username}`}
          className="group__avatar"
        >
          <UserAvatar avatarClass="group" user={groupInfo.owner} />
        </Link>
        <Link to={`/user/${groupInfo.owner.username}`} className="gm__name">
          {groupInfo.owner.username}
        </Link>
      </div>
      <div className="players__header">Players</div>
      {!groupInfo.members || !groupInfo.members.length ? (
        <div>No players found</div>
      ) : (
        groupInfo.members.map((member) => (
          <div className="group__player" key={member.username}>
            <Link to={`/user/${member.username}`} className="group__avatar">
              <UserAvatar avatarClass="group" user={member} />
            </Link>
            <Link to={`/user/${member.username}`} className="player__name">
              {member.username}
            </Link>
          </div>
        ))
      )}
    </aside>
  );
}
export default GroupSidebar;
