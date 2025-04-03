import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Pricing from "@/components/pricing";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <div className="min-h-screen">
          <Hero />
        </div>
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
