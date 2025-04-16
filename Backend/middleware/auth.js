const { authSupabase } = require('../utils/supabaseClient');

const auth = async (req, res, next) => {
    try {
        console.log('\n=== Auth Middleware Request Start ===');
        console.log('Request URL:', req.originalUrl);
        console.log('Request Method:', req.method);
        console.log('Request Headers:', {
            authorization: req.headers.authorization ? 'Bearer token present' : 'No authorization header',
            cookie: req.headers.cookie ? 'Cookies present' : 'No cookies'
        });
        console.log('Cookies:', {
            accessToken: req.cookies['sb-access-token'] ? 'Present' : 'Missing',
            refreshToken: req.cookies['sb-refresh-token'] ? 'Present' : 'Missing'
        });

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth Error - No valid authorization header');
            console.log('=== Auth Middleware Request End ===\n');
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token validation attempt - Token length:', token.length);

        const { data: { user }, error } = await authSupabase.auth.getUser(token);

        if (error) {
            console.log('Token validation error:', {
                message: error.message,
                status: error.status,
                name: error.name
            });

            if (error.message.includes('expired') || error.message.includes('invalid')) {
                console.log('Attempting token refresh...');
                const refreshToken = req.cookies['sb-refresh-token'];
                
                if (!refreshToken) {
                    console.log('Refresh Error - No refresh token in cookies');
                    console.log('=== Auth Middleware Request End ===\n');
                    return res.status(401).json({
                        error: 'Session expired - no refresh token',
                        code: 'SESSION_EXPIRED'
                    });
                }

                console.log('Refresh token found, attempting refresh...');
                const { data: { session, user }, error: refreshError } = await authSupabase.auth.refreshSession({
                    refresh_token: refreshToken
                });

                if (refreshError) {
                    console.log('Refresh Error:', {
                        message: refreshError.message,
                        status: refreshError.status,
                        name: refreshError.name
                    });
                    console.log('=== Auth Middleware Request End ===\n');
                    return res.status(401).json({
                        error: 'Session expired - refresh failed',
                        code: 'SESSION_EXPIRED'
                    });
                }

                console.log('Token refresh successful');
                console.log('New session details:', {
                    accessTokenLength: session.access_token.length,
                    refreshTokenLength: session.refresh_token.length,
                    userId: user.id
                });

                req.headers.authorization = `Bearer ${session.access_token}`;
                req.user = user;

                res.cookie('sb-access-token', session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600000
                });
                res.cookie('sb-refresh-token', session.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 604800000
                });

                console.log('New tokens set in cookies');
                console.log('=== Auth Middleware Request End ===\n');
                next();
                return;
            }

            console.log('=== Auth Middleware Request End ===\n');
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (!user) {
            console.log('Error - Valid token but no user found');
            console.log('=== Auth Middleware Request End ===\n');
            return res.status(401).json({ error: 'Invalid token' });
        }

        console.log('Session validated successfully:', {
            userId: user.id,
            email: user.email,
            role: user.role
        });
        console.log('=== Auth Middleware Request End ===\n');

        req.user = user;
        next();
    } catch (error) {
        console.error('Unexpected Auth Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        console.log('=== Auth Middleware Request End ===\n');
        res.status(500).json({ error: error.message });
    }
};

const admin = async (req, res, next) => {
    try {
        console.log('\n=== Admin Middleware Request Start ===');
        console.log('Request URL:', req.originalUrl);
        console.log('Request Method:', req.method);
        console.log('User attempting admin access:', req.user?.id);

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Admin Error - No valid authorization header');
            console.log('=== Admin Middleware Request End ===\n');
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Admin token validation attempt - Token length:', token.length);

        const { data: { user }, error } = await authSupabase.auth.getUser(token);

        if (error) {
            console.log('Admin token validation error:', {
                message: error.message,
                status: error.status,
                name: error.name
            });

            if (error.message.includes('expired') || error.message.includes('invalid')) {
                console.log('Attempting admin token refresh...');
                const refreshToken = req.cookies['sb-refresh-token'];
                
                if (!refreshToken) {
                    console.log('Admin Refresh Error - No refresh token in cookies');
                    console.log('=== Admin Middleware Request End ===\n');
                    return res.status(401).json({
                        error: 'Session expired - no refresh token',
                        code: 'SESSION_EXPIRED'
                    });
                }

                console.log('Admin refresh token found, attempting refresh...');
                const { data: { session, user }, error: refreshError } = await authSupabase.auth.refreshSession({
                    refresh_token: refreshToken
                });

                if (refreshError) {
                    console.log('Admin Refresh Error:', {
                        message: refreshError.message,
                        status: refreshError.status,
                        name: refreshError.name
                    });
                    console.log('=== Admin Middleware Request End ===\n');
                    return res.status(401).json({
                        error: 'Session expired - refresh failed',
                        code: 'SESSION_EXPIRED'
                    });
                }

                console.log('Admin token refresh successful');
                console.log('New admin session details:', {
                    accessTokenLength: session.access_token.length,
                    refreshTokenLength: session.refresh_token.length,
                    userId: user.id
                });

                req.headers.authorization = `Bearer ${session.access_token}`;
                req.user = user;

                res.cookie('sb-access-token', session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 3600000
                });
                res.cookie('sb-refresh-token', session.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 604800000
                });

                console.log('New admin tokens set in cookies');

                const { data: profile, error: profileError } = await authSupabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile || profile.role !== 'admin') {
                    console.log('Admin Role Check Failed:', {
                        profileError: profileError?.message,
                        profile: profile,
                        expectedRole: 'admin'
                    });
                    console.log('=== Admin Middleware Request End ===\n');
                    return res.status(403).json({ error: 'Access denied. Admin only.' });
                }

                console.log('Admin role validated successfully');
                console.log('=== Admin Middleware Request End ===\n');
                next();
                return;
            }

            console.log('=== Admin Middleware Request End ===\n');
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (!user) {
            console.log('Admin Error - Valid token but no user found');
            console.log('=== Admin Middleware Request End ===\n');
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;

        const { data: profile, error: profileError } = await authSupabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'admin') {
            console.log('Admin Role Check Failed:', {
                profileError: profileError?.message,
                profile: profile,
                expectedRole: 'admin'
            });
            console.log('=== Admin Middleware Request End ===\n');
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        console.log('Admin validation successful:', {
            userId: user.id,
            email: user.email,
            role: profile.role
        });
        console.log('=== Admin Middleware Request End ===\n');

        next();
    } catch (error) {
        console.error('Unexpected Admin Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        console.log('=== Admin Middleware Request End ===\n');
        res.status(500).json({ error: error.message });
    }
};

module.exports = { auth, admin };