"use client";

import { Box, Container, SimpleGrid } from "@mantine/core";
import Image from "next/image";

const carBrands = [
  { name: "Toyota", logo: "/car-brands/toyota.svg" },
  { name: "Honda", logo: "/car-brands/honda.svg" },
  { name: "Ford", logo: "/car-brands/ford.svg" },
  { name: "BMW", logo: "/car-brands/bmw.svg" },
  { name: "Mercedes", logo: "/car-brands/mercedes.svg" },
  { name: "Audi", logo: "/car-brands/audi.svg" },
  { name: "Volvo", logo: "/car-brands/volvo.svg" },
  { name: "Suzuki", logo: "/car-brands/suzuki.svg" },
  { name: "Subaru", logo: "/car-brands/subaru.svg" },
  { name: "Rolls-Royce", logo: "/car-brands/rollsroyce.svg" },
  { name: "Porsche", logo: "/car-brands/porsche.svg" },
  { name: "Nissan", logo: "/car-brands/nissan.svg" },
  { name: "Mitsubishi", logo: "/car-brands/mitsubishi.svg" },
  { name: "Mazda", logo: "/car-brands/mazda.svg" },
  { name: "Lexus", logo: "/car-brands/lexus.svg" },
  { name: "Land Rover", logo: "/car-brands/landrover.svg" },
  { name: "Kia", logo: "/car-brands/kia.svg" },
  { name: "Infiniti", logo: "/car-brands/infiniti.svg" },
];

export function CarBrandMarquee() {
  return (
    <Box py={80}>
      <Container size="lg">
        <SimpleGrid
          cols={{ base: 2, sm: 3, md: 4, lg: 6 }}
          spacing="xl"
          verticalSpacing="xl"
        >
          {carBrands.map((brand) => (
            <Box
              key={brand.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                position: "relative",
                width: "100%",
                height: "100px",
                filter: "grayscale(100%) brightness(0.7)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "grayscale(0%) brightness(1)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter =
                  "grayscale(100%) brightness(0.7)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "contain",
                }}
                priority
              />
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
