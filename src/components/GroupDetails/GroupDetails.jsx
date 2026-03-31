/*
    GroupDetails.jsx
    Sub-component of Group.jsx that displays the main details of a group
*/

import DOMPurify from "dompurify";

function GroupDetails({ groupInfo }) {
  return (
    <>
      <h1 className="group__name">{groupInfo.name}</h1>
      <div className="group__info">
        <div
          className={`group__system group__system_type_${groupInfo.system.id}`}
          dangerouslySetInnerHTML={{ __html: groupInfo.system.name }}
        ></div>
        <div className={`group__type group_type_${groupInfo.type}`}>
          {groupInfo.type === "online" && "Online"}
          {groupInfo.type === "hybrid" && "Hybrid"}
          {groupInfo.type === "inperson" && "In Person"}
        </div>
        <div className="group__story">{groupInfo.story}</div>
        <div className="group__slots">
          Open seats: {groupInfo.slots.open}/{groupInfo.slots.total}
        </div>
      </div>
      <div
        className="group__description"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(groupInfo.description),
        }}
      ></div>
    </>
  );
}
export default GroupDetails;
