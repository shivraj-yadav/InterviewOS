import express from "express";
import { ENV } from "../lib/env.js";

const router = express.Router();

const LANGUAGE_IDS = {
  javascript: 93, // Node.js 18.15.0
  python: 71,     // Python 3.11.2
  java: 62        // Java OpenJDK 13.0.1
};

router.post("/", async (req, res) => {
  try {
    const { language, code } = req.body;

    const language_id = LANGUAGE_IDS[language];
    if (!language_id) {
      return res.status(400).json({ success: false, error: "Unsupported language" });
    }

    if (!ENV.JUDGE0_API_KEY) {
      return res.status(500).json({ success: false, error: "Judge0 API credentials not configured in backend" });
    }

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": ENV.JUDGE0_API_KEY,
        "X-RapidAPI-Host": ENV.JUDGE0_API_HOST,
      },
      body: JSON.stringify({
        language_id,
        source_code: code,
      }),
    };

    const response = await fetch(`https://${ENV.JUDGE0_API_HOST}/submissions?base64_encoded=false&wait=true`, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.message || "Execution failed" });
    }

    // Judge0 CE output can be in stdout, stderr, or compile_output
    const output = data.stdout || data.stderr || data.compile_output || "No output";

    res.json({
      success: data.status && data.status.id <= 3, // id 3 is "Accepted", id 1/2 are In Queue/Processing
      output: output
    });

  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
