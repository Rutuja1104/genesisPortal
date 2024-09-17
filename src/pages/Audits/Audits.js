import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { MDBBtn, MDBSpinner } from "mdb-react-ui-kit";
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
const Audits = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    siteId: "",
    cdh: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let params = {
      endDate: "03/26/2024 13:20",
      siteId: "PF.a28bd017-d39c-4470-985b-6c0c5bd3db9c",
      startDate: "03/26/2023 13:20",
    };
    getAuditLogs(params);
  }, []);

  const getAuditLogs = async (params) => {
    try {
      setColumns([]);
      setRows([]);
      const auditsResponse = await AuditLogDataService.getAuditLogs(params);
      const keysArray = Object.keys(auditsResponse?.data?.body.auditEvents[0]);
      const arrayOfObjects = keysArray.map((key) => ({
        name: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        selector: (row) => {
          if (row[key] !== null && typeof row[key] === "boolean") {
            return row[key] ? "true" : "false";
          }
          if (key === "data" && typeof row[key] === "string") {
            try {
              const parsedData = JSON.parse(row[key]);
              console.log("PARSED DATA IS ", parsedData);
              return JSON.stringify(parsedData);
            } catch (error) {
              console.error("Error parsing JSON:", error);
              return "N/A";
            }
          }
          return row[key] !== null ? row[key] : "N/A";
        },
        sortable: true,
      }));
      setColumns(arrayOfObjects);
      setRows(auditsResponse?.data?.body.auditEvents);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (submittedData, { resetForm }) => {
    setIsLoading(true);
    const params = {
      siteId: submittedData.siteId,
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
      resetForm();
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader>
              <Formik
                initialValues={formValues}
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
                            <Input {...field} id="cdh" name="cdh" type="text" />
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
                  subHeaderComponent={
                    <input type="text" placeholder="Search..." />
                  }
                />
              ) : (
                <span>No audit logs</span>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Audits;
