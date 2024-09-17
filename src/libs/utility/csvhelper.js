import { useCSVDownloader } from "react-papaparse";
import { MDBIcon } from "mdb-react-ui-kit";
import General from "../../libs/utility/General";

export function CSVDownloader({ fields }) {
	const { CSVDownloader, Type } = useCSVDownloader();
	const combinedObject = {};
	fields?.forEach((key) => {
		combinedObject[key] = "";
	});

	return (
		<CSVDownloader
			type={Type.Link}
			filename={"bulk-organizations-template"}
			style={{ cursor: "pointer" }}
			bom={true}
			config={{
				delimiter: ",",
			}}
			data={[combinedObject]}
		>
			<MDBIcon fas icon="download" /> Download template
		</CSVDownloader>
	);
}

export const validateType = (headerRow, dataRows, orgAdditionalFields) => {
	const validationErrors = [];
	for (let i = 0; i < dataRows.length; i++) {
		const row = dataRows[i];
		for (let j = 0; j < headerRow.length; j++) {
			const columnHeader = headerRow[j];
			const columnDefinition = orgAdditionalFields.find((field) => field.title === columnHeader);
			if (columnDefinition) {
				const type = columnDefinition.type;
				const value = row[j];
				const typeParts = type.split(":");
				if (typeParts.length === 2) {
					const type = typeParts[0].trim();
					const options = typeParts[1].split("|").map((option) => option.split("^")[1]);
					const extractInternalValues = (val) => {
						return val.split(",").map((v) => v.trim());
					};
					let internalValues;
					if (type === "single-select") {
						internalValues = [value];
					} else if (type === "multi-select") {
						internalValues = extractInternalValues(
							value.startsWith('"') && value.endsWith('"') ? value.substring(1, value.length - 1) : value
						);
					} else {
						internalValues = [value];
					}
					internalValues.forEach((internalValue) => {
						if (type === "single-select" || type === "multi-select") {
							if (!options.includes(internalValue)) {
								validationErrors.push(
									`Row ${i + 2}, Column ${j + 1} (${columnHeader}): Invalid value "${internalValue}"`
								);
							}
						} else if (type === "datetime-local" || type === "date") {
							const isValid = General.isValidDateFormat(internalValue);
							if (!isValid) {
								validationErrors.push(
									`Row ${i + 2}, Column ${
										j + 1
									} (${columnHeader}): Invalid date format "${internalValue}"`
								);
							}
						}
					});
				}
			}
		}
	}
	return validationErrors;
};

export const validateRequiredColumns = (headerRow, dataRows, requiredFields) => {
	const emptyRows = dataRows.filter((row) => {
		for (let i = 0; i < headerRow.length; i++) {
			const columnHeader = headerRow[i];
			if (requiredFields.includes(columnHeader) && !row[i].trim()) {
				return true;
			}
		}
		return false;
	});
	return emptyRows;
};
