import React, { useState } from "react";
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBModalFooter } from "mdb-react-ui-kit";
function DeleteConfirmationModal({ open, toggle, deleteData, deleteFunction }) {
  return (
    <MDBModal open={open} onClose={toggle} tabIndex="-1" backdrop={false} keyboard={false}>
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Delete File</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={toggle}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <span>
              Are you sure you want to permanently delete <b>{deleteData?.name}</b> ?
            </span>
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color="secondary" onClick={toggle}>
              No
            </MDBBtn>
            <MDBBtn onClick={() => deleteFunction()}>Yes</MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default DeleteConfirmationModal;
