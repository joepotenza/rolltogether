/*
  GroupAPI.js
  API functions for Groups
*/
import APIBase from "./APIBase.js";

export default class GroupAPI extends APIBase {
  // Get a list of groups, with optional filters and pagination
  getGroups(filters) {
    const queryFilters = {};
    if (filters.userId) queryFilters.userId = filters.userId;
    if (filters.owner) queryFilters.owner = filters.owner;
    if (filters.member) queryFilters.member = filters.member;
    if (filters.system) queryFilters.system = filters.system;
    if (filters.type) queryFilters.type = filters.type;
    if (typeof filters.openSlots !== "undefined")
      queryFilters.openSlots = filters.openSlots;
    if (typeof filters.isHomebrew !== "undefined")
      queryFilters.isHomebrew = filters.isHomebrew;
    if (filters.story) queryFilters.story = filters.story;
    if (filters.limit) queryFilters.limit = filters.limit;
    const queryString = new URLSearchParams(queryFilters).toString();
    return this._makeAPICall({
      endpoint: `/groups?${queryString}`,
      method: "GET",
    });
  }

  // Fetch group details
  getGroup({ groupId }) {
    return this._makeAPICall({
      endpoint: `/groups/${groupId}`,
      method: "GET",
    });
  }

  // Create a new group
  createGroup({
    name,
    summary,
    description,
    isHomebrew,
    story,
    slots,
    system,
    type,
  }) {
    return this._makeAPICall({
      endpoint: "/groups",
      method: "POST",
      body: JSON.stringify({
        name,
        summary,
        description,
        isHomebrew,
        story,
        slots,
        system,
        type,
      }),
      requireToken: true,
    });
  }

  // Edit a group
  editGroup(
    groupId,
    { name, summary, description, isHomebrew, story, slots, system, type },
  ) {
    return this._makeAPICall({
      endpoint: `/groups/${groupId}`,
      method: "PATCH",
      body: JSON.stringify({
        name,
        summary,
        description,
        isHomebrew,
        story,
        slots,
        system,
        type,
      }),
      requireToken: true,
    });
  }

  // Fetch group applications
  getGroupApplications({ groupId, filters }) {
    const queryFilters = {};
    if (filters?.userId) queryFilters.userId = filters.userId;
    if (filters?.status) queryFilters.status = filters.status;
    const queryString = new URLSearchParams(queryFilters).toString();
    return this._makeAPICall({
      endpoint: `/groups/${groupId}/applications?${queryString}`,
      method: "GET",
      requireToken: true,
    });
  }

  // Fetch group sessions
  getGroupSessions({ groupId, filters }) {
    const queryFilters = {};
    const queryString = new URLSearchParams(queryFilters).toString();
    return this._makeAPICall({
      endpoint: `/groups/${groupId}/sessions?${queryString}`,
      method: "GET",
      requireToken: true,
    });
  }

  // Submit an application
  submitApplication({ groupId, message }) {
    return this._makeAPICall({
      endpoint: `/applications`,
      method: "POST",
      body: JSON.stringify({ groupId, message }),
      requireToken: true,
    });
  }

  // Update an application status
  updateApplicationStatus({ groupId, appId, status, response }) {
    return this._makeAPICall({
      endpoint: `/applications/${appId}`,
      method: "PATCH",
      body: JSON.stringify({ groupId, status, response }),
      requireToken: true,
    });
  }

  // Create a group session
  createSession({
    group,
    name,
    date,
    preSessionNotes,
    postSessionNotes,
    areNotesVisibleToMembers,
    attendees,
  }) {
    return this._makeAPICall({
      endpoint: `/sessions`,
      method: "POST",
      body: JSON.stringify({
        group,
        name,
        date,
        preSessionNotes,
        postSessionNotes,
        areNotesVisibleToMembers,
        attendees,
      }),
      requireToken: true,
    });
  }

  // Edit a group session
  editSession(
    sessionId,
    {
      group,
      name,
      date,
      preSessionNotes,
      postSessionNotes,
      areNotesVisibleToMembers,
      attendees,
    },
  ) {
    return this._makeAPICall({
      endpoint: `/sessions/${sessionId}`,
      method: "PATCH",
      body: JSON.stringify({
        group,
        name,
        date,
        preSessionNotes,
        postSessionNotes,
        areNotesVisibleToMembers,
        attendees,
      }),
      requireToken: true,
    });
  }

  // delete a group session
  deleteSession(sessionId) {
    return this._makeAPICall({
      endpoint: `/sessions/${sessionId}`,
      method: "DELETE",
      requireToken: true,
    });
  }

  // Match Google Calendar availability
  freebusy({
    start,
    end,
    groupId,
    userIds,
    minUsers,
    minDuration,
    prefStartHour,
    prefEndHour,
  }) {
    return this._makeAPICall({
      endpoint: "/users/freebusy",
      method: "POST",
      body: JSON.stringify({
        start,
        end,
        groupId,
        userIds,
        minUsers,
        minDuration,
        prefStartHour,
        prefEndHour,
      }),
      requireToken: true,
      additionalHeaders: {
        // Google documentation says to include this
        "X-Requested-With": "XmlHttpRequest",
      },
    });
  }
}
