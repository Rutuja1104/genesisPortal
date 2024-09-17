import * as yup from "yup";

export const createNetworkSchema = yup.object({
  networkName: yup.string("Enter network name").required("Network name is required"),
  baseUrls: yup
    .string()
    .optional("Base URL is required")
    .matches(/^(?!.*insiteflow\.io$)/, "Please enter only prefix"),
});

export const networkDetailsSchema = yup.object({
  networkName: yup.string().required("Network name is required"),
});
