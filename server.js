const express = require('express');//toolbox(express) run and build server
const cors = require('cors'); //toolkit cors function
const app = express(); //const= bring tool
require('dotenv').config();
const supabase = require('./databse/supabaseClient'); //remove
//Import Routes
const mealPlanRoute = require('./routes/mealplan');
// Middleware(app= using tool)
app.use(cors()); //using cors toolkit
app.use(express.json()); //using tool =app
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Log all incoming requests(get)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
//user data route(post)
app.post('/api/userdata', (req, res) => {
  console.log('Received data:', req.body);  // 👈 Check this
  res.status(200).json({ message: 'Data received successfully' });
});

// Use routes
app.use('/api/mealplan', mealPlanRoute); // <== This connects your route
// Basic Supabase health check
app.get('/api/db-health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mealplan')
      .select('count')
      .limit(1);
    
    if (error) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed', 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      status: 'success', 
      message: 'Database connection successful' 
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error', 
      message: 'Database health check failed', 
      error: error.message 
    });
  }
});

//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});