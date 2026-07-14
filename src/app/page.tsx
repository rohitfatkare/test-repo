import Link from "next/link";
import { Button } from "@/components/Button";
import { Counter } from "@/components/Counter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <main className="max-w-2xl w-full text-center space-y-8 bg-white p-12 rounded-xl shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">
          AI Code Review Test Project
        </h1>
        <p className="text-lg text-gray-600">
          This project is used to test the AI-powered code review system.
          Create a PR to see the AI in action!
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/review">
            <Button variant="primary">View Review Dashboard</Button>
          </Link>
          <Button variant="secondary">Learn More</Button>
        </div>
        <Counter />
      </main>
    </div>
  );
}
