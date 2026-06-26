
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseAdmin: typeof admin | null = null;
try {
    const sdkKey = process.env.FIREBASE_ADMIN_SDK;
    const config: any = {
        projectId: "gen-lang-client-0064050034"
    };
    
    if (sdkKey) {
        try {
            config.credential = admin.credential.cert(JSON.parse(sdkKey));
        } catch (e) {
            console.error("Failed to parse FIREBASE_ADMIN_SDK JSON. Falling back to default credentials.");
        }
    }

    admin.initializeApp(config);
    firebaseAdmin = admin;
    console.log("Firebase Admin initialized successfully");
} catch (error) {
    console.warn("Firebase Admin initialization failed. Push notifications will be disabled.", error);
}

// Lazy Supabase client
let supabaseClient: any = null;
function getSupabase() {
    if (!supabaseClient) {
        const url = process.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
            console.error("CRITICAL: Supabase environment variables are missing (VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).");
            return null;
        }
        supabaseClient = createClient(url, key);
    }
    return supabaseClient;
}

async function startServer() {
    const app = express();
    app.use(express.json());

    // API Route to send push notification
    app.post('/api/send-push', async (req, res) => {
        const { userId, title, body, data } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const supabase = getSupabase();
        if (!supabase) {
            return res.status(500).json({ error: 'Supabase client not initialized' });
        }

        if (!firebaseAdmin) {
            return res.status(500).json({ error: 'Firebase Admin not initialized. Check your environment variables.' });
        }

        try {
            // 1. Get push token from Supabase profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('push_token')
                .eq('id', userId)
                .single();

            if (profileError || !profile?.push_token) {
                console.log(`No push token found for user ${userId}`);
                return res.status(404).json({ error: 'No push token found' });
            }

            // 2. Send via FCM
            const message = {
                notification: {
                    title: title || 'New Notification',
                    body: body || ''
                },
                data: data || {},
                token: profile.push_token
            };

            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);
            res.json({ success: true, messageId: response });

        } catch (error: any) {
            console.error('Error sending push notification:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // API Route to verify Paystack payment securely on the server
    app.get('/api/paystack/verify/:reference', async (req, res) => {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({ error: 'Transaction reference is required' });
        }

        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            console.error("PAYSTACK_SECRET_KEY is missing from environment variables.");
            // Returning a helpful debug message for preview environments
            return res.status(500).json({ 
                error: 'Paystack Secret Key is not configured on the server. Please add PAYSTACK_SECRET_KEY in the application settings.' 
            });
        }

        try {
            const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Paystack verification error response:", errorData);
                return res.status(response.status).json({ 
                    success: false, 
                    error: errorData.message || 'Paystack verification request failed.' 
                });
            }

            const data = await response.json();
            
            if (data.status && data.data && data.data.status === 'success') {
                return res.json({ 
                    success: true, 
                    message: 'Payment verified successfully', 
                    amount: data.data.amount / 100, // Return standard GHS unit
                    reference: data.data.reference
                });
            } else {
                return res.status(400).json({ 
                    success: false, 
                    error: data.message || 'Transaction was not successful or is still pending.' 
                });
            }

        } catch (error: any) {
            console.error('Error verifying Paystack payment:', error);
            res.status(500).json({ error: error.message || 'Internal server error during verification' });
        }
    });

    // Vite Integration
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(__dirname, 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
}

startServer();
