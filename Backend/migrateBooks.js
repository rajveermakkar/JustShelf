require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use service role key for migration
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FIREBASE_URL = process.env.FIREBASE_URL + '/books.json';

async function migrateBooks() {
    try {
        console.log('Starting book migration from Firebase to Supabase...');
        console.log('Firebase URL:', FIREBASE_URL);

        // 1. Fetch all books from Firebase
        console.log('Fetching books from Firebase...');
        const response = await fetch(FIREBASE_URL);

        if (!response.ok) {
            throw new Error(`Error fetching books from Firebase: ${response.status}`);
        }

        const firebaseData = await response.json();

        if (!firebaseData) {
            console.log('No books found in Firebase');
            return;
        }

        // Transform Firebase data into array
        const books = Object.entries(firebaseData).map(([id, bookData]) => ({
            id,
            title: bookData.title || '',
            author: bookData.author || '',
            description: bookData.description || '',
            price: parseFloat(bookData.price) || 0,
            image_url: bookData.image || bookData.image || '',
            stock_quantity: parseInt(bookData.stockQuantity) || 0,
            category: bookData.category || '',
            rating: parseFloat(bookData.rating) || 0,
            reviews: parseInt(bookData.reviews) || 0,
            created_at: bookData.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        console.log(`Found ${books.length} books in Firebase`);

        // 2. Insert books into Supabase in batches
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < books.length; i += batchSize) {
            const batch = books.slice(i, i + batchSize);
            console.log(`Migrating batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(books.length/batchSize)}...`);

            const { data, error } = await supabase
                .from('books')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error(`Error inserting batch:`, error);
                errorCount += batch.length;
            } else {
                successCount += batch.length;
                console.log(`Successfully migrated ${batch.length} books`);
            }
        }

        console.log('\nMigration Summary:');
        console.log(`Total books found: ${books.length}`);
        console.log(`Successfully migrated: ${successCount}`);
        console.log(`Failed to migrate: ${errorCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run the migration
migrateBooks();