import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pekpjrpmhylpuwjkcdde.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBla3BqcnBtaHlscHV3amtjZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMTk1NDcsImV4cCI6MjA4OTg5NTU0N30.kqwKHgR4LwTlTmpQ2ADSnsWlpA9Vc9LSZjl4PT60hAw'

export const supabase = createClient(supabaseUrl, supabaseKey)
