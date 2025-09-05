import { WobbleCard } from "@/components/ui/wobble-card";

export default function AboutPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <WobbleCard className="max-w-md p-8 bg-white shadow-lg">
        <h1 className="text-2xl font-bold mb-4">About Us</h1>
        <p>
          Welcome to our application! We use the WobbleCard component to make this page interactive and visually appealing.
        </p>
      </WobbleCard>
    </div>
  );
}
