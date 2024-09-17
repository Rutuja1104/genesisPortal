import React from "react";
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
function DeleteConfirmationModal({ open, toggle }) {
	return (
		<MDBModal open={open} onClose={() => toggle(false)} tabIndex="-1" backdrop={false} keyboard={false}>
			<MDBModalDialog>
				<MDBModalContent>
					<form>
						<MDBModalHeader>
							<MDBModalTitle>Remove Field </MDBModalTitle>
							<MDBBtn className="btn-close" color="none" onClick={() => toggle(false)}></MDBBtn>
						</MDBModalHeader>
						<MDBModalBody>
							<span>Are you sure want to remove this field ?</span>
						</MDBModalBody>
						<MDBModalFooter>
							<MDBBtn className="btn btn-secondary" type="reset" onClick={() => toggle(false)}>
								No
							</MDBBtn>
							<MDBBtn type="submit" className="btn btn-primary" onClick={() => toggle(true)}>
								Yes
							</MDBBtn>
						</MDBModalFooter>
					</form>
				</MDBModalContent>
			</MDBModalDialog>
		</MDBModal>
	);
}

export default DeleteConfirmationModal;
