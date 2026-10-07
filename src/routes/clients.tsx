import { PageHero } from "@/components/PageHero";
import boiLogo from "@/assets/client logos/boi.png";
import indianOilLogo from "@/assets/client logos/indian oil.png";
import hpPetrolLogo from "@/assets/client logos/hp petrol.png";
import dexgreenLogo from "@/assets/client logos/dexgreen.png";
import sunteckLogo from "@/assets/client logos/sunteck.png";
import pirajeesLogo from "@/assets/client logos/pirajees .png";
import sahuwalaLogo from "@/assets/client logos/sahuwala.png";
import agrovanLogo from "@/assets/client logos/agrovan.png";
import cheriseLogo from "@/assets/client logos/cherise.png";
import sarvadnyaLogo from "@/assets/client logos/sarvadnya.png";
import sadhuLogo from "@/assets/client logos/sadhu.png";
import bharatSchoolLogo from "@/assets/client logos/bharat school.png";
import angelSchoolLogo from "@/assets/client logos/angel school.png";
import acuteLogo from "@/assets/client logos/acute.png";
import caramellasLogo from "@/assets/client logos/caramellas.png";
import circuitHouseLogo from "@/assets/client logos/circuit house .png";
import gbruLogo from "@/assets/client logos/gbru.png";
import redragonLogo from "@/assets/client logos/redragon.png";
import mahalaxmiGroupsLogo from "@/assets/client logos/mahalaxmi groups.png";
import shreyashLogo from "@/assets/client logos/shreyash .png";
import lexiconLogo from "@/assets/client logos/lexicon.png";
import jspmLogo from "@/assets/client logos/jspm.png";
import edumontLogo from "@/assets/client logos/edumont.png";
import autopeepalLogo from "@/assets/client logos/autopeepal.png";
import gravotechLogo from "@/assets/client logos/gravotech.png";
import bettinelliLogo from "@/assets/client logos/bettinelli.png";
import mobilitiLogo from "@/assets/client logos/mobiliti.png";
import danLogo from "@/assets/client logos/dan.png";
import rainbowLogo from "@/assets/client logos/rainbow.png";
import apolloLogo from "@/assets/client logos/apollo.png";
import shreeLifecareLogo from "@/assets/client logos/shree lifecare.png";
import shreeHospitalLogo from "@/assets/client logos/shree hospital.png";
import sardarLogo from "@/assets/client logos/sardar.png";
import shomeshwarBhelLogo from "@/assets/client logos/shomeshwar bhel.png";
import gurudattaWadapavLogo from "@/assets/client logos/gurudatta wadapav.png";
import serumLogo from "@/assets/client logos/serum logo.png";
import fitnessLogo from "@/assets/client logos/fitness.png";
import inigmaAirLogo from "@/assets/client logos/inigmaair.png";
import { useEffect, useState } from "react";
import { assetUrl } from "@/lib/api";
import { fetchPublicClients, type PublicClient } from "@/lib/public-content";

