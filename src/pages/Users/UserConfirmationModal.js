import React from "react";
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter } from "mdb-react-ui-kit";
function UserConfirmationMdoal({ open, toggle, handleConfirmation, title, description }) {
  return (
    <MDBModal open={open} onClose={toggle} tabIndex="-1" backdrop={false} keyboard={false}>
      <MDBModalDialog>
        <MDBModalContent>
          <form>
            <MDBModalHeader>
              <MDBModalTitle>{title}</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={toggle}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <span>{description}</span>
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" type="reset" onClick={toggle}>
                No
              </MDBBtn>
              <MDBBtn
                color="primary"
                type="button"
                onClick={() => {
                  handleConfirmation();
                  toggle();
                }}
              >
                Yes
              </MDBBtn>
            </MDBModalFooter>
          </form>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default UserConfirmationMdoal;
