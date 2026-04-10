/*
  Group.jsx
  Group display page: shows details and allows for applying to open groups
*/

import "./Group.css";
import { useState, useEffect, useContext, useMemo } from "react";
import { useParams } from "react-router";
import DOMPurify from "dompurify";
import { useLoadMonitor } from "../../hooks/useLoadMonitor";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import PreLoader from "../PreLoader/PreLoader";
import GroupDetails from "../GroupDetails/GroupDetails";
import GroupSidebar from "../GroupSidebar/GroupSidebar";
import GroupApplication from "../GroupApplication/GroupApplication";
import GroupApplicationList from "../GroupApplicationList/GroupApplicationList";
import GroupAdministration from "../GroupAdministration/GroupAdministration";
import GroupSessionList from "../GroupSessionList/GroupSessionList";
import GroupSessionScheduler from "../GroupSessionScheduler/GroupSessionScheduler";
import GroupForm from "../GroupForm/GroupForm";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import PageContext from "../../contexts/PageContext";

function Group() {
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

  const { currentUser, isLoggedIn } = useContext(CurrentUserContext);
  const { groupAPI, handleCloseModal } = useContext(PageContext);

  const [editSessionInfo, setEditSessionInfo] = useState({});

  const { onFetchError, ErrorUI } = useErrorHandler(true);

  // If logged out while on an owner or member-only screen, go back to description
  const [selectedTab, setSelectedTab] = useState("description");
  const displayMode = useMemo(() => {
    return !isLoggedIn ? "description" : selectedTab;
  }, [isLoggedIn, selectedTab]);

  /**
   * Loading Monitor for Group Info
   */
  async function fetchGroupInfo() {
    try {
      const data = await groupAPI.getGroup({ groupId });
      return data || emptyGroupInfo;
    } catch (err) {
      onFetchError(err);
      return emptyGroupInfo;
    }
  }
  const {
    isGroupLoading,
    setIsGroupLoading,
    groupInfo,
    setGroupInfo,
    getGroupInfo,
  } = useLoadMonitor({
    variableName: "isGroupLoading",
    variableSetterName: "setIsGroupLoading",
    initialValue: true,
    loadingFunction: fetchGroupInfo,
    resultVariableName: "groupInfo",
    resultVariableSetterName: "setGroupInfo",
    initialResultValue: emptyGroupInfo,
    functionName: "getGroupInfo",
  });

  /**
   * Loading Monitor for Application List
   */

  async function fetchGroupApplications() {
    try {
      const data = await groupAPI.getGroupApplications({ groupId });
      return data || [];
    } catch (error) {
      onFetchError(error);
      return [];
    }
  }
  const {
    isApplicationListLoading,
    setIsApplicationListLoading,
    applicationList,
    setApplicationList,
    getGroupApplications,
  } = useLoadMonitor({
    variableName: "isApplicationListLoading",
    variableSetterName: "setIsApplicationListLoading",
    initialValue: false,
    loadingFunction: fetchGroupApplications,
    resultVariableName: "applicationList",
    resultVariableSetterName: "setApplicationList",
    initialResultValue: [],
    functionName: "getGroupApplications",
  });

  async function fetchGroupSessions() {
    try {
      const data = await groupAPI.getGroupSessions({ groupId });
      return data || [];
    } catch (error) {
      onFetchError(error);
      return [];
    }
  }

  /**
   * Loading Monitor for Session List
   */
  const {
    isSessionListLoading,
    setIsSessionListLoading,
    sessionList,
    setSessionList,
    getGroupSessions,
  } = useLoadMonitor({
    variableName: "isSessionListLoading",
    variableSetterName: "setIsSessionListLoading",
    initialValue: false,
    loadingFunction: fetchGroupSessions,
    resultVariableName: "sessionList",
    resultVariableSetterName: "setSessionList",
    initialResultValue: [],
    functionName: "getGroupSessions",
  });

  /**
   * Loading Monitor for User's Application(s)
   */

  async function fetchMyApplications() {
    try {
      const data = await groupAPI.getGroupApplications({
        groupId,
        filters: { userId: currentUser._id },
      });
      return data || [];
    } catch (error) {
      onFetchError(error);
      return [];
    }
  }
  const {
    isMyApplicationListLoading,
    setIsMyApplicationListLoading,
    myApplicationList,
    setMyApplicationList,
    getMyApplications,
  } = useLoadMonitor({
    variableName: "isMyApplicationListLoading",
    variableSetterName: "setIsMyApplicationListLoading",
    initialValue: false,
    loadingFunction: fetchMyApplications,
    resultVariableName: "myApplicationList",
    resultVariableSetterName: "setMyApplicationList",
    initialResultValue: [],
    functionName: "getMyApplications",
  });

  const isOwner = useMemo(() => {
    return currentUser._id && currentUser._id === groupInfo.owner._id;
  }, [currentUser._id, groupInfo.owner._id]);

  const isMember = useMemo(() => {
    const userIsMember = groupInfo.members.some((member) => {
      return member._id === currentUser._id;
    });
    return currentUser._id && userIsMember;
  }, [currentUser._id, groupInfo.members]);

  // Click "edit session" - replaces page contents
  const handleEditSession = (session) => {
    setEditSessionInfo(session);
    setSelectedTab("scheduler");
  };

  //Delete session
  const handleDeleteSession = async (sessionId, onSuccess, onError) => {
    await groupAPI
      .deleteSession(sessionId)
      .then((response) => {
        getGroupSessions();
        handleCloseModal();
        onSuccess();
      })
      .catch(onError);
  };

  // process "Edit Group" form
  const handleEditGroup = (group) => {
    setGroupInfo(group);
    setSelectedTab("description");
  };

  // after submitting "Schedule Session" form
  const handleScheduleSession = async (values, onError) => {
    if (!values._id) {
      // submit new group
      await groupAPI
        .createSession(values)
        .then((/* session */) => {
          setSelectedTab("sessionList");
          getGroupSessions();
        })
        .catch(onError);
    } else {
      // submit edit session
      await groupAPI
        .editSession(values._id, values)
        .then((/* session */) => {
          setSelectedTab("sessionList");
          getGroupSessions();
        })
        .catch(onError);
    }
  };

  // Handle Application submission
  const handleApplicationSubmission = async (values, onError) => {
    const { message } = values;
    const newAppList = [...myApplicationList];
    await groupAPI
      .submitApplication({ groupId, message })
      .then((app) => {
        getMyApplications();
        setSelectedTab("description");
      })
      .catch(onError);
  };

  /* After approving an application
   * reloads groupInfo so the member list and open seats refresh properly
   */
  const handleApproveApplication = () => {
    getGroupInfo();
    getGroupApplications();
  };

  // load group on page render
  useEffect(() => {
    getGroupInfo();
  }, [getGroupInfo, isLoggedIn, displayMode]);

  // Update ownership state if group or current user changes
  useEffect(() => {
    if (!groupInfo._id) {
      return;
    }
    if (isOwner) {
      // load applications for owner to view/update
      getGroupApplications();
    }
    if (isOwner || isMember) {
      // load sessions for owner/members to view
      getGroupSessions();
    }
    if (isLoggedIn && !isOwner && !isMember) {
      // get any applications this user has submitted for the group
      getMyApplications();
    }
  }, [
    groupInfo._id,
    isOwner,
    isMember,
    isLoggedIn,
    getGroupApplications,
    getGroupSessions,
    getMyApplications,
  ]);

  return (
    ErrorUI || (
      <main className="group">
        {isGroupLoading ? (
          <PreLoader fill />
        ) : (
          <>
            {/*Set document title*/}
            <title>{`${groupInfo.name} | Roll Together`}</title>
            <h1 className="group__name">{groupInfo.name}</h1>
            <div className="group__content">
              <div className="group__details">
                {/* First: Details bar */}
                <GroupDetails groupInfo={groupInfo} />

                {/* Second: Administration bar */}
                {isLoggedIn && (
                  <GroupAdministration
                    groupInfo={groupInfo}
                    isOwner={isOwner}
                    isMember={isMember}
                    applicationList={applicationList}
                    sessionList={sessionList}
                    displayMode={displayMode}
                    onGoBack={() => setSelectedTab("description")}
                    onOpenEditForm={() => setSelectedTab("edit")}
                    onOpenScheduler={() => {
                      setEditSessionInfo({});
                      setSelectedTab("scheduler");
                    }}
                    onOpenSessionList={() => setSelectedTab("sessionList")}
                    onOpenApplicationList={() =>
                      setSelectedTab("applicationList")
                    }
                    onOpenApplicationForm={() => setSelectedTab("apply")}
                    myApplications={myApplicationList}
                  />
                )}

                {/* Edit Mode */}
                {displayMode === "edit" && isOwner && (
                  <GroupForm
                    groupInfo={groupInfo}
                    onSubmit={handleEditGroup}
                    onGoBack={() => setSelectedTab("description")}
                  />
                )}

                {/* Schedule A Session */}
                {displayMode === "scheduler" && isOwner && (
                  <GroupSessionScheduler
                    groupInfo={groupInfo}
                    sessionInfo={editSessionInfo}
                    onSubmit={handleScheduleSession}
                    onGoBack={() => {
                      setEditSessionInfo({});
                      setSelectedTab("description");
                    }}
                  />
                )}

                {/* Application List */}
                {displayMode === "applicationList" && isOwner && (
                  <GroupApplicationList
                    groupInfo={groupInfo}
                    applicationList={applicationList}
                    isApplicationListLoading={isApplicationListLoading}
                    onApprove={handleApproveApplication}
                  />
                )}

                {/* Session List */}
                {displayMode === "sessionList" && (isOwner || isMember) && (
                  <GroupSessionList
                    groupInfo={groupInfo}
                    isOwner={isOwner}
                    isMember={isMember}
                    sessionList={sessionList}
                    isSessionListLoading={isSessionListLoading}
                    handleEditSession={handleEditSession}
                    handleDeleteSession={handleDeleteSession}
                  />
                )}

                {/* Group Description (default page) */}
                {displayMode === "description" && (
                  <div
                    className="group__description"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(groupInfo.description),
                    }}
                  ></div>
                )}

                {/* Application Form */}
                {displayMode === "apply" && (
                  <GroupApplication
                    groupInfo={groupInfo}
                    myApplications={myApplicationList}
                    onSubmit={handleApplicationSubmission}
                  />
                )}
              </div>

              {/* Sidebar with member avatars */}
              <GroupSidebar groupInfo={groupInfo} />
            </div>
          </>
        )}
      </main>
    )
  );
}
export default Group;
