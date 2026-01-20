
export const STORAGE_KEY_DATA = 'landlord_data_v25';
export const STORAGE_KEY_CONFIG = 'landlord_config_v25';

export const DEFAULT_CONFIG = {
  elecPrice: '1.0',
  waterPrice: '5.0',
  defaultRent: '1000',
  
  // 🔴 开发者必填 (SaaS模式)
  // 请去 supabase.com 注册账号 -> New Project
  // 然后在 Project Settings -> API 中找到 URL 和 anon key 填入下面
  
  supabaseUrl: 'https://exsupxyolwkihmttjxty.supabase.co', // Corrected API URL
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c3VweHlvbHdraWhtdHRqeHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTcyNjgsImV4cCI6MjA4NDQzMzI2OH0.7nOLlqhiDYkDr3B9LLlsIZbzrS7M_vLSyxprlIm9hz8'
};