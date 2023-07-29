export const mainView = (inner?: string) => {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <title></title>
      <link rel="stylesheet" href="/styles/global.css" type="text/css">
      <link rel="favicon" href="favicon.png">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="description" content="Read reviews from people you actucally give a shit about">
      <script type="importmap">
      {
        "imports": {
          "@supabase/supabase-js": "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm",
          "@supabase/auth-helpers-shared": "https://unpkg.com/@supabase/auth-helpers-shared@0.4.1/dist/index.mjs",
          "jose": "https://unpkg.com/jose/dist/browser/index.js"
        }
      }
      </script>
      <script src="https://unpkg.com/htmx.org@1.9.2"></script>
      <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
      <script type="module" src="/scripts/supabaseAuthModuleWithVars.js"></script>
      <script src="/scripts/authHandlers.js"></script>
    </head>
    
    <body>
      <main class="main-container" id="page" hx-trigger="supabase-auth-change from:document" hx-post="/authChange" hx-swap="innerHTML">
        ${inner ? inner : ""}
      </main>
    </body>
    
    </html>
  `;
};

export const authenticatedView = (inner?: string) => {
  return /* html */ `
    <div class="auth-controls" hx-get="/signIn" hx-swap="innerHTML" hx-trigger="signout-event from:document" hx-target=".main-container">
      <button onclick="signout()">sign out</button>
    </div>
    ${
      inner
        ? /* html */ `
      <div class="main-content">
        ${inner}
      </div>`
        : null
    }
  `;
};

export const updatePasswordView = (message?: string) => {
  return /* html */ `
    <div class="main-content">
      ${message ? `<p>${message}</p>` : ""}
      <form id="auth-form" hx-post="/updatePassword" hx-target=".main-container" hx-swap="innerHTML">
        <input id="password" type="password" name="password" placeholder="new password" />
        <button type="submit">update</button>
      </div>
    </div>
  `;
};

export const signInView = (message?: string) => {
  return /* html */ `
    <div class="main-content" hx-get="/authenticated" hx-swap="innerHTML" hx-trigger="signin-event from:document" hx-target=".main-container">
      ${message ? `<p>${message}</p>` : ""}
      <form id="auth-form" hx-post="/resetPassword" hx-target=".main-container" hx-swap="innerHTML">
        <input id="email" type="text" name="email" placeholder="email" />
        <input id="password" type="password" name="password" placeholder="password" />
        <button type="button" onclick="signin()">sign in</button>
        <button type="submit" class="look-like-anchor" hx-get="/checkEmail" hx-swap="innerHTML" hx-trigger="supabase-password-reset from:document" hx-target=".main-container">reset password</button>
        <button type="button" class="look-like-anchor" hx-get="/signUp" hx-target=".main-container" hx-swap="innerHTML">sign up instead</button>
      </div>
    </div>
  `;
};

export const signUpView = (message?: string) => {
  return /* html */ `
    <div class="main-content" hx-get="/checkEmail" hx-swap="innerHTML" hx-trigger="signup-event from:document">
      ${message ? `<p>${message}</p>` : ""}
      <div id="auth-form">
        <input id="email" type="text" name="email" placeholder="email" />
        <input id="password" type="password" name="password" placeholder="password" />
        <button type="button" onclick="signup()">sign up</button>
        <button type="button" class="look-like-anchor" hx-get="/signIn" hx-target=".main-container" hx-swap="innerHTML">sign in instead</button>
      </div>
    </div>
  `;
};
