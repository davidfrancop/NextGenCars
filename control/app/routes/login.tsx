// control/app/routes/login.tsx
import {
  ActionFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { parse, object, string, email, minLength } from "valibot";
import { loginUser } from "~/services/login.server";
import { decodeJwt } from "~/utils/jwt";
import { getRedirectByRole } from "~/utils/roles";
import { authCookie } from "~/utils/setAuthCookie";

const loginSchema = object({
  email: string([email()]),
  password: string([minLength(6)]),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  try {
    parse(loginSchema, { email, password });

    const response = await loginUser(email, password);
    const { token } = response;

    if (!token) throw new Error("Invalid credentials");

    const user = decodeJwt(token);
    const redirectTo = getRedirectByRole(user.role);

    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await authCookie.serialize(token),
      },
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 400 });
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <Form method="post" className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border rounded-xl p-3"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border rounded-xl p-3"
            required
          />

          {actionData?.error && (
            <p className="text-red-600 text-sm text-center">
              {actionData.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </Form>
      </div>
    </div>
  );
}
