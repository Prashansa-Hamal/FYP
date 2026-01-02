import AuthForm from "../_component/authForm";


const LoginPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ oauthError?: string }>;
}) => {
  const resolvedParams = (await searchParams) ?? {};
  const { oauthError } = resolvedParams;

  return (
    <AuthForm
      title="Welcome Back"
      description="Don't have a account?"
      buttonText="Log In"
      authType="login"
      href={{
        text: "sign up",
        url: "/signup",
      }}
      isSignup={false}
      oauthError={oauthError}
    />
  );
};
export default LoginPage;