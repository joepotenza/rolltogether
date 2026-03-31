/*
  Group.jsx
  Group display page: shows details and allows for applying to open groups
*/

import "./Group.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import PreLoader from "../PreLoader/PreLoader";
import NotFound from "../NotFound/NotFound";
import GroupDetails from "../GroupDetails/GroupDetails";
import GroupSidebar from "../GroupSidebar/GroupSidebar";
import GroupApplication from "../GroupApplication/GroupApplication";
import GroupAdministration from "../GroupAdministration/GroupAdministration";
import GroupSessionList from "../GroupSessionList/GroupSessionList";
import GroupForm from "../GroupForm/GroupForm";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function Group({ api, onFetchError }) {
  const emptyGroupInfo = {
    _id: "",
    name: "",
    summary: "",
    description: "",
    system: {
      id: "",
      name: "",
    },
    type: {
      id: "",
      name: "",
    },
    owner: {
      _id: "",
      username: "",
      avatar: "",
    },
    members: [],
    story: "",
    slots: {
      open: 0,
      total: 0,
    },
  };
  const { groupId } = useParams();

  const [groupInfo, setGroupInfo] = useState(emptyGroupInfo);
  const [isGroupLoading, setIsGroupLoading] = useState(true);

  const [applicationList, setApplicationList] = useState([]);
  const [isApplicationListLoading, setIsApplicationListLoading] =
    useState(false);

  const [sessionList, setSessionList] = useState([]);
  const [isSessionListLoading, setIsSessionListLoading] = useState(false);

  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);

  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const checkIsMember = (group = groupInfo) => {
    return group.members.some((member) => {
      return member._id === currentUser._id;
    });
  };

  function getGroupInfo() {
    api
      .getGroup({ groupId })
      .then((data) => {
        setGroupInfo(data);
        setIsGroupLoading(false);
      })
      .catch(onFetchError);
  }

  function getGroupApplications() {
    api
      .getGroupApplications({ groupId })
      .then((data) => {
        setApplicationList(data);
        setIsApplicationListLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsApplicationListLoading(false);
      });
  }
  function getGroupSessions() {
    api
      .getGroupSessions({ groupId })
      .then((data) => {
        setSessionList(data);
        setIsSessionListLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsSessionListLoading(false);
      });
  }

  const handleToggleEditForm = () => {
    setIsEditMode(!isEditMode);
  };

  const handleApplicationSubmission = (values, afterSubmit) => {
    /*
      api.submitApplication
    */
    console.log("handleApplicationSubmission ", values);
    afterSubmit();
  };

  const handleEditGroup = (values, onError) => {
    api
      .editGroup(groupId, values)
      .then((group) => {
        setGroupInfo(group);
        setIsEditMode(false);
      })
      .catch(onError);
  };

  // load group on page render
  useEffect(() => {
    getGroupInfo();
  }, []);

  // Update ownership state if group or current user changes
  useEffect(() => {
    const isGroupOwner =
      currentUser._id &&
      groupInfo._id &&
      currentUser._id === groupInfo.owner._id;
    const isGroupMember = currentUser._id && groupInfo._id && checkIsMember();
    setIsOwner(isGroupOwner);
    setIsMember(isGroupMember);
    if (isGroupOwner) {
      setIsApplicationListLoading(true);
      getGroupApplications();
    }
    if (isGroupOwner || isGroupMember) {
      setIsSessionListLoading(true);
      getGroupSessions();
    }
  }, [groupInfo, currentUser]);

  return (
    <main className="group">
      {/*<Link to="/" className="link__back group__back-btn">
        Go Back
      </Link>*/}
      {isGroupLoading ? (
        <PreLoader />
      ) : !groupInfo._id ? (
        <NotFound message={"Sorry, we couldn't find that group"} />
      ) : isOwner && isEditMode ? (
        <GroupForm
          api={api}
          groupInfo={groupInfo}
          onSubmit={handleEditGroup}
          handleToggleEditForm={handleToggleEditForm}
        />
      ) : (
        <div className="group__content">
          {/*Set document title*/}
          <title>{`${groupInfo.name} | Roll Together`}</title>
          <div className="group__details">
            <GroupDetails groupInfo={groupInfo} />
            {isOwner && (
              <GroupAdministration
                groupInfo={groupInfo}
                applicationList={applicationList}
                isApplicationListLoading={isApplicationListLoading}
                handleToggleEditForm={handleToggleEditForm}
              />
            )}
            {(isOwner || isMember) && (
              <GroupSessionList
                groupInfo={groupInfo}
                isOwner={isOwner}
                isMember={isMember}
                sessionList={sessionList}
                isSessionListLoading={isSessionListLoading}
              />
            )}
            {isLoggedIn && !isOwner && !isMember && (
              <GroupApplication
                groupInfo={groupInfo}
                onSubmit={handleApplicationSubmission}
              />
            )}
          </div>
          <div className="sidebar group__sidebar">
            <GroupSidebar groupInfo={groupInfo} />
          </div>
        </div>
      )}
    </main>
  );
}
export default Group;
