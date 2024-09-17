import React, { useEffect, useState, useContext } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import General from "../../libs/utility/General";
import { MDBBtn, MDBDropdown, MDBIcon, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem, MDBSpinner } from "mdb-react-ui-kit";
import { Card, CardBody, Col, Container, Row, Breadcrumb, BreadcrumbItem, CardHeader, Input } from "reactstrap";
import { listContents, updateAWSCreds } from "../../libs/hooks/useContent";
import CustomeIcon from "./CustomIcon";
import UploadFileModal from "./UploadFileModal";
import NetworkDataService from "../../services/NetworkDataService";
import OrganizationDataService from "../../services/OrganizationDataService";
import LoginDataService from "../../services/LoginDataService";
import DeleteConfirmationModal from "./DeleteConfirmation";
import { globalContext } from "../../global-context/GlobalContext";
import { toast } from "react-toastify";
import { ROLES } from "../../libs/constant";
import { trackEvents } from "../../libs/utility/mixpanelHelper";
export default function Files({ selectedOrganizaiton }) {
  const [prefix, setPrefix] = useState("");
  const [homeDirectory, setHomeDirectory] = useState("");
  const [rows, setRows] = useState([]);
  const [breadcrumbItems, setBreadcrumbItems] = useState("/");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshList, setRefreshList] = useState(false);
  const [type, setType] = useState("");
  const [toggleUploadFile, setToggleUploadFile] = useState(false);
  const context = useContext(globalContext);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteData, SetDeleteData] = useState("");
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  const userRole = General.getUserRole();
  const { networks, selectedNetwork, setSelectedNetwork, setNetworks } = context;
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (selectedNetwork) {
          setIsLoading(true);
          const body = {
            networkId: selectedNetwork,
            organizationId: selectedOrganizaiton,
          };
          const getCreds = await OrganizationDataService.getAWSCreds(body);
          if (getCreds.status) {
            const awsCreds = {
              accessKeyId: getCreds.data.body.accessKeyId,
              secretAccessKey: getCreds.data.body.secretAccessKey,
              sessionToken: getCreds.data.body.sessionToken,
              region: process.env.REACT_APP_AWS_REGION,
            };
            updateAWSCreds(awsCreds);
            setPrefix(`${getCreds.data.body.folderName}/`);
            setHomeDirectory(`${getCreds.data.body.folderName}/`);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedNetwork]);

  async function fetchNetworks(params) {
    try {
      if (networks.length === 0) {
        setIsNetworkLoading(true);
        const response = await NetworkDataService.getAllNetworks(params);
        if (response.status) {
          const networkList = response.data.body?.networks;
          if (networkList.length === 1) setSelectedNetwork(networkList[0].networkId);
          setNetworks(response.data.body.networks);
        }
        setIsNetworkLoading(false);
      }
    } catch (error) {
      console.error("Error fetching networks:", error);
    }
  }

  useEffect(() => {
    (async () => {
      if (userRole === ROLES.SUPER_ADMIN) {
        fetchNetworks();
      } else {
        const response = await LoginDataService.getUserId();
        if (response.status) {
          handleNetworkChange(response?.data?.body?.networkId);
          fetchNetworks({
            networkId: response?.data?.body?.networkId,
          });
        }
      }
    })();
  }, []);

  const handleNetworkChange = (networkId) => {
    setSelectedNetwork(networkId);
  };
  useEffect(() => {
    const fetchList = async () => {
      try {
        setIsLoading(true);
        const result = await listContents(prefix);
        const folders = result.folders;
        const files = result.objects;
        setRows([...folders, ...files]);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [prefix, refreshList]);

  const handleRowClicked = (e) => {
    if (e.data.type === "folder") {
      setPrefix(e.data.path);
      setBreadcrumbItems((prev) => `${prev}${e.data.name}`);
    } else {
      e.data.openFile();
    }
  };

  const customFieldName = (file) => {
    return (
      <span>
        <CustomeIcon type={file.type} /> {file.name}
      </span>
    );
  };

  const changeDirectory = (dir) => {
    if (dir === "/") {
      setPrefix(homeDirectory);
      setBreadcrumbItems("/");
      return;
    } else {
      const pathToSet = breadcrumbItems.split(dir)[0] + dir + "/";
      setBreadcrumbItems(`${pathToSet}`);
      setPrefix(`${homeDirectory}` + pathToSet.slice(1));
    }
  };

  const handleToggleUploadFileModal = (isRefresh = false, type = "file") => {
    setType(type);
    if (isRefresh) {
      setRefreshList(!refreshList);
    }
    setToggleUploadFile(!toggleUploadFile);
  };

  const toggleConfirmationModal = () => {
    setDeleteConfirmationModal(!deleteConfirmationModal);
  };

  const deleteFunction = async () => {
    try {
      if (deleteData?.type === "file") {
        const deleteResp = await deleteData?.deleteFile();
        if (deleteResp) {
          toast.success(`${deleteData?.name} deleted successfully ! `);
          setRefreshList(!refreshList);
        } else {
          toast.error(`${deleteData?.name} could not be deleted ! `);
        }
      } else if (deleteData?.type === "folder") {
        const resp = await deleteData?.deleteFolder();
        if (resp.status) {
          toast.success(`${deleteData?.name} deleted successfully ! `);
          setRefreshList(!refreshList);
        } else {
          toast.error(`${deleteData?.name} is not empty, Please deletes the folder content first `);
        }
      }
      toggleConfirmationModal();
      SetDeleteData("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <div className="d-flex justify-content-between mb-2" style={{ width: "100%" }}>
                <div className="d-flex align-items-center">
                  <span className="mx-2">Network</span>
                  {isNetworkLoading ? (
                    <MDBSpinner color="primary" className="m-2" />
                  ) : (
                    <Input
                      id="networkId"
                      name="networkId"
                      type="select"
                      required
                      onChange={(e) => {
                        trackEvents("NETWORK_CHANGED", { networkId: e.target.value });
                        handleNetworkChange(e.target.value);
                      }}
                      defaultValue={selectedNetwork}
                    >
                      {networks.length === 1 ? (
                        <option key={networks[0]?.networkId} value={networks[0]?.networkId} label={networks[0]?.networkName} selected>
                          {networks[0]?.networkName}
                        </option>
                      ) : (
                        <>
                          <option value="" disabled selected>
                            Select Network
                          </option>
                          {networks?.map((network) => (
                            <option key={network?.networkId} value={network?.networkId}>
                              {network?.networkName}
                            </option>
                          ))}
                        </>
                      )}
                    </Input>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between">
                <Breadcrumb className="mx-2">
                  <MDBIcon fas icon="home" color="primary" className="mt-1" style={{ cursor: "pointer" }} onClick={() => changeDirectory("/")} />
                  {breadcrumbItems.split("/").map((e, index) => (
                    <BreadcrumbItem className="text-primary" style={{ cursor: "pointer" }} active={index === breadcrumbItems.split("/").length - 1}>
                      <a onClick={() => changeDirectory(e)}>{e}</a>
                    </BreadcrumbItem>
                  ))}
                </Breadcrumb>
                <div>
                  <MDBBtn rounded color="info" className="mx-2" onClick={() => handleToggleUploadFileModal(false, "folder")}>
                    <MDBIcon fas icon="folder-plus" /> Create Folder
                  </MDBBtn>
                  <MDBBtn rounded color="secondary" onClick={() => handleToggleUploadFileModal()}>
                    <MDBIcon fas icon="cloud-upload-alt" /> Upload File
                  </MDBBtn>
                </div>
              </div>
              {toggleUploadFile && <UploadFileModal toggle={toggleUploadFile} handleToggle={handleToggleUploadFileModal} path={prefix} type={type} list={rows} />}
              <DataTable
                value={rows}
                dataKey="id"
                className="custom-datatable"
                emptyMessage="No records found."
                selectionMode="single"
                scrollable
                scrollHeight="40rem"
                onRowSelect={(e) => handleRowClicked(e)}
                loading={isLoading}
                removableSort
              >
                <Column field="name" header="Name" sortable body={(e) => customFieldName(e)} />
                <Column
                  field="metadata"
                  header="Description"
                  sortable
                  body={(e) => {
                    return e.metadata?.description;
                  }}
                />
                <Column field="size" header="Size" sortable body={(e) => General.formatFileSize(e.size)} />
                <Column
                  field="metadata"
                  header="Uploaded by"
                  sortable
                  body={(e) => {
                    return e.metadata?.uploadedby;
                  }}
                />
                <Column field="lastModified" header="Last modified" sortable body={(e) => General.formatDate(e.lastModified)} />
                <Column
                  field="action"
                  header=""
                  body={(e) => {
                    return (
                      <MDBDropdown>
                        <MDBDropdownToggle tag="a" className="nav-link custom-dropdown-toggle">
                          <i className="fas fa-ellipsis-v"></i>
                        </MDBDropdownToggle>

                        <MDBDropdownMenu>
                          {e.type === "folder" ? (
                            <>
                              <MDBDropdownItem link onClick={() => changeDirectory(e.name.split("/")[0])}>
                                <MDBIcon fas icon="external-link-alt" /> Open
                              </MDBDropdownItem>
                              <MDBDropdownItem
                                link
                                onClick={() => {
                                  SetDeleteData(e);
                                  toggleConfirmationModal();
                                }}
                              >
                                <MDBIcon far icon="trash-alt" /> Delete
                              </MDBDropdownItem>
                            </>
                          ) : (
                            <>
                              <MDBDropdownItem link onClick={() => e.openFile()}>
                                <MDBIcon fas icon="external-link-alt" /> Open
                              </MDBDropdownItem>
                              <MDBDropdownItem link onClick={() => e.downloadFile()}>
                                <MDBIcon fas icon="arrow-down" /> Download
                              </MDBDropdownItem>
                              <MDBDropdownItem
                                link
                                onClick={() => {
                                  SetDeleteData(e);
                                  toggleConfirmationModal();
                                }}
                              >
                                <MDBIcon far icon="trash-alt" /> Delete
                              </MDBDropdownItem>
                            </>
                          )}
                        </MDBDropdownMenu>
                      </MDBDropdown>
                    );
                  }}
                />
              </DataTable>
            </CardBody>
          </Card>
        </Col>
      </Row>
      {deleteConfirmationModal && <DeleteConfirmationModal open={deleteConfirmationModal} toggle={toggleConfirmationModal} deleteData={deleteData} deleteFunction={deleteFunction} />}
    </Container>
  );
}
