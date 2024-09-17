import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  MDBBtn,
  MDBSpinner,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBIcon,
} from "mdb-react-ui-kit";
import { Tooltip as ReactTooltip } from "react-tooltip";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import AuditLogDataService from "../../services/AuditLogDataService";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { auditLogSchema } from "../../libs/utility/validators/auditLogValidator";
import { customTableStyles } from "../../libs/constant";

export default function AuditLogModal({
  toggle,
  setIsToggle,
  handleToggle,
  siteId,
}) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const currentdate = new Date();
    const datetime =
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    if (siteId) {
      let params = {
        endDate: "03/26/2024 13:20",
        siteKey: siteId,
        startDate: "03/26/2023 13:20",
      };
      getAuditLogs(params);
    }
  }, [siteId]);

  const getAuditLogs = async (params) => {
    setColumns([]);
    setRows([]);
    try {
      let auditsResponse = await AuditLogDataService.getAuditLogs(params);
      if (auditsResponse) {
        let auditColumn = ["dateTime", "action", "data"];
        const arrayOfObjects = auditColumn.map((key) => ({
          name: key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          selector: (row) => {
            if (row[key] !== null && typeof row[key] === "boolean") {
              return row[key] ? "true" : "false";
            }
            return row[key] !== null ? row[key] : "N/A";
          },
          sortable: true,
        }));
        const auditData = auditsResponse.data?.body.auditEvents;
        const parsedAudit = auditData.map((data) => {
          const value = JSON.parse(data.data);
          return {
            dateTime: value.StartDate,
            action: value.EventType,
            data: JSON.stringify(value.Action?.ResponseBody || {}),
          };
        });
        console.log("PARSED AUDIT", parsedAudit);
        arrayOfObjects.push({
          name: "Info",
          ignoreRowClick: true,
          cell: (row) => {
            let info = row.data;
            console.log("ROW", row);
            return (
              <div className="d-inline m-1">
                <ReactTooltip
                  id="my-tooltip-1"
                  render={() => <div>{JSON.stringify(info, null, 2)}</div>}
                  clickable
                />
                <MDBIcon
                  fas
                  color="primary"
                  data-tooltip-id="my-tooltip-1"
                  style={{ cursor: "pointer" }}
                  icon="info-circle"
                />
              </div>
            );
          },
        });
        setColumns(arrayOfObjects);
        setRows(parsedAudit);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (submittedData, { resetForm }) => {
    setIsLoading(true);
    const params = {
      siteKey: submittedData.siteId,
      startDate: submittedData.startDate,
      endDate: submittedData.endDate,
    };
    try {
      const response = await getAuditLogs(params);
      console.log(response);
    } catch (err) {
      console.log("error", err);
      let error = err.json();
      console.log("ERROR ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MDBModal open={toggle} setOpen={setIsToggle} tabIndex="-1">
      <MDBModalDialog size="xl">
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Organization audits log</MDBModalTitle>
            <MDBBtn
              className="btn-close"
              color="none"
              onClick={handleToggle}
            ></MDBBtn>
          </MDBModalHeader>
          <MDBModalBody>
            <Container fluid>
              <Row>
                <Col xl={12}>
                  <Card>
                    <CardHeader>
                      <Formik
                        initialValues={{
                          siteId: "",
                          cdh: "",
                          startDate: "",
                          endDate: "",
                        }}
                        validationSchema={auditLogSchema}
                        onSubmit={handleSubmit}
                      >
                        {({ isSubmitting }) => (
                          <Form
                            autoComplete="off"
                            className="d-flex justify-content-start"
                          >
                            <Field name="siteId">
                              {({ field }) => (
                                <div className="mx-4">
                                  <FormGroup>
                                    <Label>Site Id</Label>
                                    <Input
                                      {...field}
                                      id="siteId"
                                      name="siteId"
                                      type="text"
                                      value={siteId}
                                    />
                                    <ErrorMessage
                                      name="siteId"
                                      component="div"
                                      className="text-danger text-sm"
                                    />
                                  </FormGroup>
                                </div>
                              )}
                            </Field>
                            <Field name="cdh">
                              {({ field }) => (
                                <div className="mx-4">
                                  <FormGroup>
                                    <Label>CDH</Label>
                                    <Input
                                      {...field}
                                      id="cdh"
                                      name="cdh"
                                      type="text"
                                    />
                                    <ErrorMessage
                                      name="cdh"
                                      component="div"
                                      className="text-danger text-sm"
                                    />
                                  </FormGroup>
                                </div>
                              )}
                            </Field>
                            <Field name="startDate">
                              {({ field }) => (
                                <div className="mx-4">
                                  <FormGroup>
                                    <Label>Start date</Label>
                                    <Input
                                      {...field}
                                      id="startDate"
                                      name="startDate"
                                      type="datetime-local"
                                    />
                                    <ErrorMessage
                                      name="startDate"
                                      component="div"
                                      className="text-danger text-sm"
                                    />
                                  </FormGroup>
                                </div>
                              )}
                            </Field>
                            <Field name="endDate">
                              {({ field }) => (
                                <div className="mx-4">
                                  <FormGroup>
                                    <Label>End date</Label>
                                    <Input
                                      {...field}
                                      id="endDate"
                                      name="endDate"
                                      type="datetime-local"
                                    />
                                    <ErrorMessage
                                      name="endDate"
                                      component="div"
                                      className="text-danger text-sm"
                                    />
                                  </FormGroup>
                                </div>
                              )}
                            </Field>

                            <div className="mt-4">
                              <FormGroup>
                                {isLoading ? (
                                  <MDBSpinner color="primary" />
                                ) : (
                                  <MDBBtn type="submit" disabled={isSubmitting}>
                                    Get audit
                                  </MDBBtn>
                                )}
                              </FormGroup>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    </CardHeader>
                    <CardBody>
                      {columns && rows.length > 0 ? (
                        <DataTable
                          columns={columns.map((column) => ({
                            ...column,
                            width:
                              column.name === "Id"
                                ? "100px"
                                : column.name === "Created" ||
                                  column.name === "Updated" ||
                                  column.name === "Actions"
                                ? "2%"
                                : undefined,
                          }))}
                          data={rows}
                          pagination
                          highlightOnHover
                          paginationPerPage={5}
                          paginationRowsPerPageOptions={[5, 10, 15]}
                          paginationComponentOptions={{
                            rowsPerPageText: "Rows per page:",
                          }}
                          noHeader
                          persistTableHead
                          subHeader
                          customStyles={customTableStyles}
                          subHeaderComponent={
                            <input type="text" placeholder="Search..." />
                          }
                        />
                      ) : (
                        <MDBSpinner color="primary" />
                      )}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </MDBModalBody>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}
