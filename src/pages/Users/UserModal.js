import React, { useState } from "react";
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBInput, MDBSpinner } from "mdb-react-ui-kit";
import { FormGroup, Input, Label } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { createUserSchema } from "../../libs/utility/validators/userValidationSchema";
import UsersDataService from "../../services/utils/UsersDataService";
import { toast } from "react-toastify";
import { ROLES } from "../../libs/constant";
import General from "../../libs/utility/General";
import { trackEvents } from "../../libs/utility/mixpanelHelper";
import UserConfirmationMdoal from "./UserConfirmationModal";

function UserModal({ toggle, handleToggle, selectedOrg, selectedUser }) {
  const [createLoading, setCreateLoading] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

  const [formValues] = useState({
    firstName: selectedUser?.firstName,
    lastName: selectedUser?.lastName,
    userName: selectedUser?.userName,
    type: selectedUser?.type,
    displayName: selectedUser?.displayName,
  });
  const token = General.getToken();
  const decodedData = General.tokenDecode(token);
  const userRole = General.getUserRole();
  const currentUserDescopeId = decodedData.sub;
  const updatePermission = selectedUser
    ? !(userRole === ROLES.SUPER_ADMIN || (userRole === ROLES.ADMIN && (selectedUser.type === ROLES.ADMIN || selectedUser.type === ROLES.PRACTICE_MANAGER || selectedUser.type === ROLES.CLIENT)))
    : false;

  const handleCreateUpdateUser = async (submittedData, { resetForm }) => {
    setCreateLoading(true);
    const body = {
      organizationId: submittedData.type !== ROLES.SUPER_ADMIN ? selectedOrg : undefined,
      firstName: General?.sanitizeInput(submittedData?.firstName) || undefined,
      lastName: General?.sanitizeInput(submittedData.lastName) || undefined,
      type: General?.sanitizeInput(submittedData.type) || undefined,
      userName: General?.sanitizeInput(submittedData?.userName) || undefined,
      displayName: General?.sanitizeInput(submittedData?.displayName) || undefined,
    };
    let response;
    if (selectedUser) {
      const { firstName, lastName, displayName } = body;
      response = await UsersDataService.updateUser({
        descopeUserId: selectedUser?.descopeUserId,
        descopeUserId: selectedUser?.descopeUserId,
        firstName,
        lastName,
        displayName,
      });
    } else {
      response = await UsersDataService.createUser(body);
    }

    if (response?.status) {
      toast.success(`User ${selectedUser ? "updated" : "created"} successfully !`);
      handleToggle(false, true);
    } else {
      toast.error(response?.error);
      handleToggle(false, false);
    }
    setCreateLoading(false);
    resetForm();
  };

  const showConfirmationModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedUser.isActive) {
      setOpenConfirmationModal(true);
    } else {
      activateDeactivateUser();
    }
  };

  const activateDeactivateUser = async () => {
    console.log(selectedUser);
    const body = {
      descopeUserId: selectedUser.descopeUserId,
      userName: selectedUser.userName,
      isActive: !selectedUser.isActive,
    };
    const response = await UsersDataService.activateDeactivateUser(body);
    if (response?.status) {
      toast.success(`User ${selectedUser.isActive ? "Deactivated" : "Activated"} successfully !`);
      handleToggle(false, true);
    } else {
      toast.error(response?.error);
      handleToggle(false, false);
    }
    setCreateLoading(false);
  };

  const handleActAsUser = async (e) => {
    setCreateLoading(true);
    e.stopPropagation();
    e.preventDefault();
    const body = {
      descopeUserId: selectedUser.descopeUserId,
    };
    let response = await UsersDataService.updateActAs(body);
    if (response?.status) {
      toast.success(`Act as role updated !`);
      sessionStorage.setItem("actAsToken", response?.data?.body);
      window.location.reload();
      handleToggle(false, true);
    } else {
      toast.error(response?.error);
      handleToggle(false, false);
    }
    setCreateLoading(false);
  };

  return (
    <div>
      <MDBModal open={toggle} onClose={() => handleToggle()} tabIndex="-1">
        <MDBModalDialog size="lg">
          {openConfirmationModal && (
            <UserConfirmationMdoal
              open={openConfirmationModal}
              toggle={() => setOpenConfirmationModal(!openConfirmationModal)}
              handleConfirmation={activateDeactivateUser}
              title={"User Deactivation"}
              description={"Are you sure you want to deactivate this user ?"}
            />
          )}
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle> {selectedUser ? "Update User" : "Create User"}</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => handleToggle()}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <Formik initialValues={formValues} validationSchema={createUserSchema} onSubmit={handleCreateUpdateUser}>
                {({ isSubmitting, handleSubmit }) => (
                  <Form autoComplete="off" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <Field name="firstName">
                          {(field) => (
                            <div className="mb-4">
                              <Label>
                                {" "}
                                First Name <span className="text-danger">* </span>
                              </Label>
                              <MDBInput {...field.field} type="text" disabled={updatePermission} />
                              <ErrorMessage name="firstName" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col-md-6">
                        <Field name="lastName">
                          {({ field }) => (
                            <div className="mb-4">
                              <Label>
                                {" "}
                                Last Name <span className="text-danger">* </span>
                              </Label>
                              <MDBInput {...field} type="text" disabled={updatePermission} />
                              <ErrorMessage name="lastName" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col-md-6">
                        <Field name="displayName">
                          {({ field }) => (
                            <div className="mb-4">
                              <Label>
                                {" "}
                                Display Name <span className="text-danger">* </span>
                              </Label>
                              <MDBInput {...field} type="text" disabled={updatePermission} />
                              <ErrorMessage name="displayName" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col-md-6">
                        <Field name="userName">
                          {({ field }) => (
                            <div className="mb-4">
                              <Label>
                                {" "}
                                Email <span className="text-danger">* </span>
                              </Label>
                              <MDBInput {...field} type="text" disabled={!!selectedUser} />
                              <ErrorMessage name="userName" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col-md-6">
                        <Field name="type">
                          {({ field }) => (
                            <div className="mb-4">
                              <FormGroup>
                                <Label>
                                  Role <span className="text-danger">* </span>
                                </Label>
                                {selectedUser ? (
                                  <Input {...field} id="type" name="type" disabled />
                                ) : (
                                  <Input {...field} id="type" name="type" type="select">
                                    {}
                                    <option value="" disabled selected>
                                      Select Role
                                    </option>
                                    {(userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) && (
                                      <option key={"admin"} value={"admin"}>
                                        Admin{" "}
                                      </option>
                                    )}
                                    <option key={"practice manager"} value={"practice manager"}>
                                      Practice Manager{" "}
                                    </option>{" "}
                                    <option key={"client"} value={"client"}>
                                      Client{" "}
                                    </option>
                                    <option key={"provider"} value={"provider"}>
                                      Provider{" "}
                                    </option>
                                    <option key={"system"} value={"system"}>
                                      System{" "}
                                    </option>
                                  </Input>
                                )}
                                <ErrorMessage name="type" component="div" className="text-danger text-sm" />
                              </FormGroup>
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                    <div>
                      {createLoading ? (
                        <MDBSpinner color="primary" />
                      ) : (
                        <div className="d-flex justify-content-between">
                          <MDBBtn type="submit" className="my-2" disabled={isSubmitting || updatePermission || (selectedUser ? !selectedUser.isActive : false)}>
                            {selectedUser ? "Update" : "Create"}
                          </MDBBtn>
                          {selectedUser && (selectedUser.type === ROLES.SUPER_ADMIN ? userRole === ROLES.SUPER_ADMIN : [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(userRole)) && (
                            <>
                              {userRole === ROLES.SUPER_ADMIN && selectedUser.type === ROLES.ADMIN && (
                                <MDBBtn
                                  className={`m-2 btn-info`}
                                  disabled={isSubmitting || ((selectedUser ? !selectedUser.isActive : false) && userRole === ROLES.SUPER_ADMIN && selectedUser.type === ROLES.ADMIN)}
                                  onClick={(e) => {
                                    handleActAsUser(e);
                                  }}
                                >
                                  {`Act as ${selectedUser?.displayName}`}
                                </MDBBtn>
                              )}
                              <MDBBtn
                                className={`m-2 ${selectedUser?.isActive ? "btn-danger" : "btn-info"}`}
                                disabled={isSubmitting || selectedUser?.descopeUserId === currentUserDescopeId || updatePermission}
                                onClick={(e) => {
                                  showConfirmationModal(e);
                                  selectedUser?.isActive ? trackEvents("DEACTIVATE_USER_BUTTON_CLICKED", selectedUser) : trackEvents("ACTIVATE_USER_BUTTON_CLICKED", selectedUser);
                                }}
                              >
                                {selectedUser?.isActive ? "Deactivate" : "Activate"}
                              </MDBBtn>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
}

export default UserModal;
