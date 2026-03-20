import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Email sending function using Resend
async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.log('⚠️ RESEND_API_KEY not configured - skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  // RESEND TEST MODE RESTRICTION: Can only send to verified email (212520@vistacollege.nl)
  // For testing, we skip emails to other addresses
  const allowedTestEmail = '212520@vistacollege.nl';
  if (to !== allowedTestEmail) {
    console.log(`⚠️ RESEND TEST MODE: Cannot send to ${to}, only to ${allowedTestEmail}`);
    console.log(`📧 Would have sent email: "${subject}" to ${to}`);
    console.log(`📧 To enable sending to all addresses, verify a domain at resend.com/domains`);
    return { success: false, error: 'Test mode: can only send to verified email' };
  }

  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 API Key present: ${resendApiKey ? 'YES (length: ' + resendApiKey.length + ')' : 'NO'}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Limburg University <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const responseText = await response.text();
    console.log(`📧 Resend API response status: ${response.status}`);
    console.log(`📧 Resend API response body: ${responseText}`);

    if (!response.ok) {
      console.error('⚠️ Failed to send email (non-critical):', responseText);
      // Don't fail the request if email fails - just log it
      return { success: false, error: responseText };
    }

    const result = JSON.parse(responseText);
    console.log('✅ Email sent successfully:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('⚠️ Error sending email (non-critical):', error);
    console.error('⚠️ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Don't fail the request if email fails
    return { success: false, error: String(error) };
  }
}

// Helper function to hash password (simple hash for demo - in production use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize default admin account on startup
async function initializeDefaultAdmin() {
  try {
    console.log('=== INITIALIZING DEFAULT ADMIN ===');
    
    const defaultEmail = Deno.env.get('ADMIN_EMAIL');
    const defaultPassword = Deno.env.get('ADMIN_PASSWORD');
    
    if (!defaultEmail || !defaultPassword) {
      console.error('ERROR: ADMIN_EMAIL or ADMIN_PASSWORD environment variables not set');
      return;
    }
    
    console.log('Using environment variables for admin initialization');
    console.log('Email:', defaultEmail);
    console.log('Password length:', defaultPassword.length);
    
    // Check if admin already exists
    const existingAdmin = await kv.get('admin:credentials');
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists with email:', existingAdmin.email);
      return; // Admin exists, skip initialization
    }
    
    // Create new admin account from environment variables
    console.log('Creating new admin account...');
    const passwordHash = await hashPassword(defaultPassword);
    
    const adminCredentials = {
      id: crypto.randomUUID(),
      email: defaultEmail,
      passwordHash: passwordHash,
      created_at: new Date().toISOString(),
    };
    
    await kv.set('admin:credentials', adminCredentials);
    
    console.log('✅ New admin account created successfully!');
    console.log('Email:', defaultEmail);
    console.log('Password hash:', passwordHash.substring(0, 20) + '...');
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
}

// Initialize admin on startup
await initializeDefaultAdmin();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-09c2210b/health", (c) => {
  return c.json({ status: "ok" });
});

// Test endpoint to check environment variables
app.get("/make-server-09c2210b/test/env", (c) => {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const adminEmail = Deno.env.get('ADMIN_EMAIL');
  const adminPassword = Deno.env.get('ADMIN_PASSWORD');
  
  return c.json({
    resend_api_key_set: !!resendKey,
    resend_api_key_length: resendKey ? resendKey.length : 0,
    admin_email_set: !!adminEmail,
    admin_email: adminEmail || 'NOT SET',
    admin_password_set: !!adminPassword,
    admin_password_length: adminPassword ? adminPassword.length : 0,
    timestamp: new Date().toISOString(),
  });
});

