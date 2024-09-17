import React, { useContext, useEffect, useState, useRef } from "react";
import { MDBBtn, MDBSpinner } from "mdb-react-ui-kit";
import { Card, CardBody, CardHeader, Col, Container, Row, Input } from "reactstrap";
import { AiOutlinePlus, AiOutlineCloudUpload } from "react-icons/ai";
import OrganizationDataService from "../../services/OrganizationDataService";
import LoginDataService from "../../services/LoginDataService";
import BulkUploadOrg from "./BulkUploadOrg";
import OrganizationInfoModal from "./OrganizationInfoModal";
import NetworkDataService from "../../services/NetworkDataService";
import AuditLogModal from "./AuditLogModal";
import { ROLES } from "../../libs/constant";
import General from "../../libs/utility/General";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { globalContext } from "../../global-context/GlobalContext";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import CustomField from "./CustomeField";
import moment from "moment";
import Flatpickr from "react-flatpickr";
import { CSVLink } from "react-csv";
import { FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";

const Organization = () => {
  const [toggle, setToggle] = useState(false);
  const [toggleOrg, setToggleOrg] = useState(false);
  const [toggleAudit, setToggleAudit] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isNetworkLoading, setIsNetworkLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [tableRefresh, setTableRefresh] = useState(false);
  const [siteIdAudit, setSiteIdAudit] = useState();
  const [orgsMandatoryData, setOrgsMandatoryData] = useState([]);
  const [sortField, setSortField] = useState("organizationName");
  const [sortOrder, setSortOrder] = useState("ASC");
  const statuses = ["COMPLETE", "IN PROGRESS", "ERROR"];
  const context = useContext(globalContext);
  const [searchParams, setSearchParams] = useState({});
  let selNetwork = {};
  const { networks, setNetworks, selectedNetwork, setSelectedNetwork, searchableProps, setSearchableProps } = context;
  const pageChange = useRef(false);
  const [currentDate, setCurrentDate] = useState("");
  const clearDateRef = useRef(null);
  const clearUpdatedDateRef = useRef(null);
  const [networkName, setNetworkName] = useState("");
  const userRole = General.getUserRole();

  useEffect(() => {
    if (selectedNetwork) {
      setNetworkName(networks?.find((net) => net?.networkId === selectedNetwork));
      selNetwork = { networkId: selectedNetwork };
      if (currentPage === 0)
        fetchOrgData({
          page: 1,
          pageSize: perPage,
          orderName: sortField,
          orderBy: sortOrder,
          ...selNetwork,
          ...searchableProps,
        });
      else
        fetchOrgData({
          page: currentPage,
          pageSize: perPage,
          orderName: sortField,
          orderBy: sortOrder,
          ...selNetwork,
          ...searchableProps,
        });
    }
    (async () => {
      const userRole = General.getUserRole();
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
  }, [tableRefresh, selectedNetwork, sortField, sortOrder]);

  const fetchOrgData = async (params) => {
    try {
      setIsLoading(true);
      setPerPage(params.pageSize);
      const organizations = await OrganizationDataService.getAllOrganization({ body: params });
      setOrgsMandatoryData(organizations?.data?.body?.network?.orgAdditionalFields);
      if (organizations.status && organizations.data.body?.network?.organizations.length > 0) {
        const organizationDate = organizations.data.body.network.organizations;
        setRows(organizationDate);
        setTotalRows(organizations?.data?.body.totalItems);
        setCurrentPage(organizations?.data?.body.currentPage - 1);
        setIsLoading(false);
      } else {
        setRows([]);
        setTotalRows(0);
        setCurrentPage(1);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(err);
      console.log(err);
    }
  };
  useEffect(() => {
    let inProgressSite = false;
    let timeoutId;
    rows?.forEach((data) => {
      if (data.activationStatus === "IN PROGRESS" || data.deactivationStatus === "IN PROGRESS") {
        inProgressSite = true;
      }
    });
    if (inProgressSite) {
      inProgressSite = false;
      timeoutId = setTimeout(async () => {
        let params = {};
        if (currentPage === 0) {
          params = { page: 1, pageSize: perPage, ...searchParams };
        } else {
          params = {
            page: currentPage + 1,
            pageSize: perPage,
            ...searchParams,
          };
        }
        params.networkId = selectedNetwork;
        const organizations = await OrganizationDataService.getAllOrganization({ body: params });
        if (organizations.status && organizations.data.body?.network?.organizations.length > 0) {
          const organizationDate = organizations.data.body.network.organizations;
          setRows(organizationDate);
        }
      }, 10000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [rows, perPage, currentPage, selectedNetwork, searchParams]);

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
      toast.error(error);
      console.error("Error fetching networks:", error);
    }
  }

  const handleToggle = (isRefresh, isCSV) => {
    if (isRefresh) {
      if (isCSV) {
        for (let i = 1; i <= 3; i++) {
          callFetchOrgData(i);
          setCurrentDate(moment().format("YYYY-MM-DD"));
        }
      } else {
        setTableRefresh(!tableRefresh);
      }
    }
    setToggle(!toggle);
  };

  let timeouts = [];

  const callFetchOrgData = (attempt) => {
    if (selectedNetwork) {
      selNetwork = { ["networkId"]: selectedNetwork };
    }
    const timeoutId = setTimeout(() => {
      fetchOrgData({
        page: 1,
        pageSize: perPage,
        ...selNetwork,
        createdAt: moment().format("YYYY-MM-DD"),
        orderName: sortField,
        orderBy: sortOrder,
        ...searchableProps,
      });
    }, 5000 * attempt);
    timeouts.push(timeoutId);
  };

  const clearAllTimeouts = () => {
    timeouts?.forEach(clearTimeout);
    timeouts = [];
  };

  document.addEventListener("click", (event) => {
    const element = document.getElementById("bulk-upload");
    if (!element?.contains(event?.target)) {
      clearAllTimeouts();
    }
  });

  const handleCreateToggle = (isRefresh) => {
    setSelectedRow();
    if (isRefresh) {
      setTimeout(() => {
        setTableRefresh(!tableRefresh);
      }, 5000);
    }
    setToggleOrg(!toggleOrg);
  };

  const handleAuditToggle = () => {
    setToggleAudit(!toggleAudit);
  };

  const handlePageChange = (e) => {
    if (selectedNetwork) {
      selNetwork = { ["networkId"]: selectedNetwork };
    }
    pageChange.current = true;
    fetchOrgData({
      pageSize: e.rows,
      page: e.page + 1,
      ...searchParams,
      orderName: sortField,
      orderBy: sortOrder,
      ...selNetwork,
      ...searchableProps,
    });
  };

  const handleRowClicked = () => {
    setToggleOrg(!toggleOrg);
  };

  const handleNetworkChange = (networkId) => {
    setSelectedNetwork(networkId);
  };

  function removeNullProperties(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null));
  }

  const onChangeFilter = (event) => {
    let orgSearchProp = {};
    let searchable = Object.fromEntries(
      Object.entries(event?.filters ?? {})
        .map(([key, filter]) => {
          if ((key === "createdAt" || key === "updatedAt") && Array.isArray(filter?.value)) {
            if (filter.value.length > 1) {
              const [start, end] = filter.value;
              return [key, `${moment(start).format("YYYY/MM/DD")} | ${moment(end).format("YYYY/MM/DD")}`];
            } else {
              return [key, null];
            }
          }
          return [key, filter?.value];
        })
        .filter((entry) => entry[1] !== "")
    );

    setSearchableProps({
      ...searchableProps,
      ...searchable,
    });
    orgSearchProp = {
      ...searchableProps,
      ...searchable,
    };

    if (selectedNetwork) {
      selNetwork = { ["networkId"]: selectedNetwork };
    }
    const cleanedObject = removeNullProperties(orgSearchProp);

    const searchOrgs = General.debounce((searchables) => {
      fetchOrgData({
        page: 1,
        pageSize: perPage,
        ...selNetwork,
        ...searchables,
        orderName: sortField,
        orderBy: sortOrder,
      });
    }, 500);
    if (Object.keys(cleanedObject).length > 0) {
      searchOrgs(cleanedObject);
    } else {
      searchOrgs(searchableProps);
    }
    setSearchParams(cleanedObject);
  };
  const statusItemTemplate = (option) => {
    return <div>{option}</div>;
  };
  const dateTimeFilterTemplate = (event) => {
    return (
      <>
        <Flatpickr
          ref={clearDateRef}
          options={{
            mode: "range",
            dateFormat: "Y-m-d",
          }}
          className="form-control p-2"
          value={currentDate}
          placeholder="Select..."
          onChange={(e) => {
            event.filterApplyCallback(e);
            setCurrentDate(e);
          }}
        />
        <button className="button-icon" type="reset" onClick={clearDates}>
          &times;
        </button>
      </>
    );
  };
  const dateTimeUpdatedAt = (event) => {
    return (
      <>
        <Flatpickr
          ref={clearUpdatedDateRef}
          options={{
            mode: "range",
            dateFormat: "Y-m-d",
          }}
          className="form-control p-2"
          placeholder="Select..."
          onChange={(e) => {
            event.filterApplyCallback(e);
          }}
        />
        <button className="button-icon" type="reset" onClick={clearUpdatedDates}>
          &times;
        </button>
      </>
    );
  };
  const FilterTemplate = (event, col) => {
    const field = { name: event?.field, type: col?.type };
    return (
      <CustomField
        config={field}
        onUpdate={(e, fieldValue) => {
          let data = fieldValue;
          if (Array.isArray(fieldValue)) {
            const values = fieldValue.map((obj) => obj.value);
            data = values.join(",");
          }
          handleOrgAddFieldSearch({
            name: event?.field,
            value: data || "",
          });
        }}
        customStyle={{ marginBottom: "24px", height: "44px" }}
      />
    );
  };

  function deleteNestedProperty(obj, keyPath) {
    const keys = keyPath.split(".");
    const lastKey = keys.pop();
    const nestedObj = keys.reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

    if (nestedObj && nestedObj.hasOwnProperty(lastKey)) {
      delete nestedObj[lastKey];
      return true;
    }
    return false;
  }

  const handleOrgAddFieldSearch = (e) => {
    let orgSearchProp = "";
    if (["siteKey", "organizationName", "accountKey"].includes(e?.name)) {
      if (e?.value) {
        setSearchableProps({
          ...searchableProps,
          [e?.name]: typeof e?.value === "object" ? e?.value?.value : e?.value,
        });
        orgSearchProp = {
          ...searchableProps,
          [e?.name]: typeof e?.value === "object" ? e?.value?.value : e?.value,
        };
      } else {
        delete searchableProps[e?.name];
      }
    } else if (e) {
      if (e?.value) {
        setSearchableProps({
          ...searchableProps,
          ["orgAdditionalFields"]: {
            ...searchableProps?.orgAdditionalFields,
            [e?.name.split(".")[1]]: typeof e?.value === "object" ? e?.value?.value : e?.value,
          },
        });
        orgSearchProp = {
          ...searchableProps,
          ["orgAdditionalFields"]: {
            ...searchableProps?.orgAdditionalFields,
            [e?.name.split(".")[1]]: typeof e?.value === "object" ? e?.value?.value : e?.value,
          },
        };
      } else {
        deleteNestedProperty(searchableProps, e?.name);
      }
    }
    if (selectedNetwork) {
      selNetwork = { ["networkId"]: selectedNetwork };
    } else {
      return;
    }
    if (Object.keys(orgSearchProp).length > 0) {
      fetchOrgData({
        page: 1,
        pageSize: perPage,
        ...selNetwork,
        ...orgSearchProp,
        orderName: sortField,
        orderBy: sortOrder,
      });
    } else {
      fetchOrgData({
        page: 1,
        pageSize: perPage,
        ...selNetwork,
        ...searchableProps,
        orderName: sortField,
        orderBy: sortOrder,
      });
    }
  };

  const statusRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterApplyCallback(e.value)}
        itemTemplate={statusItemTemplate}
        placeholder="Select Status"
        className="p-column-filter"
        showClear
        style={{ maxWidth: "10rem" }}
      />
    );
  };
  const dStatusItemTemplate = (option) => {
    return <div>{option}</div>;
  };

  const statusBodyTemplate = (rowData) => {
    if (rowData.activationStatus === "COMPLETE") {
      return `Activated At ${General.formatDate(rowData.activationDate)}`;
    } else if (rowData?.activationStatus == null) {
      return "-";
    }
    return `${rowData?.activationStatus}`;
  };

  const customFieldTitle = (field, col) => {
    const networkInfo = networks.filter((element) => selectedNetwork === element.networkId)[0];
    const networkOrgAdditionalField = networkInfo?.orgAdditionalFields;
    const currentField = networkOrgAdditionalField?.filter((element) => element.key === col.key)[0];
    const typeParts = currentField?.type?.split(":");
    if (typeParts && typeParts.length === 2) {
      const type = typeParts[0].trim();
      if (type === "single-select") {
        const options = typeParts[1].split("|").map((option) => ({
          value: option.split("^")[0],
          key: option.split("^")[1],
        }));

        const key = options.filter((element) => element.value === field.orgAdditionalFields[col.key])[0];
        return <span>{key?.key || "-"}</span>;
      } else if (type === "multi-select") {
        const options = typeParts[1].split("|").map((option) => ({
          value: option.split("^")[0],
          key: option.split("^")[1],
        }));
        let splitableVal = field.orgAdditionalFields[col.key].split(",");

        const key = splitableVal.map((obj) => {
          let test = options.find((ele) => {
            if (obj === ele?.value) {
              return ele;
            }
          });
          return test;
        });
        return <span>{key?.map((ele) => (ele !== undefined ? ele?.key + " " : "-")) || "-"}</span>;
      }
    }
    if (col?.default) {
      return <span>{field[col.key]}</span>;
    }
    return <span>{field.orgAdditionalFields[col.key]}</span>;
  };

  const dStatusBodyTemplate = (rowData) => {
    if (rowData.deactivationStatus === "COMPLETE") {
      return `Deactivated At ${General.formatDate(rowData.deactivationDate)}`;
    } else if (rowData?.deactivationStatus == null) {
      return "-";
    }
    return `${rowData?.deactivationStatus}`;
  };
  const dStatusRowFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterApplyCallback(e.value)}
        itemTemplate={dStatusItemTemplate}
        placeholder="Select Status"
        className="p-column-filter"
        showClear
        style={{ maxWidth: "10rem" }}
      />
    );
  };

  const clearDates = () => {
    if (clearDateRef.current) {
      clearDateRef.current.flatpickr.clear();
      setCurrentDate("");
    }
  };

  const clearUpdatedDates = () => {
    if (clearUpdatedDateRef.current) {
      clearUpdatedDateRef.current.flatpickr.clear();
    }
  };

  const handleSort = (e) => {
    setSortField(e?.sortField);
    setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC");
  };
  const CSV_HEADERS = [
    ...(orgsMandatoryData ?? [])
      .map((obj) => {
        if (!obj?.sensitive) {
          return { label: obj?.title, key: obj?.key, type: obj?.type };
        }
      })
      .filter(Boolean),
    { label: "Activation Status", key: "activationStatus" },
    { label: "Deactivation Status", key: "deactivationStatus" },
    { label: "Created At", key: "createdAt" },
    { label: "Updated At", key: "updatedAt" },
  ];

  const transformedData = rows.map((item) => {
    const transformedItem = {};
    CSV_HEADERS?.forEach((header) => {
      if (header?.key === "deactivationStatus") {
        transformedItem[header.key] = item[header.key] === "COMPLETE" ? `Deactivated At ${General.formatDate(item["deactivationDate"])}` : "-";
      } else if (header?.key === "activationStatus") {
        transformedItem[header.key] = item[header.key] === "COMPLETE" ? `Activated At ${General.formatDate(item["activationDate"])}` : "-";
      } else if (["createdAt", "updatedAt"].includes(header?.key)) {
        transformedItem[header.key] = item[header.key] ? General.formatDate(item[header.key]) : "-";
      } else if (header?.type?.split(":")[0] === ("single-select" || "multi-select")) {
        const fieldType = orgsMandatoryData?.find((ele) => ele?.key === header.key)?.type;
        const typeParts = fieldType?.split(":");
        const options = typeParts[1]?.split("|")?.map((option) => ({
          value: option?.split("^")[0],
          key: option?.split("^")[1],
        }));
        const valueArray = item?.orgAdditionalFields[header.key]?.split(",");
        const labels = valueArray?.map((value) => {
          const foundObject = options?.find((item) => item.value === value);
          return foundObject ? foundObject.key : valueArray[0];
        });
        transformedItem[header.key] = item[header.key] ? item[header.key] : labels;
      } else {
        transformedItem[header.key] = item[header.key] ? item[header.key] : item.orgAdditionalFields[header.key];
      }
    });
    return transformedItem;
  });

  return (
    <Container fluid>
      <Row>
        <Col xl={12}>
          {!isNetworkLoading || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(userRole) ? (
            <Card className="w-100">
              <CardHeader className="d-flex">
                {toggleAudit ? <AuditLogModal toggle={toggleAudit} setIsToggle={setToggleAudit} handleToggle={handleAuditToggle} siteId={siteIdAudit} /> : ""}
                {toggleOrg ? (
                  <OrganizationInfoModal
                    toggle={toggleOrg}
                    setIsToggle={setToggleOrg}
                    handleToggle={handleCreateToggle}
                    networks={networks}
                    defaultNetwork={selectedNetwork}
                    selectedRow={selectedRow}
                  />
                ) : (
                  ""
                )}
                {toggle ? <BulkUploadOrg toggle={toggle} setIsToggle={setToggle} handleToggle={handleToggle} networks={networks} organizations={rows} defaultNetwork={selectedNetwork} /> : ""}
                <div className="d-flex justify-content-between mb-2" style={{ width: "100%" }}>
                  <div className="d-flex align-items-center">
                    <span className="mx-2">Network</span>

                    <Input
                      id="networkId"
                      name="networkId"
                      type="select"
                      required
                      onChange={(e) => {
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
                  </div>
                </div>
              </CardHeader>
              <CardBody className="w-100 text-center">
                <div className="d-flex justify-content-between">
                  <div>
                    <MDBBtn className="me-1" color="secondary" onClick={() => handleCreateToggle(false)} disabled={!selectedNetwork}>
                      <AiOutlinePlus style={{ fontSize: "15px" }} /> Create Organization
                    </MDBBtn>
                    <MDBBtn className="me-1" color="info" disabled={!selectedNetwork} onClick={() => handleToggle(false)}>
                      <AiOutlineCloudUpload style={{ fontSize: "15px" }} /> bulk organization upload
                    </MDBBtn>
                  </div>
                  <div>
                    {selectedNetwork && (
                      <CSVLink data={transformedData} headers={CSV_HEADERS} filename={`${networkName?.networkName}_Organization_Export_Page-${currentPage}_${moment().format("YYYY-MM-DD")}.CSV`}>
                        <MDBBtn className="me-1" color="info">
                          <FaDownload style={{ fontSize: "15px" }} /> export csv
                        </MDBBtn>
                      </CSVLink>
                    )}
                  </div>
                </div>
                {selectedNetwork && (
                  <div>
                    <div className="w-10">
                      <DataTable
                        stripedRows
                        value={rows}
                        dataKey="id"
                        className="custom-datatable org-table"
                        selectionMode="single"
                        emptyMessage="No records found."
                        onSelectionChange={(e) => setSelectedRow(e.value)}
                        selection={selectedRow}
                        onRowSelect={() => handleRowClicked()}
                        filterDisplay="row"
                        onFilter={(event) => {
                          onChangeFilter(event);
                        }}
                        scrollHeight="65vh"
                        loading={isLoading}
                        sortable
                        onSort={handleSort}
                        sortField={sortField}
                        sortOrder={sortOrder === "ASC" ? -1 : 1}
                        scrollable
                      >
                        {orgsMandatoryData?.map((col, i) => {
                          return (
                            col?.displyed &&
                            !col.sensitive && (
                              <Column
                                key={`orgAdditionalFields.${col.key}`}
                                field={col?.default ? col.key : `orgAdditionalFields.${col.key}`}
                                header={col.title}
                                style={{ minWidth: "10rem", maxWidth: "10rem" }}
                                showFilterMenu={false}
                                filter
                                filterElement={(e) => FilterTemplate(e, col)}
                                body={(e) => customFieldTitle(e, col)}
                                sortable
                              />
                            )
                          );
                        })}
                        <Column
                          field="activationStatus"
                          header="Activation Status"
                          showFilterMenu={false}
                          filterMenuStyle={{ width: "10rem" }}
                          style={{ maxWidth: "10rem" }}
                          body={statusBodyTemplate}
                          filter
                          filterElement={statusRowFilterTemplate}
                          sortable
                        />
                        <Column
                          field="deactivationStatus"
                          header="Deactivation Status"
                          showFilterMenu={false}
                          filterMenuStyle={{ width: "10rem" }}
                          style={{ maxWidth: "10rem" }}
                          body={dStatusBodyTemplate}
                          filter
                          filterElement={dStatusRowFilterTemplate}
                          sortable
                        />
                        <Column
                          field="createdAt"
                          header="Created At"
                          showFilterMenu={false}
                          body={(row) => General.formatDate(row.createdAt)}
                          filter
                          style={{ maxWidth: "10rem" }}
                          filterElement={dateTimeFilterTemplate}
                          sortable
                        />
                        <Column
                          field="updatedAt"
                          header="Updated At"
                          showFilterMenu={false}
                          body={(row) => General.formatDate(row.updatedAt)}
                          filter
                          style={{ maxWidth: "10rem" }}
                          filterElement={dateTimeUpdatedAt}
                          sortable
                        />
                      </DataTable>
                      <div className="d-flex">
                        <Paginator
                          first={currentPage * perPage}
                          rows={perPage}
                          totalRecords={totalRows}
                          onPageChange={handlePageChange}
                          rowsPerPageOptions={[100, 250, 500, 1000]}
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
                                  {options.first} - {options.last} of {options.totalRecords}
                                </span>
                              );
                            },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="d-flex justify-content-center mt-4 pt-4">
              <MDBSpinner color="primary" />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Organization;
