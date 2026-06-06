import { Request, RequestHandler } from "express";
import multer from "multer";
import PDFParser from "pdf2json";

// Extend Express Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * Extract text from PDF buffer using pdf2json (similar to PyPDF2)
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser();
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        reject(new Error('Failed to parse PDF'));
      });
      
      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          // Extract text from all pages
          let fullText = '';
          
          if (pdfData.Pages) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts) {
                page.Texts.forEach((text: any) => {
                  if (text.R) {
                    text.R.forEach((r: any) => {
                      if (r.T) {
                        // Decode URI component and add to text
                        fullText += decodeURIComponent(r.T) + ' ';
                      }
                    });
                  }
                });
                fullText += '\n\n'; // Add paragraph break between pages
              }
            });
          }
          
          resolve(fullText.trim());
        } catch (error) {
          console.error('Text extraction error:', error);
          reject(new Error('Failed to extract text from PDF data'));
        }
      });
      
      // Parse the buffer
      pdfParser.parseBuffer(buffer);
      
    } catch (error) {
      console.error('PDF extraction error:', error);
      reject(new Error('Failed to extract text from PDF'));
    }
  });
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Remove special characters but keep basic punctuation
  cleaned = cleaned.replace(/[^\w\s.,!?;:()\-'"]/g, '');
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Summarize text using Gemini API with retry logic
 */
async function summarizeText(text: string, apiKey: string, retryCount = 0): Promise<string> {
  // Use v1 API with gemini-2.5-pro (latest model)
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  // Limit text length to avoid token limits (max ~30k characters)
  const truncatedText = text.length > 30000 ? text.substring(0, 30000) + '...' : text;
  
  const prompt = `Please provide a comprehensive summary of the following text. 
Focus on the main ideas, key concepts, and important details:

${truncatedText}

Summary:`;

  try {
    console.log('Calling Gemini API for summarization...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 503) {
        if (retryCount < 2) {
          console.log(`Gemini API overloaded, retrying in 5 seconds... (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          return summarizeText(text, apiKey, retryCount + 1);
        }
        throw new Error('Gemini API is currently overloaded. Please try again in a few minutes.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      } else if (response.status === 400) {
        throw new Error('Invalid request to Gemini API. Please check your API key and request format.');
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini response structure:', JSON.stringify(data));
      throw new Error('Invalid response from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Summarization error:', error);
    throw new Error(`Failed to summarize text: ${error.message}`);
  }
}

/**
 * Generate basic summary without AI (fallback)
 */
function generateBasicSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const firstParagraph = sentences.slice(0, 3).join('. ');
  const keyPoints = sentences.slice(0, 5).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
  
  return `Basic Summary:\n\n${firstParagraph}\n\nKey Points:\n${keyPoints}`;
}

/**
 * Generate basic visual content without AI (fallback)
 */
function generateBasicVisuals(text: string): any {
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const keywords = words.filter(w => w.length > 4 && !commonWords.includes(w)).slice(0, 10);
  
  return {
    title: "Document Analysis",
    keyConcepts: keywords.slice(0, 5),
    visualDescriptions: ["Basic text analysis completed", "Key terms extracted"],
    formulas: [],
    examples: keywords.slice(5, 8),
    summary: ["Document processed successfully", "Basic analysis completed", "AI processing unavailable"]
  };
}

/**
 * Generate visual content from text using Gemini
 */
async function generateVisuals(text: string, apiKey: string): Promise<any> {
  // Use v1 API with gemini-2.5-pro (latest model)
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
  
  // Limit text length to avoid token limits
  const truncatedText = text.length > 20000 ? text.substring(0, 20000) + '...' : text;
  
  const prompt = `Based on the following text, generate a structured learning content with:
1. Key concepts (as bullet points)
2. Visual descriptions for diagrams or illustrations
3. Important formulas or equations (if any)
4. Practical examples
5. Summary points

Text:
${truncatedText}

Please format the response as JSON with the following structure:
{
  "title": "Main topic title",
  "keyConcepts": ["concept1", "concept2", ...],
  "visualDescriptions": ["description1", "description2", ...],
  "formulas": ["formula1", "formula2", ...],
  "examples": ["example1", "example2", ...],
  "summary": ["point1", "point2", ...]
}`;

  try {
    console.log('Calling Gemini API for visual generation...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API visual response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API visual error response:', errorData);
      
      // Handle specific error cases
      if (response.status === 503) {
        throw new Error('Gemini API is currently overloaded. Please try again in a few minutes.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      } else if (response.status === 400) {
        throw new Error('Invalid request to Gemini API. Please check your API key and request format.');
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Gemini API visual response received successfully');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid Gemini visual response structure:', JSON.stringify(data));
      throw new Error('Invalid response from Gemini API');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Try to parse JSON from response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, responseText];
      const jsonStr = jsonMatch[1] || responseText;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.log('JSON parsing failed, returning structured text');
      // If JSON parsing fails, return structured text
      return {
        title: "Generated Content",
        rawContent: responseText,
        keyConcepts: [],
        visualDescriptions: [],
        formulas: [],
        examples: [],
        summary: []
      };
    }
  } catch (error: any) {
    console.error('Visual generation error:', error);
    throw new Error(`Failed to generate visuals: ${error.message}`);
  }
}

/**
 * Handle PDF upload and processing
 */
export const processPDF: RequestHandler = async (req: MulterRequest, res) => {
  try {
    console.log('PDF processing request received');
    
    if (!req.file) {
      console.error('No PDF file in request');
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('PDF file received:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Hardcoded Gemini API key for now
    const HARDCODED_GEMINI_KEY = "AIzaSyDJyDR6xJG6PJ_tjOAi0-VRRzSgCedCwXE"; // Replace with your actual key
    
    let { geminiApiKey } = req.body;
    
    // Use hardcoded key if no key provided or invalid key
    if (!geminiApiKey || geminiApiKey.trim() === '' || geminiApiKey === 'your_gemini_api_key_here') {
      console.log('Using hardcoded Gemini API key');
      geminiApiKey = HARDCODED_GEMINI_KEY;
    }
    
    if (geminiApiKey === "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX") {
      console.error('Please replace the hardcoded API key with your actual Gemini API key');
      return res.status(400).json({ 
        error: 'Gemini API key not configured',
        details: 'Please replace the hardcoded API key in the server code with your actual Google Gemini API key'
      });
    }

    // Step 1: Extract text from PDF using pdf2json
    console.log('Extracting text from PDF...');
    const extractedText = await extractTextFromPDF(req.file.buffer);
    
    if (!extractedText || extractedText.length < 10) {
      return res.status(400).json({ error: 'No text could be extracted from PDF' });
    }

    // Step 2: Clean the extracted text
    console.log('Cleaning extracted text...');
    const cleanedText = cleanText(extractedText);
    
    // Step 3: Try to summarize using Gemini API with fallback
    console.log('Generating summary with Gemini API...');
    let summary: string;
    let visualContent: any;
    
    // Try summarization with fallback
    try {
      summary = await summarizeText(cleanedText, geminiApiKey);
      console.log('✅ Summary generated successfully with Gemini API');
    } catch (error: any) {
      console.log('⚠️ Gemini API failed for summarization, using fallback...');
      summary = generateBasicSummary(cleanedText);
    }
    
    // Try visual generation with fallback
    try {
      console.log('Generating visual content with Gemini API...');
      visualContent = await generateVisuals(cleanedText, geminiApiKey);
      console.log('✅ Visual content generated successfully with Gemini API');
    } catch (error: any) {
      console.log('⚠️ Gemini API failed for visuals, using fallback...');
      visualContent = generateBasicVisuals(cleanedText);
    }

    // Return the processed data
    res.json({
      success: true,
      data: {
        originalText: extractedText.substring(0, 1000) + '...', // First 1000 chars
        cleanedText: cleanedText.substring(0, 1000) + '...',
        summary,
        visuals: visualContent,
        textLength: extractedText.length,
        wordCount: extractedText.split(/\s+/).length
      }
    });

  } catch (error: any) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process PDF',
      details: error.toString()
    });
  }
};

/**
 * Health check endpoint
 */
export const healthCheck: RequestHandler = (req, res) => {
  res.json({ status: 'ok', message: 'PDF processor is running' });
};