// Login endpoint
app.post("/make-server-09c2210b/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('=== LOGIN REQUEST (SERVER) ===');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('Password first char:', password?.[0]);
    console.log('Password last char:', password?.[password?.length - 1]);
    
    // Get admin credentials from KV store
    const adminCredentials = await kv.get('admin:credentials');
    
    if (!adminCredentials) {
      console.error('ERROR: No admin credentials found in KV store');
      return c.json({ 
        error: 'Geen admin account gevonden',
      }, 401);
    }
    
    console.log('Admin credentials from KV:');
    console.log('- Email:', adminCredentials.email);
    console.log('- Password hash:', adminCredentials.passwordHash.substring(0, 20) + '...');
    console.log('- Created at:', adminCredentials.created_at);
    
    // Check if email matches
    if (adminCredentials.email !== email) {
      console.error('ERROR: Email does not match. Provided:', email, 'Expected:', adminCredentials.email);
      return c.json({ error: 'Ongeldige inloggegevens' }, 401);
    }
    
    console.log('Email matches! Now checking password...');
    
    // Hash the provided password and compare
    const passwordHash = await hashPassword(password);
    console.log('Provided password hash:', passwordHash.substring(0, 20) + '...');
    console.log('Expected password hash:', adminCredentials.passwordHash.substring(0, 20) + '...');
    console.log('Hashes match:', passwordHash === adminCredentials.passwordHash);
    
    if (passwordHash !== adminCredentials.passwordHash) {
      console.error('ERROR: Password hash does not match');
      console.log('Full provided hash:', passwordHash);
      console.log('Full expected hash:', adminCredentials.passwordHash);
      return c.json({ error: 'Ongeldige inloggegevens' }, 401);
    }
    
    console.log('Login successful - credentials verified from KV store');
    
    // Generate session token
    const sessionToken = `token_${crypto.randomUUID()}`;
    const sessionId = `session:${sessionToken}`;
    
    await kv.set(sessionId, {
      user: {
        id: adminCredentials.id,
        email: adminCredentials.email,
        role: 'admin'
      },
      created_at: new Date().toISOString(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
    });
    
    console.log('Session created successfully for admin:', email);
    
    return c.json({ 
      access_token: sessionToken,
      user: {
        id: adminCredentials.id,
        email: adminCredentials.email,
        role: 'admin',
        name: 'Admin'
      },
    });
  } catch (error) {
    console.error('Error in /login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all challenges
app.get("/make-server-09c2210b/challenges", async (c) => {
  try {
    console.log('Fetching challenges...');
    
    // Retry logic for database connection issues
    let challenges = [];
    let allProposals = [];
    let retries = 3;
    
    while (retries > 0) {
      try {
        challenges = await kv.getByPrefix("challenge:");
        allProposals = await kv.getByPrefix("proposal:");
        break; // Success, exit retry loop
      } catch (dbError: any) {
        retries--;
        console.error(`Database error (${retries} retries left):`, dbError.message);
        
        if (retries === 0) {
          throw dbError; // No more retries, throw error
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      }
    }
    
    console.log(`Found ${challenges.length} challenges and ${allProposals.length} proposals`);
    
    // Add proposal count to each challenge
    const challengesWithCounts = challenges.map((challenge: any) => {
      const proposalCount = allProposals.filter((p: any) => p.challenge_id === challenge.id).length;
      return {
        ...challenge,
        proposal_count: proposalCount,
      };
    });
    
    // Get query parameters for filtering
    const search = c.req.query('search')?.toLowerCase();
    const municipality = c.req.query('municipality');
    const category = c.req.query('category');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
    
    // Apply filters
    let filteredChallenges = challengesWithCounts;
    
    if (search) {
      filteredChallenges = filteredChallenges.filter((ch: any) => 
        ch.title?.toLowerCase().includes(search) || 
        ch.description?.toLowerCase().includes(search)
      );
    }
    
    if (municipality) {
      filteredChallenges = filteredChallenges.filter((ch: any) => 
        ch.municipality === municipality
      );
    }
    
    if (category) {
      filteredChallenges = filteredChallenges.filter((ch: any) => 
        ch.category === category
      );
    }
    
    // Sort by created_at in descending order (newest first)
    filteredChallenges.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order
    });
    
    // Apply limit if specified
    if (limit) {
      filteredChallenges = filteredChallenges.slice(0, limit);
    }
    
    console.log(`Returning ${filteredChallenges.length} filtered challenges`);
    return c.json(filteredChallenges);
  } catch (error) {
    console.error('Error in GET /challenges:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get stats for home page
app.get("/make-server-09c2210b/stats", async (c) => {
  try {
    console.log('Fetching stats...');
    
    const challenges = await kv.getByPrefix("challenge:");
    const proposals = await kv.getByPrefix("proposal:");
    
    // Count unique municipalities
    const uniqueMunicipalities = new Set(challenges.map((ch: any) => ch.municipality));
    
    return c.json({
      challenges: challenges.length,
      proposals: proposals.length,
      municipalities: uniqueMunicipalities.size,
    });
  } catch (error) {
    console.error('Error in GET /stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all proposals
app.get("/make-server-09c2210b/proposals", async (c) => {
  try {
    const proposals = await kv.getByPrefix("proposal:");
    
    // Sort by created_at in descending order (newest first)
    proposals.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return c.json(proposals);
  } catch (error) {
    console.error('Error in GET /proposals:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get proposals for a specific challenge
app.get("/make-server-09c2210b/challenges/:id/proposals", async (c) => {
  try {
    const id = c.req.param('id');
    const allProposals = await kv.getByPrefix("proposal:");
    const challengeProposals = allProposals.filter((p: any) => p.challenge_id === id);
    
    // Sort by created_at in descending order (newest first)
    challengeProposals.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return c.json(challengeProposals);
  } catch (error) {
    console.error('Error in GET /challenges/:id/proposals:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create new proposal
app.post("/make-server-09c2210b/proposals", async (c) => {
  try {
    console.log('=== CREATE PROPOSAL REQUEST ===');
    
    // Use custom header instead of Authorization to avoid Supabase JWT validation
    const sessionToken = c.req.header('X-Session-Token');
    console.log('X-Session-Token header:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'MISSING');
    
    if (!sessionToken) {
      console.error('ERROR: No session token provided');
      return c.json({ error: 'Unauthorized: No session token provided' }, 401);
    }
    
    // Verify session from KV store
    const sessionId = `session:${sessionToken}`;
    const session = await kv.get(sessionId);
    
    if (!session) {
      console.error('ERROR: Session not found in KV store');
      return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
    }
    
    if (session.expires_at && session.expires_at < Date.now()) {
      await kv.del(sessionId);
      return c.json({ error: 'Unauthorized: Session expired' }, 401);
    }
    
    // Session is valid - user is authenticated as admin
    console.log('Admin authenticated:', session.user?.email);
    
    const body = await c.req.json();
    
    // Get and increment counter for proposals
    const counterKey = 'counter:proposals';
    let counter = await kv.get(counterKey) || 0;
    counter++;
    await kv.set(counterKey, counter);
    
    const id = `pr${counter}`;
    const proposal = {
      ...body,
      id,
      created_at: new Date().toISOString(),
    };

    await kv.set(`proposal:${id}`, proposal);
    console.log('Proposal created successfully:', id);

    // Send email notifications
    // TEST EMAIL - using hardcoded email for testing
    const adminEmail = '212520@vistacollege.nl';
    
    // Get the challenge info for context
    const challenge = await kv.get(`challenge:${proposal.challenge_id}`);
    const challengeTitle = challenge?.title || 'Toelichting';
    
    // Email to admin
    if (adminEmail) {
      const adminEmailHtml = `
        <h2>Nieuwe Challenge Ingediend</h2>
        <p>Er is een nieuwe challenge ingediend op het Limburg University platform.</p>
        
        <h3>Challenge Details:</h3>
        <ul>
          <li><strong>Titel:</strong> ${proposal.title}</li>
          <li><strong>Voor toelichting:</strong> ${challengeTitle}</li>
          <li><strong>Interesse type:</strong> ${proposal.interest_type || 'Niet opgegeven'}</li>
          <li><strong>Beschrijving:</strong> ${proposal.description}</li>
        </ul>
        
        <h3>Indiener:</h3>
        <ul>
          <li><strong>Naam:</strong> ${proposal.author}</li>
          <li><strong>Email:</strong> ${proposal.email}</li>
          <li><strong>Organisatie:</strong> ${proposal.organization}</li>
        </ul>
        
        <p><a href="${c.req.url.replace('/make-server-09c2210b/proposals', `/listing/${proposal.challenge_id}`)}">Bekijk de challenge</a></p>
      `;
      
      await sendEmail(adminEmail, 'Nieuwe Challenge Ingediend', adminEmailHtml);
    }
    
    // Confirmation email to submitter
    if (proposal.email) {
      const userEmailHtml = `
        <h2>Bedankt voor het indienen van je challenge!</h2>
        <p>Beste ${proposal.author},</p>
        
        <p>Je challenge is succesvol ingediend op het Limburg University platform.</p>
        
        <h3>Je Challenge:</h3>
        <ul>
          <li><strong>Titel:</strong> ${proposal.title}</li>
          <li><strong>Voor toelichting:</strong> ${challengeTitle}</li>
          <li><strong>Interesse type:</strong> ${proposal.interest_type || 'Niet opgegeven'}</li>
        </ul>
        
        <p>We nemen contact met je op zodra er updates zijn.</p>
        
        <p>Met vriendelijke groet,<br/>
        Limburg University</p>
      `;
      
      await sendEmail(proposal.email, 'Challenge Bevestiging - Limburg University', userEmailHtml);
    }

    return c.json(proposal, 201);
  } catch (error) {
    console.error('ERROR in POST /proposals:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single challenge with proposals
app.get("/make-server-09c2210b/challenges/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const challenge = await kv.get(`challenge:${id}`);
    
    if (!challenge) {
      return c.json({ error: 'Challenge not found' }, 404);
    }

    // Get all proposals for this challenge
    const allProposals = await kv.getByPrefix("proposal:");
    const challengeProposals = allProposals.filter((p: any) => p.challenge_id === id);

    return c.json({ challenge, proposals: challengeProposals });
  } catch (error) {
    console.error('Error in GET /challenges/:id:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create new challenge
app.post("/make-server-09c2210b/challenges", async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token');
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized: No session token provided' }, 401);
    }
    
    const sessionId = `session:${sessionToken}`;
    const session = await kv.get(sessionId);
    
    if (!session) {
      return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
    }
    
    if (session.expires_at && session.expires_at < Date.now()) {
      await kv.del(sessionId);
      return c.json({ error: 'Unauthorized: Session expired' }, 401);
    }
    
    // Session is valid - user is authenticated as admin
    console.log('Admin authenticated:', session.user?.email);
    
    const body = await c.req.json();
    
    // Get and increment counter for challenges
    const counterKey = 'counter:challenges';
    let counter = await kv.get(counterKey) || 0;
    counter++;
    await kv.set(counterKey, counter);
    
    const id = `ch${counter}`;
    const challenge = {
      ...body,
      id,
      created_at: new Date().toISOString(),
    };

    await kv.set(`challenge:${id}`, challenge);
    console.log('Challenge created:', id);

    // Send email notifications
    // TEST EMAIL - using hardcoded email for testing
    const adminEmail = '212520@vistacollege.nl';
    
    // Define name mappings for both emails
    const categoryNames: Record<string, string> = {
      'duurzaamheid': 'Duurzaamheid',
      'mobiliteit': 'Mobiliteit',
      'sociale-cohesie': 'Sociale Cohesie',
      'innovatie': 'Innovatie',
      'veiligheid': 'Veiligheid',
    };
    
    const municipalityNames: Record<string, string> = {
      'maastricht': 'Maastricht',
      'heerlen': 'Heerlen',
      'sittard-geleen': 'Sittard-Geleen',
      'venlo': 'Venlo',
      'roermond': 'Roermond',
    };
    
    if (adminEmail) {
      // Email to admin (notification)
      const adminEmailHtml = `
        <h2>Nieuwe Toelichting Geplaatst</h2>
        <p>Er is een nieuwe toelichting geplaatst op het Limburg University platform.</p>
        
        <h3>Toelichting Details:</h3>
        <ul>
          <li><strong>Titel:</strong> ${challenge.title}</li>
          <li><strong>Gemeente:</strong> ${municipalityNames[challenge.municipality] || challenge.municipality}</li>
          <li><strong>Categorie:</strong> ${categoryNames[challenge.category] || challenge.category}</li>
          <li><strong>Beschrijving:</strong> ${challenge.description}</li>
        </ul>
        
        <h3>Contactgegevens:</h3>
        <ul>
          <li><strong>Afdeling:</strong> ${challenge.organization || 'Niet opgegeven'}</li>
          <li><strong>Email:</strong> ${challenge.email}</li>
        </ul>
        
        <p><strong>Geplaatst door:</strong> Admin (${session.user?.email})</p>
      `;
      
      await sendEmail(adminEmail, 'Nieuwe Toelichting Geplaatst', adminEmailHtml);
    }
    
    // Confirmation email to the person who placed the challenge (contact email)
    if (challenge.email) {
      const confirmationEmailHtml = `
        <h2>Bevestiging: Toelichting Succesvol Geplaatst</h2>
        <p>Bedankt voor het plaatsen van een toelichting op het Limburg University platform.</p>
        
        <h3>Jouw Toelichting:</h3>
        <ul>
          <li><strong>Titel:</strong> ${challenge.title}</li>
          <li><strong>Gemeente:</strong> ${municipalityNames[challenge.municipality] || challenge.municipality}</li>
          <li><strong>Categorie:</strong> ${categoryNames[challenge.category] || challenge.category}</li>
        </ul>
        
        <p>Burgers en studenten kunnen nu challenges indienen op deze toelichting. Je ontvangt een notificatie wanneer er nieuwe challenges worden ingediend.</p>
        
        <p>Met vriendelijke groet,<br/>
        Limburg University</p>
      `;
      
      await sendEmail(challenge.email, 'Toelichting Bevestiging - Limburg University', confirmationEmailHtml);
    }

    return c.json(challenge, 201);
  } catch (error) {
    console.error('Error in POST /challenges:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Reset database (delete all challenges and proposals)
app.delete("/make-server-09c2210b/reset", async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token');
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized: No session token provided' }, 401);
    }
    
    const sessionId = `session:${sessionToken}`;
    const session = await kv.get(sessionId);
    
    if (!session) {
      return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
    }
    
    if (session.expires_at && session.expires_at < Date.now()) {
      await kv.del(sessionId);
      return c.json({ error: 'Unauthorized: Session expired' }, 401);
    }
    
    // Session is valid - user is authenticated as admin
    console.log('Admin authenticated:', session.user?.email);
    console.log('Resetting database...');
    
    // Get all challenges and proposals
    const challenges = await kv.getByPrefix("challenge:");
    const proposals = await kv.getByPrefix("proposal:");
    
    // Delete all challenges
    for (const challenge of challenges) {
      await kv.del(`challenge:${challenge.id}`);
    }
    
    // Delete all proposals
    for (const proposal of proposals) {
      await kv.del(`proposal:${proposal.id}`);
    }
    
    // Reset counters
    await kv.set('counter:challenges', 0);
    await kv.set('counter:proposals', 0);
    
    console.log(`Deleted ${challenges.length} challenges and ${proposals.length} proposals`);
    
    return c.json({ 
      message: 'Database reset successful',
      deleted: {
        challenges: challenges.length,
        proposals: proposals.length
      }
    });
  } catch (error) {
    console.error('Error in DELETE /reset:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete single challenge
app.delete("/make-server-09c2210b/challenges/:id", async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token');
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized: No session token provided' }, 401);
    }
    
    const sessionId = `session:${sessionToken}`;
    const session = await kv.get(sessionId);
    
    if (!session) {
      return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
    }
    
    if (session.expires_at && session.expires_at < Date.now()) {
      await kv.del(sessionId);
      return c.json({ error: 'Unauthorized: Session expired' }, 401);
    }
    
    // Session is valid - user is authenticated as admin
    console.log('Admin authenticated:', session.user?.email);
    
    const id = c.req.param('id');
    const challenge = await kv.get(`challenge:${id}`);
    
    if (!challenge) {
      return c.json({ error: 'Challenge not found' }, 404);
    }
    
    // Delete the challenge
    await kv.del(`challenge:${id}`);
    
    // Delete all proposals for this challenge
    const allProposals = await kv.getByPrefix("proposal:");
    const challengeProposals = allProposals.filter((p: any) => p.challenge_id === id);
    
    for (const proposal of challengeProposals) {
      await kv.del(`proposal:${proposal.id}`);
    }
    
    console.log(`Deleted challenge ${id} and ${challengeProposals.length} proposals`);
    
    return c.json({ 
      message: 'Challenge deleted successfully',
      deletedProposals: challengeProposals.length
    });
  } catch (error) {
    console.error('Error in DELETE /challenges/:id:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete single proposal
app.delete("/make-server-09c2210b/challenges/:challengeId/proposals/:proposalId", async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token');
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized: No session token provided' }, 401);
    }
    
    const sessionId = `session:${sessionToken}`;
    const session = await kv.get(sessionId);
    
    if (!session) {
      return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
    }
    
    if (session.expires_at && session.expires_at < Date.now()) {
      await kv.del(sessionId);
      return c.json({ error: 'Unauthorized: Session expired' }, 401);
    }
    
    // Session is valid - user is authenticated as admin
    console.log('Admin authenticated:', session.user?.email);
    
    const proposalId = c.req.param('proposalId');
    const proposal = await kv.get(`proposal:${proposalId}`);
    
    if (!proposal) {
      return c.json({ error: 'Proposal not found' }, 404);
    }
    
    // Delete the proposal
    await kv.del(`proposal:${proposalId}`);
    
    console.log(`Deleted proposal ${proposalId}`);
    
    return c.json({ 
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /proposals/:id:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Seed database with sample data
app.post("/make-server-09c2210b/seed", async (c) => {
  try {
    const sessionToken = c.req.header('X-Session-Token');
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized: No session token provided' }, 401);
    }
    
    const sessionId = `session:${sessionToken}`;
    const session = await kv.get(sessionId);
    
    if (!session) {
      return c.json({ error: 'Unauthorized: Invalid or expired session' }, 401);
    }
    
    if (session.user?.email !== 'admin@citydeal.nl') {
      return c.json({ error: 'Forbidden: Only admin can seed database' }, 403);
    }
    
    console.log('Admin authenticated:', session.user?.email);
    console.log('Seeding database with sample data...');
    
    // Sample challenges
    const sampleChallenges = [
      {
        title: "Groene Mobiliteit in het Stadscentrum",
        description: "Hoe kunnen we het gebruik van auto's in het stadscentrum verminderen en inwoners stimuleren om te kiezen voor duurzame vervoersmiddelen zoals fietsen, elektrische steps en openbaar vervoer?",
        category: "mobiliteit",
        municipality: "maastricht",
      },
      {
        title: "Vermindering van Voedselverspilling",
        description: "Ontwikkel een initiatief om voedselverspilling in onze gemeente te verminderen door samenwerking tussen restaurants, supermarkten en voedselbanken.",
        category: "duurzaamheid",
        municipality: "heerlen",
      },
      {
        title: "Versterking van Wijkgemeenschappen",
        description: "Hoe kunnen we de sociale cohesie in onze wijken verbeteren en eenzaamheid onder ouderen verminderen door middel van digitale en fysieke ontmoetingsplekken?",
        category: "sociale-cohesie",
        municipality: "sittard-geleen",
      },
      {
        title: "Smart City Dashboard voor Burgers",
        description: "Creëer een gebruiksvriendelijk dashboard waar inwoners realtime data kunnen bekijken over luchtkwaliteit, verkeer, evenementen en gemeentelijke diensten.",
        category: "innovatie",
        municipality: "venlo",
      },
      {
        title: "Veilige Routes naar School",
        description: "Ontwerp een plan om schoolroutes veiliger te maken voor kinderen die fietsen of lopen, inclusief betere verlichting en verkeerscirculatie.",
        category: "veiligheid",
        municipality: "roermond",
      },
      {
        title: "Circulaire Economie in de Bouw",
        description: "Hoe kunnen we hergebruik van bouwmaterialen stimuleren en afval in de bouwsector verminderen binnen gemeentelijke projecten?",
        category: "duurzaamheid",
        municipality: "maastricht",
      },
      {
        title: "Jeugdparticipatie in Lokaal Bestuur",
        description: "Ontwikkel een platform of methode waarmee jongeren meer betrokken worden bij besluitvorming over zaken die hen aangaan.",
        category: "sociale-cohesie",
        municipality: "heerlen",
      },
      {
        title: "Slim Parkeren en Parkeerdruk",
        description: "Hoe kunnen we met slimme technologie de parkeerdruk verminderen en parkeerplaatsen efficiënter benutten?",
        category: "mobiliteit",
        municipality: "venlo",
      },
    ];
    
    // Reset counters first
    await kv.set('counter:challenges', 0);
    await kv.set('counter:proposals', 0);
    
    // Create challenges
    const createdChallenges = [];
    for (const challengeData of sampleChallenges) {
      let counter = await kv.get('counter:challenges') || 0;
      counter++;
      await kv.set('counter:challenges', counter);
      
      const id = `ch${counter}`;
      const challenge = {
        ...challengeData,
        id,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
      };
      
      await kv.set(`challenge:${id}`, challenge);
      createdChallenges.push(challenge);
    }
    
    // Sample proposals for some challenges
    const sampleProposals = [
      {
        challenge_id: "ch1",
        title: "Fietsdeelnetwerk met App",
        description: "Een uitgebreid netwerk van deelfietsen en e-bikes, gekoppeld aan een gebruiksvriendelijke app met routeplanner en incentives voor regelmatig gebruik.",
        author: "Dr. Emma van Dijk",
        email: "e.vandijk@zuyd.nl",
        organization: "Hogeschool Zuyd",
      },
      {
        challenge_id: "ch1",
        title: "Gratis OV voor Studenten",
        description: "Een pilot waarbij studenten gratis of met sterke korting gebruik kunnen maken van lokaal openbaar vervoer, gefinancierd door gemeente en onderwijsinstellingen.",
        author: "Prof. Marc Jansen",
        email: "m.jansen@maastrichtuniversity.nl",
        organization: "Universiteit Maastricht",
      },
      {
        challenge_id: "ch2",
        title: "FoodRescue Platform",
        description: "Een digitaal platform dat overtollig voedsel van bedrijven koppelt aan voedselbanken, goede doelen en particulieren. Real-time beschikbaarheid en ophaalservice.",
        author: "Dr. Lisa Hermans",
        email: "l.hermans@zuyd.nl",
        organization: "Hogeschool Zuyd",
      },
      {
        challenge_id: "ch3",
        title: "Buurthuiskamer Concept",
        description: "Laagdrempelige ontmoetingsruimtes in wijken waar bewoners samen kunnen koken, koffie drinken en activiteiten organiseren. Combinatie van digitale matchmaking en fysieke bijeenkomsten.",
        author: "Dr. Thomas Willems",
        email: "t.willems@vista.nl",
        organization: "VISTA College",
      },
      {
        challenge_id: "ch4",
        title: "Limburg Live Dashboard",
        description: "Een interactief dashboard met open data over luchtkwaliteit, geluidsniveaus, parkeerplaatsen en evenementen. Inclusief mobiele app met notificaties.",
        author: "Dr. Sarah Peeters",
        email: "s.peeters@zuyd.nl",
        organization: "Hogeschool Zuyd",
      },
    ];
    
    // Create proposals
    const createdProposals = [];
    for (const proposalData of sampleProposals) {
      let counter = await kv.get('counter:proposals') || 0;
      counter++;
      await kv.set('counter:proposals', counter);
      
      const id = `pr${counter}`;
      const proposal = {
        ...proposalData,
        id,
        created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 5 days
      };
      
      await kv.set(`proposal:${id}`, proposal);
      createdProposals.push(proposal);
    }
    
    console.log(`Seeded ${createdChallenges.length} challenges and ${createdProposals.length} proposals`);
    
    return c.json({
      message: 'Database seeded successfully',
      created: {
        challenges: createdChallenges.length,
        proposals: createdProposals.length
      }
    });
  } catch (error) {
    console.error('Error in POST /seed:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Debug endpoint to check admin credentials
app.get("/make-server-09c2210b/debug/admin", async (c) => {
  try {
    const adminCredentials = await kv.get('admin:credentials');
    
    // Get environment variables
    const envEmail = Deno.env.get('ADMIN_EMAIL');
    const envPassword = Deno.env.get('ADMIN_PASSWORD');
    
    console.log('=== DEBUG ADMIN ===');
    console.log('ENV ADMIN_EMAIL:', envEmail);
    console.log('ENV ADMIN_PASSWORD:', envPassword ? `SET (${envPassword.length} chars)` : 'NOT SET');
    console.log('KV admin exists:', !!adminCredentials);
    
    if (!adminCredentials) {
      return c.json({ 
        exists: false,
        message: 'No admin credentials found in KV store',
        env: {
          email: envEmail || 'NOT SET',
          passwordLength: envPassword ? envPassword.length : 0,
          passwordSet: !!envPassword,
        }
      });
    }
    
    return c.json({
      exists: true,
      email: adminCredentials.email,
      id: adminCredentials.id,
      created_at: adminCredentials.created_at,
      passwordHash: adminCredentials.passwordHash.substring(0, 20) + '...',
      env: {
        email: envEmail || 'NOT SET',
        passwordLength: envPassword ? envPassword.length : 0,
        passwordSet: !!envPassword,
        emailMatches: envEmail === adminCredentials.email,
      }
    });
  } catch (error) {
    console.error('Error in /debug/admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Force reset admin credentials - recreate admin from environment variables
app.post("/make-server-09c2210b/force-reset-admin", async (c) => {
  try {
    console.log('=== FORCE RESET ADMIN ===');
    
    const defaultEmail = Deno.env.get('ADMIN_EMAIL');
    const defaultPassword = Deno.env.get('ADMIN_PASSWORD');
    
    if (!defaultEmail || !defaultPassword) {
      console.error('ERROR: ADMIN_EMAIL or ADMIN_PASSWORD environment variables not set');
      return c.json({ error: 'Environment variables not set' }, 500);
    }
    
    console.log('Using environment variables:');
    console.log('Email:', defaultEmail);
    console.log('Password length:', defaultPassword.length);
    
    // Delete existing admin
    const existingAdmin = await kv.get('admin:credentials');
    if (existingAdmin) {
      console.log('Deleting existing admin:', existingAdmin.email);
      await kv.del('admin:credentials');
    }
    
    // Create new admin with environment variables
    console.log('Creating new admin with email:', defaultEmail);
    const passwordHash = await hashPassword(defaultPassword);
    
    const adminCredentials = {
      id: crypto.randomUUID(),
      email: defaultEmail,
      passwordHash: passwordHash,
      created_at: new Date().toISOString(),
    };
    
    await kv.set('admin:credentials', adminCredentials);
    
    console.log('✅ Admin reset successful!');
    console.log('Email:', defaultEmail);
    console.log('Password hash:', passwordHash.substring(0, 20) + '...');
    
    return c.json({
      success: true,
      message: 'Admin credentials reset successfully with environment variables',
      email: defaultEmail,
      created_at: adminCredentials.created_at,
    });
  } catch (error) {
    console.error('Error in /force-reset-admin:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);