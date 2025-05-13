const express = require('express');//toolbox(express) run and build server
const cors = require('cors'); //toolkit cors function
const app = express(); //cont= bring tool
require('dotenv').config();
//const { supabse } = require('./supabaseClient'); //import supabase client
//Import Routes
const mealPlanRoute = require('./routes/mealplan');
// Middleware
app.use(cors()); //using cors toolkit
app.use(express.json()); //using tool =app
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
// Supabase test route
//app.get('/api/supabase-test', async (req, res) => {
  //try {
    // Test Supabase connection by attempting to select from a table
  //  const { data, error } = await supabase
  //    .from('meal_plans') // Replace with your actual table name
  //    .select('*')
  //    .limit(1);
    
 //   if (error) throw error;
    
  //  res.json({ 
 //     success: true, 
 //     message: 'Supabase connection successful',
  //    data 
  //  });
  //} catch (error) {
  //  console.error('Supabase error:', error);
    //res.status(500).json({ 
  //    success: false, 
  //    message: 'Supabase connection failed', 
  //    error: error.message 
  //  });
 // }
//});
//user data route
app.post('/api/userdata', (req, res) => {
  console.log('Received data:', req.body);  // 👈 Check this
  res.status(200).json({ message: 'Data received successfully' });
});

// Use routes
app.use('/api/mealplan', mealPlanRoute); // <== This connects your route

// Define a test route to verify connection(Base route)
//app.get('/api/test', (req, res) => {
//    res.json({ message: "Swasthi AI API is running!" });
//});
  // Save meal plan route (example)
//app.post('/api/save-meal-plan', async (req, res) => {
 // try {
 //   const { userId, inputData, generatedPlan } = req.body;
    
   // const { data, error } = await supabase
 //     .from('meal_plans')
//      .insert({
 //       user_id: userId,
 //       input_data: inputData,
 //       generated_plan: generatedPlan,
 //       created_at: new Date().toISOString()
  //    });
    
 //   if (error) throw error;
    
 //   res.status(200).json({ 
   //   success: true, 
  //    data 
//    });
//  } catch (error) {
  //  console.error('Error saving meal plan:', error);
    //res.status(500).json({ 
  //    success: false, 
    //  error: error.message 
 //   });
//  }
//});

// Fetch user's meal plans
//app.get('/api/fetch-meal-plans', async (req, res) => {
//  try {
//    const { userId } = req.query;
    
//    if (!userId) {
//      return res.status(400).json({ 
//        success: false, 
//        error: 'User ID is required' 
 //     });
 //   }
    
//    const { data, error } = await supabase
 //     .from('mealplan')
 //     .select('*')
   //   .eq('user_id', userId)
     // .order('created_at', { ascending: false });
    
  //  if (error) throw error;
    
  //  res.status(200).json({ 
      //success: true, 
    //  data 
    //});
//  } catch (error) {
//    console.error('Error fetching meal plans:', error);
  //  res.status(500).json({ 
  //    success: false, 
  //    error: error.message 
  //  });
 // }
//});
//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
//SUPABASE_URL='https://ikmbxolcjvozzoouabum.supabase.co'
//SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbWJ4b2xjanZvenpvb3VhYnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzIyODYsImV4cCI6MjA2MjU0ODI4Nn0.cTYAanqiEw5CnEdEJdQ6q_PypXJ1GRnylUr01bekdXo'
//# Environment: NODE_ENV=development