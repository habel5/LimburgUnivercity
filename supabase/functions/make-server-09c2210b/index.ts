import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.ts";

const app = new Hono();

type UserRole = "admin" | "gemeente" | "onderwijs";

interface AccountRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  created_at: string;
}

createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured - skipping email");
    return { success: false, error: "Email service not configured" };
  }

  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";
  const fromName = Deno.env.get("RESEND_FROM_NAME") ?? "Limburg University";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      return { success: false, error: await response.text() };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Wachtwoord hashen met SHA-256: het wachtwoord wordt omgezet naar een vaste versleutelde string.
// De originele waarde is hier niet meer uit te herleiden — wachtwoorden worden nooit in plaintext opgeslagen.
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAccountDefinitions() {
  return [
    {
      role: "admin" as const,
      email: Deno.env.get("ADMIN_EMAIL"),
      password: Deno.env.get("ADMIN_PASSWORD"),
      name: Deno.env.get("ADMIN_NAME") ?? "Admin",
    },
    {
      role: "gemeente" as const,
      email: Deno.env.get("MUNICIPALITY_EMAIL"),
      password: Deno.env.get("MUNICIPALITY_PASSWORD"),
      name: Deno.env.get("MUNICIPALITY_NAME") ?? "Gemeente",
    },
    {
      role: "onderwijs" as const,
      email: Deno.env.get("EDUCATION_EMAIL"),
      password: Deno.env.get("EDUCATION_PASSWORD"),
      name: Deno.env.get("EDUCATION_NAME") ?? "Onderwijs",
    },
  ];
}

// Initialiseer de drie standaardaccounts (admin, gemeente, onderwijs) bij elke cold start.
// Inloggegevens worden uitgelezen uit de omgevingsvariabelen op de server, niet hardcoded.
async function initializeDefaultAccounts() {
  try {
    for (const definition of getAccountDefinitions()) {
      if (!definition.email || !definition.password) {
        continue;
      }

      const passwordHash = await hashPassword(definition.password);
      // Bestaand account ophalen om het UUID en de aanmaakdatum stabiel te houden
      const existingAccount = await kv.get(`account:${definition.role}`);

      const account: AccountRecord = {
        id: existingAccount?.id ?? crypto.randomUUID(),
        email: definition.email,
        passwordHash,
        role: definition.role,
        name: definition.name,
        created_at: existingAccount?.created_at ?? new Date().toISOString(),
      };

      await kv.set(`account:${definition.role}`, account);
    }
  } catch (error) {
    console.error("Error initializing default accounts:", error);
  }
}

await initializeDefaultAccounts();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-09c2210b/health", (c) => c.json({ status: "ok" }));

