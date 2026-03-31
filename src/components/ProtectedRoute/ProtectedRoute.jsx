/*
  ProtectedRoute.jsx
  Wrapper for any page that requires user login
*/

import { useContext } from "react";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { Navigate, useLocation } from "react-router";
import PreLoader from "../PreLoader/PreLoader";

function ProtectedRoute({ children, anonymous = false }) {
  // Invoke the useLocation hook and access the value of the
  // 'from' property from its state object. If there is no 'from'
  // property we default to "/".
  const location = useLocation();
  const from = location.state?.from || "/";

  // Destructure isLoggedIn from the value provided by CurrentUserContext
  const { isLoggedIn, isCheckingAuth } = useContext(CurrentUserContext);

  // If the user is logged in we redirect them away from our
  // anonymous-only routes.
  if (anonymous && isLoggedIn) {
    return <Navigate to={from} />;
  }

  // If a user is not logged in and tries to access a route that
  // requires authorization, we redirect them to the /login route.
  if (!anonymous && !isLoggedIn) {
    // If the auth token is still being checked, we show the PreLoader so
    // that we don't accidentally redirect a logged in user
    if (isCheckingAuth) {
      return <PreLoader fill />;
    }

    // While redirecting to /login we set the location objects
    // state.from property to store the current location value.
    // This allows us to redirect them appropriately after they
    // log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Otherwise, display the children of the current route.
  return children;
}

export default ProtectedRoute;
