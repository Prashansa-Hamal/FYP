import AuthForm from "../_components/auth-form";

const SignupPage = () => {
  return (
    <AuthForm
      title="Create an Account"
      description="Already have an account?"
      buttonText="Create an Account"
      authType="signup"
      href={{
        text: "login",
        url: "/login",
      }}
      isSignup={true}
    />
  );
};

export default SignupPage;
