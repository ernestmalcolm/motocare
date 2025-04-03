"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Group,
  Button,
  Text,
  rem,
  Box,
  ThemeIcon,
  Burger,
  Drawer,
  Stack,
  UnstyledButton,
  useMantineTheme,
  ActionIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCar, IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
];

export function LandingNavbar() {
  const [opened, setOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useMantineTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const handleNavClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    href: string
  ) => {
    e.preventDefault();

    // Close menu on mobile
    if (isMobile && opened) {
      setOpened(false);
    }

    // Get the target element
    const element = document.querySelector(href);
    if (element) {
      // Get the element's position
      const rect = element.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop - 80; // 80px offset for header

      // Wait a bit before scrolling
      setTimeout(() => {
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(255, 255, 255, 0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? `1px solid ${theme.colors.gray[2]}` : "none",
      }}
    >
      <Container size="lg" py="md">
        <Group justify="space-between" align="center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Group gap="xs">
              <ThemeIcon
                size="lg"
                radius="md"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
              >
                <IconCar size={24} />
              </ThemeIcon>
              <Text
                size="xl"
                fw={700}
                component={Link}
                href="/"
                style={{
                  textDecoration: "none",
                  background:
                    "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                MotoCare
              </Text>
            </Group>
          </motion.div>

          <Group gap="xl" visibleFrom="sm">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <UnstyledButton
                onClick={(e) => handleNavClick(e, "#about")}
                style={{
                  textDecoration: "none",
                  color: theme.colors.gray[7],
                  fontWeight: 500,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    width: "0%",
                    height: 2,
                    background:
                      "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                    transition: "width 0.2s ease",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                About
              </UnstyledButton>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <UnstyledButton
                onClick={(e) => handleNavClick(e, "#features")}
                style={{
                  textDecoration: "none",
                  color: theme.colors.gray[7],
                  fontWeight: 500,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    width: "0%",
                    height: 2,
                    background:
                      "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                    transition: "width 0.2s ease",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                Features
              </UnstyledButton>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <UnstyledButton
                onClick={(e) => handleNavClick(e, "#pricing")}
                style={{
                  textDecoration: "none",
                  color: theme.colors.gray[7],
                  fontWeight: 500,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    width: "0%",
                    height: 2,
                    background:
                      "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                    transition: "width 0.2s ease",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                Pricing
              </UnstyledButton>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <UnstyledButton
                onClick={(e) => handleNavClick(e, "#testimonials")}
                style={{
                  textDecoration: "none",
                  color: theme.colors.gray[7],
                  fontWeight: 500,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    width: "0%",
                    height: 2,
                    background:
                      "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                    transition: "width 0.2s ease",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                Testimonials
              </UnstyledButton>
            </motion.div>
          </Group>

          <Group gap="md">
            <Group visibleFrom="sm">
              <Button
                variant="light"
                component={Link}
                href="/auth/signin"
                style={{
                  border: "1px solid rgba(34, 139, 230, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    background: "rgba(34, 139, 230, 0.05)",
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                href="/auth/signup"
                style={{
                  background:
                    "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                }}
              >
                Get Started
              </Button>
            </Group>

            <Burger
              opened={opened}
              onClick={() => setOpened(!opened)}
              hiddenFrom="sm"
              size="sm"
              color={theme.colors.gray[6]}
            />
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        size="100%"
        padding="md"
        position="right"
        zIndex={1000000}
        withCloseButton={false}
      >
        <Stack gap="xl">
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon
                size="lg"
                radius="md"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
              >
                <IconCar size={24} />
              </ThemeIcon>
              <Text
                size="xl"
                fw={700}
                style={{
                  background:
                    "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                MotoCare
              </Text>
            </Group>
            <ActionIcon
              variant="light"
              size="lg"
              radius="md"
              onClick={() => setOpened(false)}
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>

          <Stack gap="md">
            {navItems.map((item) => (
              <UnstyledButton
                key={item.label}
                onClick={() => {
                  setOpened(false);
                  const element = document.querySelector(
                    item.href.replace("/", "")
                  );
                  if (element) {
                    const rect = element.getBoundingClientRect();
                    const scrollTop =
                      window.pageYOffset || document.documentElement.scrollTop;
                    const targetPosition = rect.top + scrollTop - 80;
                    window.scrollTo({
                      top: targetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                style={{
                  textDecoration: "none",
                  color: theme.colors.gray[7],
                  fontWeight: 500,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  "&:hover": {
                    backgroundColor: theme.colors.gray[0],
                  },
                }}
              >
                {item.label}
              </UnstyledButton>
            ))}
          </Stack>

          <Stack gap="md" mt="xl">
            <Button
              variant="light"
              component={Link}
              href="/auth/signin"
              fullWidth
              onClick={() => setOpened(false)}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              href="/auth/signup"
              fullWidth
              onClick={() => setOpened(false)}
              style={{
                background: "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </Box>
  );
}
