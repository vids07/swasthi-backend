//STEP 1: Set up your toolkit
const express = require('express');
const router = express.Router();
require('dotenv').config();//Loads .env file and pull its data
const axios = require("axios"); //axios lets you make HTTP requests (send data to APIs, get data back).
const cors = require('cors');
const model = "nousresearch/deephermes-3-mistral-24b-preview:free";  // Use the correct format according to OpenRouter docs
const supabase = require('../databse/supabaseClient');
//STEP 2: Give your delivery boy special permission
// Add CORS middleware to the router
router.use(cors());//saying to router that its okay if people from other locations like flutter app want to talk to you

// STEP 3: Check if API Key is ready
// Check for API key
if (!process.env.OPENROUTER_API_KEY) {                                                                                           
  console.error("❌ Missing OPENROUTER_API_KEY in .env"); // Error message if the API key is not found
  process.exit(1);
}

// NUTRITION DATABASE - Comprehensive Indian food nutrition data
const nutritionDatabase = {
  // Grains & Cereals
  "rice": { protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, vitamins: 0.1, calories: 130 },
  "brown rice": { protein: 2.6, carbs: 23, fats: 0.9, fiber: 1.8, vitamins: 0.2, calories: 112 },
  "roti": { protein: 3.1, carbs: 15.8, fats: 0.4, fiber: 1.9, vitamins: 0.1, calories: 85 },
  "chapati": { protein: 3.1, carbs: 15.8, fats: 0.4, fiber: 1.9, vitamins: 0.1, calories: 85 },
  "wheat": { protein: 11.8, carbs: 71.2, fats: 1.5, fiber: 12.2, vitamins: 0.4, calories: 346 },
  "oats": { protein: 16.9, carbs: 66.3, fats: 6.9, fiber: 10.6, vitamins: 0.8, calories: 389 },
  "quinoa": { protein: 14.1, carbs: 64.2, fats: 6.1, fiber: 7, vitamins: 0.6, calories: 368 },
  
  // Pulses & Legumes
  "dal": { protein: 9.0, carbs: 20.0, fats: 0.5, fiber: 8.0, vitamins: 0.3, calories: 116 },
  "moong dal": { protein: 24.5, carbs: 59.0, fats: 1.2, fiber: 16.3, vitamins: 0.8, calories: 347 },
  "chana dal": { protein: 22.0, carbs: 57.0, fats: 5.3, fiber: 12.8, vitamins: 0.7, calories: 364 },
  "toor dal": { protein: 22.3, carbs: 57.6, fats: 1.7, fiber: 15.5, vitamins: 0.6, calories: 343 },
  "rajma": { protein: 22.5, carbs: 60.3, fats: 1.4, fiber: 24.9, vitamins: 0.9, calories: 347 },
  "chickpeas": { protein: 19.3, carbs: 61.0, fats: 6.0, fiber: 17.4, vitamins: 0.7, calories: 378 },
  "black gram": { protein: 25.2, carbs: 59.6, fats: 1.6, fiber: 18.3, vitamins: 0.8, calories: 347 },
  
  // Vegetables
  "spinach": { protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, vitamins: 2.8, calories: 23 },
  "potato": { protein: 2.0, carbs: 17.0, fats: 0.1, fiber: 2.2, vitamins: 0.5, calories: 77 },
  "onion": { protein: 1.1, carbs: 9.3, fats: 0.1, fiber: 1.7, vitamins: 0.3, calories: 40 },
  "tomato": { protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, vitamins: 1.2, calories: 18 },
  "carrot": { protein: 0.9, carbs: 9.6, fats: 0.2, fiber: 2.8, vitamins: 3.5, calories: 41 },
  "broccoli": { protein: 2.8, carbs: 6.6, fats: 0.4, fiber: 2.6, vitamins: 4.2, calories: 34 },
  "cauliflower": { protein: 1.9, carbs: 5.0, fats: 0.3, fiber: 2.0, vitamins: 1.8, calories: 25 },
  "beans": { protein: 1.8, carbs: 7.0, fats: 0.1, fiber: 3.4, vitamins: 1.2, calories: 35 },
  "okra": { protein: 2.0, carbs: 7.5, fats: 0.2, fiber: 3.2, vitamins: 1.5, calories: 33 },
  "eggplant": { protein: 1.0, carbs: 5.9, fats: 0.2, fiber: 3.0, vitamins: 0.8, calories: 25 },
  
  // Fruits
  "apple": { protein: 0.3, carbs: 25.1, fats: 0.2, fiber: 4.4, vitamins: 2.1, calories: 95 },
  "banana": { protein: 1.1, carbs: 22.8, fats: 0.3, fiber: 2.6, vitamins: 1.8, calories: 89 },
  "orange": { protein: 0.9, carbs: 11.8, fats: 0.1, fiber: 2.4, vitamins: 4.2, calories: 47 },
  "mango": { protein: 0.8, carbs: 15.0, fats: 0.4, fiber: 1.6, vitamins: 3.8, calories: 60 },
  "papaya": { protein: 0.5, carbs: 10.8, fats: 0.3, fiber: 1.7, vitamins: 5.2, calories: 43 },
  "guava": { protein: 2.6, carbs: 14.3, fats: 0.9, fiber: 5.4, vitamins: 8.1, calories: 68 },
  
  // Dairy & Proteins
  "milk": { protein: 3.2, carbs: 4.8, fats: 3.2, fiber: 0, vitamins: 0.8, calories: 61 },
  "yogurt": { protein: 10.0, carbs: 3.6, fats: 0.4, fiber: 0, vitamins: 0.6, calories: 59 },
  "paneer": { protein: 18.3, carbs: 1.2, fats: 20.8, fiber: 0, vitamins: 0.4, calories: 265 },
  "egg": { protein: 13.0, carbs: 1.1, fats: 11.0, fiber: 0, vitamins: 1.2, calories: 155 },
  "chicken": { protein: 31.0, carbs: 0, fats: 3.6, fiber: 0, vitamins: 0.8, calories: 165 },
  
  // Nuts & Seeds
  "almonds": { protein: 21.2, carbs: 21.6, fats: 49.9, fiber: 12.5, vitamins: 2.1, calories: 579 },
  "walnuts": { protein: 15.2, carbs: 13.7, fats: 65.2, fiber: 6.7, vitamins: 1.8, calories: 654 },
  "cashews": { protein: 18.2, carbs: 30.2, fats: 43.9, fiber: 3.3, vitamins: 1.2, calories: 553 },
  
  // Beverages
  "tea": { protein: 0, carbs: 0.7, fats: 0, fiber: 0, vitamins: 0.1, calories: 2 },
  "masala chai": { protein: 1.6, carbs: 9.0, fats: 1.8, fiber: 0, vitamins: 0.2, calories: 60 },
  "coffee": { protein: 0.3, carbs: 0, fats: 0, fiber: 0, vitamins: 0.1, calories: 5 },
  
  // Snacks & Others
  "biscuit": { protein: 6.5, carbs: 66.2, fats: 19.1, fiber: 2.3, vitamins: 0.2, calories: 443 },
  "bread": { protein: 9.0, carbs: 49.0, fats: 3.2, fiber: 2.7, vitamins: 0.3, calories: 265 },
  "upma": { protein: 4.0, carbs: 32.0, fats: 8.0, fiber: 2.5, vitamins: 0.4, calories: 220 },
  "idli": { protein: 4.0, carbs: 15.0, fats: 1.0, fiber: 1.2, vitamins: 0.2, calories: 50 },
  "dosa": { protein: 4.0, carbs: 20.0, fats: 3.0, fiber: 1.5, vitamins: 0.3, calories: 120 },
  "poha": { protein: 3.0, carbs: 20.0, fats: 0.5, fiber: 2.0, vitamins: 0.3, calories: 95 }
};

