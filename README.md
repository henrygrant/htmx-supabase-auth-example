# htmx-supabase-auth-example

[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/bukotsunikki.svg?style=social&label=%40henry_grant_)](https://twitter.com/bukotsunikki)

This repository is an example of a (mostly) server-side rendered app using [HTMX](https://htmx.org/), [Express](https://expressjs.com/), and [Supabase](https://supabase.com/).

Hosted at [https://htmx-supabase-auth-example-zzubz4a5ta-uc.a.run.app](https://htmx-supabase-auth-example-zzubz4a5ta-uc.a.run.app)

## Motivation (short version)

1. I wanted to mess around with a serverside-rendered webapp that uses HTMX
2. I didn't want roll my own auth and db, so I used Supabase. Supabase's auth (and auth in general really) on serverside apps is tricky
3. [Supabase's SSR Auth Helpers lib](https://github.com/supabase/auth-helpers) only had code for popular ssr js frameworks

See [More Info](#more-information) for the long version.

## Setup

### Clone the project

```
$ git clone git@github.com:henrygrant/htmx-supabase-auth-example.git
$ cd htmx-supabase-auth-example
```

### Set Environment Variables

from `/htmx-supabase-auth-example`

```
$ touch .env
$ echo SUPABASE_URL="<YOUR_SUPABASE_URL>" >> .env
$ echo SUPABASE_ANON_KEY="<YOUR_SUPABASE_ANON_KEY>" >> .env
$ echo PORT="<YOUR_DESIRED_HOST_PORT>" >> .env
```

### Supabase Configuration

from Supabase Console > Authentication > URL Configuration:

- set `http://localhost:<YOUR_DESIRED_PORT>` as `Site URL`
- set `http://localhost:<YOUR_DESIRED_PORT>` and `http://localhost:<YOUR_DESIRED_PORT>/authCallback` as `RedirectURLs`

from Supabase Console > Authentication > Providers:

- enable `Email`
  - set `Enable Email provider`
  - set `Confirm email`
  - set `Secure email change`

### Run application

```
npm start
```

or

```
docker-compose up --build
```

## More Information

### Motivation (long version)

Long ago, before the rise of the SPA the dozens (hundreds?) of javascript frameworks, much of the web was rendered on the serverside by backend languages/frameworks with template engines. The backend would receive a request, build an html respose, and serve back a new page with the content the user was looking for.

This worked in an era of little interactivity, but HTML was limited. The only way to get anything back from the server was an `<a>`, and the only way to post data to a server was from a `<form>`. Furthermore, any time the server responded to one of these requests, a full-page reload would happen and the new content would be displayed.

[HTMX](https://htmx.org/) is a nifty library that extends HTML to allow you to GET/POST/PATCH/PUT etc from any element you want. It does use Javascript, but simply by slapping it's source in a a script tag you get just about everything you need to do much of what JS frameworks allow you to do simply by adding tags to HTML elements. Additionally, HTMX will trigger update just one HTML element upon receiving a response from the server rather than a full page reload.

With this tool, these "old-school" methods can now create many of the web experiences without the need for large client-side frameworks. Nearly all of your logic can be kept on the backend, and your site renders extremely quickly as there isn't much crunching being done on the client.

So, wanting to mess around with this new library and not particularly wanting to host a database and roll my own auth to do it, I looked to [Supabase](https://supabase.com/). Supabase is a back-end-as-a-service that stands up a database, auth, storage, etc for you and lets you interact with these things from the client via a fairly robust TS lib that I had familarity with.

Because Supabase's TS library is officially supported and fairly complete, I figured I'd do this with an Express application. Looking around at Supabase's docs, I saw they had support for serverside rendering, and even maintained [a library](https://github.com/supabase/auth-helpers) with some helper code for some popular serverside-rendered JS frameworks. These helpers are necessary because in a serverside-rendered application, a server that you (the developer, not supabase) runs is making api calls _on behalf_ of the user's client. There's opportunity for some bad actors to do something nefarious if this isn't handled correctly.

Unfortunately, there was _only_ helpers for some popular JS frameworks. Nothing for plain old javascript! This situation prompted the need for this repository, which handles all the client-side authorization stuff for your app. In theory, this is all the client-side code you'll need to worry about.

### PKCE and this app's Auth strategy

The most secure way to do auth for SSR apps is via [Proof Key for Code Exchage (PKCE)](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce), which is a whole flow of code/token exchange between your user's client, your server, and (in this case) your Supabase instance's auth server. The short version is something like this:

1. User enters their info and signs up. The signup endpoint from Supabase does 3 things:
   - Generates a code-verifier cookie and sets it on the client
   - Generates a Code Challenge on the Supabase auth server
   - Sends an email to the user with a link to Supabase's auth server
2. The user clicks this link to the auth server and Supabase redirects the user back to the site with a code set in the query params
3. Your site gets the code from the query params and calls back to Supabase auth (via `exchangeCodeForSession()`) with the code _and_ the code-verifier cookie
4. If they match, the user in the database is marked as "verified" and a session is returned. The session information is stored in a cookie called `sb-somegarbage-auth-token`. The deserialized version of this token looks like:

```
[
	session.access_token,
	session.refresh_token,
	session.provider_token,
	session.provider_refresh_token
]
```

For future signins, the user just enters their email and password, Supabase auth responds with a session and sets that `sb-somegarbage-auth-token` cookie

Every call the Express server makes to Supabase is proceeded by `createServerClient()`, which takes the client's `req` as an arg, so all followup calls to Supabase will have the client's cookie information passed along with it.
