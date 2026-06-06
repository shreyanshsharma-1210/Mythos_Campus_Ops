import { RequestHandler } from "express";

// Vapi proxy route to bypass client-side network restrictions
export const handleVapiProxy: RequestHandler = async (req, res) => {
  try {
    const vapiEndpoint = req.params.endpoint || req.query.endpoint;
    const vapiUrl = `https://api.vapi.ai/${vapiEndpoint}`;

    const vapiResponse = await fetch(vapiUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    console.log("✅ Vapi response status:", vapiResponse.status);

    // Read response once and handle both JSON and text cases
    let responseText;
    let responseData;

    try {
      responseText = await vapiResponse.text();
    } catch (readError) {
      console.error("❌ Failed to read Vapi response:", readError);
      return res.status(500).json({
        error: "Failed to read response from Vapi API",
        details: readError.message,
      });
    }

    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(
        "❌ Vapi response not valid JSON:",
        vapiResponse.status,
        responseText,
      );
      return res.status(vapiResponse.status).json({
        error: "Invalid response format from Vapi API",
        details: responseText,
        status: vapiResponse.status,
      });
    }

    // Forward the response back to client
    res.status(vapiResponse.status).json(responseData);
  } catch (error: any) {
    console.error("❌ Vapi proxy error:", error);
    res.status(500).json({
      error: "Vapi proxy failed",
      details: error.message,
    });
  }
};

// Specific handler for Vapi call creation
export const handleVapiCall: RequestHandler = async (req, res) => {
  try {
    const callConfig = req.body;
    const vapiResponse = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callConfig),
    });

    console.log("📞 Vapi call response status:", vapiResponse.status);

    // Read response once and handle both JSON and text cases
    let responseText;
    let responseData;

    try {
      responseText = await vapiResponse.text();
    } catch (readError) {
      console.error("❌ Failed to read Vapi call response:", readError);
      return res.status(500).json({
        error: "Failed to read response from Vapi API",
        details: readError.message,
      });
    }

    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error(
        "❌ Vapi response not valid JSON:",
        vapiResponse.status,
        responseText,
      );
      return res.status(vapiResponse.status).json({
        error: "Vapi call creation failed",
        details: responseText,
        status: vapiResponse.status,
      });
    }

    if (!vapiResponse.ok) {
      console.error("❌ Vapi call failed:", vapiResponse.status, responseData);
      return res.status(vapiResponse.status).json({
        error: "Vapi call creation failed",
        details: responseData,
        status: vapiResponse.status,
      });
    }

    const callData = responseData;
    console.log("✅ Vapi call created successfully!");
    console.log("📋 Call details:", {
      id: callData.id,
      status: callData.status,
      type: callData.type,
    });

    // Return success response
    res.json({
      success: true,
      call: callData,
      message: "Vapi call created via server proxy",
    });
  } catch (error: any) {
    console.error("❌ Vapi call creation error:", error);
    res.status(500).json({
      error: "Vapi call creation failed",
      details: error.message,
      stack: error.stack?.substring(0, 200),
    });
  }
};

// Test Vapi connectivity from server-side
export const handleVapiTest: RequestHandler = async (req, res) => {
  try {
    const testResponse = await fetch("https://api.vapi.ai/assistant", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(
      `📊 Vapi response: ${testResponse.status} ${testResponse.statusText}`,
    );

    const success = testResponse.ok || testResponse.status === 404;

    // Get response body for debugging - read once to avoid clone issues
    let responseBody = "";
    let errorDetails = null;
    try {
      const text = await testResponse.text();
      responseBody = text.substring(0, 200); // First 200 chars
      console.log("📄 Response body preview:", responseBody);

      // If there's an error, try to parse the full text for more details
      if (!testResponse.ok) {
        try {
          errorDetails = JSON.parse(text);
          console.log("❌ Error details:", errorDetails);
        } catch (e) {
          console.log("📄 Error response not JSON:", text);
        }
      }
    } catch (e) {
      console.log("📄 Could not read response body:", e);
    }

    const result = {
      success,
      status: testResponse.status,
      message: success
        ? "Vapi API connectivity successful from server"
        : "Vapi API connectivity failed from server",
      configured: true,
      responsePreview: responseBody.substring(0, 50),
      errorDetails: errorDetails,
    };

    console.log("✅ Test result:", result);
    res.json(result);
  } catch (error: any) {
    console.error("❌ Server-side Vapi test failed:", error);
    res.status(500).json({
      success: false,
      error: "Server-side Vapi test failed",
      details: error.message,
      stack: error.stack?.substring(0, 500),
      configured: false,
    });
  }
};
