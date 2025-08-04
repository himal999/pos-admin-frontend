// utils/withAuth.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionData } from "@/utils/session";

const withAuth = (WrappedComponent: any) => {
  const AuthenticatedComponent = (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const token = getSessionData("accessToken");
      if (!token) {
        router.push("/auth/login");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
