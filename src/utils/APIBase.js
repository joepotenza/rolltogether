/*
  APIBase.js
  Base Component for the API controllers: provides fetch, response processing, and auth token storage
*/
export default class ApiBase {
  constructor({ baseUrl, headers }) {
    // constructor body
    this._baseUrl = baseUrl;
    this._headers = headers;
    this._token = "";
  }

  // single internal function for making API calls
  _makeAPICall({
    endpoint,
    method = "GET",
    body = "",
    requireToken = false,
    additionalHeaders = {},
  }) {
    const headers = { ...this._headers, ...additionalHeaders };

    // Add token if present and required
    if (this._token && requireToken) {
      headers.authorization = `Bearer ${this._token}`;
    }

    const params = {
      method,
      headers,
    };

    // Add body parameter when updating or adding content
    if (method === "PATCH" || method === "POST") {
      params.body = body;
    }

    // Generic function to use for parsing JSON from an API
    function checkResponse(res) {
      try {
        // If status is OK, parse JSON and return
        if (res.ok) {
          return res.json();
        }

        // Otherwise try the JSON just to get any error info
        return res.json().then((data) => {
          const { statusCode = res.status, message, validation } = data;
          const myError = new Error(message);
          myError.statusCode = statusCode;
          if (validation) {
            myError.validation = validation; // get the nicer error message from Joi validation on backend
          }
          return Promise.reject(myError);
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return fetch(`${this._baseUrl}${endpoint}`, params).then(checkResponse);
  }
  // Set User Token for any API calls
  setUserToken(token) {
    this._token = token;
  }
}
