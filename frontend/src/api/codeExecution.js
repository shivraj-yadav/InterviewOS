import axiosInstance from "../lib/axios";

export const codeExecutionApi = {
  executeCode: async (code, language, input = "") => {
    try {
      const response = await axiosInstance.post("/execute", {
        code,
        language,
        input,
      });
      return response.data;
    } catch (error) {
      console.error("Code execution error:", error);
      throw error;
    }
  },
};
