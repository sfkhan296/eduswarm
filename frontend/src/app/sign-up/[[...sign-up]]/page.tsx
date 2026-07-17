import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900">
      <SignUp />
    </div>
  );
}
