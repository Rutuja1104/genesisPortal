import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useContext, useEffect, useState } from "react";
import { Input } from "reactstrap";
import UsersDataService from "../../services/utils/UsersDataService";
import { Paginator } from "primereact/paginator";
import { MDBBtn, MDBIcon, MDBInput, MDBInputGroup, MDBSpinner } from "mdb-react-ui-kit";
import { AiOutlinePlus } from "react-icons/ai";
import UserModal from "./UserModal";
import { ROLES } from "../../libs/constant";
import General from "../../libs/utility/General";
import LoginDataService from "../../services/LoginDataService";
import NetworkDataService from "../../services/NetworkDataService";
import { globalContext } from "../../global-context/GlobalContext";
import OrganizationDataService from "../../services/OrganizationDataService";
import { trackEvents } from "../../libs/utility/mixpanelHelper";

const User = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toggleUser, setToggleUser] = useState(false);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchBy, setSearchBy] = useState("");
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const [organization, setOrganization] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [refreshUserList, setRefreshUserList] = useState(false);
  const userRole = General.getUserRole();
  const context = useContext(globalContext);
  const { networks, setNetworks, selectedNetwork, setSelectedNetwork, userData } = context;
  const [searchKey, setSearchKey] = useState("");
  useEffect(() => {
    if (userData?.organizationId) {
      setSelectedOrg(userData?.organizationId);
    }
  }, [userData]);

  const handleNetworkChange = (networkId) => {
    setSelectedNetwork(networkId);
  };

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

  useEffect(() => {
    if (selectedNetwork || userRole !== ROLES.SUPER_ADMIN) {
      fetchOrgData({
        networkId: selectedNetwork || networks[0]?.networkId,
      });
    }
  }, [selectedNetwork]);

  const fetchOrgData = async (params) => {
    setIsOrgLoading(true);
    try {
      const organizations = await OrganizationDataService.getAllOrganization({
        body: params,
      });
      setOrganization(organizations?.data?.body?.network?.organizations);
      setIsOrgLoading(false);
    } catch (err) {
      setIsOrgLoading(false);
      console.log(err);
    }
  };

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

  const fetchUsersData = async (params) => {
    try {
      setIsLoading(true);
      setPageSize(params.pageSize);
      const users = await UsersDataService.getAllUsers(params);
      if (users?.data?.body?.users) {
        setAllUsers(users?.data?.body?.users);
        setTotalRows(users?.data?.body.totalItems);
        setCurrentPage(users?.data?.body.currentPage - 1);
      } else {
        setAllUsers([]);
        setTotalRows(0);
        setCurrentPage(1);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (userRole === ROLES.SUPER_ADMIN) {
      const params = {
        page: currentPage + 1,
        pageSize: pageSize,
        ...(selectedOrg ? { organizationId: selectedOrg } : null),
        ...(selectedNetwork ? { networkId: selectedNetwork } : null),
        [searchBy]: searchKey,
      };
      fetchUsersData(params);
    } else if (selectedOrg) {
      const params = {
        page: currentPage + 1,
        pageSize: pageSize,
        organizationId: selectedOrg,
        networkId: selectedNetwork,
        [searchBy]: searchKey,
      };
      fetchUsersData(params);
    }
  }, [selectedOrg, refreshUserList, selectedNetwork]);

  const handlePageChange = (e) => {
    fetchUsersData({
      pageSize: e.rows,
      page: e.page + 1,
      [searchBy]: searchKey,
      ...(selectedOrg ? { organizationId: selectedOrg } : null),
      ...(selectedNetwork ? { networkId: selectedNetwork } : null),
    });
    trackEvents("USER_LIST_PAGINATION_CHANGED", { page: e.page + 1, pageSize: e.rows });
  };

  const handleCreateToggle = (createUserFlag = false, isRefresh = false) => {
    if (createUserFlag) {
      setSelectedRow();
    }
    if (isRefresh) {
      setRefreshUserList(!refreshUserList);
    }
    setToggleUser(!toggleUser);
  };

  const renderNameColumn = (rowData) => {
    return (
      <span>
        {rowData?.firstName ? rowData?.firstName : " "} {rowData?.lastName ? rowData?.lastName : ""}
      </span>
    );
  };

  const onSearchUser = General.debounce((evt) => {
    const searchValue = evt?.target?.value || searchKey;
    if (searchValue) setSearchKey(searchValue);
    trackEvents("SEARCH_BUTTON_CLICKED", { searchKey: searchValue });
    const params = {
      page: 1,
      pageSize,
      organizationId: selectedOrg,
      networkId: selectedNetwork,
      [searchBy]: searchValue,
    };
    fetchUsersData(params);
  }, 500);

  return (
    <div>
      <div className="d-flex flex-row-reverse">
        <MDBBtn
          className="m-2"
          color="info"
          onClick={() => {
            handleCreateToggle(true);
            trackEvents("CREATE_USER_MODAL_DISPLAYED");
          }}
          style={{ width: "content-fit" }}
          disabled={!(selectedOrg && ![ROLES.PRACTICE_MANAGER, ROLES.CLIENT, ROLES.PROVIDER, ROLES.SYSTEM].includes(userRole))}
        >
          <AiOutlinePlus className="fw-bold" /> Create User
        </MDBBtn>
      </div>
      <div className="row">
        <div className="col-12 col-md-6 mb-3 mb-md-0 d-flex gap-4">
          <div className="d-flex justify-content-between">
            {userRole === ROLES.SUPER_ADMIN && (
              <div className="d-flex align-items-center w-100">
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
                      setSelectedNetwork(e?.target?.value);
                      setSelectedOrg("");
                      trackEvents("NETWORK_CHANGED", { networkId: e?.target?.value });
                    }}
                    value={selectedNetwork}
                  >
                    {networks.length === 1 ? (
                      <option key={networks[0]?.networkId} value={networks[0]?.networkId} selected>
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
            )}
            {selectedNetwork || userRole !== ROLES.SUPER_ADMIN ? (
              <div className="d-flex align-items-center w-100">
                <span className="mx-2">Organization</span>
                {isOrgLoading ? (
                  <MDBSpinner color="primary" className="m-2" />
                ) : (
                  <Input
                    id="organization"
                    name="organization"
                    type="select"
                    required
                    onChange={(e) => {
                      setSelectedOrg(e?.target?.value);
                      trackEvents("ORGANIZATION_CHANGED", { organizationId: e?.target?.value });
                    }}
                    value={selectedOrg}
                  >
                    <>
                      <option value="" selected>
                        Select Organization
                      </option>
                      {organization?.map(
                        (org) =>
                          org.organizationType === "customer" && (
                            <option key={org?.organizationId} value={org?.organizationId}>
                              {org?.organizationName}
                            </option>
                          )
                      )}
                    </>
                  </Input>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex justify-content-between gap-2 align-items-center">
            <div className="d-flex align-items-center w-50">
              <Input
                id="type"
                name="select"
                type="select"
                onChange={(evt) => {
                  setSearchBy(evt?.target?.value);
                  setSearchKey("");
                  trackEvents("SEARCH_BY_CRITERIA_CHANGED", { searchBy: evt?.target?.value });
                }}
                disabled={userRole === ROLES.SUPER_ADMIN ? false : !selectedOrg}
              >
                <option value="" disabled selected>
                  Select Search By
                </option>
                <option key={"firstName"} value={"firstName"}>
                  First Name{" "}
                </option>
                <option key={"lastName"} value={"lastName"}>
                  Last Name{" "}
                </option>
                <option key={"displayName"} value={"displayName"}>
                  Display Name{" "}
                </option>
                <option key={"userName"} value={"userName"}>
                  Email{" "}
                </option>
                <option key={"isActive"} value={"isActive"}>
                  Activation Status{" "}
                </option>
              </Input>
            </div>
            <MDBInputGroup className="w-50" style={{ maxHeight: "2.3rem" }}>
              {searchBy === "isActive" ? (
                <Input id="type" name="select" type="select" onChange={onSearchUser}>
                  <option key={""} value={""} selected>
                    All{" "}
                  </option>
                  <option key={"true"} value={"true"}>
                    Activated{" "}
                  </option>
                  <option key={"false"} value={"false"}>
                    Deactivated{" "}
                  </option>
                </Input>
              ) : (
                <MDBInput label="Search.." onChange={onSearchUser} className="pb-2" disabled={!searchBy} />
              )}
              <MDBBtn rippleColor="dark" onClick={onSearchUser}>
                <MDBIcon icon="search" />
              </MDBBtn>
            </MDBInputGroup>
          </div>
        </div>
      </div>
      <DataTable
        value={allUsers}
        stripedRows
        selectionMode="single"
        onSelectionChange={(e) => setSelectedRow(e.value)}
        selection={selectedRow}
        onRowSelect={(e) => {
          trackEvents("UPDATE_USER_MODAL_DISPLAYED", e.data);
          handleCreateToggle();
        }}
        dataKey="id"
        className="custom-datatable"
        emptyMessage="No records found."
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        scrollHeight="65vh"
        loading={isLoading}
      >
        <Column header="Name" style={{ width: "16.5%" }} body={renderNameColumn} />
        <Column field="displayName" header="Display Name" style={{ width: "16.5%" }} />
        <Column field="userName" header="Email" style={{ width: "16.5%" }} />
        <Column field="type" header="Role" style={{ width: "10%" }} />
        <Column field="organizationName" header="Organization" style={{ width: "16.5%" }} />
        <Column
          field="isActive"
          header="Activation Status"
          body={(e) => {
            if (e.isActive) {
              return "Activated";
            } else {
              return "Deactivated";
            }
          }}
          style={{ width: "16.5%" }}
        />
      </DataTable>
      <div className="d-flex">
        <Paginator
          first={currentPage * pageSize}
          rows={pageSize}
          totalRecords={totalRows}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[10, 50, 100]}
          template={{
            layout: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport",
            CurrentPageReport: (options) => {
              return (
                <span
                  style={{
                    userSelect: "none",
                    width: "120px",
                    textAlign: "center",
                  }}
                >
                  {isNaN(options.first) ? 0 : options.first} - {isNaN(options.last) ? 0 : options.last} of {options.totalRecords ?? 0}
                </span>
              );
            },
          }}
        />
      </div>
      {toggleUser ? <UserModal toggle={toggleUser} handleToggle={handleCreateToggle} selectedOrg={selectedOrg} selectedUser={selectedRow} /> : ""}
    </div>
  );
};

export default User;
