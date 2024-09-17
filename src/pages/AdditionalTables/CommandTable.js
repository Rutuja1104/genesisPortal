import React, { useEffect } from "react";
import { GrAddCircle } from "react-icons/gr";
import { Card, Input } from "reactstrap";
import { Field } from "formik";
import { MDBInput, MDBBtn } from "mdb-react-ui-kit";
import { AiOutlinePlus } from "react-icons/ai";
import { IoIosRemoveCircleOutline } from "react-icons/io";
const CommandTable = ({ commands, setCommands }) => {

  const addParams = (index) => {
    const newCommands = commands?.map((method, i) => {
      if (i === index) {
        return {
          ...method,
          params: [
            ...method.params,
            {
              label: "",
              type: "",
            },
          ],
        };
      }
      return method;
    });
    setCommands(newCommands);
  };

  const removeParams = (index, keyToRemove) => {
    const newCommands = [...commands];
    const newParams = [...newCommands[index].params];
    newParams.splice(keyToRemove, 1);
    const updatedSupportedMethod = newCommands?.map((method, i) => {
      if (i === index) {
        return {
          ...method,
          params: newParams,
        };
      }
      return method;
    });
    setCommands(updatedSupportedMethod);
  };

  const updateSupportedMethodValue = (index, key, value, paramsIndex) => {
    const newCommands = [...commands];
    if (paramsIndex >= 0) {
      newCommands[index]["params"][paramsIndex][key] = value;
    } else if (newCommands[index]) {
      newCommands[index][key] = value;
    }
    setCommands(newCommands);
  };

  const addCommands = () => {
    setCommands([
      ...commands,
      {
        scope: "",
        label: "",
        key: "",
        description: "",
        params: [],
      },
    ]);
  };

  const removeCommands = (index) => {
    const newCommands = [...commands];
    newCommands.splice(index, 1);
    setCommands(newCommands);
  };

  return (
    <>
      <div className="d-flex align-items-end justify-content-end ">
        <MDBBtn className="m-1" type="button" color="secondary" onClick={() => addCommands()}>
          <AiOutlinePlus />
          Add new command
        </MDBBtn>
      </div>
      {commands?.map((method, i) => {
        return (
          <Card key={i} className=" mb-3 py-2">
            <div className="d-flex align-items-end justify-content-between mx-1">
              <Field name="scope">
                {({ field }) => (
                  <div className=" mx-2 w-50">
                    <span className="mx-1">Select Scope</span>
                    <Input
                      {...field}
                      type="select"
                      required
                      onChange={(e) => {
                        updateSupportedMethodValue(i, field.name, e.target.value);
                      }}
                      defaultValue={method?.scope}
                    >
                      <>
                        <option value="" disabled selected>
                          Select Scope
                        </option>
                        <option key="organization" value={"organization"}>
                          Organization
                        </option>
                        <option key="network" value={"network"}>
                          Network
                        </option>
                      </>
                    </Input>
                  </div>
                )}
              </Field>
              <h4>
                <IoIosRemoveCircleOutline
                  onClick={() => {
                    removeCommands(i);
                  }}
                  style={{ color: "red", cursor: "pointer" }}
                />
              </h4>
            </div>
            <div className="d-flex align-items-center flex-row gap-2 ">
              <Field name="label">
                {({ field }) => (
                  <div className=" mx-2 w-50">
                    <span className="mx-1">Label</span>
                    <MDBInput type="text" onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value)} required value={method?.label} />{" "}
                  </div>
                )}
              </Field>
              <Field name="key">
                {({ field }) => (
                  <div className="mx-2 w-50">
                    <span className="mx-1 w-25">Key</span>
                    <MDBInput {...field} type="text" onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value)} required value={method?.key} />{" "}
                  </div>
                )}
              </Field>
              <Field name="description">
                {({ field }) => (
                  <div className="mx-2 w-50">
                    <span className="mx-1 w-25">Description</span>
                    <MDBInput {...field} type="text" onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value)} required value={method?.description} />{" "}
                  </div>
                )}
              </Field>
            </div>
            <div className="my-2">
              <span className="fw-bolder mx-2">
                {" "}
                Parameter <GrAddCircle onClick={() => addParams(i)} />
              </span>
              {method?.params?.map((param, index) => {
                return (
                  <div className="d-flex my-1 " key={index}>
                    <Field name="label">
                      {({ field }) => (
                        <div className="mx-2 w-50">
                          <span className="mx-1">Label</span>
                          <MDBInput {...field} onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value, index)} value={param.label} required />{" "}
                        </div>
                      )}
                    </Field>
                    <Field name="type">
                      {({ field }) => (
                        <div className="mx-2 w-50">
                          <span className="mx-1">Type</span>
                          <Input {...field} type="select" required defaultValue={param.type} onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value, index)}>
                            <option value="" disabled selected>
                              Select Parameter type
                            </option>
                            <option key="text" value="text">
                              Text
                            </option>
                            <option key="number" value="number">
                              Number
                            </option>
                            <option key="datetime" value="datetime">
                              Date-time
                            </option>
                            <option key="boolean" value="boolean">
                              Boolean
                            </option>
                          </Input>
                        </div>
                      )}
                    </Field>

                    <h5>
                      <IoIosRemoveCircleOutline
                        className="m-2"
                        onClick={() => {
                          removeParams(i, index);
                        }}
                        style={{ color: "red", cursor: "pointer" }}
                      />
                    </h5>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </>
  );
};

export default CommandTable;
