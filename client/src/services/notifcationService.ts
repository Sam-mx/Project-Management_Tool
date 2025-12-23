import axiosInstance from "../axiosInstance";

export const getNotifications = async () => {
  const response = await axiosInstance.get("/notifications");
  return response.data;
};

export const markNotificationsRead = async () => {
  const response = await axiosInstance.put("/notifications/read");
  return response.data;
};