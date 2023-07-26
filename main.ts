import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as path from "path";
import * as fs from "fs";
import { createServerClient } from "./lib/authUtil";
import { authenticatedView, mainView, unauthenticatedView } from "./views";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
}

const app = express();
const PORT = 3000;
const HOSTNAME = "localhost";
const HOST = `${HOSTNAME}:${PORT}`;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", [path.join(__dirname, "views")]);
app.use(express.static("public"));
app.get("/scripts/supabaseAuthModuleWithVars.js", (req, res) => {
  fs.readFile(
    path.join(__dirname, "public", "scripts", "supabaseAuthModule.js"),
    "utf8",
    (err, data) => {
      if (err) {
        console.error(err);
        res.sendStatus(404);
      } else {
        const toSend = data
          .toString()
          .replace("SUPABASE_URL_REPLACE_ME", SUPABASE_URL)
          .replace("SUPABASE_ANON_KEY_REPLACE_ME", SUPABASE_ANON_KEY);
        res.contentType("application/javascript");
        res.send(toSend);
      }
    }
  );
});

// checks authentication status of the user and sends the appropriate view
// also handles code exchange
app.get("/", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  const code = req.query.code as string;
  if (code) {
    const sbResp = await supabase.auth.exchangeCodeForSession(code);
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();

  res.send(
    !!session
      ? mainView(authenticatedView(/* html */ `<div>hi</div>`))
      : mainView(unauthenticatedView)
  );
});

// querys the test table for its records
// table has a RLS rule to only allow SELECTs from authenticated users
app.get("/lookup", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  const { data, error } = await supabase.from("test").select();
  if (error) console.error(error);
  res.send(data);
});

// will be called any time the client gets something back from
// supabase.auth.onAuthStateChanged
// the change is picked up from the req cookies
app.post("/authChange", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  const { data, error } = await supabase.auth.getSession();
  if (!data.session || error) {
    res.send(unauthenticatedView);
  } else {
    res.send(authenticatedView("<div>Authenticated!</div>"));
  }
});

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

app.listen(PORT);
