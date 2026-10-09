import { redirect } from "react-router";

export const loginAction = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === "admin" && password === "password") {
    return redirect("/project");
  } else {
    alert("Invalid credentials");
  }
};
