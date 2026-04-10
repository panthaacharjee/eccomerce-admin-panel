// components/withAuth.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const router = useRouter();
    const { status } = useSession();
    // const {loading, isAuthenticated, error} = useSelector((state:RootState)=>state.user)

    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/themes/login");
      }
    }, [status]);

    if (status === "authenticated") {
      return <Component {...props} />;
    }
  };
}
