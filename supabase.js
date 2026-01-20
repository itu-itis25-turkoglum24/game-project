// ============================================
// SUPABASE DATABASE MODULE
// Handles all cloud database operations
// ============================================

const SUPABASE_URL = 'https://fznfhrfxjxgmsfywjmvh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bmZocmZ4anhnbXNmeXdqbXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTE5MjUsImV4cCI6MjA4NDMyNzkyNX0.AwcYf2DYyVyZ5xAf1P08YAoDzFVHva8HVZWhrFG1PA4';

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } else {
        console.warn('Supabase library not loaded, falling back to localStorage');
        return false;
    }
}

// Check if Supabase is available
function isSupabaseReady() {
    return supabaseClient !== null;
}

// ============================================
// PLAYER OPERATIONS
// ============================================

// Fetch player data by name
async function fetchPlayer(name) {
    if (!isSupabaseReady()) return null;

    try {
        const { data, error } = await supabaseClient
            .from('players')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No player found, not an error
                return null;
            }
            console.error('Error fetching player:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception fetching player:', err);
        return null;
    }
}

// Create or update player data
async function savePlayer(playerData) {
    if (!isSupabaseReady()) return false;

    try {
        const { data, error } = await supabaseClient
            .from('players')
            .upsert({
                name: playerData.name,
                high_score: playerData.highScore,
                tokens: playerData.tokens,
                owned_frame_colors: playerData.ownedFrameColors,
                owned_shape_colors: playerData.ownedShapeColors,
                owned_patterns: playerData.ownedPatterns,
                power_up_inventory: playerData.powerUpInventory,
                active_frame_color: playerData.activeFrameColor,
                active_shape_color: playerData.activeShapeColor,
                active_pattern: playerData.activePattern,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'name'
            });

        if (error) {
            console.error('Error saving player:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception saving player:', err);
        return false;
    }
}

// ============================================
// LEADERBOARD OPERATIONS
// ============================================

// Fetch global leaderboard (top 10)
async function fetchLeaderboard() {
    if (!isSupabaseReady()) return null;

    try {
        const { data, error } = await supabaseClient
            .from('leaderboard')
            .select('name, score')
            .order('score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return null;
        }

        // Transform to match local format
        return data.map(entry => ({
            name: entry.name,
            score: entry.score
        }));
    } catch (err) {
        console.error('Exception fetching leaderboard:', err);
        return null;
    }
}

// Update leaderboard entry (only if score is higher)
async function updateLeaderboardEntry(playerName, score) {
    if (!isSupabaseReady()) return false;

    try {
        // First check if entry exists and get current score
        const { data: existing } = await supabaseClient
            .from('leaderboard')
            .select('score')
            .eq('name', playerName)
            .single();

        // Only update if new score is higher or no entry exists
        if (existing && existing.score >= score) {
            return true; // No update needed
        }

        const { error } = await supabaseClient
            .from('leaderboard')
            .upsert({
                name: playerName,
                score: score,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'name'
            });

        if (error) {
            console.error('Error updating leaderboard:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception updating leaderboard:', err);
        return false;
    }
}

// Export functions for use in game.js
window.SupabaseDB = {
    init: initSupabase,
    isReady: isSupabaseReady,
    fetchPlayer,
    savePlayer,
    fetchLeaderboard,
    updateLeaderboardEntry
};
