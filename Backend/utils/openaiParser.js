const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Create OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: parseInt(process.env.OPENAI_API_TIMEOUT, 10) || 10000,
    maxRetries: parseInt(process.env.OPENAI_API_MAX_RETRIES, 10) || 3,
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}


/**
 * Parse a bill image using OpenAI's Vision API
 * @param {string} imagePath - Full path to the bill image
 * @returns {Promise<Array>} - Array of extracted items
 */
async function parseBillImage(imagePath) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized. Check your API key.');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Call OpenAI API with vision capabilities
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-4o',
      temperature: parseFloat(process.env.OPENAI_API_TEMPERATURE) || 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "This is a restaurant bill. Extract all the menu items with their prices. For each item, provide: name, quantity (default to 1 if not specified), unit price, and total price. Format the response as a JSON array with objects having the fields: name, quantity, unitPrice, totalPrice. Only include food/drink items, not tax, tip, or totals. Do not include any explanations in your response, just the JSON."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: parseInt(process.env.OPENAI_API_MAX_TOKENS, 10) || 8000,
    });

    // Parse the response to get the JSON data
    const content = response.choices[0].message.content;
    
    // Try to extract JSON from the response
    let items = [];
    try {
      // Look for JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0]);
      } else {
        // If no array found, try parsing the entire content
        items = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error parsing OpenAI response as JSON:', error);
      console.log('Raw response:', content);
      throw new Error('Failed to parse items from the bill');
    }

    return items;
  } catch (error) {
    console.error('Error parsing bill with OpenAI:', error);
    throw error;
  }
}

module.exports = { parseBillImage };