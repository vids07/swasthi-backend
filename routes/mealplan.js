//STEP 1: Set up your toolkit
const express = require('express');
const router = express.Router();
//const fetch = require('node-fetch'); // node-fetch is a lightweight module that brings `window.fetch` to Node.js. It allows you to make HTTP requests in Node.js, similar to how you would in the browser.
require('dotenv').config();//Loads .env file and pull its data
const axios = require("axios"); //axios lets you make HTTP requests (send data to APIs, get data back).
const cors = require('cors');
const model = "meta-llama/llama-4-scout:free";  // Use the correct format according to OpenRouter docs
//const supabase = require('../supabaseClient');

//STEP 2: Give your delivery boy special permission
// Add CORS middleware to the router
router.use(cors());//saying to router that its okay if people from other locations like flutter app want to talk to you

// STEP 3: Check if API Key is ready
// Check for API key
if (!process.env.OPENROUTER_API_KEY) {
  console.error("❌ Missing OPENROUTER_API_KEY in .env"); // Error message if the API key is not found
  process.exit(1);
}

// 3. Step 4 : Build the prompt for AI based on user input to send to OpenRouter
const buildPrompt = (data) => { //"Hey AI, here's the user's health info. Make a meal plan that matches all this. And format your answer as JSON so I can read it easily in my app."
  //Why use a function(buildprompt) for this? So that no matter which user fills the form — you can generate a new prompt dynamically, without rewriting everything.
  return `  
    You are a certified nutritionist. Create a personalized 1-day meal plan for a user with these details:

    Age: ${data.age}
    Height: ${data.height} cm
    Weight: ${data.weight} kg
    Activity Level: ${data.activityLevel}
    Goal: ${data.fitnessGoal}
    Diet Preference: ${data.dietPreference}
    Allergy: ${data.allergy|| 'None'}
    Food Preference: ${data.foodPreference}
    Medical Condition: ${data.medicalCondition || 'None'}
    Weekly Budget: ${data.weeklyBudget}

     IMPORTANT: Your response must be structured as valid JSON with a specific format. The response should include:
    - A "weeklyPlan" array containing one day of meals
    - A "greeting" string with a personalized message
    - A "totalCalories" number field

    Each meal should have a "type" (Breakfast, Mid-morning Snack, Lunch, Evening Snack, Dinner) and an "items" array.
    Each item should have "name", "quantity", and "calories" (as a number) fields.

    Example structure (this is just a template, fill with appropriate values):
    
    {
      "weeklyPlan": [
        {
          "day": "Day 1",
          "meals": [
            {
              "type": "Breakfast",
              "items": [
                {"name": "Vegetable Upma", "quantity": "1 cup", "calories": 220}
              ]
            },
            {
              "type": "Mid-morning Snack",
              "items": [
                {"name": "Apple", "quantity": "1 medium", "calories": 95}
              ]
            },
            {
              "type": "Lunch",
              "items": [
                {"name": "Roti", "quantity": "2 pieces", "calories": 170},
                {"name": "Dal", "quantity": "1 cup", "calories": 150},
                {"name": "Mixed Vegetable Curry", "quantity": "1 cup", "calories": 120}
              ]
            },
            {
              "type": "Evening Snack",
              "items": [
                {"name": "Masala Chai", "quantity": "1 cup", "calories": 60},
                {"name": "Roasted Chana", "quantity": "1/4 cup", "calories": 100}
              ]
            },
            {
              "type": "Dinner",
              "items": [
                {"name": "Brown Rice", "quantity": "1 cup", "calories": 216},
                {"name": "Palak Paneer", "quantity": "1 cup", "calories": 260}
              ]
            }
          ]
        }
      ],
      "greeting": "Hi there! Here's your personalized Indian vegetarian meal plan designed for your specific needs.",
      "totalCalories": 1391
    }
    
    Ensure all fields are properly filled and the JSON is valid without any markdown formatting or code blocks.
  `;
};

// First test if its working properly; Express route to handle meal plan generation
router.get('/', (req, res) => {
  res.send('Meal Plan API is working!');
});

//STEP 5: Route that talks to OpenRouter (AI)  
//Main route to generate meal plan( route that match url)
router.post('/generate-mealplan', async (req, res) => {//Sets up a POST route at /generate-mealplan.
  try {
    console.log("Received request body:", req.body); // Log the exact parameters you're sending to OpenRouter
    
    // Validate input :Validates that the frontend has actually sent data.
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, error: "Missing request body" });
    }

    const userInput = req.body;// Grab all user fields from request body
const prompt =  buildPrompt(userInput);// Build the prompt, Use the helper function we made earlier
   

      // Make sure API key is available: "Even if somehow we got here, don't crash, respond nicely."
      if (!process.env.OPENROUTER_API_KEY) {
        console.error("Missing OpenRouter API key");
        return res.status(500).json({ 
          success: false, 
          error: "Server configuration error - API key missing" 
        });
    }
    console.log("🔍 DEBUG: Using API key:", process.env.OPENROUTER_API_KEY.substring(0, 5) + "...");
    //const apiRequestBody = {
      const response = await axios.post( //: You're hitting OpenRouter’s chat API.
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-4-scout:free",
          messages: [//This is the chat history you're sending to the AI model — like a conversation between the user and assistant.
            {
              role: "system", //a role: either "system", "user", or "assistant"
              content: "You are a helpful AI dietician specializing in personalized meal plans."
            },//content: the actual text of the message user asked
            { role: "user", content: prompt }
          ]
        },
        {
          //Headers are extra pieces of information you send along with your API request. Think of them like metadata that tells the server: Who you are What type of data you're sending How the server should handle your request
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",// tells server what type of data you re sending
            "HTTP-Referer": "https://192.168.1.10:3000", //This is used for tracking where the request is coming from.
            "X-Title": "Swasthi AI Meal Plan"
          }
        }
      );
    console.log("Received response from OpenRouter");
    if (!response.data.choices || !response.data.choices[0]) {
      return res.status(500).json({ 
        success: false, 
        error: "Invalid response from OpenRouter API",
        details: response.data
      });
    }
console.log("successfully recieved meal plan from API");
    // Return the meal plan in the format expected by the frontend
    res.json({
      success: true,
      mealPlan: response.data.choices[0].message.content
      //mealPlan: mealPlanContent
    });
  } catch (error) {
    console.error("Meal Plan Error:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ success: false, error: "Failed to generate meal plan", details: error.response ? error.response.data : error.message  });
  }
});

// Fixed closing bracket alignment here
module.exports = router;
