"use client";
import { useSession } from "next-auth/react";
import React from "react";
import Layout from "../Layout";
import AdminSignIn from "../Signin";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  if (status === "authenticated") {
    return <Layout>{children}</Layout>;
  } else {
    return <AdminSignIn />;
  }
};

export default AuthProvider;