app.post("/make-server-09c2210b/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    // Alle accounts ophalen uit de KV-store en zoeken op e-mailadres
    const accounts = (await kv.getByPrefix("account:")) as AccountRecord[];
    const matchedAccount = accounts.find((account) => account?.email === email);

    if (!matchedAccount) {
      return c.json({ error: "Ongeldige inloggegevens" }, 401);
    }

    // Het ingevoerde wachtwoord hashen en vergelijken met de opgeslagen hash —
    // als de hashes niet overeenkomen, is het wachtwoord onjuist
    const passwordHash = await hashPassword(password);
    if (passwordHash !== matchedAccount.passwordHash) {
      return c.json({ error: "Ongeldige inloggegevens" }, 401);
    }

    // Sessie aanmaken: genereer een uniek token en sla het op met een vervaldatum van 24 uur
    const sessionToken = `token_${crypto.randomUUID()}`;
    await kv.set(`session:${sessionToken}`, {
      user: {
        id: matchedAccount.id,
        email: matchedAccount.email,
        role: matchedAccount.role,
        name: matchedAccount.name,
      },
      created_at: new Date().toISOString(),
      expires_at: Date.now() + 24 * 60 * 60 * 1000,
    });

    return c.json({
      access_token: sessionToken,
      user: {
        id: matchedAccount.id,
        email: matchedAccount.email,
        role: matchedAccount.role,
        name: matchedAccount.name,
      },
    });
  } catch (error) {
    console.error("Error in /login:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/make-server-09c2210b/challenges", async (c) => {
  try {
    const challenges = await kv.getByPrefix("challenge:");
    const allProposals = await kv.getByPrefix("proposal:");

    const municipality = c.req.query("municipality");
    const category = c.req.query("category");
    const limit = c.req.query("limit");

    let filtered = challenges.map((challenge) => ({
      ...challenge,
      proposal_count: allProposals.filter((proposal) => proposal.challenge_id === challenge.id).length,
    }));

    if (municipality) filtered = filtered.filter((item) => item.municipality === municipality);
    if (category) filtered = filtered.filter((item) => item.category === category);
    if (limit) filtered = filtered.slice(0, Number(limit));

    return c.json(filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return c.json({ error: "Failed to fetch challenges" }, 500);
  }
});

app.get("/make-server-09c2210b/challenges/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const challenge = await kv.get(`challenge:${id}`);

    if (!challenge) {
      return c.json({ error: "Challenge not found" }, 404);
    }

    const allProposals = await kv.getByPrefix("proposal:");
    const proposals = allProposals.filter((proposal) => proposal.challenge_id === id);

    return c.json({
      challenge: {
        ...challenge,
        proposal_count: proposals.length,
      },
      proposals,
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return c.json({ error: "Failed to fetch challenge" }, 500);
  }
});

app.get("/make-server-09c2210b/proposals", async (c) => {
  try {
    return c.json(await kv.getByPrefix("proposal:"));
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return c.json({ error: "Failed to fetch proposals" }, 500);
  }
});

app.get("/make-server-09c2210b/stats", async (c) => {
  try {
    const challenges = await kv.getByPrefix("challenge:");
    const proposals = await kv.getByPrefix("proposal:");
    return c.json({
      challenges: challenges.length,
      proposals: proposals.length,
      municipalities: 31,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Sessievalidatie: controleer of het X-Session-Token header aanwezig en geldig is.
// Een verlopen sessie wordt automatisch uit de database verwijderd.
async function requireSession(c: any) {
  const sessionToken = c.req.header("X-Session-Token");
  if (!sessionToken) return { error: "Unauthorized", status: 401 };

  const sessionId = `session:${sessionToken}`;
  const session = await kv.get(sessionId);

  if (!session || session.expires_at < Date.now()) {
    if (session) await kv.del(sessionId);
    return { error: "Session expired", status: 401 };
  }

  return { session };
}

// Rolgebaseerde autorisatie: controleer of de ingelogde gebruiker een van de vereiste rollen heeft.
// Bij onvoldoende rechten geeft de server een 403 Forbidden terug.
async function requireRoles(c: any, roles: UserRole[]) {
  const auth = await requireSession(c);
  if ("error" in auth) return auth;

  const userRole = auth.session.user?.role as UserRole | undefined;
  if (!userRole || !roles.includes(userRole)) {
    return { error: "Forbidden", status: 403 };
  }

  return auth;
}

app.post("/make-server-09c2210b/proposals", async (c) => {
  try {
    // Autorisatie: alleen rollen 'onderwijs' en 'admin' mogen een voorstel indienen
    const auth = await requireRoles(c, ["onderwijs", "admin"]);
    if ("error" in auth) return c.json({ error: auth.error }, auth.status);

    const body = await c.req.json();
    // Oplopende teller als ID — eenvoudig en leesbaar in de KV-store
    let counter = (await kv.get("counter:proposals")) || 0;
    counter += 1;
    await kv.set("counter:proposals", counter);

    const id = String(counter);
    const proposal = {
      id,
      challenge_id: body.challenge_id,
      title: body.title,
      description: body.description,
      author: body.author,
      email: body.email,
      organization: body.organization,
      interest_type: body.interest_type,
      created_by_email: auth.session.user?.email,
      created_by_role: auth.session.user?.role,
      created_at: new Date().toISOString(),
    };

    await kv.set(`proposal:${id}`, proposal);
    return c.json({ success: true, proposal });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return c.json({ error: "Failed to create proposal" }, 500);
  }
});

app.post("/make-server-09c2210b/challenges", async (c) => {
  try {
    // Autorisatie: alleen rollen 'gemeente' en 'admin' mogen een nieuwe case aanmaken
    const auth = await requireRoles(c, ["gemeente", "admin"]);
    if ("error" in auth) return c.json({ error: auth.error }, auth.status);

    const body = await c.req.json();
    let counter = (await kv.get("counter:challenges")) || 0;
    counter += 1;
    await kv.set("counter:challenges", counter);

    const id = String(counter);
    const challenge = {
      id,
      title: body.title,
      description: body.description,
      category: body.category,
      municipality: body.municipality,
      author: body.author,
      email: body.email,
      organization: body.organization,
      created_by_email: auth.session.user?.email,
      created_by_role: auth.session.user?.role,
      created_at: new Date().toISOString(),
    };

    await kv.set(`challenge:${id}`, challenge);

    // E-mailnotificaties via Resend: admin ontvangt een melding, de indiener een bevestiging
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const categoryNames: Record<string, string> = {
      duurzaamheid: "Duurzaamheid",
      mobiliteit: "Mobiliteit",
      "sociale-cohesie": "Sociale Cohesie",
      innovatie: "Innovatie",
      veiligheid: "Veiligheid",
      overig: "Overig",
    };
    const municipalityNames: Record<string, string> = {
      beek: "Beek",
      beekdaelen: "Beekdaelen",
      beesel: "Beesel",
      bergen: "Bergen",
      brunssum: "Brunssum",
      "echt-susteren": "Echt-Susteren",
      "eijsden-margraten": "Eijsden-Margraten",
      gennep: "Gennep",
      "gulpen-wittem": "Gulpen-Wittem",
      maastricht: "Maastricht",
      meerssen: "Meerssen",
      "mook-en-middelaar": "Mook en Middelaar",
      nederweert: "Nederweert",
      "peel-en-maas": "Peel en Maas",
      roerdalen: "Roerdalen",
      simpelveld: "Simpelveld",
      stein: "Stein",
      vaals: "Vaals",
      "valkenburg-aan-de-geul": "Valkenburg aan de Geul",
      heerlen: "Heerlen",
      "horst-aan-de-maas": "Horst aan de Maas",
      kerkrade: "Kerkrade",
      landgraaf: "Landgraaf",
      leudal: "Leudal",
      maasgouw: "Maasgouw",
      "sittard-geleen": "Sittard-Geleen",
      venlo: "Venlo",
      roermond: "Roermond",
      venray: "Venray",
      voerendaal: "Voerendaal",
      weert: "Weert",
    };

    if (adminEmail) {
      const adminEmailHtml = `
        <h2>Nieuwe case geplaatst</h2>
        <p>Er is een nieuwe case geplaatst op het platform.</p>
        <h3>Details</h3>
        <ul>
          <li><strong>Titel:</strong> ${challenge.title}</li>
          <li><strong>Gemeente:</strong> ${municipalityNames[challenge.municipality] || challenge.municipality}</li>
          <li><strong>Categorie:</strong> ${categoryNames[challenge.category] || challenge.category}</li>
          <li><strong>Beschrijving:</strong> ${challenge.description}</li>
          <li><strong>Afdeling:</strong> ${challenge.organization || "Niet opgegeven"}</li>
          <li><strong>Contact e-mail:</strong> ${challenge.email}</li>
        </ul>
        <p><strong>Geplaatst door:</strong> Admin (${auth.session.user?.email})</p>
      `;

      await sendEmail(adminEmail, "Nieuwe case geplaatst", adminEmailHtml);
    }

    if (challenge.email) {
      const confirmationEmailHtml = `
        <h2>Bevestiging van je case</h2>
        <p>Je case is succesvol geplaatst op het Limburg University platform.</p>
        <h3>Jouw case</h3>
        <ul>
          <li><strong>Titel:</strong> ${challenge.title}</li>
          <li><strong>Gemeente:</strong> ${municipalityNames[challenge.municipality] || challenge.municipality}</li>
          <li><strong>Categorie:</strong> ${categoryNames[challenge.category] || challenge.category}</li>
        </ul>
        <p>Burgers en studenten kunnen nu reageren op deze case.</p>
        <p>Met vriendelijke groet,<br/>Limburg University</p>
      `;

      await sendEmail(
        challenge.email,
        "Bevestiging van je case",
        confirmationEmailHtml,
      );
    }

    return c.json({ success: true, challenge });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return c.json({ error: "Failed to create challenge" }, 500);
  }
});

// PUT-endpoint voor het bewerken van een bestaande case — alleen toegankelijk voor de rol 'admin'
app.put("/make-server-09c2210b/challenges/:id", async (c) => {
  try {
    const auth = await requireRoles(c, ["admin"]);
    if ("error" in auth) return c.json({ error: auth.error }, auth.status);

    const id = c.req.param("id");
    const existingChallenge = await kv.get(`challenge:${id}`);
    if (!existingChallenge) {
      return c.json({ error: "Challenge not found" }, 404);
    }

    const body = await c.req.json();
    const updatedChallenge = {
      ...existingChallenge,
      title: body.title,
      description: body.description,
      category: body.category,
      municipality: body.municipality,
      author: body.author,
      email: body.email,
      organization: body.organization,
    };

    await kv.set(`challenge:${id}`, updatedChallenge);
    return c.json({ success: true, challenge: updatedChallenge });
  } catch (error) {
    console.error("Error updating challenge:", error);
    return c.json({ error: "Failed to update challenge" }, 500);
  }
});

// DELETE-endpoint voor het verwijderen van een case — alleen toegankelijk voor de rol 'admin'.
// Cascade delete: alle gekoppelde voorstellen worden meegenomen in de verwijdering.
app.delete("/make-server-09c2210b/challenges/:id", async (c) => {
  try {
    const auth = await requireRoles(c, ["admin"]);
    if ("error" in auth) return c.json({ error: auth.error }, auth.status);

    const id = c.req.param("id");
    const challenge = await kv.get(`challenge:${id}`);
    if (!challenge) return c.json({ error: "Challenge not found" }, 404);

    // Verwijder eerst alle bijbehorende voorstellen om orphaned records te voorkomen
    const allProposals = await kv.getByPrefix("proposal:");
    const relatedProposals = allProposals.filter(
      (item) => item && typeof item === "object" && item.challenge_id === id && item.id,
    );

    for (const proposal of relatedProposals) {
      await kv.del(`proposal:${proposal.id}`);
    }

    await kv.del(`challenge:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return c.json({ error: `Failed to delete challenge: ${String(error)}` }, 500);
  }
});

app.delete("/make-server-09c2210b/challenges/:challengeId/proposals/:proposalId", async (c) => {
  try {
    const auth = await requireRoles(c, ["admin"]);
    if ("error" in auth) return c.json({ error: auth.error }, auth.status);

    const proposalId = c.req.param("proposalId");
    const proposal = await kv.get(`proposal:${proposalId}`);
    if (!proposal) return c.json({ error: "Proposal not found" }, 404);

    await kv.del(`proposal:${proposalId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    return c.json({ error: "Failed to delete proposal" }, 500);
  }
});

app.post("/make-server-09c2210b/seed", async (c) => {
  try {
    const auth = await requireRoles(c, ["admin"]);
    if ("error" in auth) return c.json({ error: auth.error }, auth.status);

    const challenges = [
      {
        title: "Hoe kunnen we jongeren actiever betrekken bij lokale besluitvorming?",
        description: "We zoeken nieuwe vormen van participatie die jongeren aanspreken.",
        category: "sociale-cohesie",
        municipality: "maastricht",
        author: "Gemeente Maastricht",
        email: "info@maastricht.nl",
        organization: "Afdeling Participatie",
      },
    ];

    await kv.set("counter:challenges", 0);
    await kv.set("counter:proposals", 0);

    for (const data of challenges) {
      let counter = (await kv.get("counter:challenges")) || 0;
      counter += 1;
      await kv.set("counter:challenges", counter);
      const id = String(counter);
      await kv.set(`challenge:${id}`, {
        id,
        ...data,
        created_at: new Date().toISOString(),
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error seeding data:", error);
    return c.json({ error: "Failed to seed data" }, 500);
  }
});

Deno.serve(app.fetch);
