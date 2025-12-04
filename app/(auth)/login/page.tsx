import AuthForm from "../_component/authForm";


const LoginPage = () => {
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
    />
  );
};
export default LoginPage;