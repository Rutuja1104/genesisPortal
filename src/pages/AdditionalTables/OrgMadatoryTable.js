import React, { useEffect, useState } from "react";
import "./table.css";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { AddColumns } from "./columns";
import { FooterCell } from "./FooterCell";
import useOrgFields from "./useOrgFields";
import { MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import { AiOutlinePlus } from "react-icons/ai";

const OrgMadatoryTable = ({ networks, orgAdditionalFields, setorgAdditionalFields }) => {
    const { data: originalData, errorMessage, addRow, updateRow, deleteRow } = useOrgFields(orgAdditionalFields);
    const [data, setData] = useState([]);
    const [editedRows, setEditedRows] = useState({});
    const [validRows, setValidRows] = useState({});
    const [disableAddRow, setDisableAddRow] = useState(false);

    useEffect(() => {
        if (originalData.length) {
            setData([...originalData]);
        }
    }, [originalData]);

    useEffect(() => {
        if (orgAdditionalFields?.length > 0) {
            let newArray = orgAdditionalFields.map((obj, index) => {
                if (!obj.hasOwnProperty("id")) {
                    const id = Math.floor(Math.random() * 1000);
                    obj.id = id;
                }
                return obj;
            });
            setData(newArray);
        }
    }, [orgAdditionalFields]);

    useEffect(() => {
        setorgAdditionalFields(data);
    }, [data]);

    const table = useReactTable({
        data,
        columns: AddColumns(networks),
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        meta: {
            editedRows,
            setEditedRows,
            validRows,
            setValidRows,
            revertData: (rowIndex) => {
                setData((old) => {
                    if (old) {
                        return old.map((row, index) => (index === rowIndex ? originalData[rowIndex] : row));
                    } else {
                        return [];
                    }
                });
            },
            updateRow: (rowIndex) => {
                updateRow(data[rowIndex]?.id, data[rowIndex]);
            },
            updateData: (rowIndex, columnId, value, isValid) => {
                setData((old) => {
                    if (old) {
                        return old.map((row, index) => {
                            if (index === rowIndex) {
                                return {
                                    ...old[rowIndex],
                                    [columnId]: value,
                                };
                            }
                            return row;
                        });
                    } else {
                        return [];
                    }
                });
                setValidRows((old) => ({
                    ...old,
                    [rowIndex]: { ...old[rowIndex], [columnId]: isValid },
                }));
            },
            addRow: () => {
                const newRow = {
                    title: "",
                    key: "",
                    type: "",
                    justification: "",
                    required: false,
                    displyed: false,
                    sensitive: false,
                };
                addRow(newRow);
            },
            removeRow: (rowIndex) => {
                deleteRow(data[rowIndex].id);
            },
            removeSelectedRows: (selectedRows) => {
                const setFilterFunc = (old) => old?.filter((_row, index) => !selectedRows?.includes(index));
                setData(setFilterFunc);
                selectedRows.forEach(async (rowIndex) => {
                    deleteRow(data[rowIndex]?.id);
                });
            },
        },
    });
    const meta = table?.options?.meta;
    useEffect(() => {
        table?.getRowModel()?.rows?.map((row) => {
            if (!row?.original?.title || !row?.original?.key || !row?.original?.justification || !row?.original?.type) {
                setDisableAddRow(true);
            } else {
                setDisableAddRow(false);
            }
        });
        if (table?.getRowModel()?.rows?.length === 0) {
            setDisableAddRow(false);
        }
    }, [table?.getRowModel()?.rows]);

    return (
        <div className="orgFieldTableContainer">
            <article className="table-container d-flex align-items-start flex-column mb-0">
                {errorMessage && (
                    <MDBTypography className="p-2 col mb-1" note noteColor="danger">
                        {" "}
                        <strong>{errorMessage}</strong>Last row is not saved or not fully filled.
                    </MDBTypography>
                )}
                <MDBBtn className="ms-auto col mb-0" disabled={disableAddRow} type="button" color="secondary" onClick={meta?.addRow}>
                    <AiOutlinePlus />
                    Add new field
                </MDBBtn>
                <table className="orgTable">
                    <thead>
                        {table?.getHeaderGroups()?.map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup?.headers?.map((header) => (
                                    <th key={header.id}>{header.isPlaceholder ? null : flexRender(header?.column?.columnDef?.header, header?.getContext())}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table?.getRowModel()?.rows?.map((row) => (
                            <tr key={row?.id}>
                                {row?.getVisibleCells()?.map((cell) => (
                                    <td key={cell?.id}>{flexRender(cell?.column?.columnDef?.cell, cell?.getContext())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan={table?.getCenterLeafColumns()?.length} align="right">
                                <FooterCell table={table} />
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </article>
        </div>
    );
};

export default OrgMadatoryTable;
