
-- Check the current constraint on the invoices table
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'invoices'::regclass 
AND contype = 'c';

-- Update the check constraint to allow all valid status values
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Add the correct check constraint with all valid status values
ALTER TABLE invoices 
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'pending', 'paid', 'overdue'));
