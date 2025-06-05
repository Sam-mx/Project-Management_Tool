import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { loginUser } from "../../redux/features/authSlice";

interface Props {
  setCommonError: React.Dispatch<React.SetStateAction<string>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleAuthBtn = ({ setCommonError, setIsSubmitting }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const googleSuccess = async (response: CredentialResponse) => {
    const credential = response.credential;

    if (!credential) {
      setCommonError("Oops, something went wrong");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axiosInstance.post(`/auth/google`, {
        tokenId: credential, // send the JWT credential to your backend
      });
      const { data } = res.data;

      setCommonError("");
      setIsSubmitting(false);

      dispatch(
        loginUser({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );
      // Optionally navigate after login:
      // navigate("/dashboard");
    } catch (error: any) {
      setIsSubmitting(false);
      setCommonError("");
      if (error.response) {
        const { message } = error.response.data;
        switch (error.response.status) {
          case 400:
          case 500:
            setCommonError(message);
            break;
          default:
            setCommonError("Oops, something went wrong");
        }
      } else if (error.request) {
        setCommonError("Oops, something went wrong");
      } else {
        setCommonError(`Error: ${error.message}`);
      }
    }
  };

  const googleFailure = () => {
    setCommonError("Unable to get profile information from Google");
  };

  return (
    <GoogleLogin
      onSuccess={googleSuccess}
      onError={googleFailure}
      text="continue_with"
    />
  );
};

export default GoogleAuthBtn;
