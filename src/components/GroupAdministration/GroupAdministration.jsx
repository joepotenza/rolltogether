/*
    GroupAdminstration.jsx
    Shows the available features for an owner of a group
    Should show:
    - Edit button (places page in edit mode, showing only the form)
    - List of applications
    - Session Scheduler
*/

import "./GroupAdministration.css";
import PreLoader from "../PreLoader/PreLoader";
import GroupSessionScheduler from "../GroupSessionScheduler/GroupSessionScheduler";

function GroupAdministration({
  groupInfo,
  applicationList,
  isApplicationListLoading,
  handleToggleEditForm,
  handleToggleScheduler,
}) {
  return (
    <div className="group__administration">
      <button className="group_edit-btn" onClick={handleToggleEditForm}>
        Edit Group
      </button>
      <button className="group_schedule-btn" onClick={handleToggleScheduler}>
        Schedule Session
      </button>
      <GroupSessionScheduler />
    </div>
  );
}
/*<div className="sessions_list">
        {isApplicationListLoading && <PreLoader />}
      </div>*/
export default GroupAdministration;
