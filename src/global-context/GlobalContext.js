import React, { useState, createContext } from "react";
export const globalContext = createContext();

function GlobalContext({ children }) {
    const [networks, setNetworks] = useState([]);
    const [selectedNetwork, setSelectedNetwork] = useState("");
    const [userData, setUserData] = useState("");
    const [activeTab, setActiveTab] = useState("");
    const [searchableProps, setSearchableProps] = useState({});

    return (
        <globalContext.Provider
            value={{
                networks,
                setNetworks,
                selectedNetwork,
                setSelectedNetwork,
                userData,
                setUserData,
                setActiveTab,
                activeTab,
                searchableProps,
                setSearchableProps,
            }}
        >
            {children}
        </globalContext.Provider>
    );
}

export default GlobalContext;
