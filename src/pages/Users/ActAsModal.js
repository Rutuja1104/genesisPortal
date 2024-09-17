import React, { useContext, useEffect, useState } from "react";
import { useDescope } from "@descope/react-sdk";
import { useNavigate } from "react-router-dom";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBInput,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { FormGroup, Input, Label } from "reactstrap";
import { ROLES } from "../../libs/constant";
import { Field, Form, Formik } from "formik";
import UsersDataService from "../../services/utils/UsersDataService";
import { toast } from "react-toastify";
import { globalContext } from "../../global-context/GlobalContext";
import OrganizationDataService from "../../services/OrganizationDataService";
import General from "../../libs/utility/General";
import { getSessionToken } from "@descope/react-sdk";
function ActAsModal({ toggle, handleToggle }) {
  const [updateLoading, setIsupdateLoading] = useState(false);
  const context = useContext(globalContext);
  const { userData, networks } = context;
  const [actAs, setActAs] = useState(userData?.type);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedNet, setSelectedNet] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const token = getSessionToken();
  const navigate = useNavigate();
  const { logout } = useDescope();
  const userRole = General.tokenDecode(token)?.roles?.[0];
  console.log("user data is ", userData);
  const [formValues] = useState({
    network: userData?.networkId,
    organization: userData?.networkId,
    email: userData?.email || userData?.userName,
    actAs: userData?.type,
  });

  const handleActAsUser = async (submittedData, { resetForm }) => {
    setIsupdateLoading(true);
    const body = {
      organizationId: selectedOrg,
      networkId: selectedNet,
      email: userData?.email || userData?.userName,
      role: actAs,
      displayName: userData?.name,
    };
    let response = await UsersDataService.updateActAs(body);
    if (response?.status) {
      toast.success(`Act as role updated, Please login again !`);
      handleToggle(false, true);
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } else {
      toast.error(response?.error);
      handleToggle(false, false);
    }
    setIsupdateLoading(false);
    resetForm();
  };

  useEffect(() => {
    if (selectedNet || userRole !== ROLES.SUPER_ADMIN) {
      fetchOrgData({
        networkId: selectedNet || networks[0]?.networkId,
      });
    }
  }, [selectedNet]);

  const fetchOrgData = async (params) => {
    setIsOrgLoading(true);
    try {
      const organizations = await OrganizationDataService.getAllOrganization({
        body: params,
      });
      setOrganizations(organizations?.data?.body?.network?.organizations);
      setIsOrgLoading(false);
    } catch (err) {
      setIsOrgLoading(false);
      console.log(err);
    }
  };

  return (
    <div>
      <MDBModal open={toggle} onClose={() => handleToggle()} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>Act as user</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => handleToggle()}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <Formik initialValues={formValues} onSubmit={handleActAsUser}>
                {({ isSubmitting, handleSubmit }) => (
                  <Form autoComplete="off" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <Field name="network">
                          {(field) => (
                            <div className="mb-4">
                              <Label>
                                {" "}
                                Network <span className="text-danger">* </span>
                              </Label>
                              <Input
                                id="networkId"
                                name="networkId"
                                type="select"
                                value={selectedNet}
                                onChange={(e) => setSelectedNet(e.target.value)}
                              >
                                {networks.length === 1 ? (
                                  <option
                                    key={networks[0]?.networkId}
                                    value={networks[0]?.networkId}
                                    selected
                                  >
                                    {networks[0]?.networkName}
                                  </option>
                                ) : (
                                  <>
                                    <option value="" disabled selected>
                                      Select Network
                                    </option>
                                    {networks?.map((network) => (
                                      <option
                                        key={network?.networkId}
                                        value={network?.networkId}
                                      >
                                        {network?.networkName}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </Input>
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col-md-6">
                        {isOrgLoading ? (
                          <MDBSpinner color="primary" className="mt-5" />
                        ) : (
                          <Field name="organization">
                            {({ field }) => (
                              <div>
                                <Label>
                                  {" "}
                                  Organization{" "}
                                  <span className="text-danger">* </span>
                                </Label>
                                <Input
                                  id="organization"
                                  name="organization"
                                  type="select"
                                  value={selectedOrg}
                                  onChange={(e) =>
                                    setSelectedOrg(e.target.value)
                                  }
                                >
                                  <>
                                    <option value="" disabled selected>
                                      Select Organization
                                    </option>
                                    {organizations?.map(
                                      (org) =>
                                        org.organizationType === "customer" && (
                                          <option
                                            key={org?.organizationId}
                                            value={org?.organizationId}
                                          >
                                            {org?.organizationName}
                                          </option>
                                        )
                                    )}
                                  </>
                                </Input>
                              </div>
                            )}
                          </Field>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <Field name="email">
                          {({ field }) => (
                            <div className="mb-4">
                              <FormGroup>
                                <Label>Email</Label>
                                <MDBInput
                                  {...field}
                                  id="email"
                                  name="email"
                                  disabled
                                />
                              </FormGroup>
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col-md-6">
                        <Field name="actAs">
                          {({ field }) => (
                            <div className="mb-4">
                              <FormGroup>
                                <Label>Act as</Label>
                                <Input
                                  {...field}
                                  id="actAs"
                                  name="actAs"
                                  type="select"
                                  value={actAs}
                                  onChange={(e) => setActAs(e.target.value)}
                                >
                                  {}
                                  <option
                                    key={"super-admin"}
                                    value={"super-admin"}
                                  >
                                    Super admin
                                  </option>
                                  <option key={"admin"} value={"admin"}>
                                    Admin{" "}
                                  </option>
                                  <option
                                    key={"practice manager"}
                                    value={"practice manager"}
                                  >
                                    Practice Manager{" "}
                                  </option>{" "}
                                </Input>
                              </FormGroup>
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                    <div>
                      {updateLoading ? (
                        <MDBSpinner color="primary" />
                      ) : (
                        <div className="d-flex">
                          <MDBBtn
                            type="submit"
                            className="my-2 justify-content-center"
                            disabled={isSubmitting}
                          >
                            Update
                          </MDBBtn>
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

export default ActAsModal;
