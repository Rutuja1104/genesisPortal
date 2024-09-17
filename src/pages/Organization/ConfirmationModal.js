import React, { useState } from "react";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import { Input } from "reactstrap";
function ConfirmationModal({ open, toggle, handleDeactivateOrg }) {
  const [deactivationReason, setDeactivationReason] = useState();
  const handleSiteDeactivation = () => {
    if (!deactivationReason) {
      return false;
    } else {
      handleDeactivateOrg(deactivationReason);
    }
  };
  return (
    <MDBModal
      open={open}
      onClose={toggle}
      tabIndex="-1"
      backdrop={false}
      keyboard={false}
    >
      <MDBModalDialog>
        <MDBModalContent>
          <form>
            <MDBModalHeader>
              <MDBModalTitle>Deactivate Organization </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={toggle}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <span>
                Are you sure you want to deactivate this organization ?
              </span>
              <Input
                type="textarea"
                name="deactivationReason"
                placeholder="Add the reason *"
                value={deactivationReason}
                pattern="\S(.*\S)?"
                onChange={(e) => setDeactivationReason(e.target.value)}
                required
              />
            </MDBModalBody>
            <MDBModalFooter>
              <MDBBtn color="secondary" type="reset" onClick={toggle}>
                No
              </MDBBtn>
              <MDBBtn type="submit" onClick={handleSiteDeactivation}>
                Yes
              </MDBBtn>
            </MDBModalFooter>
          </form>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default ConfirmationModal;
