import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// KV-store (key-value opslag): alle gegevens worden opgeslagen als naam-waarde-paren in de database.
// Elke record heeft een unieke sleutel, zoals "account:admin", "challenge:1" of "session:<token>".

// Maak een Supabase-client aan met de service role key — dit geeft volledige toegang tot de database
const client = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

// Sla een waarde op in de database. Bij een bestaande sleutel wordt de waarde overschreven (upsert).
export const set = async (key: string, value: unknown): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_09c2210b").upsert({ key, value });
  if (error) throw new Error(error.message);
};

// Haal één record op uit de database op basis van de exacte sleutel.
// Geeft null terug als de sleutel niet bestaat.
export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_09c2210b")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value;
};

// Verwijder een record uit de database op basis van de sleutel.
export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_09c2210b").delete().eq("key", key);
  if (error) throw new Error(error.message);
};

// Haal alle records op waarvan de sleutel begint met het opgegeven prefix.
// Bijvoorbeeld: prefix "challenge:" geeft alle cases terug, "proposal:" alle voorstellen.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase
    .from("kv_store_09c2210b")
    .select("key, value")
    .like("key", `${prefix}%`);
  if (error) throw new Error(error.message);
  return data?.map((item) => item.value) ?? [];
};
