export const COOKIE_NAME = "qr_admin_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Token que se guarda en la cookie de sesión cuando el login es correcto. */
export async function getExpectedToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SECRET || "";
  return sha256Hex(`${password}:${secret}`);
}

export async function checkPassword(password: string): Promise<boolean> {
  return password === (process.env.ADMIN_PASSWORD || "");
}
