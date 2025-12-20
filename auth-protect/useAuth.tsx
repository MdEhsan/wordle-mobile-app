import React from "react";
import { AuthContext } from "./AuthProvider";

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

export default useAuth;
