import * as yup from "yup";
export const uploadOrganizationSchema = yup.object({
  csvFile: yup.string("Select the network").required("CSV file is required"),
});

export const createOrgSchema = yup.object({});

export const updateOrgSchema = yup.object({
  organizationType: yup
    .string("Enter organization type")
    .required("Organization type is required"),
});

export const folderValidationSchema = yup.object().shape({
  folderName: yup.string()
    .matches(/^[a-zA-Z0-9_-][a-zA-Z0-9 _-]*$/, 'Folder name can only contain letters, numbers, spaces (except at the beginning), _, and -')
    .required('Folder name is required'),
});
