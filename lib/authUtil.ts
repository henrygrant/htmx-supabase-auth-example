import {
  CookieAuthStorageAdapter,
  CookieOptions,
  CookieOptionsWithName,
  createSupabaseClient,
  serializeCookie,
  SupabaseClientOptionsWithoutAuth,
} from "@supabase/auth-helpers-shared";
import { SupabaseClient } from "@supabase/supabase-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

const PACKAGE_NAME = "auth-helpers-htmx";
const PACKAGE_VERSION = "0.0.0";

class ExpressServerAuthStorageAdapter extends CookieAuthStorageAdapter {
  constructor(
    private readonly req: ExpressRequest,
    private readonly res: ExpressResponse,
    cookieOptions?: CookieOptions
  ) {
    super(cookieOptions);
  }

  protected getCookie(name: string): string | null | undefined {
    const ret = this.req.cookies[name];
    return ret;
  }
  protected setCookie(name: string, value: string): void {
    const cookieStr = serializeCookie(name, value, {
      ...this.cookieOptions,
      // Allow supabase-js on the client to read the cookie as well
      httpOnly: false,
    });
    this.res.set("set-cookie", cookieStr);
  }
  protected deleteCookie(name: string): void {
    const cookieStr = serializeCookie(name, "", {
      ...this.cookieOptions,
      maxAge: 0,
      // Allow supabase-js on the client to read the cookie as well
      httpOnly: false,
    });
    this.res.set("set-cookie", cookieStr);
  }
}

export function createServerClient<
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>(
  supabaseUrl: string,
  supabaseKey: string,
  {
    req,
    res,
    options,
    cookieOptions,
  }: {
    req: ExpressRequest;
    res: ExpressResponse;
    options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
    cookieOptions?: CookieOptionsWithName;
  }
): SupabaseClient<Database, SchemaName, Schema> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "supabaseUrl and supabaseKey are required to create a Supabase client! Find these under `Settings` > `API` in your Supabase dashboard."
    );
  }

  if (!req || !res) {
    throw new Error(
      "request and response must be passed to createSupabaseClient function, when called from loader or action"
    );
  }

  return createSupabaseClient<Database, SchemaName, Schema>(
    supabaseUrl,
    supabaseKey,
    {
      ...options,
      global: {
        ...options?.global,
        headers: {
          ...options?.global?.headers,
          "X-Client-Info": `${PACKAGE_NAME}@${PACKAGE_VERSION}`,
        },
      },
      auth: {
        storageKey: cookieOptions?.name,
        storage: new ExpressServerAuthStorageAdapter(req, res, cookieOptions),
      },
    }
  );
}