// Function to calculate nutrition for a food item
const calculateNutrition = (foodName, quantity) => {
  const cleanName = foodName.toLowerCase().trim();
  let nutritionData = null;
  
  // Try exact match first
  if (nutritionDatabase[cleanName]) {
    nutritionData = nutritionDatabase[cleanName];
  } else {
    // Try partial matching for compound foods
    for (const [key, value] of Object.entries(nutritionDatabase)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        nutritionData = value;
        break;
      }
    }
  }
  
  // Default nutrition if not found
  if (!nutritionData) {
    nutritionData = { protein: 2, carbs: 15, fats: 2, fiber: 1, vitamins: 0.5, calories: 80 };
  }
  
  // Calculate quantity multiplier
  let multiplier = 1;
  const quantityStr = quantity.toLowerCase();
  
  if (quantityStr.includes('cup')) {
    multiplier = quantityStr.includes('2') ? 2 : quantityStr.includes('3') ? 3 : 1;
  } else if (quantityStr.includes('piece')) {
    const num = quantityStr.match(/(\d+)/);
    multiplier = num ? parseInt(num[1]) : 1;
  } else if (quantityStr.includes('medium') || quantityStr.includes('small') || quantityStr.includes('large')) {
    multiplier = quantityStr.includes('large') ? 1.5 : quantityStr.includes('small') ? 0.5 : 1;
  }
  
  return {
    protein: Math.round(nutritionData.protein * multiplier * 10) / 10,
    carbs: Math.round(nutritionData.carbs * multiplier * 10) / 10,
    fats: Math.round(nutritionData.fats * multiplier * 10) / 10,
    fiber: Math.round(nutritionData.fiber * multiplier * 10) / 10,
    vitamins: Math.round(nutritionData.vitamins * multiplier * 10) / 10,
    calories: Math.round(nutritionData.calories * multiplier)
  };
};

