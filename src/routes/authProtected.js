import { useDescope } from "@descope/react-sdk";
import General from "../libs/utility/General";
import React from "react";
import { Navigate } from "react-router-dom";

const AuthProtected = ({ children }) => {
  const { isJwtExpired } = useDescope();
  const token = General.getToken();
  if (token.length > 0) {
    if (isJwtExpired(token)) {
      window.location.href = "/login";
      deleteAllCookies();
    }
  } else {
    deleteAllCookies();
    window.location.href = "/login";
  }
  return children;
};

const deleteAllCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  });
};

const FullPageRoute = ({ children }) => {
  const token = General.getToken();
  if (token) {
    return <Navigate to="/organizations" />;
  }

  return children;
};

export { AuthProtected, FullPageRoute };
