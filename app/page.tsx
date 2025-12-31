import type { Metadata } from "next";
import Homeslider from "./components/Homeslider";
import Newsletter from "./components/Newsletter";
import Banner from "./components/Banner";
import PopularProducts from "./components/ProductGrid";
import GetStartedSection from "./components/GetStartedSection";



export const metadata: Metadata = {
  title: "Home | Block Boi",
  description: "Official website for Block Boi, your destination for modern shopping.",
};


export default function AboutPage() {
  return (
    <div>
      <Homeslider />
      <Banner />
       <PopularProducts/>
      <Newsletter />
      <GetStartedSection />
    
      <h1 className="text-4xl font-bold text-gray-900"></h1>
    </div>
  );
}