// 3. Step 4 : Build the prompt for AI based on user input to send to OpenRouter
const buildPrompt = (data) => { //"Hey AI, here's the user's health info. Make a meal plan that matches all this. And format your answer as JSON so I can read it easily in my app."
  //Why use a function(buildprompt) for this? So that no matter which user fills the form — you can generate a new prompt dynamically, without rewriting everything.
    // Determine number of days based on mealPlanDuration
  // Determine number of days based on mealPlanDuration
 let numDays = 1;
  if (data.mealPlanDuration === '3 Days') numDays = 3;
  else if (data.mealPlanDuration === '1 Week') numDays = 7;

  const generateExampleDays = (days) => {
    let exampleDays = [];
    for (let i = 1; i <= days; i++) {
      if (days === 7) {
        exampleDays.push(`        {
          "day": "Day ${i}",
          "meals": [
            {"type": "Breakfast", "items": [{"name": "Idli", "quantity": "3 pieces", "calories": 150}]},
            {"type": "Mid-morning Snack", "items": [{"name": "Apple", "quantity": "1 medium", "calories": 95}]},
            {"type": "Lunch", "items": [{"name": "Rice & Dal", "quantity": "1 cup each", "calories": 300}]},
            {"type": "Evening Snack", "items": [{"name": "Masala Chai", "quantity": "1 cup", "calories": 60}]},
            {"type": "Dinner", "items": [{"name": "Roti & Sabzi", "quantity": "2 roti + curry", "calories": 250}]}
          ]
        }`);
      } else {
        exampleDays.push(`        {
          "day": "Day ${i}",
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
                {"name": "Dal", "quantity": "1 cup", "calories": 150}
              ]
            },
            {
              "type": "Evening Snack",
              "items": [
                {"name": "Masala Chai", "quantity": "1 cup", "calories": 60}
              ]
            },
            {
              "type": "Dinner",
              "items": [
                {"name": "Brown Rice", "quantity": "1 cup", "calories": 216}
              ]
            }
          ]
        }`);
      }
    }
    return exampleDays.join(',\n');
  };

  return `You are a certified nutritionist. Create a personalized ${data.mealPlanDuration || '1 Day'} meal plan for a user with these details:

Name: ${data.name || 'User'}
Age: ${data.age}
Height: ${data.height} cm
Weight: ${data.weight} kg
Activity Level: ${data.activityLevel}
Goal: ${data.fitnessGoal}
Meal Plan Duration: ${data.mealPlanDuration}
Diet Preference: ${data.dietPreference}
Allergy: ${data.allergy || 'None'}
Food Preference: ${data.foodPreference}
Medical Condition: ${data.medicalCondition || 'None'}
Weekly Budget: ${data.weeklyBudget}

CRITICAL: Return ONLY valid JSON without any markdown formatting, code blocks, or extra text. Your response must start with { and end with }.

The JSON should include:
- A "weeklyPlan" array containing ${numDays} ${numDays === 1 ? 'day' : 'days'} of meals
- A "greeting" string with a personalized message  
- A "totalCalories" number field (average daily calories)

${numDays === 7 ? 'IMPORTANT: For 7-day plans, use simplified meal structure with 3 main meals per day to stay within token limits.' : 'IMPORTANT: Keep your response under 1500 tokens to avoid truncation.'}

Ensure the JSON is complete and properly closed with all brackets and braces.

Each meal should have a "type" and an "items" array.
Each item should have "name", "quantity", and "calories" (as a number) fields.

Use common Indian foods like: rice, dal, roti, chapati, vegetables (spinach, potato, onion, tomato), fruits (apple, banana, orange), milk, yogurt, paneer, idli, dosa, upma, poha, masala chai, etc.

Example structure (create exactly ${numDays} days):

{
  "weeklyPlan": [
${generateExampleDays(numDays)}
  ],
  "greeting": "Hi ${data.name || 'there'}, Here's your personalized ${numDays}-day ${data.dietPreference || 'Indian vegetarian'} meal plan designed for your specific needs.",
  "totalCalories": ${numDays === 7 ? '1400' : '1391'}
}

Ensure all fields are properly filled and the JSON is valid without any markdown formatting or code blocks. Create exactly ${numDays} different days with varied meals.`;
};

