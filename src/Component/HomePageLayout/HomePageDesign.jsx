import HeroSection from "./HeroSection";
import TrustBadgesBar from "./TrustBadgesBar";
import ShopByCategories from "./ShopByCategories";
import FlashSaleBanner from "./FlashSaleBanner";
import FlashSaleProductShowcase from "./FlashSaleProductShowcase";
import PopularProductsShowcase from "./PopularProductsShowcase";
import BestDealShowcase from "./BestDealShowcase";
import TopRatedShops from "./TopRatedShops";
import JustForYou from "./JustForYou";

export default function HomePageDesign() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HeroSection />
      <TrustBadgesBar />
      <ShopByCategories />
      <FlashSaleBanner />
      <FlashSaleProductShowcase />
      <PopularProductsShowcase />
      <BestDealShowcase />
      <TopRatedShops />
      <JustForYou />
    </div>
  );
}
