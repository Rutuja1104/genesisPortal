import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalContext from "./global-context/GlobalContext";
import { AuthProvider } from "@descope/react-sdk";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider projectId={process.env.REACT_APP_DESCOPE_ID} sessionTokenViaCookie>
      <ToastContainer />
      <GlobalContext>
        <App />
      </GlobalContext>
    </AuthProvider>
  </BrowserRouter>
);
