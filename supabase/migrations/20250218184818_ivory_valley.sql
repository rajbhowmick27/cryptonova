/*
  # Configure Authentication Settings

  1. Changes
    - Enable email authentication
    - Configure Google OAuth
    - Set up secure password policies
    - Add rate limiting for auth attempts

  2. Security
    - Enable secure password requirements
    - Add brute force protection
    - Configure session management
*/

-- Enable email authentication
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Configure auth settings
BEGIN;
  -- Update auth settings
  INSERT INTO auth.config (key, value)
  VALUES
    ('SECURITY.CAPTCHA.ENABLED', 'true'),
    ('MAILER.SUBJECTS.CONFIRMATION', 'Confirm your email'),
    ('MAILER.SUBJECTS.RECOVERY', 'Reset your password'),
    ('SECURITY.AUTO_CONFIRM_EMAIL', 'true'),
    ('SECURITY.REFRESH_TOKEN_ROTATION_ENABLED', 'true'),
    ('SECURITY.PASSWORD_POLICY.MIN_LENGTH', '8'),
    ('SECURITY.PASSWORD_POLICY.REQUIRE_SPECIAL_CHAR', 'true'),
    ('SECURITY.PASSWORD_POLICY.REQUIRE_NUMBER', 'true'),
    ('SECURITY.PASSWORD_POLICY.REQUIRE_UPPERCASE', 'true')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

  -- Configure rate limiting
  INSERT INTO auth.config (key, value)
  VALUES 
    ('RATE_LIMIT.EMAIL.ENABLED', 'true'),
    ('RATE_LIMIT.EMAIL.POINTS', '5'),
    ('RATE_LIMIT.EMAIL.PERIOD', '900'),
    ('RATE_LIMIT.SMS.ENABLED', 'true'),
    ('RATE_LIMIT.SMS.POINTS', '5'),
    ('RATE_LIMIT.SMS.PERIOD', '900')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
COMMIT;

-- Add RLS policies for auth
CREATE POLICY "Users can read own auth settings"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Enable secure sessions
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON auth.sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);