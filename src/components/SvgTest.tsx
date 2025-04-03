import { Box, Chip, Group } from "@mantine/core";
import { IconCar } from "@tabler/icons-react";

export function SvgTest() {
  return (
    <Box p={20}>
      <Group>
        <Chip
          size="xl"
          style={{
            height: "auto",
            padding: "12px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <IconCar size={40} style={{ color: "#666" }} />
        </Chip>

        <Chip
          size="xl"
          style={{
            height: "auto",
            padding: "12px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <img
            src="/car-brands/BMW-Logo.wine.svg"
            alt="BMW"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
              filter: "grayscale(100%) brightness(0.7)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "grayscale(0%) brightness(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "grayscale(100%) brightness(0.7)";
            }}
          />
        </Chip>
      </Group>
    </Box>
  );
}
