import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { RootState } from "./redux/app";
import { addToast } from "./redux/features/toastSlice";
import { ToastObj } from "./types";

interface Props {
  toast?: ToastObj;
  children: JSX.Element;
}

const PrivateRoute = ({ toast, children }: Props) => {
  const dispatch = useDispatch();

  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  const location = useLocation();

  if (!accessToken && !refreshToken) {
    if (toast) {
      dispatch(addToast(toast));
    }
    // FIX: Redirect to Landing Page ("/") instead of Login
    return <Navigate replace to="/" state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
