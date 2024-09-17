import React, { useState } from "react";
import { MDBInputGroup, MDBIcon } from "mdb-react-ui-kit";
import { Input, Label } from "reactstrap";
import Select from "react-select";
import useDebounce from "../../libs/hooks/useDebounce";
import { Tooltip } from "react-tooltip";
import { IoMdInformationCircleOutline } from "react-icons/io";
const CustomField = ({ config, onUpdate, defaultValue, customStyle = {}, selectedRow = {}, validation = "" }) => {
    const [isVisible, setIsVisible] = useState(!defaultValue);
    const [value, setValue] = useState(defaultValue || "");
    const debounce = useDebounce(1000);
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
        const handleChangeSelect = (e) => {
        setValue(e);
        onUpdate(config.key, e);
    };
    const handleChange = (e) => {
        if (validation) {
            if (validation.test(e?.target?.value) || e?.target?.value?.length === 0) {
                setValue(e?.target?.value);
            }
        } else {
            setValue(e?.target?.value);
        }

        debounce(() => {
            onUpdate(config.key, e?.target?.value);
        });
    };

    const parseTypeString = (typeString) => {
        const dataType = typeString?.split(":");
        if (dataType) {
            const [type, valuesString] = typeString.split(":");
            if (!valuesString) {
                return { type, values: [] };
            }
            const values = valuesString.split("|").map((valuePair) => {
                const [value, label] = valuePair.split("^");
                return { value, label };
            });
            return { type, values };
        }
        return { type: dataType, values: "" };
    };

    const renderMultiSelect = (type) => {
        if (type === "multi-select") {
            return (
                <Select
                    options={values}
                    isMulti={type === "multi-select"}
                    value={
                        Array.isArray(value)
                            ? value?.map((obj) => {
                                  return {
                                      value: obj?.value,
                                      label: obj?.label,
                                  };
                              })
                            : value?.split(",").map((obj) => {
                                  return values?.find((ob) => ob?.value === obj);
                              })
                    }
                    onChange={handleChangeSelect}
                    isSearchable={false}
                    required={config.required}
                    isClearable
                    styles={{
                        control: (provided, state) => ({
                            ...provided,
                            ...customStyle,
                        }),
                    }}
                />
            );
        } else {
            return (
                <Select
                    options={values}
                    isMulti={type === "multi-select"}
                    value={
                        value && typeof value === "object"
                            ? { value: value?.value, label: value?.label }
                            : value?.split(",").map((obj) => {
                                  return values?.find((ob) => ob?.value === obj);
                              })
                    }
                    onChange={handleChangeSelect}
                    required={config.required}
                    isClearable
                    styles={{
                        control: (provided, state) => ({
                            ...provided,
                            ...customStyle,
                        }),
                    }}
                />
            );
        }
    };
    const { type, values } = parseTypeString(config.type);
    const isMasked = value ? "***************" : "(Not configured)";

    const isDisabled = (() => {
        if (config.sensitive) {
            return !isVisible;
        }

        const hasCustomStyle = Object.keys(customStyle).length > 0;
        const hasNonSensitiveKey = !["siteKey", "accountKey"].includes(config?.key);
        const hasSelectedRow = Object.keys(selectedRow).length > 0;

        return !(hasCustomStyle || hasNonSensitiveKey || hasSelectedRow);
    })();

    return (
        <>
            <Label>
                {config.title}
                {config.required ? <span className="text-danger"> * </span> : ""}
            </Label>
            {config.justification?.length>0?<> <IoMdInformationCircleOutline
                            style={{ cursor: "pointer" }}
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content={config.justification}
                        />  
                        <Tooltip id="my-tooltip" /> </>:""}
            {type === "single-select" || type === "multi-select" ? (
                renderMultiSelect(type)
            ) : (
                <MDBInputGroup
                    noBorder
                    style={{ cursor: "pointer" }}
                    textAfter={config.sensitive ? <MDBIcon fas icon={isVisible ? "eye-slash" : "pencil"} onClick={toggleVisibility} /> : ""}
                >
                    <>
                        {config.sensitive ? (
                            <>
                                <Input
                                    type={type}
                                    placeholder={isVisible ? value : isMasked}
                                    value={isVisible ? value : ""}
                                    onChange={handleChange}
                                    disabled={isDisabled}
                                    required={config.required}
                                    style={{ ...customStyle, fontFamily: "monospace" }}
                                />
                                {value && Object.keys(customStyle).length > 0 ? (
                                    <button className="button-icon" type="reset" onClick={handleChange}>
                                        &times;
                                    </button>
                                ) : (
                                    ""
                                )}
                            </>
                        ) : (
                            <>
                                <Input
                                    type={type}
                                    value={value}
                                    onChange={handleChange}
                                    required={config.required}
                                    style={customStyle}
                                    placeholder={Object.keys(customStyle).length === 0 ? "" : "Search..."}
                                    isclearable={"true"}
                                    disabled={
                                        !(
                                            Object.keys(customStyle).length > 0 ||
                                            !["siteKey", "accountKey"].includes(config?.key) ||
                                            !Object.keys(selectedRow).length > 0
                                        )
                                    }
                                />
                                {value && Object.keys(customStyle).length > 0 ? (
                                    <button className="button-icon" type="reset" onClick={handleChange}>
                                        &times;
                                    </button>
                                ) : (
                                    ""
                                )}
                            </>
                        )}
                    </>
                </MDBInputGroup>
            )}
        </>
    );
};

export default CustomField;
