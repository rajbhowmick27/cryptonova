/*
  # Configure Authentication and Security Settings

  1. Changes
    - Set up user preferences table for auth settings
    - Configure auth policies
    - Add rate limiting tracking
    - Set up session management

  2. Security
    - Enable RLS for all tables
    - Add secure policies for data access
    - Track auth attempts for rate limiting
*/

-- Create auth settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  last_login timestamptz,
  login_attempts integer DEFAULT 0,
  lockout_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create auth attempts tracking table
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  user_agent text,
  attempted_at timestamptz DEFAULT now(),
  success boolean DEFAULT false,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for auth_attempts
CREATE POLICY "Users can read own auth attempts"
  ON auth_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle new user settings
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_settings();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at trigger to user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to track failed login attempts
CREATE OR REPLACE FUNCTION track_failed_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_settings
  SET 
    login_attempts = COALESCE(login_attempts, 0) + 1,
    lockout_until = CASE 
      WHEN COALESCE(login_attempts, 0) >= 5 THEN now() + interval '15 minutes'
      ELSE lockout_until
    END
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Add trigger for failed login attempts
CREATE TRIGGER on_failed_login_attempt
  AFTER INSERT ON auth_attempts
  FOR EACH ROW
  WHEN (NEW.success = false)
  EXECUTE FUNCTION track_failed_login();

-- Function to reset login attempts on successful login
CREATE OR REPLACE FUNCTION reset_login_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_settings
  SET 
    login_attempts = 0,
    lockout_until = NULL,
    last_login = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Add trigger for successful login
CREATE TRIGGER on_successful_login
  AFTER INSERT ON auth_attempts
  FOR EACH ROW
  WHEN (NEW.success = true)
  EXECUTE FUNCTION reset_login_attempts();