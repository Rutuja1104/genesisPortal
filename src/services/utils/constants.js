import General from "../../libs/utility/General"; 
const headerContentWithAuthorization = {
    Accept: "*/*",
    "Content-Type": "application/json",
};

export const customHeaders = (isForm) => {
    let token = General.getToken();
    if (isForm) {
        let copiedHeaderContentWithAuthorization = {};
        copiedHeaderContentWithAuthorization["Authorization"] = `Bearer ${token}`;
        return { headers: copiedHeaderContentWithAuthorization };
    }
    let copiedHeaderContentWithAuthorization = {
        ...headerContentWithAuthorization,
    };
    copiedHeaderContentWithAuthorization["Authorization"] = `Bearer ${token}`;
    return { headers: copiedHeaderContentWithAuthorization };
};

export const defaultHeaders = () => {
    let copiedHeaderContentWithAuthorization = {
        ...headerContentWithAuthorization,
    };
    return { headers: copiedHeaderContentWithAuthorization };
};
