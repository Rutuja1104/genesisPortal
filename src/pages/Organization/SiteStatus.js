import { MDBSpinner } from "mdb-react-ui-kit";
import React from "react";
import General from "../../libs/utility/General";
import { Card, CardBody, CardHeader } from "reactstrap";

function SiteStatus({ siteStatusData, siteStatusLoading }) {
    const renderSiteData = (siteData) => {
        return Object.entries(siteData).map(([key, value]) => {
            return (
                <Card key={key} className="my-2 mx-2">
                    <CardHeader>
                        <span className="fw-bolder">{value?.title}</span>
                    </CardHeader>
                    <CardBody>
                        {value?.details?.map((detail, i) => {
                            return (
                                <div className="my-2" key={i + 1}>
                                    <div>
                                        <div className="d-flex gap-2">
                                            <span className="fw-bolder">{detail?.name}:</span>
                                            <span>{General.isValidDateFormat(detail?.value) ? General.formatDate(detail?.value) : detail?.value}</span>
                                        </div>
                                    </div>
                                    {detail?.data?.length > 0 ? (
                                        <div className="d-flex flex-column">
                                            <span className="fw-bolder">Data:</span>
                                            {detail?.data?.map?.((data, index) => {
                                                return <span key={index + 1}>{data}</span>;
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </CardBody>
                </Card>
            );
        });
    };
    return (
        <div className="m-2" style={{ maxHeight: "47rem", overflow: "scroll" }}>
            {siteStatusLoading ? (
                <MDBSpinner color="primary" className="m-2" />
            ) : siteStatusData === "Site Not Configured" ? (
                <div className="text-center ">{siteStatusData}</div>
            ) : (
                renderSiteData(siteStatusData)
            )}
        </div>
    );
}

export default SiteStatus;
