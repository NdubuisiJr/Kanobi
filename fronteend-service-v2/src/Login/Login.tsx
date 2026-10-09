import { Form, useNavigation } from "react-router";
import LoadingScreen from "../components/LoadingScreen";

export default function LoginPage() {
  const navigation = useNavigation();
  return navigation.state == "loading" || navigation.state == "submitting" ? (
    <LoadingScreen />
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Form
        action="/"
        method="post"
        className="p-6 rounded-xl shadow-md w-80 bg-gray-600 text-white"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          className="border p-2 rounded w-full mb-2 placeholder:text-white"
          placeholder="Username"
          name="username"
        />
        <input
          type="password"
          className="border p-2 rounded w-full mb-4 placeholder:text-white"
          placeholder="Password"
          name="password"
        />
        <button
          type="submit"
          className="bg-blue-500  p-2 rounded w-full hover:bg-blue-600"
        >
          Login
        </button>
      </Form>
    </div>
  );
}
