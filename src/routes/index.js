import React from "react";
import { Routes, Route } from "react-router-dom";
import { AUTH_PROTECTED_ROUTES, PUBLIC_ROUTES } from "./allRoutes";
import { AuthProtected, FullPageRoute } from "./authProtected";
import VerticalLayout from "../layouts/index";

const index = () => {
  return (
    <Routes>
      {PUBLIC_ROUTES.map((route, idx) => {
        return (
          <Route
            path={route.path}
            key={idx}
            element={<FullPageRoute>{route.component}</FullPageRoute>}
          />
        );
      })}

      {AUTH_PROTECTED_ROUTES.map((route, idx) => {
        const { path, component, ...rest } = route;
        return (
          <Route
            key={idx}
            exact={true}
            path={path}
            element={
              <AuthProtected {...rest}>
                <VerticalLayout>{component}</VerticalLayout>
              </AuthProtected>
            }
          />
        );
      })}
    </Routes>
  );
};

export default index;
