import * as yup from "yup";

export const createUserSchema = yup.object({
  firstName: yup.string("Enter First Name.").required("First Name is required."),
  lastName: yup.string("Enter Last Name.").required("Last Name is required."),
  userName: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required."),
  type: yup.string("Select Role.").required("Role is required."),
  displayName: yup
    .string("Enter Last Display Name")
    .required("Display Name is required."),
});
