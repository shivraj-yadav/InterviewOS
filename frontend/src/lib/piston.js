export async function executeCode(language, code) {
  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    
    const response = await fetch(`${API_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP Error ${response.status}`,
      };
    }

    return {
      success: data.success,
      output: data.output || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}