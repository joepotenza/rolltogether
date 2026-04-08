/*
    GroupDetails.jsx
    Sub-component of Group.jsx that displays the main details of a group
*/

function GroupDetails({ groupInfo }) {
  return (
    <>
      <div className="group__info">
        <div
          className={`group__system group__system_type_${groupInfo.system.id}`}
          dangerouslySetInnerHTML={{ __html: groupInfo.system.name }}
        ></div>
        <div className={`group__type group_type_${groupInfo.type}`}>
          {groupInfo.type === "online" && "Online"}
          {groupInfo.type === "hybrid" && "Hybrid"}
          {groupInfo.type === "inperson" && "In-Person"}
        </div>
        <div className="group__story">
          {groupInfo.isHomebrew ? "Homebrew" : groupInfo.story}
        </div>
        <div className="group__slots">
          Open seats: {groupInfo.slots.open}/{groupInfo.slots.total}
        </div>
      </div>
    </>
  );
}
export default GroupDetails;
