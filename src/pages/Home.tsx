import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Benefits } from "@/components/Benefits";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Hero />
        <section className="my-12">
          <HowItWorks />
        </section>
        <section className="my-12">
          <Benefits />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
