import React, { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import { MDBBtn, MDBSwitch, MDBTable, MDBTableBody, MDBSpinner } from "mdb-react-ui-kit";
import CustomeField from "./CustomeField";
import SiteConfigConfirmation from "./SiteConfigConfirmation";
import OrganizationDataService from "../../services/OrganizationDataService";
import ContainerConfig from "./ContainerConfig";
import { toast } from "react-toastify";

export default function OrganizationConfig({
    organizationInfo,
    handleCreateOrg,
    setSiteConfigData,
    siteConfigData,
    isLoading,
    customerAppIntegrationType,
    defaultNetwork,
    handleToggle,
}) {
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
    const [openConfirmationForReset, setOpenConfirmationForReset] = useState(false);
    const [isResetGapsLoading, setIsResetGapsLoading] = useState(false);

    const renderConfigBody = (key, value, validation) => {
        const regex = new RegExp(validation);
        if (typeof value == "boolean") {
            return (
                <MDBSwitch
                    defaultChecked={value}
                    Checked={value}
                    id="flexSwitchCheckChecked"
                    name={key}
                    onChange={(e) => {
                        setSiteConfigData({
                            ...siteConfigData,
                            [e?.target?.name]: e?.target?.checked,
                        });
                    }}
                    className="mt-3"
                />
            );
        } else {
            return (
                <CustomeField
                    defaultValue={value}
                    config={{ name: key, type: key === "servicePassword" ? "password" : "text" }}
                    onUpdate={(fieldName, fieldValue) => {
                        const trimmedValue = fieldValue.replace(/ /g, "");
                        setSiteConfigData({
                            ...siteConfigData,
                            [key]: trimmedValue,
                        });
                    }}
                    validation={regex}
                />
            );
        }
    };
    const renderSiteConfigData = (siteData) => {
        return Object.entries(siteData ?? {})?.map(([key, value]) => {
            return (
                <tr key={key}>
                    <th scope="row">
                        <span>{value?.title}</span>
                        <IoMdInformationCircleOutline
                            style={{ marginLeft: "10px", cursor: "pointer" }}
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content={value?.description}
                        />
                        <Tooltip id="my-tooltip" />
                    </th>
                    <td className={typeof value !== "boolean" ? "pt-0" : ""}>
                        {renderConfigBody(value?.key, value?.value ? value?.value : value?.defaultValue, value?.validation)}
                    </td>
                </tr>
            );
        });
    };

    const resetGaps = async () => {
        if(process.env.REACT_APP_ENV === "dev" || process.env.REACT_APP_ENV === "qa"){
            setIsResetGapsLoading(true);
            const resetGapsResp = await OrganizationDataService.resetGaps({accountKey:organizationInfo?.accountKey, siteKey:organizationInfo?.siteKey});
            if (resetGapsResp?.status) {
                toast.success(resetGapsResp.data.body, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error(resetGapsResp.error, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
            setIsResetGapsLoading(false);
        }
    }

    return (
        <div style={{ maxHeight: "44rem", overflowX: "scroll" }}>
            {customerAppIntegrationType === "insiteflowHostedApp" ? (
                <ContainerConfig handleToggle={handleToggle} organizationInfo={organizationInfo} defaultNetwork={defaultNetwork} />
            ) : (
                <>
                    <MDBTable>
                        <MDBTableBody>
                            {Object.keys(organizationInfo?.config ?? {}).length > 0 ? (
                                renderSiteConfigData(organizationInfo?.config)
                            ) : (
                                <span style={{ marginLeft: "35%" }}>No config found for this organization.</span>
                            )}
                        </MDBTableBody>
                    </MDBTable>
                    <div>
                        <div className="d-flex justify-content-between">
                            {isLoading ? (
                                <MDBSpinner color="primary" className="my-2" />
                            ) : (
                                Object.keys(organizationInfo?.config ?? {}).length > 0 && (
                                    <MDBBtn type="button" onClick={() => setOpenConfirmationModal(true)} className="m-2">
                                        Update Config
                                    </MDBBtn>
                                )
                            )}
                           {(process.env.REACT_APP_ENV === "dev" || process.env.REACT_APP_ENV==="qa-func")&&(isResetGapsLoading ?  <MDBSpinner color="primary" className="my-2" />: <MDBBtn className="m-2" color="secondary"  onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenConfirmationForReset(true)}}>Reset Gaps</MDBBtn>)} 
                        </div>
                    </div>
                    {openConfirmationModal && (
                        <SiteConfigConfirmation
                            open={openConfirmationModal}
                            toggle={() => setOpenConfirmationModal(!openConfirmationModal)}
                            handleUpdateConfig={handleCreateOrg}
                            title={"Site Configuration"}
                            description={"Are you sure you want to update the site configuration ?"}
                        />
                    )}
                     {openConfirmationForReset && (
                        <SiteConfigConfirmation
                            open={openConfirmationForReset}
                            toggle={() => setOpenConfirmationForReset(!openConfirmationForReset)}
                            handleUpdateConfig={resetGaps}
                            title={"Reset Gaps"}
                            description={"Are you sure you want to reset gaps for this site ?"}
                        />
                    )}
                </>
            )}
        </div>
    );
}
