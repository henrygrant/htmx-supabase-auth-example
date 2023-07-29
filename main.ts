import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as path from "path";
import * as fs from "fs";
import { createServerClient } from "./lib/authUtil";
import {
  authenticatedView,
  mainView,
  updatePasswordView,
  signInView,
  signUpView,
} from "./views";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
}

const app = express();
const PORT = process.env.PORT;
const HOSTNAME = "localhost";
const HOST = `${HOSTNAME}:${PORT}`;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", [path.join(__dirname, "views")]);
app.use(express.static("public"));

/*
  main route 
  checks authentication status of the user and sends the appropriate view 
*/
app.get("/", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error(error);
  }
  res.send(
    !!data.session
      ? mainView(
          authenticatedView(/* html */ `<div>Hi there is a session</div>`)
        )
      : mainView(signInView())
  );
});

/*
  session checker
  will be called any time the client gets a SIGNED_IN or SIGNED_OUT event
  punts user if no session
*/
app.post("/authChange", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  const { data, error } = await supabase.auth.getSession();
  if (!data.session || error) {
    res.send(signInView());
  } else {
    res.send(authenticatedView("<div>Authenticated!</div>"));
  }
});

/*
  callback for signup
*/
app.get("/authCallback", async (req, res) => {
  const code = req.query.code as string;
  if (code) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      req,
      res,
    });
    await supabase.auth.exchangeCodeForSession(code);
    res.redirect("/");
  }
});

/*
  handles user beginning to reset their password
*/
app.post("/resetPassword", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  if (!req.body.email) {
    res.send(signInView("enter your email first"));
    return;
  }
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    req.body.email as string,
    {
      redirectTo: `http://${HOST}/updatePassword`,
    }
  );
  if (error) {
    console.error(error);
    res.send(signInView("error resetting password"));
  } else {
    res.send(signInView("check your email"));
  }
});

/*
  page user comes back to after clicking reset the link in their email
*/
app.get("/updatePassword", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  res.send(mainView(updatePasswordView()));
});

/*
  handles user actually updating their password
*/
app.post("/updatePassword", async (req, res) => {
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    req,
    res,
  });
  if (!req.body.password) {
    res.send(updatePasswordView("enter the new password first"));
    return;
  }
  const { error } = await supabase.auth.updateUser({
    password: req.body.password as string,
  });
  if (error) {
    console.error(error);
    res.send(signInView("error resetting password"));
  } else {
    res.redirect("/");
  }
});

/*
  shows authenticated view 
*/
app.get("/authenticated", async (req, res) => {
  res.send(
    authenticatedView(/* html */ `<p>home page, build app from here</p>`)
  );
});

/*
  shows signin form
*/
app.get("/signIn", async (req, res) => {
  res.send(signInView());
});

/*
  shows signup form
*/
app.get("/signUp", async (req, res) => {
  res.send(signUpView());
});

/*
  shows successful signup message
*/
app.get("/checkEmail", async (req, res) => {
  res.send(/* html */ `<div>check your email</div>`);
});

/*
  irrelevant for example
  serves the supabaseAuthModule.js file with the correct variables
  to keep them declared in one place
*/
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

app.listen(PORT);
