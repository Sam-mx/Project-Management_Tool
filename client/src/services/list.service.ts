// client/src/services/list.service.ts
import axiosInstance from "../axiosInstance";

export const sortListByPriority = async (listId: string) => {
  const response = await axiosInstance.put(`/lists/${listId}/sort-priority`);
  return response.data;
};