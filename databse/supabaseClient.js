// config/supabaseClient.js - Supabase connection configuration

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials in .env file");
  console.error("Make sure SUPABASE_URL and SUPABASE_ANON_KEY are defined");
  process.exit(1);
}

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;