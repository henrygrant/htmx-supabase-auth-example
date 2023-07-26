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
      <div id="result">Nothing</div>
      <button hx-get="/lookup" hx-target="#result" hx-swap="innerHTML">lookup</button>
      <main class="main-container" id="page" hx-trigger="supabase-auth-change from:document" hx-post="/authChange" hx-swap="innerHTML">
        ${inner ? inner : ""}
      </main>
    </body>
    
    </html>
  `;
};
export const authenticatedView = (inner?: string) => {
  return /* html */ `
    <div class="auth-controls">
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
export const unauthenticatedView = /* html */ `
  <div class="main-content">
    <div id="auth-form">
      <input id="email" type="text" name="email" placeholder="email" />
      <input id="password" type="password" name="password" placeholder="password" />
      <button onclick="signin()">sign in</button>
      <button class="look-like-anchor" hx-get="/component/signup" hx-target=".main-content" hx-swap="innerHTML">sign up instead</button>
    </div>
  </div>
`;
