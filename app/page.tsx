import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Home() {
  return (
    <div className="h-svh w-svw flex items-center justify-center flex-col gap-2">
      <p className="text-2xl font-semibold">DineEase </p>
      <Link href="/login">
    <Button className="w-full">Login</Button>
  </Link>
    </div>
  );
}
