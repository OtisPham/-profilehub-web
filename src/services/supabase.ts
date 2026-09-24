import { createClient } from '@supabase/supabase-js'

// Nhớ tạo file .env ở thư mục gốc và lấy 2 key này trong mục Project Settings -> API của Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)