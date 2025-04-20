"use client"

import { Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";

export const ProtectedRoute = ({ Component }: { Component: () => JSX.Element }) => {
    const { 
        data: session, 
        isPending, //loading state
        error, //error object
    } = fine.auth.useSession()

    if (isPending) return <div></div>;
    
    return !session?.user ? <Navigate to='/login' /> : <Component />;
};