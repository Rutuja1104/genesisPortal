import React from "react";
import { Navigate } from "react-router-dom";
import Login from "../pages/Authentication/Login";
import Network from "../pages/Network";
import Organization from "../pages/Organization/Organization";
import LogoutModal from "../pages/Logout/Logout";
import User from "../pages/Users/User";
import Releases from "../pages/Releases/Releases";
import Unauthorized from "../pages/UnauthorisedUser/Unauthorized";
import Metrics from "../pages/Metrics/Metrics";
import Files from "../pages/Files/Files";

const AUTH_PROTECTED_ROUTES = [
    { path: "/networks", component: <Network /> },
    { path: "/organizations", component: <Organization /> },
    { path: "*", component: <Navigate to="/login" replace /> },
    { path: "/metrics", component: <Metrics /> },
    { path: "/files", component: <Files /> },
    { path: "/users", component: <User /> },
    { path: "/releases", component: <Releases /> },
    { path: "/unauthorized", component: <Unauthorized /> },
    { path: "/logout", component: <LogoutModal /> },
];

const PUBLIC_ROUTES = [
    { path: "/login", component: <Login /> },
    { path: "/", component: <Navigate to="/organizations" /> },
];

export { AUTH_PROTECTED_ROUTES, PUBLIC_ROUTES };
