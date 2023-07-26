// app.get("/auth/callback", async (req, res) => {
//   const code = req.query.code as string;
//   if (code) {
//     const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
//       req,
//       res,
//     });
//     const sbResp = await supabase.auth.exchangeCodeForSession(code);
//   }
// });
