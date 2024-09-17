import React, { useEffect, useState } from "react";
import { IoIosRemoveCircleOutline, IoMdInformationCircleOutline } from "react-icons/io";
import { MDBBtn, MDBSwitch, MDBInput, MDBSpinner, MDBIcon, MDBCheckbox } from "mdb-react-ui-kit";
import { Formik, Form, Field } from "formik";
import { Card, CardBody, CardHeader, Col, Row, Label } from "reactstrap";
import { GrAddCircle } from "react-icons/gr";
import OrganizationDataService from "../../services/OrganizationDataService";
import { toast } from "react-toastify";
import Select from "react-select";
import { Tooltip } from "react-tooltip";

function ContainerConfig({ organizationInfo, defaultNetwork, handleToggle }) {
    const [newKey, setNewKey] = useState("");
    const [configData, setConfigData] = useState("");
    const [workflow, setWorkflow] = useState({});
    const [eventLaunchUrls, setEventLaunchUrls] = useState({});
    const [supportedMethods, setSupportedMethods] = useState([]);
    const [layout, setLayout] = useState([]);
    const [allowedContext, setAllowedContext] = useState({});
    const [loader, setLoader] = useState(false);
    const [isEnablementLoading, setIsEnablementLoading] = useState(false);
    const [selectedSupportedMethods, setSelectedSupportedMethods] = useState({});
    const [dataMappings, setDataMappings] = useState([]);
    const [selectedConfigProp, setSelectedConfigProp] = useState([]);
    const [contextApi, setContextApi] = useState({});
    const [contextDbConnection, setContextDbConnection] = useState({});

    const dataMappingOptions = [
        { label: "accountId", value: "accountId" },
        { label: "tenantId", value: "tenantId" },
        { label: "providerId", value: "providerId" },
        { label: "paitentId", value: "paitentId" },
        { label: "chartId", value: "chartId" },
        { label: "encounterId", value: "encounterId" },
    ];
    const eventLaunchUrlsOptions = [
        { label: "patient chart view", value: "patient_chart_view" },
        { label: "patient encounter view", value: "patient_encounter_view" },
        { label: "patient view", value: "patient_view" },
        { label: "provider login", value: "provider_login" },
        { label: "provider logout", value: "provider_logout" },
        { label: "provider view", value: "provider_view" },
    ];

    const workflowTypeOptions = [
        { label: "insiteflow-specific-jwe", value: "insiteflow-specific-jwe" },
        { label: "customer-specific-jwe", value: "customer-specific-jwe" },
    ];

    const systemDropdownOptions = [
        { label: "aledade", value: "aledade" },
        { label: "babylon", value: "babylon" },
        { label: "varadigm", value: "varadigm" },
    ];

    const sytemConfigOptions = [
        { label: "Context Path", value: "contextPath" },
        { label: "Context Api", value: "contextApi" },
        { label: "Context Db Connection", value: "contextDbConnection" },
    ];

    const [initialEventLaunchUrls, setIntialUrls] = useState({});

    useEffect(() => {
        setWorkflow(configData?.data?.workflow);
        setEventLaunchUrls(configData?.launch?.eventLaunchUrls);
        setDataMappings(configData?.data?.dataMappings);
        setLayout(configData?.layout);
        setAllowedContext(configData?.data?.allowedContext);
        setContextApi(configData?.data?.contextApi);
        setContextDbConnection(configData?.data?.contextDbConnection);
        let supportedMethods = configData?.data?.workflow?.supportedMethods?.reduce((acc, method) => {
            acc[method.name] = method.name;
            return acc;
        }, {});
        setSelectedSupportedMethods(supportedMethods);
        if (configData?.data?.workflow?.supportedMethods?.length <= 1) {
            setSupportedMethods([
                ...configData?.data?.workflow?.supportedMethods,
                {
                    baseUrl: "",
                    contextEvents: [],
                    name:
                        configData?.data?.workflow?.supportedMethods[0]?.name === "get-notification-data-for-user-context"
                            ? "get-counts-for-user-context"
                            : "get-notification-data-for-user-context",
                    params: [],
                },
            ]);
        } else {
            setSupportedMethods(configData?.data?.workflow?.supportedMethods);
        }
        if (configData?.data?.allowedContext?.system?.properties?.contextPath) {
            setSelectedConfigProp({ label: "contextPath", value: "contextPath" });
        } else if (configData?.data?.allowedContext?.system?.properties?.contextDbConnection) {
            setSelectedConfigProp({ label: "contextDbConnection", value: "contextDbConnection" });
        } else if (configData?.data?.allowedContext?.system?.properties?.contextApi) {
            setSelectedConfigProp({ label: "contextApi", value: "contextApi" });
        }
    }, [configData]);

    useEffect(() => {
        setIntialUrls({
            patient_chart_view: configData?.launch?.eventLaunchUrls?.hasOwnProperty("patient_chart_view")
                ? configData?.launch?.eventLaunchUrls["patient_chart_view"]
                : "",
            patient_encounter_view: configData?.launch?.eventLaunchUrls?.hasOwnProperty("patient_encounter_view")
                ? configData?.launch?.eventLaunchUrls["patient_encounter_view"]
                : "",
            patient_view: configData?.launch?.eventLaunchUrls?.hasOwnProperty("patient_view") ? configData?.launch?.eventLaunchUrls["patient_view"] : "",
            provider_login: configData?.launch?.eventLaunchUrls?.hasOwnProperty("provider_login") ? configData?.launch?.eventLaunchUrls["provider_login"] : "",
            provider_logout: configData?.launch?.eventLaunchUrls?.hasOwnProperty("provider_logout")
                ? configData?.launch?.eventLaunchUrls["provider_logout"]
                : "",
            provider_view: configData?.launch?.eventLaunchUrls?.hasOwnProperty("provider_view") ? configData?.launch?.eventLaunchUrls[" provider_view"] : "",
        });
    }, [configData?.launch?.eventLaunchUrls]);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoader(true);
                let params = {
                    networkId: defaultNetwork,
                    organizationId: organizationInfo?.organizationId,
                };
                const res = await OrganizationDataService.getConfig(params);
                if (res?.data) {
                    setConfigData(res?.data?.body?.metadata);
                    setLoader(false);
                } else if (res?.error) {
                    toast.error(res?.error);
                    setLoader(false);
                }
            } catch (err) {
                setLoader(false);
                console.log("error--", err);
            }
        }
        fetchData();
    }, []);

    const addParams = (index) => {
        const newSupportedMethods = supportedMethods?.map((method, i) => {
            if (i === index) {
                return {
                    ...method,
                    params: [
                        ...method.params,
                        {
                            name: "",
                            nullable: false,
                            type: "",
                            value: "",
                        },
                    ],
                };
            }
            return method;
        });
        setSupportedMethods(newSupportedMethods);
    };

    const removeParams = (index, keyToRemove) => {
        const newSupportedMethods = [...supportedMethods];
        const newParams = [...newSupportedMethods[index].params];
        newParams.splice(keyToRemove, 1);
        const updatedSupportedMethod = newSupportedMethods?.map((method, i) => {
            if (i === index) {
                return {
                    ...method,
                    params: newParams,
                };
            }
            return method;
        });
        setSupportedMethods(updatedSupportedMethod);
    };

    const updateSupportedMethodValue = (index, key, value, paramsIndex) => {
        const newSupportedMethods = [...supportedMethods];
        if (paramsIndex >= 0) {
            newSupportedMethods[index]["params"][paramsIndex][key] = value;
        } else if (newSupportedMethods[index]) {
            newSupportedMethods[index][key] = value;
        }
        setSupportedMethods(newSupportedMethods);
    };

    const updateDataMappingProperty = (index, key, value) => {
        const newDataMappings = [...dataMappings];
        if (newDataMappings[index]) {
            newDataMappings[index][key] = value;
            setDataMappings(newDataMappings);
        }
    };

    const updateValue = (key, newValue) => {
        setEventLaunchUrls((prevState) => ({
            ...prevState,
            [key]: newValue,
        }));
        setIntialUrls((prevState) => ({
            ...prevState,
            [key]: newValue,
        }));
    };
    const updateKey = (oldKey, newKey) => {
        setEventLaunchUrls((prevState) => {
            const { [oldKey]: value, ...rest } = prevState;
            return { ...rest, [newKey]: value };
        });
        setNewKey("");
    };

    const updateDataMappingKey = (index, oldKey, newKey) => {
        setDataMappings((prevDataMappings) => {
            const updatedMappings = [...prevDataMappings];
            const valueToMove = updatedMappings[index][oldKey];
            delete updatedMappings[index][oldKey];
            updatedMappings[index] = { [newKey]: valueToMove, ...updatedMappings[index] };
            return updatedMappings;
        });
    };

    function updateViewportProperty(propertyName, value) {
        const viewPort = { ...layout.viewport };
        if (viewPort.properties.hasOwnProperty(propertyName)) {
            viewPort.properties[propertyName] = value;
            setLayout({ notifications: { ...layout.notifications }, viewport: viewPort });
        } else {
            viewPort[propertyName] = value;
            setLayout({ notifications: { ...layout.notifications }, viewport: viewPort });
        }
    }

    function updateNotificationsProperty(propertyName, value) {
        const notifications = { ...layout.notifications };
        if (notifications.properties.hasOwnProperty(propertyName)) {
            notifications.properties[propertyName] = value;
            setLayout({ notifications: notifications, viewport: { ...layout.viewport } });
        } else {
            notifications[propertyName] = value;
            setLayout({ notifications: notifications, viewport: { ...layout.viewport } });
        }
    }

    function handleAllowedContext(propertyName, value) {
        const allowedContexts = { ...allowedContext };
        if (allowedContexts?.hasOwnProperty(propertyName)) {
            allowedContexts[propertyName] = value;
            setAllowedContext(allowedContexts);
        } else {
            if (allowedContexts?.system?.hasOwnProperty(propertyName)) {
                allowedContexts.system[propertyName] = value;
                setAllowedContext(allowedContexts);
            } else {
                if (allowedContexts?.system?.properties?.hasOwnProperty(propertyName)) {
                    allowedContexts.system.properties[propertyName] = value;
                    setAllowedContext(allowedContexts);
                } else {
                    if (allowedContexts?.system?.properties?.contextPath?.hasOwnProperty(propertyName)) {
                        allowedContexts.system.properties.contextPath[propertyName] = value;
                        setAllowedContext(allowedContexts);
                    } else if (allowedContexts?.system?.properties?.contextDbConnection?.hasOwnProperty(propertyName)) {
                        allowedContexts.system.properties.contextDbConnection[propertyName] = value;
                        setAllowedContext(allowedContexts);
                    }
                    if (allowedContexts?.system?.properties?.contextApi?.hasOwnProperty(propertyName)) {
                        allowedContexts.system.properties.contextApi[propertyName] = value;
                        setAllowedContext(allowedContexts);
                    } else {
                        setAllowedContext((prevState) => ({
                            ...prevState,
                            system: {
                                ...prevState.system,
                                properties: {
                                    ...prevState.system.properties,
                                    [selectedConfigProp?.value]: { ...allowedContexts?.system?.properties[selectedConfigProp.value], [propertyName]: value },
                                },
                            },
                        }));
                    }
                }
            }
        }
    }

    function updateWorkflow(propertyName, value) {
        const workflowProp = { ...workflow };
        if (workflowProp.hasOwnProperty(propertyName)) {
            workflowProp[propertyName] = value;
            setWorkflow(workflowProp);
        } else {
            workflowProp.launchToken[propertyName] = value;
            setWorkflow(workflowProp);
        }
    }

    function handleChangeContainerConfig(propertyName, value) {
        const config = { ...configData };
        if (config.hasOwnProperty(propertyName)) {
            config[propertyName] = value;
            setConfigData(config);
        }
    }

    const updateConfig = async () => {
        let filteredMethodsArray = supportedMethods.filter((method) => selectedSupportedMethods.hasOwnProperty(method.name));
        try {
            const data = {
                ...configData,
                layout: layout,
                launch: { eventLaunchUrls: { ...eventLaunchUrls } },
                data: {
                    allowedContext: { ...allowedContext },
                    dataMappings: [...dataMappings],
                    workflow: { ...workflow, supportedMethods: [...filteredMethodsArray] },
                },
            };

            const params = {
                networkId: defaultNetwork,
                organizationId: organizationInfo?.organizationId,
            };
            await OrganizationDataService.updateConfig({ params, body: data });
            handleToggle(false);
        } catch (err) {
            handleToggle(false);
            console.log("error--", err);
        }
    };

    const handleCheckboxChange = (key, value, isChecked) => {
        if (isChecked) {
            setEventLaunchUrls({ ...eventLaunchUrls, [key]: value });
        } else {
            const updatedEventLaunchUrls = { ...eventLaunchUrls };
            delete updatedEventLaunchUrls[key];
            setEventLaunchUrls(updatedEventLaunchUrls);
        }
    };

    const getEnablementKey = async () => {
        setIsEnablementLoading(true);
        const enablementKey = await OrganizationDataService.getEnablementKey({
            organizationId: organizationInfo.organizationId,
        });
        if (enablementKey) {
            const element = document.createElement("a");
            const file = new Blob([enablementKey?.data?.body], {
                type: "text/plain",
            });
            element.href = URL.createObjectURL(file);
            element.download = "enablement.key";
            document.body.appendChild(element);
            element.click();
        }
        setIsEnablementLoading(false);
        console.log("Enablement key is ", enablementKey);
    };

    const getDesktopContainer = async (platform, event) => {
        event.preventDefault();
        event.stopPropagation();
        const element = document.createElement("a");
        let fileName = "";
        if (platform === "windows") {
            fileName = "InsiteflowDesktop.exe";
        } else if (platform === "mac") {
            fileName = "InsiteflowDesktop.dmg";
        }

        if (fileName) {
            const fileUrl = `${process.env.REACT_APP_CONTAINER_UPDATE_URL}/${fileName}`;
            element.href = fileUrl;
            element.download = fileName;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } else {
            console.error("Unsupported platform specified.");
        }
    };
    const getBrowserExtension = (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(process.env.REACT_APP_BROWSER_EXTENSION_URL, "_blank");
    };
    const supportedMethodCheckboxChange = (key, value, isChecked) => {
        if (isChecked) {
            setSelectedSupportedMethods({ ...selectedSupportedMethods, [key]: value });
        } else {
            const updatedSupportedMethod = { ...selectedSupportedMethods };
            delete updatedSupportedMethod[key];
            setSelectedSupportedMethods(updatedSupportedMethod);
        }
    };

    return (
        <div>
            {loader ? (
                <div className="d-flex justify-content-center mx-4 px-4">
                    <MDBSpinner color="primary" />
                </div>
            ) : (
                <div>
                    <div className="d-flex justify-content-around">
                        {isEnablementLoading ? (
                            <MDBSpinner color="primary" className="mx-1" />
                        ) : (
                            <MDBBtn onClick={() => getEnablementKey()}>
                                <MDBIcon fas icon="key" className="fa-lg mx-1" /> Get Enablement key
                            </MDBBtn>
                        )}
                        <MDBBtn className="mx-1" color="info" onClick={(e) => getDesktopContainer("windows", e)}>
                            <MDBIcon fab icon="windows" className="fa-lg mx-1" /> Desktop container exe (64-bit)
                        </MDBBtn>
                        <MDBBtn className="mx-1" color="dark" onClick={(e) => getDesktopContainer("mac", e)}>
                            <MDBIcon fab icon="apple" className="fa-lg mx-1" /> Desktop container for mac
                        </MDBBtn>
                        <MDBBtn className="mx-1" color="secondary" onClick={(e) => getBrowserExtension(e)}>
                            <MDBIcon fas icon="puzzle-piece" className="fa-lg mx-1" /> Browser extension
                        </MDBBtn>
                    </div>
                    <Formik
                    // initialValues={formValues}
                    // validationSchema={organizationInfo ? updateOrgSchema : createOrgSchema}
                    // onSubmit={handleCreateOrg}
                    >
                        {({ isSubmitting, handleSubmit }) => (
                            <Form autoComplete="off" style={{ height: "100%" }} onSubmit={handleSubmit}>
                                <div className="">
                                    <Card className="card-shadow mt-4 mx-2">
                                        <p className="fw-bold mt-4 mx-2">
                                            Layout
                                            <IoMdInformationCircleOutline
                                                style={{ cursor: "pointer" }}
                                                className="mx-2 mb-1"
                                                data-tooltip-id="my-tooltip"
                                                data-tooltip-content={"layout"}
                                            />
                                            <Tooltip id="my-tooltip" />:
                                        </p>
                                        <Row>
                                            <Col>
                                                <Card>
                                                    <CardHeader className="d-flex ">
                                                        <span className="fw-bolder">
                                                            Viewport{" "}
                                                            <IoMdInformationCircleOutline
                                                                style={{ cursor: "pointer" }}
                                                                className="mx-1"
                                                                data-tooltip-id="my-tooltip"
                                                                data-tooltip-content={"Viewport"}
                                                            />
                                                            <Tooltip id="my-tooltip" /> :
                                                        </span>
                                                        <Field name="alwaysOn">
                                                            {({ field }) => (
                                                                <div className="d-flex mx-2">
                                                                    <span className="mx-1">Always On</span>
                                                                    <MDBSwitch
                                                                        defaultChecked={layout?.viewport?.alwaysOn}
                                                                        checked={layout?.viewport?.alwaysOn}
                                                                        id="flexSwitchCheckChecked"
                                                                        name={"alwaysOn"}
                                                                        onChange={(e) => updateViewportProperty("alwaysOn", !layout?.viewport?.alwaysOn)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Field>
                                                        <Field name="showCounts">
                                                            {({ field }) => (
                                                                <div className="d-flex mx-2">
                                                                    <span className="mx-1">Show Count</span>
                                                                    <MDBSwitch
                                                                        defaultChecked={layout?.viewport?.showCounts}
                                                                        checked={layout?.viewport?.showCounts}
                                                                        id="flexSwitchCheckChecked"
                                                                        name={"showCount"}
                                                                        onChange={(e) => updateViewportProperty("showCounts", !layout?.viewport?.showCounts)}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <Row>
                                                            <Col>
                                                                <Field name="tabHeightWithoutViewport">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Tab Height Without Viewport</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.tabHeightWithoutViewport}
                                                                                onChange={(e) =>
                                                                                    updateViewportProperty("tabHeightWithoutViewport", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="tabWidthWithViewport">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Tab Width With Viewport</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.tabWidthWithViewport}
                                                                                onChange={(e) =>
                                                                                    updateViewportProperty("tabWidthWithViewport", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Field name="tabHeightWithViewport">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Tab Height With Viewport</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.tabHeightWithViewport}
                                                                                onChange={(e) =>
                                                                                    updateViewportProperty("tabHeightWithViewport", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="tabWidthWithoutViewport">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Tab Width Without Viewport</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.tabWidthWithoutViewport}
                                                                                onChange={(e) =>
                                                                                    updateViewportProperty("tabWidthWithoutViewport", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="tabBackgroundColor">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Tab Background Color</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.tabBackgroundColor}
                                                                                onChange={(e) => updateViewportProperty("tabBackgroundColor", e?.target?.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Field name="viewportHeight">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Viewport Height</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.viewportHeight}
                                                                                onChange={(e) => updateViewportProperty("viewportHeight", e?.target?.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="viewportWidth">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Viewport Width</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.viewport?.properties?.viewportWidth}
                                                                                onChange={(e) => updateViewportProperty("viewportWidth", e?.target?.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                            <Col>
                                                <Card>
                                                    <CardHeader className="d-flex ">
                                                        <span className="fw-bolder">
                                                            Notification
                                                            <IoMdInformationCircleOutline
                                                                style={{ cursor: "pointer" }}
                                                                className="mx-2"
                                                                data-tooltip-id="my-tooltip"
                                                                data-tooltip-content={"Notification"}
                                                            />
                                                            <Tooltip id="my-tooltip" /> :
                                                        </span>
                                                        <Field name="alwaysOn">
                                                            {({ field }) => (
                                                                <div className="d-flex mx-2">
                                                                    <span className="mx-1">Enable</span>
                                                                    <MDBSwitch
                                                                        defaultChecked={layout?.notifications?.enabled}
                                                                        id="flexSwitchCheckChecked"
                                                                        name={"alwaysOn"}
                                                                        onChange={() =>
                                                                            updateNotificationsProperty("alwaysOn", !layout?.notifications?.enabled)
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <Row>
                                                            <Col>
                                                                <Field name="height">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Height</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.notifications?.properties?.height}
                                                                                onChange={(e) => updateNotificationsProperty("height", e?.target?.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="width">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Width</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.notifications?.properties?.width}
                                                                                onChange={(e) => updateNotificationsProperty("width", e?.target?.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Field name="color">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Color</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={layout?.notifications?.properties?.color}
                                                                                onChange={(e) => updateNotificationsProperty("color", e?.target?.value)}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>

                                                            <Col>
                                                                <Field name="backgroundColor">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Background Color</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={configData?.layout?.notifications?.properties?.backgroundColor}
                                                                                onChange={(e) =>
                                                                                    updateNotificationsProperty("backgroundColor", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Card>
                                    <hr />
                                    <Card className="card-shadow m-2">
                                        <p className="fw-bold my-2 mx-2">
                                            Container Config
                                            <IoMdInformationCircleOutline
                                                style={{ cursor: "pointer" }}
                                                className="mx-2"
                                                data-tooltip-id="my-tooltip"
                                                data-tooltip-content={" Container Config"}
                                            />
                                            <Tooltip id="my-tooltip" /> :
                                        </p>
                                        <Row>
                                            <Col>
                                                <Card>
                                                    <CardBody>
                                                        <Row>
                                                            <Col md={3}>
                                                                <Field name="eventExpiryTimeout">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Event Expiry Timeout</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="number"
                                                                                value={configData?.eventExpiryTimeout}
                                                                                onChange={(e) =>
                                                                                    handleChangeContainerConfig("eventExpiryTimeout", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col md={3}>
                                                                <Field name="containerUpdateInterval">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Container Update Interval </Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="number"
                                                                                value={configData?.containerUpdateInterval}
                                                                                onChange={(e) =>
                                                                                    handleChangeContainerConfig("containerUpdateInterval", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Field name="containerUpdateUrl">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Container Update URL</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={configData?.containerUpdateUrl}
                                                                                onChange={(e) =>
                                                                                    handleChangeContainerConfig("containerUpdateUrl", e?.target?.value)
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <div className="mb-4 d-flex">
                                                                    <Label className="">Support Headless Container</Label>
                                                                    <MDBCheckbox className="mx-1" />
                                                                </div>
                                                            </Col>
                                                            <Col>
                                                                <Field name="headlessContainer">
                                                                    {({ field }) => (
                                                                        <div className="mb-4">
                                                                            <Label>Headless Container Id</Label>
                                                                            <MDBInput {...field} type="text" value="" />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Card>
                                    <Row>
                                        <Col>
                                            <Card className="card-shadow m-2">
                                                <p className="fw-bold my-2 mx-2">
                                                    Launch Config
                                                    <IoMdInformationCircleOutline
                                                        style={{ cursor: "pointer" }}
                                                        className="mx-2"
                                                        data-tooltip-id="my-tooltip"
                                                        data-tooltip-content={"Launch Config"}
                                                    />
                                                    <Tooltip id="my-tooltip" /> :
                                                </p>
                                                <CardHeader>
                                                    <span className="fw-bolder">
                                                        Event Launch Urls
                                                        <IoMdInformationCircleOutline
                                                            style={{ cursor: "pointer" }}
                                                            className="mx-2"
                                                            data-tooltip-id="my-tooltip"
                                                            data-tooltip-content={"Event Launch Urls"}
                                                        />
                                                        <Tooltip id="my-tooltip" /> :
                                                    </span>
                                                    {Object.entries(eventLaunchUrls || {}).map(([key, value]) => {
                                                        if (key === "template") {
                                                            return (
                                                                <Row key={key}>
                                                                    <Field name={key}>
                                                                        {({ field }) => (
                                                                            <div className="mt-2 d-flex gap-3">
                                                                                <div className="w-25">
                                                                                    <Label>{key}</Label>
                                                                                </div>
                                                                                <div className="w-75">
                                                                                    <MDBInput
                                                                                        {...field}
                                                                                        type="text"
                                                                                        value={value}
                                                                                        onChange={(e) => {
                                                                                            const newValue = e.target.value;
                                                                                            updateValue(key, newValue);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Row>
                                                            );
                                                        }
                                                    })}
                                                </CardHeader>
                                                <CardBody>
                                                    {Object.entries(initialEventLaunchUrls || {}).map(([key, value]) => {
                                                        if (key !== "template") {
                                                            return (
                                                                <Row key={key} className=" d-flex">
                                                                    <Field name={key}>
                                                                        {({ field }) => (
                                                                            <div className="mb-4 d-flex gap-2">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    name={key}
                                                                                    className="mt-2"
                                                                                    style={{ height: "22px", width: "22px" }}
                                                                                    checked={eventLaunchUrls?.hasOwnProperty(key)}
                                                                                    onChange={(e) => {
                                                                                        const isChecked = e.target.checked;
                                                                                        handleCheckboxChange(key, value, isChecked);
                                                                                    }}
                                                                                />
                                                                                <div className="w-50">
                                                                                    <Select
                                                                                        defaultValue={{
                                                                                            label: key.replace(/_/g, " "),
                                                                                            value: key,
                                                                                        }}
                                                                                        isSearchable
                                                                                        options={eventLaunchUrlsOptions}
                                                                                        onChange={(e) => {
                                                                                            setNewKey(e.value);
                                                                                        }}
                                                                                        onBlur={() => {
                                                                                            if (newKey && newKey !== key) {
                                                                                                updateKey(key, newKey);
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div className="w-100">
                                                                                    <MDBInput
                                                                                        {...field}
                                                                                        type="text"
                                                                                        value={initialEventLaunchUrls[key]}
                                                                                        onChange={(e) => {
                                                                                            const newValue = e.target.value;
                                                                                            updateValue(key, newValue);
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Row>
                                                            );
                                                        }
                                                    })}
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <div>
                                            <Card className="card-shadow m-2">
                                                <span className="fw-bold m-2">
                                                    Data Config
                                                    <IoMdInformationCircleOutline
                                                        style={{ cursor: "pointer" }}
                                                        className="mx-2"
                                                        data-tooltip-id="my-tooltip"
                                                        data-tooltip-content={"Data Config"}
                                                    />
                                                    <Tooltip id="my-tooltip" /> :
                                                </span>
                                                <CardHeader className="d-flex ">
                                                    <span className="fw-bolder">
                                                        Allowed Context
                                                        <IoMdInformationCircleOutline
                                                            style={{ cursor: "pointer" }}
                                                            className="mx-2"
                                                            data-tooltip-id="my-tooltip"
                                                            data-tooltip-content={"Allowed Context "}
                                                        />
                                                        <Tooltip id="my-tooltip" /> :
                                                    </span>

                                                    <Field name="accountId">
                                                        {({ field }) => (
                                                            <div className="d-flex mx-2">
                                                                <span className="mx-1 w-50">Account Id</span>
                                                                <MDBInput
                                                                    {...field}
                                                                    type="text"
                                                                    value={allowedContext?.accountId}
                                                                    onChange={(e) => {
                                                                        handleAllowedContext("accountId", e?.target?.value);
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Field>
                                                    <Field name="providerIds">
                                                        {({ field }) => (
                                                            <div className="d-flex mx-2">
                                                                <span className="mx-1 w-50">Provider Ids</span>
                                                                <MDBInput
                                                                    {...field}
                                                                    type="text"
                                                                    value={allowedContext?.providerIds}
                                                                    onChange={(e) => {
                                                                        handleAllowedContext("providerIds", e?.target?.value);
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Field>
                                                </CardHeader>
                                                <CardBody>
                                                    <div className="d-flex flex-column ">
                                                        <span className="fw-bolder mx-1">
                                                            System Config
                                                            <IoMdInformationCircleOutline
                                                                style={{ cursor: "pointer" }}
                                                                className="mx-2"
                                                                data-tooltip-id="my-tooltip"
                                                                data-tooltip-content={"System Config "}
                                                            />
                                                            <Tooltip id="my-tooltip" /> :
                                                        </span>
                                                        <Row>
                                                            <Col>
                                                                <Field name="name">
                                                                    {({ field }) => (
                                                                        <div className="my-2">
                                                                            <Label className="mb-2">Name</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={allowedContext?.system?.name}
                                                                                onChange={(e) => {
                                                                                    handleAllowedContext("name", e?.target?.value);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="contextFolderTemplate">
                                                                    {({ field }) => (
                                                                        <div className="my-2">
                                                                            <Label className="mb-2">Context Folder Template</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={allowedContext?.system?.properties?.contextFolderTemplate}
                                                                                onChange={(e) => {
                                                                                    handleAllowedContext("contextFolderTemplate", e?.target?.value);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                            <Col>
                                                                <Field name="epicContextKey">
                                                                    {({ field }) => (
                                                                        <div className="my-2 ">
                                                                            <Label className="mb-2">Epic Context Key</Label>
                                                                            <MDBInput
                                                                                {...field}
                                                                                type="text"
                                                                                value={allowedContext?.system?.properties?.epicContextKey}
                                                                                onChange={(e) => {
                                                                                    handleAllowedContext("epicContextKey", e?.target?.value);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Field>
                                                            </Col>
                                                        </Row>
                                                        <div>
                                                            System Config properties:
                                                            <Select
                                                                defaultValue={selectedConfigProp}
                                                                value={selectedConfigProp}
                                                                isSearchable
                                                                options={sytemConfigOptions}
                                                                onChange={(e) => {
                                                                    setSelectedConfigProp({
                                                                        label: e?.value
                                                                            .replace(/([a-z])([A-Z])/g, "$1 $2")
                                                                            .replace(/\b\w/g, (char) => char.toUpperCase()),
                                                                        value: e.value,
                                                                    });
                                                                }}
                                                            />
                                                        </div>

                                                        {selectedConfigProp?.value === "contextPath" && (
                                                            <Row>
                                                                <Col>
                                                                    <Field name="Windows_NT">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Windows</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextPath?.Windows_NT}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("Windows_NT", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="Darwin">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Mac</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextPath?.Darwin}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("Darwin", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="Linux">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Linux</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextPath?.Linux}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("Linux", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                        {selectedConfigProp?.value === "contextDbConnection" && (
                                                            <Row>
                                                                <Col>
                                                                    <Field name="engineType">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Engine Type</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextDbConnection?.engineType}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("engineType", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="user">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">User</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextDbConnection?.user}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("user", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="password">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Password</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextDbConnection?.password}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("password", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="database">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Database</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextDbConnection?.database}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("database", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="tableName">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Table Name</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextDbConnection?.tableName}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("tableName", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="pollingTime">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Polling Time</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextDbConnection?.pollingTime}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("pollingTime", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="trigger">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Trigger</Label>
                                                                                <MDBCheckbox
                                                                                    className="mx-1"
                                                                                    checked={allowedContext?.system?.properties?.contextDbConnection?.trigger}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext(
                                                                                            "trigger",
                                                                                            !allowedContext?.system?.properties?.contextDbConnection?.trigger
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                            </Row>
                                                        )}

                                                        {selectedConfigProp?.value === "contextApi" && (
                                                            <Row>
                                                                <Col>
                                                                    <Field name="port">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">Port</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextApi?.port}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("port", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                                <Col>
                                                                    <Field name="apiKey">
                                                                        {({ field }) => (
                                                                            <div className="my-2">
                                                                                <Label className="mb-2">api Key</Label>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    value={allowedContext?.system?.properties?.contextApi?.apiKey}
                                                                                    onChange={(e) => {
                                                                                        handleAllowedContext("apiKey", e?.target?.value);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                    </div>
                                                    <div className="mt-4">
                                                        <Field name="tenantIds">
                                                            {({ field }) => (
                                                                <div className="d-flex mx-2">
                                                                    <span className="fw-bolder" style={{ width: "9rem" }}>
                                                                        Tenant Ids
                                                                        <IoMdInformationCircleOutline
                                                                            style={{ cursor: "pointer" }}
                                                                            className="mx-2"
                                                                            data-tooltip-id="my-tooltip"
                                                                            data-tooltip-content={"Tenant Ids "}
                                                                        />
                                                                        <Tooltip id="my-tooltip" />
                                                                    </span>
                                                                    <MDBInput
                                                                        {...field}
                                                                        type="text"
                                                                        value={allowedContext?.tenantIds}
                                                                        onChange={(e) => {
                                                                            handleAllowedContext("tenantIds", e?.target?.value);
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </div>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card className="card-shadow m-2">
                                                <CardHeader className="d-flex align-items-center justify-content-between">
                                                    <span className="fw-bold">
                                                        Data Mappings
                                                        <IoMdInformationCircleOutline
                                                            style={{ cursor: "pointer" }}
                                                            className="mx-2"
                                                            data-tooltip-id="my-tooltip"
                                                            data-tooltip-content={"Data Mappings"}
                                                        />
                                                        <Tooltip id="my-tooltip" /> :
                                                    </span>
                                                    {/* <h3>
                                                        <GrAddCircle onClick={addDataMappingProperty} title="Add mapping" />
                                                    </h3> */}
                                                </CardHeader>

                                                <CardBody>
                                                    {dataMappings?.map((data, index) => {
                                                        return (
                                                            <div className="d-flex gap-3 " key={index}>
                                                                <div className="w-25 mt-2">
                                                                    {/* <MDBInput
                                                                        type="text"
                                                                        value={Object.keys(data)[0]}
                                                                        onChange={(e) => updateDataMappingKey(index, Object.keys(data)[0], e.target.value)}
                                                                    /> */}
                                                                    <Select
                                                                        defaultValue={{ label: Object.keys(data)[0], value: Object.keys(data)[0] }}
                                                                        isSearchable
                                                                        options={dataMappingOptions}
                                                                        onChange={(e) => {
                                                                            updateDataMappingKey(index, Object.keys(data)[0], e.value);
                                                                        }}
                                                                    />
                                                                </div>
                                                                {Object.keys(data).map((key, i) => (
                                                                    <div className="d-flex gap-3 w-50" key={i}>
                                                                        <Field name={key}>
                                                                            {({ field }) => (
                                                                                <div className="my-2 w-100 d-flex gap-3">
                                                                                    {key === "to" ? (
                                                                                        <Label className="mb-2">{key}</Label>
                                                                                    ) : (
                                                                                        <Label className="mb-2">from</Label>
                                                                                    )}
                                                                                    <MDBInput
                                                                                        {...field}
                                                                                        type="text"
                                                                                        value={data[key]}
                                                                                        onChange={(e) => updateDataMappingProperty(index, key, e.target.value)}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </Field>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })}
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Card className="card-shadow m-2">
                                                <span className="fw-bolder m-2">
                                                    Workflow
                                                    <IoMdInformationCircleOutline
                                                        style={{ cursor: "pointer" }}
                                                        className="mx-2"
                                                        data-tooltip-id="my-tooltip"
                                                        data-tooltip-content={"Workflow"}
                                                    />
                                                    <Tooltip id="my-tooltip" /> :
                                                </span>
                                                <CardHeader className="d-flex">
                                                    <span className="fw-bolder" style={{ width: "10rem" }}>
                                                        Launch Token
                                                        <IoMdInformationCircleOutline
                                                            style={{ cursor: "pointer" }}
                                                            className="mx-2"
                                                            data-tooltip-id="my-tooltip"
                                                            data-tooltip-content={" Launch Token"}
                                                        />
                                                        <Tooltip id="my-tooltip" /> :
                                                    </span>
                                                    <div className=" d-flex w-75">
                                                        <Field name="type">
                                                            {({ field }) => (
                                                                <div className="d-flex mx-2 w-50 ">
                                                                    <span className="mx-1">Type</span>
                                                                    <Select
                                                                        defaultValue={{
                                                                            label: workflow?.launchToken?.type,
                                                                            value: workflow?.launchToken?.type,
                                                                        }}
                                                                        isSearchable
                                                                        options={workflowTypeOptions}
                                                                        onChange={(e) => {
                                                                            updateWorkflow("type", e.value);
                                                                        }}
                                                                        className="w-100"
                                                                    />
                                                                </div>
                                                            )}
                                                        </Field>
                                                        <Field name="secret">
                                                            {({ field }) => (
                                                                <div className="d-flex mx-2 w-50">
                                                                    <span className="mx-1">Secret</span>
                                                                    <MDBInput
                                                                        {...field}
                                                                        type="text"
                                                                        value={workflow?.launchToken?.secret}
                                                                        onChange={(e) => {
                                                                            updateWorkflow("secret", e?.target?.value);
                                                                        }}
                                                                    />{" "}
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </div>
                                                </CardHeader>
                                                <CardBody>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="fw-bolder">
                                                            Supported Methods
                                                            <IoMdInformationCircleOutline
                                                                style={{ cursor: "pointer" }}
                                                                className="mx-2"
                                                                data-tooltip-id="my-tooltip"
                                                                data-tooltip-content={"Supported Methods"}
                                                            />
                                                            <Tooltip id="my-tooltip" /> :
                                                        </span>
                                                    </div>

                                                    {supportedMethods?.map((method, i) => {
                                                        return (
                                                            <Card key={i} className=" mb-3 py-2">
                                                                <div className="d-flex align-items-center flex-row gap-2 ">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={method?.name}
                                                                        className="mt-2 mx-2"
                                                                        style={{ height: "17px", width: "17px" }}
                                                                        checked={selectedSupportedMethods?.hasOwnProperty(method?.name)}
                                                                        onChange={(e) => {
                                                                            const isChecked = e.target.checked;
                                                                            supportedMethodCheckboxChange(method?.name, method?.name, isChecked);
                                                                        }}
                                                                    />
                                                                    <Field name="name">
                                                                        {({ field }) => (
                                                                            <div className=" mx-2 w-50">
                                                                                <span className="mx-1">Method Name</span>
                                                                                <MDBInput
                                                                                    type="text"
                                                                                    // onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value)}
                                                                                    value={method?.name}
                                                                                />{" "}
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                    <Field name="baseUrl">
                                                                        {({ field }) => (
                                                                            <div className="mx-2 w-50">
                                                                                <span className="mx-1 w-25">Base Url</span>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value)}
                                                                                    value={method?.baseUrl}
                                                                                />{" "}
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                    <Field name="contextEvents">
                                                                        {({ field }) => (
                                                                            <div className="mx-2 w-50">
                                                                                <span className="mx-1 w-25">Context Events</span>
                                                                                <MDBInput
                                                                                    {...field}
                                                                                    type="text"
                                                                                    onChange={(e) => updateSupportedMethodValue(i, field.name, e.target.value)}
                                                                                    value={method?.contextEvents}
                                                                                />{" "}
                                                                            </div>
                                                                        )}
                                                                    </Field>
                                                                </div>
                                                                <div className="my-2">
                                                                    <span className="fw-bolder mx-2">
                                                                        {" "}
                                                                        Params <GrAddCircle onClick={() => addParams(i)} />
                                                                    </span>
                                                                    {method?.params?.map((param, index) => {
                                                                        return (
                                                                            <div className="d-flex my-1 " key={index}>
                                                                                <Field name="name">
                                                                                    {({ field }) => (
                                                                                        <div className="mx-2 w-50">
                                                                                            <span className="mx-1">Param Name</span>
                                                                                            <MDBInput
                                                                                                {...field}
                                                                                                onChange={(e) =>
                                                                                                    updateSupportedMethodValue(
                                                                                                        i,
                                                                                                        field.name,
                                                                                                        e.target.value,
                                                                                                        index
                                                                                                    )
                                                                                                }
                                                                                                value={param.name}
                                                                                            />{" "}
                                                                                        </div>
                                                                                    )}
                                                                                </Field>

                                                                                <Field name="value">
                                                                                    {({ field }) => (
                                                                                        <div className="mx-2 w-50">
                                                                                            <span className="mx-1">Param Value</span>
                                                                                            <MDBInput
                                                                                                {...field}
                                                                                                onChange={(e) =>
                                                                                                    updateSupportedMethodValue(
                                                                                                        i,
                                                                                                        field.name,
                                                                                                        e.target.value,
                                                                                                        index
                                                                                                    )
                                                                                                }
                                                                                                value={param?.value}
                                                                                            />{" "}
                                                                                        </div>
                                                                                    )}
                                                                                </Field>
                                                                                <Field name="nullable">
                                                                                    {({ field }) => (
                                                                                        <div className="mx-2 w-50">
                                                                                            <span className="mx-1">Nullable</span>
                                                                                            <MDBSwitch
                                                                                                {...field}
                                                                                                onChange={(e) =>
                                                                                                    updateSupportedMethodValue(
                                                                                                        i,
                                                                                                        field.name,
                                                                                                        !param?.nullable,
                                                                                                        index
                                                                                                    )
                                                                                                }
                                                                                                checked={param?.nullable}
                                                                                            />{" "}
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
                                                    <div className="d-flex gap-2">
                                                        <span className="fw-bolder">
                                                            System
                                                            <IoMdInformationCircleOutline
                                                                style={{ cursor: "pointer" }}
                                                                className="mx-2"
                                                                data-tooltip-id="my-tooltip"
                                                                data-tooltip-content={"System"}
                                                            />
                                                            <Tooltip id="my-tooltip" />
                                                        </span>
                                                        <Select
                                                            className="w-75"
                                                            defaultValue={{
                                                                label: workflow?.system,
                                                                value: workflow?.system,
                                                            }}
                                                            value={{
                                                                label: workflow?.system,
                                                                value: workflow?.system,
                                                            }}
                                                            isSearchable
                                                            options={systemDropdownOptions}
                                                            onChange={(e) => {
                                                                updateWorkflow("system", e.value);
                                                            }}
                                                        />
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>
                                <MDBBtn type="button" className="m-2" onClick={() => updateConfig()}>
                                    Update config
                                </MDBBtn>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}
        </div>
    );
}

export default ContainerConfig;
