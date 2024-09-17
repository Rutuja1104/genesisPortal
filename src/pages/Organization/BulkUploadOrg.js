import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { CSVDownloader, validateType, validateRequiredColumns } from "../../libs/utility/csvhelper";
import {
	MDBBtn,
	MDBModal,
	MDBModalDialog,
	MDBModalContent,
	MDBModalHeader,
	MDBModalTitle,
	MDBModalBody,
	MDBSpinner,
	MDBFile,
} from "mdb-react-ui-kit";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { uploadOrganizationSchema } from "../../libs/utility/validators/organizationFormValidator";
import OrganizationDataService from "../../services/OrganizationDataService";
import { toast } from "react-toastify";
import { AiOutlineCloudUpload, AiOutlineCloseCircle } from "react-icons/ai";
import { usePapaParse } from "react-papaparse";
import { customTableStyles } from "../../libs/constant";

export default function BulkUploadOrg({ toggle, setIsToggle, handleToggle, networks, defaultNetwork }) {
	const [isLoading, setIsLoading] = useState(false);
	const [columns, setColumns] = useState([]);
	const [rows, setRows] = useState([]);
	const [csvFile, setCsvFile] = useState();
	const [errorMessage, setErrorMessage] = useState("");
	const { readRemoteFile } = usePapaParse();
	const networkOrgAdditionalField = networks.find((element) => defaultNetwork === element.networkId);

	const orgAdditionalFields = networkOrgAdditionalField?.orgAdditionalFields || [];

	const parseCSVfile = () => {
		setColumns([]);
		setRows([]);
		const requiredFields = orgAdditionalFields
			.filter((field) => field.required)
			.map((field) => {
				if (field.required) return field.title;
			});
		readRemoteFile(csvFile, {
			complete: async (results) => {
				let headerRow = results.data[0];
				headerRow = headerRow.map((header) => header.replace("*", "").trim());
				let dataRows = results.data.slice(1);
				if (dataRows[dataRows.length - 1].length === 1 && dataRows[dataRows.length - 1][0] === "") {
					dataRows.pop();
				}
				const expectedColumns = requiredFields;
				const missingColumns = expectedColumns.filter((col) => !headerRow.includes(col));

				if (missingColumns.length > 0) {
					setErrorMessage("Column mismatch. Missing columns: " + missingColumns.join(", "));
					setColumns([]);
					setRows([]);
					return;
				}

				const emptyRows = validateRequiredColumns(headerRow, dataRows, requiredFields);
				if (emptyRows.length > 0) {
					const emptyRowIndexes = emptyRows.map((row) => dataRows.indexOf(row) + 2);
					const emptyColumnIndexes = [];
					headerRow.forEach((header, index) => {
						if (emptyRows.every((row) => !row[index].trim())) {
							emptyColumnIndexes.push(index);
						}
					});
					const errorMessage = `Empty rows found at rows: ${emptyRowIndexes.join(
						", "
					)} and columns: ${emptyColumnIndexes.map((index) => headerRow[index]).join(", ")}.`;
					setErrorMessage(errorMessage);
					setColumns([]);
					setRows([]);
					return;
				}

				const validationErrors = validateType(headerRow, dataRows, orgAdditionalFields);
				if (validationErrors.length > 0) {
					setErrorMessage(validationErrors.join("\n"));
					setColumns([]);
					setRows([]);
					return;
				}
				const updatedHeaderRow = headerRow.map((header) =>
					header.endsWith("*") ? header.slice(0, -2) : header
				);
				let parsedRows = [];
				Promise.all(
					dataRows?.map(async (row) => {
						const data = updatedHeaderRow.reduce((obj, key, index) => {
							obj[key] = row[index];
							return obj;
						}, {});
						const siteIdKey = orgAdditionalFields.filter((element) => element.key === "siteKey")[0];
						const accountIdKey = orgAdditionalFields.filter((element) => element.key === "accountKey")[0];
						data["Org Status"] = await getOrganizationStatus({
							siteKey: data?.[siteIdKey.title],
							accountKey: data?.[accountIdKey.title],
						});
						parsedRows.push(data);
					})
				).then(() => {
					const columns = [...updatedHeaderRow, "Org Status"]?.map((key) => ({
						name: key,
						selector: (row) => {
							if (row[key] !== null && typeof row[key] === "boolean") {
								return row[key] ? "true" : "false";
							}
							return row[key] !== null ? row[key] : "N/A";
						},
						wrap: true,
					}));
					setColumns(columns);
					setRows(parsedRows);
				});
			},
		});
	};

	const getOrganizationStatus = async (orgParams) => {
		try {
			const response = await OrganizationDataService.getOrganizationStatus(orgParams);
			if (response?.data?.body === true) return "UPDATE";
			return "NEW";
		} catch (err) {
			console.log(err);
			return "N/A";
		}
	};

	const handleUploadOrganization = async (submittedData, { resetForm }) => {
		setIsLoading(true);
		const reader = new FileReader();
		reader.onload = async () => {
			const csvString = reader.result;
			const lines = csvString.split("\n");
			let modifiedHeaderRow = lines[0].replace(/\*+\s*,?/g, ",");
			modifiedHeaderRow = modifiedHeaderRow.split(",");
			modifiedHeaderRow = modifiedHeaderRow.slice(0, -1);
			const keysFromTitle = modifiedHeaderRow.map((header) => {
				const field = orgAdditionalFields.filter((obj) => header === obj.title);
				return field[0].key;
			});
			lines[0] = keysFromTitle;
			const modifiedCsvString = lines.join("\n");
			const formData = new FormData();
			formData.append("file", new Blob([modifiedCsvString], { type: csvFile?.type }), csvFile?.name);
			const params = {
				networkId: defaultNetwork,
			};

			try {
				const response = await OrganizationDataService.uploadOrganizationList(formData, params);
				if (response.status) {
					setIsLoading(false);
					toast.success(response.data.message, {
						position: "top-right",
						autoClose: 3000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
					});
					handleToggle(true, true);
				} else {
					setIsLoading(false);
					toast.error(response.error, {
						position: "top-right",
						autoClose: 3000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
					});
					handleToggle(true);
				}
			} catch (err) {
				toast.error("Error while uploading csv", {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
				});
				console.error("Error uploading organization:", err);
			} finally {
				setIsLoading(false);
				resetForm();
				setColumns([]);
				setRows([]);
				setCsvFile();
			}
		};

		reader.readAsText(csvFile);
	};

	useEffect(() => {
		setErrorMessage("");
		(() => {
			if (csvFile) {
				parseCSVfile();
			}
		})();
	}, [csvFile]);

  const renderCSVTable = () => {
    if (columns && rows.length > 0) {
      return (
        <DataTable
          columns={columns}
          data={rows}
          pagination
          highlightOnHover
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
          }}
          customStyles={customTableStyles}
        />
      );
    } else {
      return csvFile ? (
        <MDBSpinner color="primary" className="my-2 align-center" />
      ) : (
        <p>No CSV file chosen</p>
      );
    }
  };

	return (
		<MDBModal open={toggle} setOpen={setIsToggle} tabIndex="-1">
			<MDBModalDialog size="xl">
				<MDBModalContent>
					<MDBModalHeader>
						<MDBModalTitle>Upload organizations csv file</MDBModalTitle>
						<MDBBtn className="btn-close" color="none" onClick={() => handleToggle(false)}></MDBBtn>
					</MDBModalHeader>
					<MDBModalBody id="bulk-upload">
						<Formik
							initialValues={{
								csvFile: "",
							}}
							validationSchema={uploadOrganizationSchema}
							onSubmit={handleUploadOrganization}
						>
							{({ isSubmitting }) => (
								<Form autoComplete="off">
									{defaultNetwork && (
										<CSVDownloader
											fields={orgAdditionalFields.map((field) => {
												if (field.required) return `${field.title}*`;
												else return field.title;
											})}
										/>
									)}
									<Field name="csvFile">
										{({ field }) => (
											<div className="mb-4">
												<MDBFile
													{...field}
													label={
														<>
															Select csv file <span className="text-danger">* </span>
														</>
													}
													accept=".csv"
													onChange={(e) => {
														setCsvFile(e.target.files[0]);
														field.onChange(e);
													}}
													onClick={(e) => {
														e.target.closest("form").reset();
													}}
												/>
												<ErrorMessage
													name="csvFile"
													component="div"
													className="text-danger text-sm"
												/>
											</div>
										)}
									</Field>
									{errorMessage ? <p className="text-danger">{errorMessage}</p> : renderCSVTable()}
									<div>
										{isLoading ? (
											<MDBSpinner color="primary" className="m-2" />
										) : (
											<>
												<MDBBtn
													type="submit"
													className="m-1"
													disabled={isSubmitting && errorMessage.length > 0}
												>
													<AiOutlineCloudUpload style={{ fontSize: "15px" }} /> Upload
												</MDBBtn>
												<MDBBtn
													type="reset"
													onClick={() => handleToggle(false)}
													color="secondary"
													className="m-1"
												>
													<AiOutlineCloseCircle style={{ fontSize: "15px" }} /> Close
												</MDBBtn>
											</>
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
