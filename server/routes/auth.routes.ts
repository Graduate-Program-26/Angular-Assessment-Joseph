import { Router, Request, Response } from 'express';
import admin from 'firebase-admin';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/login', (req: Request, res: Response) => {
  const projectId = 'deejay-116b7';
  const apiKey = process.env['FIREBASE_API_KEY'];
  
  if (!apiKey) {
    return res.status(500).send('FIREBASE_API_KEY is missing in server .env');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Login to DeeJay</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
      <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
      <script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
      <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
      <style>
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #0f172a;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background: #1e293b;
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          text-align: center;
          width: 100%;
          max-width: 400px;
        }
        h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; background: linear-gradient(to right, #c084fc, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p { color: #94a3b8; margin-bottom: 2rem; }
        #loading { margin-top: 1rem; color: #c084fc; display: none; }
        
        /* Overriding FirebaseUI to match dark theme better */
        .firebaseui-card-content { padding: 0 !important; }
        .firebaseui-container { background-color: transparent !important; box-shadow: none !important; }
        .firebaseui-label { color: #94a3b8 !important; }
        .firebaseui-id-submit { background-color: #c084fc !important; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>DeeJay</h1>
        <p>Premium Music Experience</p>
        
        <div id="firebaseui-auth-container"></div>
        <div id="loading">Establishing session...</div>
      </div>

      <script>
        const config = { apiKey: "${apiKey}", authDomain: "${projectId}.firebaseapp.com" };
        firebase.initializeApp(config);
        
        async function finalizeSession(idToken) {
          console.log('Finalizing session with ID token...');
          document.getElementById('loading').style.display = 'block';
          document.getElementById('firebaseui-auth-container').style.display = 'none';
          
          try {
            const resp = await fetch('/api/auth/callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_token: idToken })
            });
            
            console.log('BFF callback response status:', resp.status);
            
            if (resp.ok) {
              console.log('Session established, redirecting to /...');
              window.location.href = '/';
            } else {
              const data = await resp.json();
              console.error('Session establishment failed:', data);
              alert('Session failed: ' + (data.error || 'Unknown error'));
              document.getElementById('loading').style.display = 'none';
              document.getElementById('firebaseui-auth-container').style.display = 'block';
            }
          } catch (err) {
            console.error('Network error during session establishment:', err);
            alert('Network error finalizing session');
            document.getElementById('loading').style.display = 'none';
            document.getElementById('firebaseui-auth-container').style.display = 'block';
          }
        }

        const ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', {
          signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
            {
              provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
              signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
            }
          ],
          signInFlow: 'popup',
          callbacks: {
            signInSuccessWithAuthResult: function(authResult) {
              console.log('FirebaseUI login successful, redirecting to callback...');
              authResult.user.getIdToken().then(idToken => {
                window.location.href = '/api/auth/callback?id_token=' + idToken;
              });
              return false;
            },
            uiShown: function() {
              console.log('FirebaseUI widget is shown');
            }
          }
        });
      </script>
    </body>
    </html>
  `);
});

router.all('/callback', async (req: Request, res: Response) => {
  const idToken = (req.method === 'POST' ? req.body.id_token : req.query['id_token']) as string;
  const queryError = req.query['error'] as string;

  if (queryError) {
    return res.redirect(`/?error=${queryError}`);
  }

  if (!idToken && req.method === 'GET') {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Authenticating...</title></head>
      <body style="background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
        <div style="text-align: center;">
          <div style="border: 4px solid #f3f3f3; border-top: 4px solid #c084fc; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <p>Finalizing login...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        <script>
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          if (params.has('id_token')) {
            window.location.href = window.location.pathname + '?' + hash;
          } else if (params.has('error')) {
            window.location.href = '/?error=' + params.get('error');
          } else {
            window.location.href = '/?error=auth_no_data';
          }
        </script>
      </body>
      </html>
    `);
  }

  if (!idToken) return res.status(400).json({ error: 'No ID token provided' });

  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    
    res.cookie('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      path: '/'
    });

    if (req.method === 'POST') res.json({ status: 'success' });
    else res.redirect('/');
  } catch {
    if (req.method === 'POST') res.status(500).json({ error: 'Session creation failed' });
    else res.redirect('/?error=session_failed');
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session', { path: '/' });
  res.json({ status: 'success' });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

export default router;
