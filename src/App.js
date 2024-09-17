import React from "react";
import Route from "./routes";
import "./assets/scss/index.scss";
import GlobalContext from "./global-context/GlobalContext";

function App() {
    return (
        <GlobalContext>
            <Route />
        </GlobalContext>
    );
}

export default App;
