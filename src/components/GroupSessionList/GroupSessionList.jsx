/*
    GroupSessionList.jsx
    Session history for a group
*/

import "./GroupSessionList.css";
import PreLoader from "../PreLoader/PreLoader";

function GroupSessionList({
  groupInfo,
  sessionList,
  isOwner,
  isMember,
  isSessionListLoading,
}) {
  return (
    <div className="group__sessions">
      <h2 className="sessions__header">Session History</h2>
      <div className="sessions_list">
        {isSessionListLoading && <PreLoader />}
      </div>
    </div>
  );
}
export default GroupSessionList;
