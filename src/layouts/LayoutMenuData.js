import React, { useContext, useEffect, useState } from "react";
import { CiLogout } from "react-icons/ci";
import { ROLES } from "../libs/constant";
import { FaNetworkWired, FaRegUser } from "react-icons/fa";
import { GiOrganigram } from "react-icons/gi";
import { BsFileEarmarkBarGraph } from "react-icons/bs";
import { globalContext } from "../global-context/GlobalContext";
import UsersDataService from "../services/utils/UsersDataService";
import { useNavigate } from "react-router-dom";
import { useDescope } from "@descope/react-sdk";
import General from "../libs/utility/General";
import metricsConfig from "../libs/metrics-config";
import { trackEvents } from "../libs/utility/mixpanelHelper";
import { IoExtensionPuzzleOutline, IoFolderOutline } from "react-icons/io5";
import { toast } from "react-toastify";
const NavData = () => {
  const [isDashboard, setIsDashboard] = useState(true);
  const [isNetwork, setIsNetwork] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [isMetrics, setIsMetrics] = useState(false);
  const [isCommands, setIsCommands] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [islogOut, setIslogOut] = useState(false);
  const [isReleases, setIsReleases] = useState(false);
  const [isFiles, setIsFiles] = useState(false);
  const [isCurrentState, setIsCurrentState] = useState("Organizations");
  const [metricsConfigItem, setMetricsConfigItem] = useState([]);
  const context = useContext(globalContext);
  const { setActiveTab, userData, setUserData } = context;
  const url = window.location.href;
  const activePath = url.split("/").pop();
  const { logout } = useDescope();
  const navigate = useNavigate();
  const token = General.getToken();
  const userDataCurrent = General.tokenDecode(token);
  const userRole = General.getUserRole();

  const returnToSuperAdmin = async () => {
    const body = {
      descopeUserId: userData.descopeUserId,
    };
    const response = await UsersDataService.updateActAs(body);
    if (response?.status) {
      toast.success(`Return to default role !`);
      trackEvents("RETURN_TO_DEFAULT_ROLE");
      sessionStorage.clear();
      window.location.reload();
    } else {
      toast.error(response?.error);
    }
  };
  useEffect(() => {
    const tab = activePath.charAt(0).toUpperCase() + activePath.slice(1);
    if (![ROLES.SUPER_ADMIN].includes(userRole) && ["Networks", "Releases", "Commands"].includes(tab)) {
      navigate("/unauthorized");
    } else {
      setActiveTab(tab);
    }
  }, [activePath]);

  useEffect(() => {
    if (isCurrentState !== "Networks") {
      setIsNetwork(false);
    }
    if (isCurrentState !== "Organizations") {
      setIsOrganization(false);
    }
    if (isCurrentState !== "Metrics") {
      setIsMetrics(false);
    }
    if (isCurrentState !== "Users") {
      setIsUser(false);
    }
    if (isCurrentState !== "Logout") {
      setIslogOut(false);
    }
    if (isCurrentState !== "Releases") {
      setIsReleases(false);
    }
    if (isCurrentState !== "Files") {
      setIsFiles(false);
    }
    if (isCurrentState !== "Commands") {
      setIsCommands(false);
    }
  }, [isDashboard, isNetwork, isCurrentState, islogOut, isReleases, isFiles]);

  const handleLogOut = () => {
    sessionStorage.clear();
    logout();
    navigate("/login");
  };

  const configureMetricsConfig = () => {
    const subItem = metricsConfig.map((config, index) => {
      return {
        id: config.key,
        label: config.key,
        link: `/metrics?id=${index}`,
        parentId: "Metrics",
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRACTICE_MANAGER],
        click: function () {
          setIsDashboard(!isMetrics);
          setIsCurrentState("Metrics");
        },
      };
    });
    setMetricsConfigItem(subItem);
  };

  useEffect(() => {
    let time = null;
    const logoutTime = 30 * 60 * 1000;
    const resetTimer = () => {
      clearTimeout(time);
      time = setTimeout(handleLogOut, logoutTime);
    };
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.ontouchstart = resetTimer;
    resetTimer();
    configureMetricsConfig();
  }, []);

  const logOutModule =
    userDataCurrent?.nsec?.defaultRole === ROLES.SUPER_ADMIN
      ? {
          id: "Return to super admin",
          label: "Return to super admin",
          icon: <CiLogout />,
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRACTICE_MANAGER],
          click: function () {
            returnToSuperAdmin();
          },
        }
      : {
          id: "Logout",
          label: "Logout",
          icon: <CiLogout />,
          link: "/logout",
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRACTICE_MANAGER],
          click: function () {
            trackEvents("LOGOUT_BUTTON_CLICKED");
            setIsDashboard(false);
            setIslogOut(true);
            setIsCurrentState("Logout");
          },
          stateVariables: islogOut,
        };

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "Networks",
      label: "Networks",
      icon: <FaNetworkWired />,
      link: "/networks",
      roles: [ROLES.SUPER_ADMIN],
      click: function () {
        trackEvents("NETWORKS_MODULE_OPENED");
        setIsDashboard(!isNetwork);
        setIsCurrentState("Networks");
      },
      stateVariables: isNetwork,
    },
    {
      id: "Organizations",
      label: "Organizations",
      icon: <GiOrganigram />,
      link: "/organizations",
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRACTICE_MANAGER],
      click: function () {
        trackEvents("ORGANIZATIONS_MODULE_OPENED");
        setIsDashboard(!isOrganization);
        setIsCurrentState("Organizations");
      },
      stateVariables: isOrganization,
    },
    // {
    //   id: "Commands",
    //   label: "Commands",
    //   icon: <IoExtensionPuzzleOutline />,
    //   link: "/commands",
    //   roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    //   click: function () {
    //     trackEvents("COMMANDS_MODULE_OPENED");
    //     setIsDashboard(!isCommands);
    //     setIsCurrentState("Commands");
    //   },
    //   stateVariables: isOrganization,
    // },
    // {
    //   id: "Metrics",
    //   label: "Metrics",
    //   icon: <BsFileEarmarkBarGraph />,
    //   roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRACTICE_MANAGER],
    //   click: function () {
    //     trackEvents("METRICS_MODULE_OPENED");
    //     setIsDashboard(!isMetrics);
    //     setIsCurrentState("Metrics");
    //   },
    //   subItems: metricsConfigItem,
    //   stateVariables: isMetrics,
    // },
    {
      id: "Files",
      label: "Files",
      icon: <IoFolderOutline />,
      link: "/files",
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
      click: function () {
        trackEvents("FILES_MODULE_OPENED");
        setIsDashboard(!isFiles);
        setIsCurrentState("Files");
      },
      stateVariables: isOrganization,
    },
    {
      id: "Users",
      label: "Users",
      icon: <FaRegUser />,
      link: "/users",
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRACTICE_MANAGER],
      click: function () {
        trackEvents("USERS_MODULE_OPENED");
        setIsDashboard(!isUser);
        setIsCurrentState("Users");
      },
      stateVariables: isUser,
    },
    logOutModule,
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default NavData;
