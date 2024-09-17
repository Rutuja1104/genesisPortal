import React, { useContext, useEffect } from "react";
import LoginDataService from "../services/LoginDataService";
import { globalContext } from "../global-context/GlobalContext";
import { ROLES } from "../libs/constant";
import UsersDataService from "../services/utils/UsersDataService";
import General from "../libs/utility/General";
import { toast } from "react-toastify";
const Header = () => {
  const context = useContext(globalContext);
  const { userData, setUserData } = context;
  const token = General.getToken();
  const userDataCurrent = General.tokenDecode(token);
  const returnToSuperAdmin = async () => {
    const body = {
      descopeUserId: userData.descopeUserId,
    };
    const response = await UsersDataService.updateActAs(body);
    if (response?.status) {
      toast.success(`Return to default role !`);
      sessionStorage.clear();
      window.location.reload();
    } else {
      toast.error(response?.error);
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const response = await LoginDataService.getUserId();
        if (response?.status) {
          setUserData(response.data.body);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  return (
    <header id="page-topbar">
      <nav>
        <div className="d-flex justify-content-between">
          <div className="container-fluid d-flex align-items-left fw-bold">{userData && `Hello, ${userData?.name ? userData?.name : userData?.displayName}`}</div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
