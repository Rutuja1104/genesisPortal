import React, { useState, useEffect } from "react";
import "./table.css";

const TableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue();
    const columnMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;
    const [value, setValue] = useState(initialValue);
    const [validationMessage, setValidationMessage] = useState("");

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = (e) => {
        displayValidationMessage(e);
        tableMeta?.updateData(row.index, column.id, value, e.target.validity.valid);
    };

    const onSelectChange = (e) => {
        displayValidationMessage(e);
        setValue(e.target.value);
        tableMeta?.updateData(row.index, column.id, e.target.value, e.target.validity.valid);
    };

    const displayValidationMessage = (e) => {
        if (columnMeta?.validate) {
            const isValid = columnMeta.validate(e.target.value);
            if (isValid) {
                e.target.setCustomValidity("");
                setValidationMessage("");
            } else {
                e.target.setCustomValidity(columnMeta.validationMessage);
                setValidationMessage(columnMeta.validationMessage);
            }
        } else if (e.target.validity.valid) {
            setValidationMessage("");
        } else {
            setValidationMessage(e.target.validationMessage);
        }
    };

    if (tableMeta?.editedRows[row.id]) {
        return columnMeta?.type === "select" ? (
            <select className="orgMandatorySelect" onChange={onSelectChange} value={initialValue} required={columnMeta?.required} title={validationMessage}>
                {columnMeta?.options?.map((option) => (
                    <option key={option.value} disabled={option.value == ""} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        ) : (
            <>
                {columnMeta?.type !== "checkbox" ? (
                    <input
                        className="orgInputFields"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={onBlur}
                        type={columnMeta?.type || "text"}
                        required={true}
                        pattern={columnMeta?.pattern}
                        title={validationMessage}
                        disabled={column.columnDef.accessorKey !== "title" && row?.original?.default ? true : false}
                    />
                ) : (
                    <input
                        className="checkboxInput"
                        type="checkbox"
                        onBlur={onBlur}
                        checked={value}
                        onChange={(e) => {
                            setValue(e.target.checked);
                        }}
                        disabled={row?.original?.default ? true : false}
                    />
                )}
            </>
        );
    }
    if (typeof value === "boolean") {
        return <input type="checkbox" checked={value} disabled />;
    }
    return <span>{value}</span>;
};

export default TableCell;
