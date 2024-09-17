import React, { useState } from "react";
import PropTypes from "prop-types";
import { MDBIcon } from "mdb-react-ui-kit";
import { AiOutlineDelete } from "react-icons/ai";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const EditCell = ({ row, table }) => {
    const [confirmationModal, setConfirmationModal] = useState(false);
    const meta = table?.options?.meta;
    const validRow = meta?.validRows[row.id];
    let disableSubmit = validRow ? Object.values(validRow)?.some((item) => !item) : false;

    const setEditedRows = (e) => {
        const elName = e.currentTarget.name;
        meta?.setEditedRows((old) => ({
            ...old,
            [row.id]: !old[row.id],
        }));
        if (elName !== "edit") {
            e?.currentTarget?.name === "cancel" ? meta?.revertData(row.index) : meta?.updateRow(row.index);
        }
    };

    const removeRow = () => {
        meta?.removeRow(row.index);
    };

    table?.getRowModel()?.rows?.map((row) => {
        if (!row?.original?.title || !row?.original?.key || !row?.original?.justification || !row?.original?.type) {
            disableSubmit = true;
        }
    });

    return (
        <div className="edit-cell-container">
            {meta?.editedRows[row.id] ? (
                <div className="edit-cell-action">
                    <button type="button" onClick={setEditedRows} name="cancel">
                        {" x "}
                    </button>{" "}
                    <button type="button" onClick={setEditedRows} name="done" disabled={disableSubmit}>
                        ✔
                    </button>
                </div>
            ) : (
                <div className="d-flex">
                    <button className="m-1" type="button" onClick={setEditedRows} name="edit">
                        <MDBIcon fas icon="pen" />
                    </button>
                    {row?.original?.default ? null : (
                        <button className="m-1" type="button" onClick={() => setConfirmationModal(true)} name="remove">
                            <AiOutlineDelete />
                        </button>
                    )}
                </div>
            )}
            {confirmationModal && (
                <DeleteConfirmationModal
                    open={confirmationModal}
                    toggle={(flag = false) => {
                        if (flag) {
                            removeRow();
                        }
                        setConfirmationModal(!confirmationModal);
                    }}
                />
            )}
        </div>
    );
};

EditCell.propTypes = {
    row: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
};

export default EditCell;
