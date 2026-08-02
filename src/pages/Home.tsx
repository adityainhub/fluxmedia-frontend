import { Hero } from "@/components/Hero";
import { StackBadges } from "@/components/StackBadges";
import { Architecture } from "@/components/Architecture";
import { CodeSample } from "@/components/CodeSample";
import { Benefits } from "@/components/Benefits";
import { FAQ } from "@/components/FAQ";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <StackBadges />
      <div id="architecture">
        <Architecture />
      </div>
      <CodeSample />
      <Benefits />
      <FAQ />
    </div>
  );
};

export default Home;
