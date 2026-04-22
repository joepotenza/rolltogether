/*
  useErrorHandler.js
  Custom hook for managing Fetch errors that need to show a full page error or 404 page
*/
import { useState } from "react";

import NotFound from "../components/NotFound/NotFound";
import ErrorPage from "../components/ErrorPage/ErrorPage";

export function useErrorHandler(use404) {
  const [hasFetchError, setHasFetchError] = useState(false);
  const [has404Error, setHas404Error] = useState(false);

  // onFetchError will catch errors so the page doesn't render incorrectly
  const onFetchError = (err) => {
    if (use404 && err.statusCode && err.statusCode === 404) {
      setHas404Error(true);
    } else {
      setHasFetchError(true);
    }
    console.error(err);
  };

  // Create the UI variable
  let ErrorUI = null;

  if (has404Error) {
    ErrorUI = <NotFound />;
  } else if (hasFetchError) {
    ErrorUI = <ErrorPage />;
  }

  return {
    onFetchError,
    ErrorUI,
    hasError: hasFetchError || has404Error,
  };
}
