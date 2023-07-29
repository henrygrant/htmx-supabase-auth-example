import {
  createSupabaseClient,
  BrowserCookieAuthStorageAdapter,
} from "@supabase/auth-helpers-shared";

function createBrowserClient(
  supabaseUrl,
  supabaseKey,
  { options, cookieOptions } = {}
) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "supabaseUrl and supabaseKey are required to create a Supabase client! Find these under Settings > API in your Supabase dashboard."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    ...options,
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        "X-Client-Info": "auth-helpers-htmx@0.0.0",
      },
    },
    auth: {
      storageKey: cookieOptions?.name,
      storage: new BrowserCookieAuthStorageAdapter(cookieOptions),
    },
  });
}
document.supabase = createBrowserClient(
  "SUPABASE_URL_REPLACE_ME",
  "SUPABASE_ANON_KEY_REPLACE_ME"
);
document.supabase.auth.onAuthStateChange((event, session) => {
  document.supabasesession = session;
});
