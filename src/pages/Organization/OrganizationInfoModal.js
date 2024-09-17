import React, { useState, useEffect } from "react";
import { Label } from "reactstrap";
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalBody, MDBSpinner, MDBInput, MDBTabs, MDBTabsItem, MDBTabsLink } from "mdb-react-ui-kit";
import { Formik, Form, Field } from "formik";
import { createOrgSchema, updateOrgSchema } from "../../libs/utility/validators/organizationFormValidator";
import OrganizationDataService from "../../services/OrganizationDataService";
import { toast } from "react-toastify";
import CustomeField from "./CustomeField";
import General from "../../libs/utility/General";
import ConfirmationModal from "./ConfirmationModal";
import "react-tooltip/dist/react-tooltip.css";
import OrganizationConfig from "./OrganizationConfig";
import SiteStatus from "./SiteStatus";
import { ROLES } from "../../libs/constant";
import Files from "../Files/Files";
import Commands from "./Commands";

export default function OrganizationInfoModal({ toggle, setIsToggle, handleToggle, networks, selectedRow, defaultNetwork }) {
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmationModal, setConfirmationModal] = useState(false);
  const networkOrgAdditionalField = networks.filter((element) => defaultNetwork === element.networkId);
  const [organizationInfo, setOrganizationInfo] = useState();
  const [orgSiteTab, setOrgSiteTab] = useState("orgInfo");
  const [siteStatusData, setSiteStatusData] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [siteStatusLoading, setSiteStatusLoading] = useState(false);
  const [siteConfigData, setSiteConfigData] = useState({});
  const [customerAppIntegrationType, setCustomerAppIntegrationType] = useState();
  let siteStatus = "IN PROGRESS";
  const userRole = General.getUserRole();

  useEffect(() => {
    getSiteStatus();
  }, [selectedRow]);

  const getSiteStatus = async () => {
    if (selectedRow?.siteKey || selectedRow?.accountKey) {
      setSiteStatusLoading(true);
      const params = {};
      if (selectedRow?.siteKey) params.siteKey = selectedRow?.siteKey;
      if (selectedRow?.accountKey) params.accountKey = selectedRow?.accountKey;
      try {
        let response = await OrganizationDataService.getSiteStatus(params);
        if (response?.data?.body) {
          setSiteStatusData(response?.data?.body);
        } else {
          setErrorMessage(response?.error);
          setSiteStatusData({});
        }
      } catch (err) {
        toast.error(err);
        console.log(err);
      } finally {
        setSiteStatusLoading(false);
      }
    } else {
      setErrorMessage("No Site key or account key found");
    }
  };

  const getOrganizationInfo = async () => {
    setIsInfoLoading(true);
    const params = {
      networkId: defaultNetwork,
      organizationId: selectedRow.organizationId,
    };
    const organizationInfoResp = await OrganizationDataService.getOrganizationInformation({
      body: params,
    });
    if (organizationInfoResp.status && organizationInfoResp?.data?.body?.network?.organization) {
      setOrganizationInfo(organizationInfoResp.data.body.network.organization);
      setCustomerAppIntegrationType(organizationInfoResp.data.body.network?.customerAppIntegrationType);
    }
    setIsInfoLoading(false);
  };

  useEffect(() => {
    if (selectedRow) {
      getOrganizationInfo();
    }
  }, [selectedRow]);

  if (selectedRow?.activationStatus === "COMPLETE" && selectedRow?.deactivationStatus === "COMPLETE") {
    siteStatus = "Activate";
  } else if (selectedRow?.activationStatus === "COMPLETE" || selectedRow?.deactivationStatus === "ERROR") {
    siteStatus = "Deactivate";
  } else if (selectedRow?.deactivationStatus === "COMPLETE" || selectedRow?.activationStatus === "ERROR") {
    siteStatus = "Activate";
  }

  const orgAdditionalFields = networkOrgAdditionalField[0]?.orgAdditionalFields;
  const keys = {};
  const isUpdate = !!selectedRow;
  let formValues = {};
  if (networkOrgAdditionalField) {
    networkOrgAdditionalField[0]?.orgAdditionalFields.map((element) => {
      return (keys[element.key] = "");
    });
    formValues = {
      ...organizationInfo,
      ...keys,
    };
  }
  const handleFieldUpdate = (fieldName, fieldValue) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: fieldValue,
    }));
  };

  const handleCreateOrg = async (submittedData, { resetForm } = {}) => {
    setIsLoading(true);
    let parsedBody = {
      notificationLogo: General?.sanitizeInput(submittedData?.notificationLogo) || undefined,
      brandingLogo: General?.sanitizeInput(submittedData?.brandingLogo) || undefined,
      siteKey: General?.sanitizeInput(submittedData?.siteKey) || General?.sanitizeInput(selectedRow?.siteKey) || General?.sanitizeInput(formData?.siteKey),
      accountKey: General?.sanitizeInput(submittedData?.accountKey) || General?.sanitizeInput(selectedRow?.accountKey) || General?.sanitizeInput(formData?.accountKey),
      organizationName: General?.sanitizeInput(submittedData?.organizationName) || General?.sanitizeInput(formData?.organizationName),
    };
    let response;
    if (isUpdate) {
      let data = {};
      Object.entries(formData).forEach(([key, value]) => {
        const test = General?.sanitizeInput(value);
        if (Array.isArray(value) && typeof value[0] === "object") {
          const values = value.map((obj) => obj.value);
          data[key] = values.join(",");
        } else if (typeof value === "object") {
          data[key] = value?.value;
        } else {
          data[key] = General?.sanitizeInput(value);
        }
      });
      response = await OrganizationDataService.updateOrganization({
        organizationId: selectedRow.organizationId,
        ...parsedBody,
        orgAdditionalFields: data,
        config: { ...siteConfigData },
      });
    } else {
      let data = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (["accountKey", "organizationName", "siteKey"].includes(key)) return;
        if (Array.isArray(value) && typeof value[0] === "object") {
          const values = value.map((obj) => obj.value);
          data[key] = values.join(",");
        } else if (typeof value === "object") {
          data[key] = value?.value;
        } else {
          data[key] = General?.sanitizeInput(value);
        }
      });
      const body = {
        networkId: defaultNetwork,
        organizationType: "client",
        ...parsedBody,
        orgAdditionalFields: data,
      };
      response = await OrganizationDataService.createOrganization(body);
    }
    if (response.status) {
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.error(response.error, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setIsLoading(false);
    handleToggle(true, true);
    if (orgSiteTab === "orgInfo") {
      resetForm();
    }
  };

  const handleSiteStatusUpdate = async (reason) => {
    setIsLoadingStatus(true);
    if (selectedRow?.siteKey || selectedRow?.accountKey) {
      const params = {};
      if (selectedRow?.siteKey) params.siteKey = selectedRow.siteKey;
      if (selectedRow?.accountKey) params.accountKey = selectedRow.accountKey;
      if (siteStatus === "Deactivate") params.activate = false;
      if (siteStatus === "Activate") params.activate = true;
      params.deactivationReason = reason || undefined;
      const response = await OrganizationDataService.activeDeactiveSite(params);
      if (response.status) {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(response.error, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
    setIsLoadingStatus(false);
    handleToggle(true, true);
  };

  const handleDeactivateOrg = (deactivationReason) => {
    setConfirmationModal(false);
    handleSiteStatusUpdate(deactivationReason);
    handleToggle(true);
  };

  return (
    <>
      <MDBModal open={toggle} setOpen={setIsToggle} tabIndex="-1">
        <MDBModalDialog size="xl" data-backdrop="static" data-keyboard="false" style={{ marginLeft: "8%" }}>
          <MDBModalContent style={{ width: "137%" }}>
            <MDBModalHeader className="pb-0">
              <MDBTabs className="mb-3">
                <MDBTabsItem>
                  <MDBTabsLink onClick={() => setOrgSiteTab("orgInfo")} active={orgSiteTab === "orgInfo"}>
                    {selectedRow ? "Organization Info" : "Create Organization"}{" "}
                  </MDBTabsLink>
                </MDBTabsItem>
                {selectedRow ? (
                  <>
                    <MDBTabsItem>
                      <MDBTabsLink onClick={() => setOrgSiteTab("siteConfig")} active={orgSiteTab === "siteConfig"}>
                        config
                      </MDBTabsLink>
                    </MDBTabsItem>
                    <MDBTabsItem>
                      <MDBTabsLink onClick={() => setOrgSiteTab("viewStatus")} active={orgSiteTab === "viewStatus"}>
                        status
                      </MDBTabsLink>
                    </MDBTabsItem>
                    {/* <MDBTabsItem>
                      <MDBTabsLink onClick={() => setOrgSiteTab("commands")} active={orgSiteTab === "commands"}>
                        Commands
                      </MDBTabsLink>
                    </MDBTabsItem> */}
                  </>
                ) : (
                  ""
                )}
              </MDBTabs>
              <MDBBtn className="btn-close" color="none" onClick={() => handleToggle(false)}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody style={{ height: "fit-content" }}>
              <div>
                {isUpdate && isInfoLoading ? (
                  <MDBSpinner color="primary" className="my-2" />
                ) : (
                  <Formik initialValues={formValues} validationSchema={organizationInfo ? updateOrgSchema : createOrgSchema} onSubmit={handleCreateOrg}>
                    {({ isSubmitting, handleSubmit }) => (
                      <Form autoComplete="off" style={{ height: "100%" }} onSubmit={handleSubmit}>
                        {orgSiteTab === "orgInfo" ? (
                          <div className="row" style={{ maxHeight: "90%", overflowX: "scroll" }}>
                            {orgAdditionalFields?.length
                              ? orgAdditionalFields?.map((fieldData) => {
                                  if (organizationInfo?.organizationType === "customer" && !["organizationName"].includes(fieldData?.key)) {
                                    return null;
                                  }
                                  return (
                                    <div className="col-md-6" key={fieldData.key}>
                                      <Field name={fieldData.key}>
                                        {({ field }) => (
                                          <div className="mb-4">
                                            <CustomeField
                                              config={fieldData}
                                              defaultValue={organizationInfo?.orgAdditionalFields?.[fieldData?.key] || organizationInfo?.[fieldData?.key]}
                                              onUpdate={handleFieldUpdate}
                                              {...field}
                                              selectedRow={organizationInfo}
                                            />
                                          </div>
                                        )}
                                      </Field>
                                    </div>
                                  );
                                })
                              : ""}

                            {organizationInfo ? (
                              <>
                                <div className="col-md-6">
                                  <Field name="createdAt">
                                    {({ field }) => (
                                      <div className="mb-4">
                                        <Label>Created At</Label>
                                        <MDBInput {...field} type="text" disabled value={General.formatDate(organizationInfo?.createdAt)} />
                                      </div>
                                    )}
                                  </Field>
                                </div>
                                <div className="col-md-6">
                                  <Field name="updatedAt">
                                    {({ field }) => (
                                      <div className="mb-4">
                                        <Label>Updated At</Label>
                                        <MDBInput {...field} type="text" disabled value={General.formatDate(organizationInfo?.updatedAt)} />
                                      </div>
                                    )}
                                  </Field>
                                </div>
                                <div className="col-md-6">
                                  {organizationInfo && organizationInfo.deactivationReason !== null ? (
                                    <Field name="deactivationReason">
                                      {({ field }) => (
                                        <div className="mb-4">
                                          <Label>Deactivation reason</Label>
                                          <MDBInput {...field} type="textarea" disabled value={organizationInfo?.deactivationReason} />
                                        </div>
                                      )}
                                    </Field>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </>
                            ) : (
                              ""
                            )}
                            <div>
                              <div className="d-flex justify-content-between">
                                {isLoading ? (
                                  <MDBSpinner color="primary" className="my-2" />
                                ) : (
                                  (siteStatus === "Deactivate" || !organizationInfo || organizationInfo?.organizationType === "customer") && (
                                    <MDBBtn type="submit" className="m-2" disabled={isSubmitting || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole)}>
                                      {organizationInfo ? "Update" : "Create"}
                                    </MDBBtn>
                                  )
                                )}
                                {organizationInfo ? (
                                  <>
                                    {isLoadingStatus ? (
                                      <MDBSpinner color="primary" className="my-2" />
                                    ) : (
                                      siteStatus !== "IN PROGRESS" && (
                                        <MDBBtn
                                          type="button"
                                          className={`m-2 ms-auto ${siteStatus === "Deactivate" ? "btn-danger" : ""}`}
                                          onClick={() => {
                                            siteStatus === "Deactivate" ? setConfirmationModal(true) : handleSiteStatusUpdate();
                                          }}
                                        >
                                          {siteStatus}
                                        </MDBBtn>
                                      )
                                    )}
                                  </>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          orgSiteTab === "siteConfig" && (
                            <OrganizationConfig
                              organizationInfo={organizationInfo}
                              handleCreateOrg={handleCreateOrg}
                              setSiteConfigData={setSiteConfigData}
                              siteConfigData={siteConfigData}
                              isLoading={isLoading}
                              customerAppIntegrationType={customerAppIntegrationType}
                              defaultNetwork={defaultNetwork}
                              handleToggle={handleToggle}
                            ></OrganizationConfig>
                          )
                        )}
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
              {orgSiteTab === "viewStatus" && <SiteStatus siteStatusData={siteStatusData} siteStatusLoading={siteStatusLoading} errorMessage={errorMessage} />}
              {/* {orgSiteTab === "commands" && <Commands commands={networkOrgAdditionalField[0]?.commands} />} */}
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      {confirmationModal && <ConfirmationModal open={confirmationModal} toggle={() => setConfirmationModal(!confirmationModal)} handleDeactivateOrg={handleDeactivateOrg} />}
    </>
  );
}
