import advertisingMediaImage from "@/assets/industries we serve/Advertising & Media.png";
import agricultureImage from "@/assets/industries we serve/Agriculture.png";
import automotiveImage from "@/assets/industries we serve/Automotive.png";
import bakeryImage from "@/assets/industries we serve/Bakery.png";
import bankImage from "@/assets/industries we serve/Bank.png";
import constructionImage from "@/assets/industries we serve/Construction.png";
import cosmeticsImage from "@/assets/industries we serve/Cosmetics (1).png";
import decoratorImage from "@/assets/industries we serve/Decorator (1).png";
import educationImage from "@/assets/industries we serve/Education.png";
import engineeringImage from "@/assets/industries we serve/Engineering.png";
import eventImage from "@/assets/industries we serve/Event.png";
import foodBeverageImage from "@/assets/industries we serve/Food & Beverage.png";
import governmentImage from "@/assets/industries we serve/Government.png";
import healthCareImage from "@/assets/industries we serve/Health Care.png";
import homeBuildersImage from "@/assets/industries we serve/Home Builders.png";
import hotelImage from "@/assets/industries we serve/Hotel.png";
import infrastructureImage from "@/assets/industries we serve/Infrastructure.png";
import insuranceImage from "@/assets/industries we serve/Insurance.png";
import itImage from "@/assets/industries we serve/IT.png";
import landDevelopersImage from "@/assets/industries we serve/Land Developers.png";
import manufacturingImage from "@/assets/industries we serve/Manufacturing.png";
import miningImage from "@/assets/industries we serve/Mining.png";
import pharmaceuticalsImage from "@/assets/industries we serve/Pharmaceuticals.png";
import retailImage from "@/assets/industries we serve/Retail.png";
import shippingImage from "@/assets/industries we serve/Shipping.png";
import telecomImage from "@/assets/industries we serve/Telecom.png";
import tourismImage from "@/assets/industries we serve/Tourism.png";
import wasteManagementImage from "@/assets/industries we serve/Waste Management.png";
import wholesaleTradeImage from "@/assets/industries we serve/Wholesale Trade.png";

const INDUSTRY_ITEMS = [
  { name: "Advertising & Media", image: advertisingMediaImage },
  { name: "Agriculture", image: agricultureImage, className: "h-16 w-16 sm:h-20 sm:w-20 xl:h-24 xl:w-24" },
  { name: "Automotive", image: automotiveImage },
  { name: "Bakery", image: bakeryImage },
  { name: "Bank", image: bankImage },
  { name: "Construction", image: constructionImage },
  { name: "Cosmetics", image: cosmeticsImage },
  { name: "Decorator", image: decoratorImage },
  { name: "Education", image: educationImage },
  { name: "Engineering", image: engineeringImage },
  { name: "Event", image: eventImage },
  { name: "Food & Beverage", image: foodBeverageImage },
  { name: "Government", image: governmentImage },
  { name: "Health Care", image: healthCareImage },
  { name: "Home Builders", image: homeBuildersImage },
  { name: "Hotel", image: hotelImage },
  { name: "Infrastructure", image: infrastructureImage },
  { name: "Insurance", image: insuranceImage },
  { name: "IT", image: itImage },
  { name: "Land Developers", image: landDevelopersImage },
  { name: "Manufacturing", image: manufacturingImage },
  { name: "Mining", image: miningImage },
  { name: "Pharmaceuticals", image: pharmaceuticalsImage },
  { name: "Retail", image: retailImage },
  { name: "Shipping", image: shippingImage },
  { name: "Telecom", image: telecomImage },
  { name: "Tourism", image: tourismImage },
  { name: "Waste Management", image: wasteManagementImage },
  { name: "Wholesale Trade", image: wholesaleTradeImage },
];

export function IndustriesGrid({ framed = false }: { framed?: boolean }) {
  return (
    <div
      className={
        framed
          ? "mx-auto grid max-w-[700px] grid-cols-2 gap-x-4 gap-y-5 bg-white px-4 py-3 sm:grid-cols-3 md:grid-cols-6 md:gap-x-6"
          : "mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6"
      }
    >
      {INDUSTRY_ITEMS.map((industry) => (
        <div key={industry.name} className="group text-center">
          <div
            className={
              framed
                ? "relative mx-auto grid h-[76px] w-[76px] place-items-center overflow-hidden rounded-full bg-white transition after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border-2 after:border-[#d8d8d8] after:transition after:content-[''] group-hover:after:border-brand-red"
                : "relative mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-white transition after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border-[3px] after:border-[#d9d9d9] after:transition after:content-[''] group-hover:after:border-brand-red sm:h-28 sm:w-28 xl:h-32 xl:w-32"
            }
          >
            <img
              src={industry.image}
              alt=""
              className={
                framed
                  ? "h-12 w-12 object-contain mix-blend-multiply"
                  : `${industry.className ?? "h-14 w-14 sm:h-16 sm:w-16 xl:h-20 xl:w-20"} object-contain mix-blend-multiply`
              }
            />
          </div>
          <div
            className={
              framed
                ? "mt-2 text-sm font-bold leading-tight text-brand-dark"
                : "mt-3 text-base font-bold leading-tight text-brand-dark sm:text-lg"
            }
          >
            {industry.name}
          </div>
        </div>
      ))}
    </div>
  );
}
