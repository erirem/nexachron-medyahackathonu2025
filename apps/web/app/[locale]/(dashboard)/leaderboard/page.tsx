import type { JSX } from "react";
import { Leaderboard } from "@/components/leaderboard/leaderboard";

export default function LeaderboardPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08111c] via-[#0d1421] to-[#0a0f1a]">
      <div className="container mx-auto py-8">
        <Leaderboard />
      </div>
    </div>
  );
}