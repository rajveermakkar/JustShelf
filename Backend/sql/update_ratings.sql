-- Update ratings for books that have reviews but 0 rating
UPDATE books 
SET rating = 
  CASE 
    WHEN reviews > 80 THEN (FLOOR(RANDOM() * 2) + 4)::float  -- 4 or 5 stars for highly reviewed books
    WHEN reviews > 50 THEN (FLOOR(RANDOM() * 2) + 3)::float  -- 3 or 4 stars for moderately reviewed books
    WHEN reviews > 20 THEN (FLOOR(RANDOM() * 3) + 2)::float  -- 2, 3, or 4 stars for books with some reviews
    ELSE (FLOOR(RANDOM() * 5) + 1)::float                    -- 1-5 stars for books with few reviews
  END
WHERE rating = 0 AND reviews > 0; 