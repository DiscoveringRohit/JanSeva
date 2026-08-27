// Cookie-based auth service (HttpOnly refresh cookie + in-memory access token)
// Improved: proper Authorization header, robust error handling and console logs to aid debugging network/CORS issues.

import { AuthResponse, LoginCredentials, PasswordResetResponse, RegisterCredentials } from "./auth-types";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Keep the access token in memory only.
let accessToken: string | null = null;

// Store a reference to the original fetch function.
// This prevents the global fetch interceptor from recursively
// calling fetchWithAuth.
const originalFetch =
  typeof window !== "undefined" ? window.fetch.bind(window) : fetch;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function refreshAccessWithCookie(): Promise<string | null> {
  try {
    const res = await originalFetch(
      `${API}/api/auth/token/refresh/cookie/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.warn(
        "cookie refresh returned non-ok",
        res.status
      );
      return null;
    }

    const data = await res.json().catch(() => null);

    if (data?.access) {
      setAccessToken(data.access);
      return data.access;
    }

    return null;
  } catch (e: any) {
    console.error(
      "refreshAccessWithCookie network error:",
      e
    );
    return null;
  }
}

export async function fetchWithAuth(
  input: URL | RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }

  const opts: RequestInit = {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  };

  try {
    // Use originalFetch so we don't trigger the global
    // fetch interceptor again.
    let res = await originalFetch(input, opts);

    if (res.status !== 401) {
      return res;
    }

    // Token might be expired. Try refreshing it using
    // the HttpOnly refresh cookie.
    const newAccess =
      await refreshAccessWithCookie();

    // If refresh fails, return the original 401.
    if (!newAccess) {
      return res;
    }

    // Retry the original request with the new access token.
    headers.set(
      "Authorization",
      `Bearer ${newAccess}`
    );

    res = await originalFetch(input, {
      ...init,
      headers,
      credentials: "include",
    });

    return res;
  } catch (e: any) {
    console.error(
      "Network error in fetchWithAuth:",
      e,
      {
        input,
        init,
      }
    );

    throw e;
  }
}

const parseErrorResponse = async (
  res: Response
) => {
  try {
    const json = await res.json();
    return json;
  } catch (e) {
    try {
      const txt = await res.text();
      return {
        detail: txt,
      };
    } catch (ee) {
      return {
        detail: `HTTP ${res.status}`,
      };
    }
  }
};

export const authService = {
  async tryRestoreSession(): Promise<boolean> {
    const newAccess =
      await refreshAccessWithCookie();

    return !!newAccess;
  },

  async login(
    credentials: LoginCredentials
  ): Promise<AuthResponse> {
    try {
      const res = await originalFetch(
        `${API}/api/auth/login/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: credentials.identifier,
            password: credentials.password,
          }),
        }
      );

      if (!res.ok) {
        const err = await (async () => {
          try {
            return await res.json();
          } catch {
            return {
              detail:
                await res.text().catch(
                  () => "Login failed"
                ),
            };
          }
        })();

        console.warn(
          "Login failed:",
          res.status,
          err
        );

        return {
          success: false,
          message:
            err.detail || "Login failed",
          errors: err,
        };
      }

      const data =
        await res.json().catch(() => null);

      if (!data) {
        return {
          success: false,
          message:
            "Login: empty response from server",
        };
      }

      if (data?.access) {
        setAccessToken(data.access);

        // Fetch profile using authenticated request.
        const profileRes =
          await fetchWithAuth(
            `${API}/api/auth/profile/`
          );

        if (profileRes.ok) {
          const user =
            await profileRes.json();

          if (
            typeof window !== "undefined"
          ) {
            localStorage.setItem(
              "janseva_user",
              JSON.stringify(user)
            );
          }

          return {
            success: true,
            user,
            token: data.access,
            message: "Login successful",
          };
        }

        return {
          success: true,
          token: data.access,
          message:
            "Login successful (no profile)",
        };
      }

      return {
        success: false,
        message:
          "Login did not return access token",
      };
    } catch (e: any) {
      console.error(
        "Network/login error:",
        e
      );

      return {
        success: false,
        message: `Network error: ${
          e.message || e
        }`,
      };
    }
  },

  async logout() {
    try {
      await originalFetch(
        `${API}/api/auth/logout/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    } catch (e: any) {
      console.warn(
        "Logout network error (ignored):",
        e
      );
    }

    setAccessToken(null);

    if (
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(
        "janseva_user"
      );
      localStorage.removeItem(
        "janseva_token"
      );
    }

    return true;
  },

  async register(
    data: RegisterCredentials
  ): Promise<AuthResponse> {
    try {
      const res = await originalFetch(
        `${API}/api/auth/register/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const err = await (async () => {
          try {
            return await res.json();
          } catch {
            return {
              error:
                await res.text().catch(
                  () =>
                    "Registration failed"
                ),
            };
          }
        })();

        console.warn(
          "Register failed:",
          res.status,
          err
        );

        return {
          success: false,
          message:
            err.error ||
            err.detail ||
            "Registration failed",
          errors: err,
        };
      }

      const d =
        await res.json().catch(() => null);

      if (!d) {
        return {
          success: false,
          message:
            "Registration: empty response",
        };
      }

      if (d?.access) {
        setAccessToken(d.access);
      }

      if (
        d?.user &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem(
          "janseva_user",
          JSON.stringify(d.user)
        );
      }

      return {
        success: true,
        user: d.user,
        token: d.access,
      };
    } catch (e: any) {
      console.error(
        "Network/register error:",
        e
      );

      return {
        success: false,
        message: `Network error: ${
          e.message || e
        }`,
      };
    }
  },

  async requestOtp(payload: {
    email?: string;
    phone_number?: string;
  }) {
    try {
      const res = await originalFetch(
        `${API}/api/auth/login/request-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      return await res.json();
    } catch (e: any) {
      console.error(
        "requestOtp network error:",
        e
      );

      return {
        success: false,
        message: `Network error: ${
          e.message || e
        }`,
      } as PasswordResetResponse;
    }
  },

  async verifyOtp(payload: {
    email?: string;
    phone_number?: string;
    otp_code: string;
  }) {
    try {
      const res = await originalFetch(
        `${API}/api/auth/login/verify-otp/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await (async () => {
          try {
            return await res.json();
          } catch {
            return {
              error:
                await res.text().catch(
                  () =>
                    "OTP verify failed"
                ),
            };
          }
        })();

        console.warn(
          "verifyOtp failed:",
          res.status,
          err
        );

        return {
          success: false,
          message:
            err.error ||
            err.detail ||
            "OTP verify failed",
        };
      }

      const data = await res.json().catch(() => null);

      if (data?.access) {
        setAccessToken(data.access);
      }

      const profileRes = await fetchWithAuth(`${API}/api/auth/profile/`);

      if (profileRes.ok) {
        const user = await profileRes.json().catch(() => null);

        if (
          typeof window !== "undefined"
        ) {
          localStorage.setItem(
            "janseva_user",
            JSON.stringify(user)
          );
        }

        return {
          success: true,
          user,
        } as any;
      }

      return {
        success: true,
      } as any;
    } catch (e: any) {
      console.error(
        "verifyOtp network error:",
        e
      );

      return {
        success: false,
        message: `Network error: ${
          e.message || e
        }`,
      } as any;
    }
  },

  async requestPasswordReset(
    identifier: string
  ): Promise<PasswordResetResponse> {
    try {
      const isEmail =
        identifier.includes("@");

      const payload = isEmail
        ? { email: identifier }
        : { phone_number: identifier };

      const res = await originalFetch(
        `${API}/api/auth/password-reset/request/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await (async () => {
          try {
            return await res.json();
          } catch {
            return {
              error:
                await res.text().catch(
                  () =>
                    "Request failed"
                ),
            };
          }
        })();

        console.warn(
          "Password reset request failed:",
          res.status,
          err
        );

        return {
          success: false,
          message:
            err.error ||
            err.detail ||
            "Password reset request failed",
        };
      }

      const data =
        await res.json().catch(() => null);

      if (!data) {
        return {
          success: false,
          message:
            "Empty response from server",
        };
      }

      return {
        success: true,
        message:
          data.message ||
          "Password reset link sent successfully",
      };
    } catch (e: any) {
      console.error(
        "Password reset request network error:",
        e
      );

      return {
        success: false,
        message: `Network error: ${
          e.message || e
        }`,
      };
    }
  },
};