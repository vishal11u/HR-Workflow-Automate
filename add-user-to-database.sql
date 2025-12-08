SELECT 
  id as user_id, 
  email, 
  created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

SELECT * FROM users WHERE email = 'your-email@example.com';

INSERT INTO users (id, organization_id, email, role)
VALUES (
  'YOUR_USER_ID_FROM_STEP_1',  
  gen_random_uuid(),            
  'your-email@example.com',   
  'admin'
);

SELECT 
  id,
  organization_id,
  email,
  role,
  created_at
FROM users
WHERE email = 'your-email@example.com'; 

INSERT INTO users (id, organization_id, email, role)
SELECT 
  id,
  gen_random_uuid(),
  email,
  'admin'
FROM auth.users
WHERE email = 'your-email@example.com' 
AND NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'your-email@example.com' 
);



