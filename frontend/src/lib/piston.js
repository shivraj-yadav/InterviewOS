export async function executeCode(language, code) {
  try {
    // In production VITE_API_URL is the Render base origin (no trailing /api).
    // In dev the Vite proxy handles /api, so we fall back to the relative path.
    const API_BASE = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api`
      : "/api";

    const response = await fetch(`${API_BASE}/execute`, {
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