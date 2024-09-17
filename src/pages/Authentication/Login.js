import React,{useCallback} from "react";
import { useNavigate } from "react-router-dom";
import { Descope } from "@descope/react-sdk";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = (e) => {
    toast.success("Welcome to Genesis!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    navigate("/organizations");
  };

  const handleError = (e) => {
    console.log("Could not log in!");
    toast.error("Failed to login", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const errorTransformer = useCallback(
    (error) => {
      const translationMap = {
        MagicLinkSignUpOrInFailed: 'Failed to login !'
      };
      return translationMap[error.type] || error.text;
    },
    []
  );
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Descope
        flowId="sign-in"
        onSuccess={handleSuccess}
        onError={handleError}
        errorTransformer={errorTransformer}
      />
    </div>
  );
}

export default Login;
