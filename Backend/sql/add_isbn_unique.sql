-- Add unique constraint to ISBN column
ALTER TABLE books ADD CONSTRAINT books_isbn_unique UNIQUE (isbn);

-- Add comment to explain the constraint
COMMENT ON CONSTRAINT books_isbn_unique ON books IS 'Ensures each book has a unique ISBN'; 