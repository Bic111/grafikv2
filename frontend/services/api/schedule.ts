import { apiClient } from "./client";

export const generateSchedule = async (year: number, month: number) => {
  try {
    const response = await apiClient.post("/grafik/generate", {
      year,
      month,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};

export const getSchedule = async (year: number, month: number) => {
  try {
    const response = await apiClient.get(`/grafik/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error;
  }
};
