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
  createGroup({ name, summary, description, story, slots, system, type }) {
    return this._makeAPICall({
      endpoint: "/groups",
      method: "POST",
      body: JSON.stringify({
        name,
        summary,
        description,
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
    { name, summary, description, story, slots, system, type },
  ) {
    return this._makeAPICall({
      endpoint: `/groups/${groupId}`,
      method: "PATCH",
      body: JSON.stringify({
        name,
        summary,
        description,
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
}
