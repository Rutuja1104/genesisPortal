import React, { useEffect, useState } from "react";
import { MDBBtn, MDBIcon, MDBInput, MDBInputGroup } from "mdb-react-ui-kit";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { AiOutlinePlus } from "react-icons/ai";
import NetworkDataService from "../../services/NetworkDataService";
import CreateNetworkModal from "./CreateNetworkModal";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import General from "../../libs/utility/General";
import { toast } from "react-toastify";
const Network = () => {
    const [toggle, setToggle] = useState(false);
    const [selectedRow, setSelectedRow] = useState({});
    const [rows, setRows] = useState();
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [tableRefresh, setTableRefresh] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        let params = {};
        if (currentPage === 0) {
            params = {
                page: 1,
                pageSize: perPage,
                ...(searchKeyword ? { networkName: searchKeyword } : null),
            };
        } else {
            params = {
                page: currentPage + 1,
                pageSize: perPage,
                ...(searchKeyword ? { networkName: searchKeyword } : null),
            };
        }
        fetchNetworkData(params);
    }, [tableRefresh]);

    const fetchNetworkData = async (params) => {
        try {
            setIsLoading(true);
            setPerPage(params.pageSize);
            params.organizationCount = true;
            const networks = await NetworkDataService.getAllNetworks(params);
            setRows(networks?.data?.body?.networks);
            setTotalRows(networks?.data?.body?.totalItems);
            setCurrentPage(networks?.data?.body?.currentPage - 1);
            setIsLoading(false);
        } catch (err) {
            toast.error(err);
            setIsLoading(false);
            console.log(err);
        }
    };

    const handleToggle = (isRefresh) => {
        setSelectedRow();
        if (isRefresh) {
            setTableRefresh(!tableRefresh);
        }
        setToggle(!toggle);
    };

    const handlePageChange = (e) => {
        fetchNetworkData({
            pageSize: e.rows,
            page: e.page + 1,
            ...(searchKeyword ? { networkName: searchKeyword } : null),
        });
    };

    const handleRowClicked = () => {
        setToggle(!toggle);
    };

    const onSearchUser = General.debounce((evt) => {
        setSearchKeyword(evt?.target?.value);
        const params = {
            page: 1,
            pageSize: 10,
            ...(evt?.target?.value ? { networkName: evt?.target?.value } : null),
        };
        fetchNetworkData({ ...params });
    }, 500);

    const onClickSearch = () => {
        const params = {
            page: 1,
            pageSize: 10,
            ...(searchKeyword ? { networkName: searchKeyword } : null),
        };
        fetchNetworkData({ ...params });
    };
    return (
        <Container fluid>
            <Row>
                <Col xl={12}>
                    <Card>
                        <CardHeader>
                            {toggle ? (
                                <CreateNetworkModal toggle={toggle} setIsToggle={setToggle} handleToggle={handleToggle} selectedRow={selectedRow} />
                            ) : null}
                            <div className="d-flex justify-content-between">
                                <MDBBtn className="me-1" color="secondary" onClick={handleToggle}>
                                    <AiOutlinePlus /> Create Network
                                </MDBBtn>

                                <MDBInputGroup className="w-25">
                                    <MDBInput label="Search by network name" onChange={onSearchUser} />
                                    <MDBBtn rippleColor="dark" onClick={() => onClickSearch()}>
                                        <MDBIcon icon="search" />
                                    </MDBBtn>
                                </MDBInputGroup>
                            </div>
                        </CardHeader>
                        <CardBody className="text-center">
                            <>
                                <DataTable
                                    value={rows}
                                    dataKey="id"
                                    className="custom-datatable"
                                    emptyMessage="No records found."
                                    selectionMode="single"
                                    onSelectionChange={(e) => setSelectedRow(e.value)}
                                    selection={selectedRow}
                                    onRowSelect={() => handleRowClicked()}
                                    scrollHeight="40rem"
                                    loading={isLoading}
                                >
                                    <Column field="networkName" header="Network Name" style={{ width: "25%" }} />
                                    <Column
                                        field="createdAt"
                                        header="Created Date"
                                        body={(row) => General.formatDate(row.createdAt)}
                                        style={{ width: "25%" }}
                                    />
                                    <Column
                                        field="updatedAt"
                                        header="Updated Date"
                                        body={(row) => General.formatDate(row.updatedAt)}
                                        style={{ width: "25%" }}
                                    />
                                    <Column field="organizationsCount" header="Organizations" style={{ width: "25%" }} />
                                </DataTable>
                                <div className="d-flex">
                                    <Paginator
                                        first={currentPage * perPage}
                                        rows={perPage}
                                        totalRecords={totalRows}
                                        onPageChange={handlePageChange}
                                        rowsPerPageOptions={[10, 50, 100]}
                                        template={{
                                            layout: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport",
                                            CurrentPageReport: (options) => {
                                                return (
                                                    <span
                                                        style={{
                                                            color: "var(--text-color)",
                                                            userSelect: "none",
                                                            width: "120px",
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {isNaN(options.first) ? 0 : options.first} - {isNaN(options.last) ? 0 : options.last} of{" "}
                                                        {options.totalRecords ?? 0}
                                                    </span>
                                                );
                                            },
                                        }}
                                    />
                                </div>
                            </>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Network;