// Helper function to save meal plan to Supabase
const saveMealPlanToSupabase = async (inputData, generatedPlan) => {
  try {
    console.log("Attempting to save to Supabase...");
    const { data, error } = await supabase
      .from('mealplan')
      .insert({
        input_data: inputData,
        generated_plan: generatedPlan,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error saving to Supabase:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Exception saving to Supabase:", error);
    return { success: false, error };
  }
};

// Test route
router.get('/', (req, res) => {
  res.send('Enhanced Meal Plan API with Nutrition is working!');
});

// Enhanced route to generate meal plan with nutrition
router.post('/generate-mealplan', async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, error: "Missing request body" });
    }

    const userInput = req.body;
    const userId = userInput.userId || 'anonymous';
    const dynamicPrompt = buildPrompt(userInput);

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Missing OpenRouter API key");
      return res.status(500).json({ 
        success: false, 
        error: "Server configuration error - API key missing" 
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "nousresearch/deephermes-3-mistral-24b-preview:free",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI dietician specializing in personalized meal plans with accurate nutrition data."
          },
          { role: "user", content: dynamicPrompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://192.168.1.9:3000",
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

    const generatedMealPlan = response.data.choices[0].message.content;

    try {
      let cleanedResponse = generatedMealPlan.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      }
      
      const parsedMealPlan = JSON.parse(cleanedResponse);
      
      // ENHANCED: Add nutrition calculation to each food item and daily totals
      if (parsedMealPlan.weeklyPlan) {
        parsedMealPlan.weeklyPlan.forEach(day => {
          let dailyNutrition = {
            protein: 0, carbs: 0, fats: 0, fiber: 0, vitamins: 0, calories: 0
          };
          
          day.meals.forEach(meal => {
            let mealNutrition = {
              protein: 0, carbs: 0, fats: 0, fiber: 0, vitamins: 0, calories: 0
            };
            
            meal.items.forEach(item => {
              const nutrition = calculateNutrition(item.name, item.quantity);
              
              // Add nutrition data to each item
              item.nutrition = nutrition;
              item.calories = nutrition.calories; // Update calories with calculated value
              
              // Add to meal totals
              Object.keys(mealNutrition).forEach(key => {
                mealNutrition[key] += nutrition[key];
              });
            });
            
            // Round meal nutrition values
            Object.keys(mealNutrition).forEach(key => {
              mealNutrition[key] = Math.round(mealNutrition[key] * 10) / 10;
            });
            meal.nutrition = mealNutrition;
            
            // Add to daily totals
            Object.keys(dailyNutrition).forEach(key => {
              dailyNutrition[key] += mealNutrition[key];
            });
          });
          
          // Round daily nutrition values
          Object.keys(dailyNutrition).forEach(key => {
            dailyNutrition[key] = Math.round(dailyNutrition[key] * 10) / 10;
          });
          day.nutrition = dailyNutrition;
        });
        
        // Calculate average daily nutrition for the entire plan
        const totalDays = parsedMealPlan.weeklyPlan.length;
        const averageNutrition = {
          protein: 0, carbs: 0, fats: 0, fiber: 0, vitamins: 0, calories: 0
        };
        
        parsedMealPlan.weeklyPlan.forEach(day => {
          Object.keys(averageNutrition).forEach(key => {
            averageNutrition[key] += day.nutrition[key];
          });
        });
        
        Object.keys(averageNutrition).forEach(key => {
          averageNutrition[key] = Math.round((averageNutrition[key] / totalDays) * 10) / 10;
        });
        
        parsedMealPlan.averageDailyNutrition = averageNutrition;
        parsedMealPlan.totalCalories = averageNutrition.calories;
      }

      // Save to Supabase
      const saveResult = await saveMealPlanToSupabase(userInput, cleanedResponse);
      if (!saveResult.success) {
        console.warn("Warning: Failed to save meal plan to database, but continuing with response");
      }
      
      // Send enhanced response with nutrition data
      res.json({
        success: true,
        mealPlan: parsedMealPlan,
        userProfile: {
          name: userInput.name,
          age: userInput.age,
          height: userInput.height,
          weight: userInput.weight,
          activityLevel: userInput.activityLevel,
          fitnessGoal: userInput.fitnessGoal,
          mealPlanDuration: userInput.mealPlanDuration,
          dietPreference: userInput.dietPreference,
          allergy: userInput.allergy || 'None',
          foodPreference: userInput.foodPreference,
          medicalCondition: userInput.medicalCondition || 'None',
          weeklyBudget: userInput.weeklyBudget
        }
      });
      
    } catch (jsonError) {
      console.error("Error parsing meal plan JSON:", jsonError);
      console.log("Invalid JSON received:", generatedMealPlan);
      
      return res.status(500).json({
        success: false,
        error: "Generated meal plan is not valid JSON",
        details: generatedMealPlan.substring(0, 200) + "..."
      });
    }
  } catch (error) {
    console.error("Meal Plan Error:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate meal plan", 
      details: error.response ? error.response.data : error.message  
    });
  }
});

// Route to fetch user's meal plan history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing user ID" });
    }

    const { data, error } = await supabase
      .from('mealplan')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching from Supabase:", error);
      return res.status(500).json({ success: false, error: "Failed to fetch meal plan history" });
    }

    return res.json({
      success: true,
      history: data
    });
  } catch (error) {
    console.error("History Error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch meal plan history" });
  }
});

module.exports = router;