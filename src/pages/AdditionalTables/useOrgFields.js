import { mutate } from "swr";
import { useState, useEffect } from "react";

const orgDefaultFields = [
    {
        id: 1,
        title: "Organization Name",
        key: "organizationName",
        type: "text",
        justification: "Organization Name",
        required: true,
        displyed: true,
        default: true,
        sensitive: false,
    },
    {
        id: 2,
        title: "Site Key",
        key: "siteKey",
        type: "text",
        justification: "Site Key",
        required: true,
        displyed: true,
        default: true,
        sensitive: false,
    },
    {
        id: 3,
        title: "Account Key",
        key: "accountKey",
        type: "text",
        justification: "Account Key",
        required: true,
        displyed: true,
        default: true,
        sensitive: false,
    },
];

export default function useOrgFields(orgAdditionalFields) {
    const [orgDataFields, setOrgDataFields] = useState(orgDefaultFields);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (orgAdditionalFields?.length > 0) {
            setOrgDataFields(orgAdditionalFields);
        }
    }, [orgAdditionalFields]);

    const updateRow = async (id, updatedData) => {
        const updatedOrgMetaFields = orgDataFields.map((orgField) => (orgField.id === id ? { ...orgField, ...updatedData } : orgField));
        setOrgDataFields(updatedOrgMetaFields);
        mutate(updatedOrgMetaFields);
    };

    const deleteRow = async (id) => {
        const updatedOrgMetaFields = orgDataFields.filter((orgField) => orgField.id !== id);
        setOrgDataFields(updatedOrgMetaFields);
        mutate(updatedOrgMetaFields);
    };

    const addRow = async (newOrgField) => {
        const lastRow = orgDataFields[orgDataFields.length - 1];
        const requiredFields = ["title", "key", "justification", "type"];
        if (lastRow && requiredFields.every((field) => lastRow[field] !== "")) {
            setErrorMessage("");
            const id = Math.floor(Math.random() * 1000);
            const orgFieldWithId = { ...newOrgField, id };
            setOrgDataFields((prevOrgFields) => [...prevOrgFields, orgFieldWithId]);
            mutate([...orgDataFields, orgFieldWithId]);
        } else if (orgDataFields?.length === 0) {
            const id = Math.floor(Math.random() * 1000);
            const orgFieldWithId = { ...newOrgField, id };
            setOrgDataFields((prevOrgFields) => [...prevOrgFields, orgFieldWithId]);
        } else {
            setErrorMessage("Cannot add a new row! One or more required fields are empty.");
        }
    };

    useEffect(() => {
        mutate(orgDataFields);
    }, [orgDataFields]);

    return {
        data: orgDataFields ?? [],
        errorMessage,
        addRow,
        updateRow,
        deleteRow,
    };
}
