import Button from "../../components/ui/Button";
import GlassCard from "../../components/ui/GlassCard";
import Input from "../../components/ui/Input";
import Logo from "../../components/common/Logo";

const Login = () => {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <GlassCard className="w-full max-w-md p-8">
        <Logo />

        <div className="mt-8 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Sign in to continue to your health dashboard.
            </p>
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
          />

          <Button className="w-full">
            Sign in
          </Button>
        </div>
      </GlassCard>
    </main>
  );
};

export default Login;