"use client";

import { TripPlanner } from "@/components/trip-planner";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
      </Authenticated>
      <Unauthenticated>
        <SignInButton >
          <Button>Sign In</Button>
        </SignInButton>
        <SignUpButton >
          <Button>Sign Up</Button>
        </SignUpButton>
      </Unauthenticated>
      <TripPlanner />
    </>
  );
}
