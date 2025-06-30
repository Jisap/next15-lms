import { ThemeToggle } from "@/components/themeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl">hello world</h1>
      <ThemeToggle />
    </div>
  );
}