const STATIC_CLIENTS = [
  {
    name: "Bank of India",
    logo: boiLogo,
  },
  {
    name: "Indian Oil",
    logo: indianOilLogo,
  },
  {
    name: "HP Petrol",
    logo: hpPetrolLogo,
  },
  {
    name: "Dexgreen",
    logo: dexgreenLogo,
  },
  {
    name: "Sunteck",
    logo: sunteckLogo,
  },
  {
    name: "Pirajees",
    logo: pirajeesLogo,
  },
  {
    name: "Sahuwala",
    logo: sahuwalaLogo,
  },
  {
    name: "Agrovan",
    logo: agrovanLogo,
  },
  {
    name: "Cherise",
    logo: cheriseLogo,
  },
  {
    name: "Sarvadnya",
    logo: sarvadnyaLogo,
  },
  {
    name: "Sadhu Vaswani Gurukul",
    logo: sadhuLogo,
  },
  {
    name: "Bharat School",
    logo: bharatSchoolLogo,
  },
  {
    name: "Angel School",
    logo: angelSchoolLogo,
  },
  {
    name: "Acute",
    logo: acuteLogo,
  },
  {
    name: "Caramellas",
    logo: caramellasLogo,
  },
  {
    name: "Circuit House",
    logo: circuitHouseLogo,
  },
  {
    name: "GBRU",
    logo: gbruLogo,
  },
  {
    name: "Redragon",
    logo: redragonLogo,
  },
  {
    name: "Mahalaxmi Groups",
    logo: mahalaxmiGroupsLogo,
  },
  {
    name: "Shreyash",
    logo: shreyashLogo,
  },
  {
    name: "Lexicon",
    logo: lexiconLogo,
  },
  {
    name: "JSPM",
    logo: jspmLogo,
  },
  {
    name: "Edumont",
    logo: edumontLogo,
  },
  {
    name: "Autopeepal",
    logo: autopeepalLogo,
  },
  {
    name: "Gravotech",
    logo: gravotechLogo,
  },
  {
    name: "Bettinelli",
    logo: bettinelliLogo,
  },
  {
    name: "Mobiliti",
    logo: mobilitiLogo,
  },
  {
    name: "Dan",
    logo: danLogo,
  },
  {
    name: "Rainbow",
    logo: rainbowLogo,
  },
  {
    name: "Apollo",
    logo: apolloLogo,
  },
  {
    name: "Shree Lifecare",
    logo: shreeLifecareLogo,
  },
  {
    name: "Shree Hospital",
    logo: shreeHospitalLogo,
  },
  {
    name: "Sardar",
    logo: sardarLogo,
  },
  {
    name: "Shomeshwar Bhel",
    logo: shomeshwarBhelLogo,
  },
  {
    name: "Gurudatta Wadapav",
    logo: gurudattaWadapavLogo,
  },
  {
    name: "Serum",
    logo: serumLogo,
  },
  {
    name: "Axiss Health Club",
    logo: fitnessLogo,
  },
  {
    name: "Inigma Air",
    logo: inigmaAirLogo,
  },
];

export function ClientsPage() {
  const [clients, setClients] = useState<PublicClient[] | null>(null);

  useEffect(() => {
    fetchPublicClients()
      .then((items) => setClients(items))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <PageHero
        title="Our Clients"
        subtitle="Trusted by leading businesses, institutions and growing brands."
        breadcrumb={[{ label: "Clients" }]}
      />
      <section className="py-8 sm:py-10">
        <div className="container-page max-w-[1180px]">
          {clients === null || clients.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {clients !== null
                ? clients.map((client) => (
                    <a
                      key={client.id ?? client.name}
                      href={client.website_url || undefined}
                      className="group flex h-28 min-w-0 items-center justify-center rounded-lg border border-border bg-white p-4 text-center shadow-soft transition hover:-translate-y-1 hover:border-brand-red"
                      target={client.website_url ? "_blank" : undefined}
                      rel={client.website_url ? "noreferrer" : undefined}
                    >
                      {client.logo_url ? (
                        <img
                          src={assetUrl(client.logo_url)}
                          alt={client.name}
                          className="h-16 w-full max-w-[140px] object-contain"
                        />
                      ) : (
                        <span className="font-display text-lg font-black text-brand-dark transition group-hover:text-brand-red">
                          {client.name}
                        </span>
                      )}
                    </a>
                  ))
                : STATIC_CLIENTS.map((client) => (
                    <div
                      key={client.name}
                      className="group flex h-28 min-w-0 items-center justify-center rounded-lg border border-border bg-white p-4 text-center shadow-soft transition hover:-translate-y-1 hover:border-brand-red"
                    >
                      <img
                        src={client.logo}
                        alt={client.name}
                        className="h-16 w-full max-w-[140px] object-contain"
                      />
                    </div>
                  ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
