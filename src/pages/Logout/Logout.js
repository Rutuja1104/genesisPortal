import React, { useState } from "react";
import { useDescope } from "@descope/react-sdk";

import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBSpinner,
  MDBFooter,
} from "mdb-react-ui-kit";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

const LogoutModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [toggle, setToggle] = useState(true);
    const navigate = useNavigate();
    const { logout } = useDescope();

    const handleToggle = async (networkName) => {
        setToggle(!toggle);
        navigate(-1);
    };

  const handleLogOut = useCallback(() => {
    setIsLoading(true);
    logout();
    sessionStorage.clear();
    navigate('/login');
  }, [logout]);

  return (
    <>
      {!isLoading ? (
        <MDBModal open={toggle} setOpen={setToggle} tabIndex="-1">
          <MDBModalDialog>
            {
              <MDBModalContent>
                <MDBModalHeader>
                  <MDBModalTitle className="LogoutTittle">Logout</MDBModalTitle>
                  <MDBBtn
                    className="btn-close"
                    color="none"
                    onClick={handleToggle}
                  ></MDBBtn>
                </MDBModalHeader>
                <MDBModalBody>
                  <p className="LogoutText">
                    Are sure do you want to log out ?
                  </p>
                </MDBModalBody>
                <MDBFooter>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-mdb-ripple-init
                      data-mdb-dismiss="modal"
                      onClick={handleToggle}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-mdb-ripple-init
                      onClick={handleLogOut}
                    >
                      Logout
                    </button>
                  </div>
                </MDBFooter>
              </MDBModalContent>
            }
          </MDBModalDialog>
        </MDBModal>
      ) : (
        <MDBSpinner color="primary" className="my-2" />
      )}
    </>
  );
};

export default LogoutModal;
