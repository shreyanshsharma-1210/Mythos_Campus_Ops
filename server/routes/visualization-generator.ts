import { RequestHandler } from "express";

interface VisualizationRequest {
  text: string;
  type: 'mindmap' | 'flowchart' | 'roadmap' | 'mnemonic';
  geminiApiKey: string;
}

/**
 * Generate Mind Map structure from text
 */
async function generateMindMap(text: string, apiKey: string): Promise<any> {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  const prompt = `Create a detailed mind map structure from the following text. 
Return a JSON structure with a central topic and branches with sub-branches.

Text:
${text.substring(0, 15000)}

Return ONLY valid JSON in this exact format:
{
  "central": "Main Topic",
  "branches": [
    {
      "name": "Branch 1",
      "subBranches": ["Sub 1.1", "Sub 1.2", "Sub 1.3"]
    },
    {
      "name": "Branch 2",
      "subBranches": ["Sub 2.1", "Sub 2.2"]
    }
  ]
}`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;
  
  // Extract JSON from markdown code blocks
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                   responseText.match(/```\n([\s\S]*?)\n```/) ||
                   [null, responseText];
  const jsonStr = jsonMatch[1] || responseText;
  
  return JSON.parse(jsonStr);
}

/**
 * Generate Flowchart structure from text
 */
async function generateFlowchart(text: string, apiKey: string): Promise<any> {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  const prompt = `Create a flowchart structure from the following text showing the process or concept flow.
Return a JSON structure with nodes and connections.

Text:
${text.substring(0, 15000)}

Return ONLY valid JSON in this exact format:
{
  "title": "Process Title",
  "nodes": [
    {"id": "1", "label": "Start", "type": "start"},
    {"id": "2", "label": "Step 1", "type": "process"},
    {"id": "3", "label": "Decision?", "type": "decision"},
    {"id": "4", "label": "End", "type": "end"}
  ],
  "connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"},
    {"from": "3", "to": "4", "label": "Yes"}
  ]
}`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;
  
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                   responseText.match(/```\n([\s\S]*?)\n```/) ||
                   [null, responseText];
  const jsonStr = jsonMatch[1] || responseText;
  
  return JSON.parse(jsonStr);
}

/**
 * Generate Learning Roadmap from text
 */
async function generateRoadmap(text: string, apiKey: string): Promise<any> {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  const prompt = `Create a learning roadmap from the following text with phases and milestones.
Return a JSON structure with learning phases and topics.

Text:
${text.substring(0, 15000)}

Return ONLY valid JSON in this exact format:
{
  "title": "Learning Roadmap",
  "phases": [
    {
      "phase": "Beginner",
      "duration": "2 weeks",
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    },
    {
      "phase": "Intermediate",
      "duration": "4 weeks",
      "topics": ["Topic 4", "Topic 5"]
    },
    {
      "phase": "Advanced",
      "duration": "6 weeks",
      "topics": ["Topic 6", "Topic 7"]
    }
  ]
}`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;
  
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                   responseText.match(/```\n([\s\S]*?)\n```/) ||
                   [null, responseText];
  const jsonStr = jsonMatch[1] || responseText;
  
  return JSON.parse(jsonStr);
}

/**
 * Generate Mnemonics from text
 */
async function generateMnemonic(text: string, apiKey: string): Promise<any> {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  const prompt = `Create memorable mnemonics from the following text to help remember key concepts.
Return a JSON structure with mnemonics for different concepts.

Text:
${text.substring(0, 15000)}

Return ONLY valid JSON in this exact format:
{
  "title": "Memory Aids",
  "mnemonics": [
    {
      "concept": "Key Concept 1",
      "mnemonic": "Easy To Remember Phrase",
      "explanation": "Each word represents..."
    },
    {
      "concept": "Key Concept 2",
      "mnemonic": "Another Memory Aid",
      "explanation": "This helps remember..."
    }
  ]
}`;

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.candidates[0].content.parts[0].text;
  
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                   responseText.match(/```\n([\s\S]*?)\n```/) ||
                   [null, responseText];
  const jsonStr = jsonMatch[1] || responseText;
  
  return JSON.parse(jsonStr);
}

/**
 * Handle visualization generation request
 */
export const generateVisualization: RequestHandler = async (req, res) => {
  try {
    const { text, type, geminiApiKey } = req.body as VisualizationRequest;

    if (!text || !type || !geminiApiKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: text, type, and geminiApiKey' 
      });
    }

    console.log(`Generating ${type} visualization...`);

    let result;
    switch (type) {
      case 'mindmap':
        result = await generateMindMap(text, geminiApiKey);
        break;
      case 'flowchart':
        result = await generateFlowchart(text, geminiApiKey);
        break;
      case 'roadmap':
        result = await generateRoadmap(text, geminiApiKey);
        break;
      case 'mnemonic':
        result = await generateMnemonic(text, geminiApiKey);
        break;
      default:
        return res.status(400).json({ error: 'Invalid visualization type' });
    }

    res.json({
      success: true,
      type,
      data: result
    });

  } catch (error: any) {
    console.error('Visualization generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate visualization',
      details: error.toString()
    });
  }
};
