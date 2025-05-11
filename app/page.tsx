import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Features from "@/components/features";
import Footer from "@/components/footer";
import Pricing from "@/components/pricing";
import VideoOptimizerTest from "@/components/test/video-optimizer-test";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <div className="min-h-screen">
          <VideoOptimizerTest />
          <Hero />
        </div>
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
