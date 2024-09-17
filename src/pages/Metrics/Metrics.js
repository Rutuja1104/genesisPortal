import React, { useEffect, useState } from "react";
import { CardBody, Card } from "reactstrap";

const Metrics = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        authenticateMixpanel();
    });
    const authenticateMixpanel = async () => {
        try {
            const response = await fetch("https://mixpanel.com/api/app/public/verify/48d74539-04ec-4524-b7ff-d591eda94949/", {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: "ZYf9vsKAq4" }),
            });
            console.log("RESPONSE IS ", response);
            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Error during authentication:", error);
            setIsAuthenticated(false); 
        }
    };
    return (
        <Card className="w-10" style={{ height: "100%" }}>
            <CardBody className="h-10">
                {!isAuthenticated ? (
                    <span>Authenticating the mixpanel...</span>
                ) : (
                    <iframe src="https://mixpanel.com/p/9zhBrgcxma61eVJ4ewc5Lt" width="100%" title="mixpanel-board" height="100%" style={{ border: "none" }} />
                )}
            </CardBody>
        </Card>
    );
};

export default Metrics;
