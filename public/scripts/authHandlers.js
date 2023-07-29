async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await document.supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${location.origin}/authCallback` },
  });
  if (error) {
    console.error(error);
  } else {
    document.dispatchEvent(new CustomEvent("signup-event", { detail: data }));
  }
  return false;
}
async function signin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await document.supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error(error);
  } else {
    document.dispatchEvent(new CustomEvent("signin-event", { detail: data }));
  }
  return false;
}
async function signout() {
  const { data, error } = await document.supabase.auth.signOut();
  if (error) {
    console.error(error);
  } else {
    document.dispatchEvent(new CustomEvent("signout-event", { detail: data }));
  }
  return false;
}
