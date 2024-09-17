import React, { useState, useContext } from "react";
import { globalContext } from "../../global-context/GlobalContext";
import { MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle, MDBModalBody, MDBInput, MDBSpinner, MDBFile, MDBProgress, MDBProgressBar } from "mdb-react-ui-kit";
import { Label } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { uploadFileToS3, createFolder } from "../../libs/hooks/useContent";
import { toast } from "react-toastify";
import { folderValidationSchema } from "../../libs/utility/validators/organizationFormValidator";

function UploadFileModal({ toggle, handleToggle, path, type, list }) {
  const [uploadFileLoading, setUploadFileLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const context = useContext(globalContext);
  const [fileToUpload, setFileToUpload] = useState();
  const { userData } = context;
  const initialValue =
    type === "file"
      ? {
          path: `/${path}`,
          description: "",
          fileToUpload: "",
        }
      : {
          path: `/${path}`,
          folderName: "",
        };
  const handleUploadFile = async (values, { resetForm }) => {
    const uploadBy = userData?.email || userData?.userName;
    setUploadFileLoading(true);
    let res;
    const progressCallback = (progress) => {
      setUploadProgress(progress);
    };
    if (type === "file") {
      res = await uploadFileToS3(path, fileToUpload, values.description, uploadBy, progressCallback);
    } else if (type === "folder") {
      const isExist = list.filter((obj) => obj.type === "folder" && obj.name === values.folderName + "/");
      if (isExist.length) {
        toast.error("Folder already exist");
        handleToggle(true);
        resetForm();
        setUploadProgress(0);
        setUploadFileLoading(false);
        return;
      } else {
        res = await createFolder(path + values.folderName, uploadBy);
      }
    }
    if (res) {
      toast.success(`${type === "file" ? "file uploaded successfully !" : "Folder created successfully !"}`);
    } else {
      toast.error(`${type === "file" ? "Unable to upload file, please try again !" : "Unable to create folder, please try again !"}`);
    }
    handleToggle(true);
    resetForm();
    setUploadProgress(0);
    setUploadFileLoading(false);
  };
  return (
    <div>
      <MDBModal open={toggle} onClose={() => handleToggle()} tabIndex="-1">
        <MDBModalDialog size="lg">
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{type === "file" ? "Upload file" : "Create folder"}</MDBModalTitle>
              <MDBBtn className="btn-close" color="none" onClick={() => handleToggle()}></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <Formik onSubmit={handleUploadFile} initialValues={initialValue} validationSchema={type === "folder" ? folderValidationSchema : ""}>
                {({ isSubmitting }) => (
                  <Form autoComplete="off">
                    {type === "folder" ? (
                      <div className="col">
                        <Field name="folderName">
                          {(field) => (
                            <div className="mb-4">
                              <Label>
                                {" "}
                                Folder Name <span className="text-danger">*</span>{" "}
                              </Label>
                              <MDBInput {...field.field} type="text" required />
                              <ErrorMessage name="folderName" component="div" className="text-danger text-sm" />
                            </div>
                          )}
                        </Field>
                      </div>
                    ) : (
                      <>
                        <div className="col">
                          <Field name="description">
                            {(field) => (
                              <div className="mb-4">
                                <Label> Description </Label>
                                <MDBInput {...field.field} type="text" />
                                <ErrorMessage name="description" component="div" className="text-danger text-sm" />
                              </div>
                            )}
                          </Field>
                        </div>
                        <div className="col">
                          <Field name="fileToUpload">
                            {({ field }) => (
                              <div className="mb-4">
                                <MDBFile
                                  {...field}
                                  required
                                  onChange={(e) => {
                                    setFileToUpload(e.target.files[0]);
                                    field.onChange(e);
                                  }}
                                  label={
                                    <>
                                      Select a file <span className="text-danger">* </span>
                                    </>
                                  }
                                />
                                <ErrorMessage name="fileToUpload" component="div" className="text-danger text-sm" />
                              </div>
                            )}
                          </Field>
                        </div>
                      </>
                    )}
                    <div>
                      {uploadFileLoading ? (
                        <>
                          {type === "file" ? (
                            <>
                              {" "}
                              Uploading...
                              <MDBProgress height="15">
                                <MDBProgressBar width={uploadProgress} valuemin={0} valuemax={100}>
                                  {uploadProgress}%
                                </MDBProgressBar>
                              </MDBProgress>
                            </>
                          ) : (
                            <MDBSpinner color="primary" className="me-2" />
                          )}
                        </>
                      ) : (
                        <div className="d-flex justify-content-between">
                          <MDBBtn type="submit" className="my-2" disabled={isSubmitting}>
                            {type === "file" ? "Upload" : "Create"}
                          </MDBBtn>
                        </div>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
}

export default UploadFileModal;
