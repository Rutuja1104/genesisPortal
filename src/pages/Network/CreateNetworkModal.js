import React, { useContext, useState } from "react";
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBInput, MDBSpinner, MDBCheckbox } from "mdb-react-ui-kit";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createNetworkSchema } from "../../libs/utility/validators/networkFormValidator";
import NetworkDataService from "../../services/NetworkDataService";
import { toast } from "react-toastify";
import { Label, Input } from "reactstrap";
import OrgMadatoryTable from "../AdditionalTables/OrgMadatoryTable";
import OrganizationDataService from "../../services/OrganizationDataService";
import { ROLES } from "../../libs/constant";
import { globalContext } from "../../global-context/GlobalContext";
import General from "../../libs/utility/General";
import CommandTable from "../AdditionalTables/CommandTable";

export default function CreateNetworkModal({ networks, toggle, setIsToggle, handleToggle, selectedRow }) {
  const [isLoading, setIsLoading] = useState(false);
  const [orgAdditionalFields, setOrgAdditionalFields] = useState([]);
  const [additionalFields, setAdditionalFields] = useState(selectedRow?.orgAdditionalFields?.length > 0);
  const [commandsCheckbox, setCommandsCheckbox] = useState(selectedRow?.commands?.length > 0);
  const [commands, setCommands] = useState(selectedRow?.commands);
  const context = useContext(globalContext);
  const { setNetworks } = context;
  const formValue = {
    networkName: selectedRow?.networkName,
    customerAppIntegrationType: selectedRow?.customerAppIntegrationType,
    description: selectedRow?.description,
    baseUrls: selectedRow?.baseUrls ? JSON.stringify(selectedRow?.baseUrls).split(".")[0] : "",
    orgAdditionalFields: selectedRow?.orgAdditionalFields,
    createdAt: selectedRow?.createdAt,
    updatedAt: selectedRow?.updatedAt,
  };
  const handleCreateNetwork = async (values, { resetForm }) => {
    setIsLoading(true);
    let response;
    const data = {
      networkName: General?.sanitizeInput(values?.networkName),
      customerAppIntegrationType: values?.customerAppIntegrationType,
      description: General?.sanitizeInput(values?.description) || undefined,
      commands: commands,
    };
    let orgArray = [];
    if (orgAdditionalFields.length > 0) {
      let filteredArray = orgAdditionalFields?.filter((item) => item.title !== "" && item.key !== "" && item.type !== "" && item.justification !== "");
      orgArray = filteredArray?.map((obj) => {
        const { id, ...rest } = obj;
        return rest;
      });
    }
    data.orgAdditionalFields = orgArray;

    if (selectedRow) {
      response = await NetworkDataService.updateNetworkDetails({
        networkId: selectedRow.networkId,
        ...data,
      });
    } else {
      const baseUrl = values?.baseUrls ? values?.baseUrls + ".insiteflow.com" : undefined;
      data.baseUrl = baseUrl;
      response = await NetworkDataService.createNetwork(data);
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
      if (!selectedRow) {
        const orgBody = {
          organizationName: `${data.networkName} organization`,
          networkId: response.data.body.networkId,
          organizationType: "customer",
        };
        const orgResponse = OrganizationDataService.createOrganization(orgBody);
        if (orgResponse.status) {
          toast.success(orgResponse.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          console.log("Organization created successfully ");
        } else {
          toast.error(orgResponse.error, {
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
      const networkResp = await NetworkDataService.getAllNetworks();
      if (networkResp.status) {
        const role = General.getUserRole();
        role === ROLES.SUPER_ADMIN ? setNetworks(networkResp?.data?.body?.networks) : setNetworks([networkResp?.data?.body]);
      }
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
    resetForm();
    handleToggle(true);
  };

  return (
    <MDBModal open={toggle} setOpen={setIsToggle} tabIndex="-1">
      <MDBModalDialog size="xl">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle> {selectedRow ? "Update Network" : "Create Network"}</MDBModalTitle>
            <MDBBtn className="btn-close" color="none" onClick={() => handleToggle(false)}></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <Formik initialValues={formValue} validationSchema={createNetworkSchema} onSubmit={handleCreateNetwork}>
              {({ isSubmitting, handleSubmit }) => (
                <Form autoComplete="off" onSubmit={handleSubmit} className="row">
                  <div className="row" style={{ paddingRight: "0rem" }}>
                    <div className="col" style={{ paddingRight: "0rem" }}>
                      <Field name="networkName">
                        {({ field }) => (
                          <div className="mb-4">
                            <Label>
                              Network name <span className="text-danger">* </span>
                            </Label>
                            <MDBInput {...field} type="text" />
                            <ErrorMessage name="networkName" component="div" className="text-danger text-sm" />
                          </div>
                        )}
                      </Field>
                      {selectedRow?.baseUrls && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Label className="m-0">Base Urls</Label>
                          <input type="checkbox" name="baseUrls" checked={true} disabled={true} style={{ height: "20px", width: "20px" }} />
                        </div>
                      )}
                    </div>
                    <div className="col" style={{ paddingRight: "0rem" }}>
                      <Field name="customerAppIntegrationType">
                        {({ field }) => (
                          <div className="mb-4">
                            <Label>
                              Customer app integration type <span className="text-danger">* </span>
                            </Label>
                            <Input {...field} type="select" required>
                              <option value="" disabled selected>
                                Select Network
                              </option>
                              <option key="Customer Hosted App" value="customerHostedApp">
                                Customer Hosted App
                              </option>
                              <option value="insiteflowHostedApp">Insiteflow Hosted App </option>
                            </Input>
                            <ErrorMessage name="customerAppIntegrationType" component="div" className="text-danger text-sm" />
                          </div>
                        )}
                      </Field>
                    </div>
                    <div className="col" style={{ paddingRight: "0rem" }}>
                      <Field name="description">
                        {({ field }) => (
                          <div className="mb-4">
                            <Label>Description</Label>
                            <MDBInput {...field} type="text" label="" />
                            <ErrorMessage name="description" component="div" className="text-danger text-sm" />
                          </div>
                        )}
                      </Field>
                    </div>
                  </div>
                  {selectedRow ? (
                    <div className="row" style={{ paddingRight: "0rem" }}>
                      <div className="col" style={{ paddingRight: "0rem" }}>
                        <Field name="createdAt">
                          {({ field }) => (
                            <div className="mb-4">
                              <Label>Created At</Label>
                              <MDBInput {...field} type="text" label="" disabled value={General.formatDate(selectedRow?.createdAt)} />
                            </div>
                          )}
                        </Field>
                      </div>
                      <div className="col" style={{ paddingRight: "0rem" }}>
                        <Field name="updatedAt">
                          {({ field }) => (
                            <div className="mb-4">
                              <Label>Updated At</Label>
                              <MDBInput {...field} type="text" label="" disabled value={General.formatDate(selectedRow?.updatedAt)} />
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="row" style={{ paddingRight: "0rem" }}>
                    <div className="col" style={{ paddingRight: "0rem" }}>
                      <MDBCheckbox name="flexCheck" label="Additional fields" className="mb-4" checked={additionalFields} onChange={(e) => setAdditionalFields(e.target.checked)} />
                      <div className={additionalFields ? "" : "d-none"}>
                        <Field name="orgAdditionalFields">
                          {({ field }) => (
                            <div className="mb-4">
                              <OrgMadatoryTable orgAdditionalFields={selectedRow?.orgAdditionalFields} networks={networks} setorgAdditionalFields={setOrgAdditionalFields} />
                              <ErrorMessage name="orgAdditionalFields" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ paddingRight: "0rem" }}>
                    <div className="col" style={{ paddingRight: "0rem" }}>
                      <MDBCheckbox name="flexCheck" label="Commands" className="mb-4" checked={commandsCheckbox} onChange={(e) => setCommandsCheckbox(e.target.checked)} />
                      <div className={commandsCheckbox ? "" : "d-none"}>
                        {/* <Field name="commands">
                          {({ field }) => (
                            <div className="mb-4">
                              <CommandTable commands={commands} setCommands={setCommands} />
                              <ErrorMessage name="commands" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    {isLoading ? (
                      <MDBSpinner color="primary" className="my-2" />
                    ) : (
                      <MDBBtn type="submit" className="d-flex my-2 justify-content-center" disabled={isSubmitting}>
                        {selectedRow ? "Update" : "Create"}
                      </MDBBtn>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </MDBModalBody>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}
