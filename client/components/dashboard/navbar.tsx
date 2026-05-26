"use client";

import {
  UserButton,
} from "@clerk/nextjs";

export const Navbar = () => {
  return (
    <header className="h-16 border-b border-neutral-800 bg-black text-white flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">
          Financial Dashboard
        </h2>
      </div>

      <UserButton />
    </header>
  );
};