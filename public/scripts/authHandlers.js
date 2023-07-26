async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const resp = await document.supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "localhost:3000",
    },
  });
  return false;
}
async function signin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const resp = await document.supabase.auth.signInWithPassword({
    email,
    password,
  });
  return false;
}
async function signout() {
  const resp = await document.supabase.auth.signOut();
  return false;
}
