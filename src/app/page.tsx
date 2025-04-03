"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  rem,
  Box,
  Grid,
  Card,
  ThemeIcon,
  Badge,
  BackgroundImage,
  Overlay,
  Paper,
  Divider,
  useMantineTheme,
  Switch,
  Chip,
  Avatar,
} from "@mantine/core";
import {
  IconCar,
  IconBell,
  IconReceipt,
  IconTools,
  IconChartBar,
  IconAlertTriangle,
  IconCalendar,
  IconWallet,
  IconGauge,
  IconCheck,
  IconArrowRight,
  IconShieldCheck,
  IconClock,
  IconChartPie,
  IconStar,
  IconBulb,
} from "@tabler/icons-react";
import Link from "next/link";
import { LandingNavbar } from "@/components/LandingNavbar";
import { CarBrandMarquee } from "@/components/CarBrandMarquee";
import Image from "next/image";

const features = [
  {
    icon: IconCar,
    title: "Vehicle Management",
    description:
      "Track all your vehicles in one place with detailed maintenance history and service records.",
    color: "blue",
    gradient: { from: "blue", to: "cyan" },
  },
  {
    icon: IconBell,
    title: "Smart Reminders",
    description:
      "Never miss a service with automated reminders for maintenance, inspections, and renewals.",
    color: "green",
    gradient: { from: "green", to: "teal" },
  },
  {
    icon: IconReceipt,
    title: "Expense Tracking",
    description:
      "Keep track of all your vehicle-related expenses and generate detailed reports.",
    color: "violet",
    gradient: { from: "violet", to: "grape" },
  },
  {
    icon: IconTools,
    title: "Maintenance Records",
    description:
      "Comprehensive maintenance history with detailed service records and cost tracking.",
    color: "yellow",
    gradient: { from: "yellow", to: "orange" },
  },
  {
    icon: IconChartBar,
    title: "Health Analytics",
    description:
      "Monitor your vehicle's health with detailed analytics and performance metrics.",
    color: "red",
    gradient: { from: "red", to: "pink" },
  },
  {
    icon: IconCalendar,
    title: "Service Scheduling",
    description:
      "Plan and schedule upcoming services with our intuitive calendar system.",
    color: "teal",
    gradient: { from: "teal", to: "cyan" },
  },
];

const benefits = [
  {
    icon: IconShieldCheck,
    title: "Reliable",
    description: "Built with industry best practices and security standards",
  },
  {
    icon: IconClock,
    title: "Time-Saving",
    description: "Automate your vehicle maintenance tasks and save time",
  },
  {
    icon: IconChartPie,
    title: "Data-Driven",
    description: "Make informed decisions with comprehensive analytics",
  },
];

const testimonials = [
  {
    quote:
      "MotoCare has completely transformed how I manage my fleet of vehicles.",
    author: "John Smith",
    role: "Fleet Manager",
  },
  {
    quote: "The smart reminders have saved me thousands in maintenance costs.",
    author: "Sarah Johnson",
    role: "Business Owner",
  },
  {
    quote:
      "Best vehicle management solution I've ever used. Simple yet powerful.",
    author: "Mike Wilson",
    role: "Car Enthusiast",
  },
];

const carTips = [
  "Wash your car regularly to protect the paint from dirt, salt, and grime buildup.",
  "Wax your vehicle every few months to keep it shiny and shield it from the elements.",
  "Check tire pressure monthly – underinflated tires wear faster and waste fuel.",
  "Rotate your tires every 8,000–10,000 km to ensure even wear.",
  "Change your oil on time – it's the lifeblood of your engine.",
  "Replace windshield wipers once or twice a year for clear visibility.",
  "Top up washer fluid and keep the windshield clean for safe driving.",
  "Inspect brakes regularly – squeaky or slow braking needs immediate attention.",
  "Keep your battery terminals clean to avoid starting issues.",
  "Don't ignore dashboard warning lights – they're early alarms.",
  "Drive smoothly – aggressive driving wears out your car faster.",
  "Use the right fuel type – check your owner's manual to avoid engine problems.",
  "Avoid driving on empty – low fuel can damage your fuel pump.",
  "Don't overload your car – too much weight stresses your engine and suspension.",
  "Check all lights monthly – brake lights, turn signals, and headlights.",
  "Service your air conditioning system annually to keep it blowing cold.",
  "Change air filters regularly – both cabin and engine filters.",
  "Park in the shade to protect your paint and interior from sun damage.",
  "Use sunshades inside the car to reduce heat and protect your dashboard.",
  "Keep a basic emergency kit – jumper cables, flashlight, first-aid, and water.",
  "Check your insurance policy annually – you might be overpaying or under-covered.",
  "Take pictures of your car regularly for insurance records.",
  "Review your vehicle registration and renewals before they expire.",
  "Always carry a spare tire and tools for emergencies.",
  "Stay on top of recalls – check your VIN occasionally for safety updates.",
  "Avoid potholes when possible – they can cause costly suspension damage.",
  "Warm up your engine for a minute before driving off (especially in cold weather).",
  "Keep your car interior clean – it improves resale value and driving comfort.",
  "Record your maintenance history – helps with resale and routine care.",
  "Treat your car like a friend – listen to the little signs before they become big problems.",
];

function useShuffleTips(interval = 5000) {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % carTips.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return currentTip;
}

export default function LandingPage() {
  const theme = useMantineTheme();
  const [pricing, setPricing] = useState("monthly");
  const currentTipIndex = useShuffleTips();

  useEffect(() => {
    const sections = document.querySelectorAll("[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) {
              window.history.replaceState(null, "", `#${id}`);
            }
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px", // Trigger when section is in middle of viewport
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <Box>
      <LandingNavbar />

      {/* Hero Section */}
      <Box
        id="home"
        h={{ base: "100vh", md: "100vh" }}
        pt={{ base: rem(100), md: rem(80) }}
        pb={{ base: rem(60), md: rem(0) }}
        style={{
          background: "linear-gradient(135deg, #f6f8fc 0%, #e9f0f7 100%)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(34, 139, 230, 0.1) 0%, transparent 70%)",
          }}
        />
        <Container size="lg" style={{ flex: 1 }}>
          <Grid h="100%" align="center" gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ margin: "-100px" }}
                >
                  <Badge
                    size="lg"
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    mb="md"
                  >
                    Your Vehicle Management Solution
                  </Badge>
                  <Title
                    order={1}
                    size="xl"
                    style={{
                      lineHeight: 1.2,
                      fontSize: rem(36),
                      "@media (minWidth: 768px)": {
                        fontSize: rem(64),
                      },
                    }}
                    mb="md"
                  >
                    Take Control of Your{" "}
                    <Text
                      component="span"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                      style={{
                        fontWeight: 800,
                        fontSize: rem(36),
                        "@media (minWidth: 768px)": {
                          fontSize: rem(64),
                        },
                      }}
                    >
                      Vehicle Care
                    </Text>
                  </Title>
                  <Text
                    size="md"
                    c="dimmed"
                    maw={500}
                    style={{
                      "@media (minWidth: 768px)": {
                        fontSize: rem(18),
                      },
                    }}
                  >
                    Streamline your vehicle maintenance, track expenses, and
                    never miss a service with our comprehensive management
                    platform.
                  </Text>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ margin: "-100px" }}
                >
                  <Group gap="md" wrap="wrap">
                    <Button
                      size="lg"
                      component={Link}
                      href="/auth/signup"
                      rightSection={<IconArrowRight size={16} />}
                      style={{
                        background:
                          "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                        boxShadow: "0 4px 12px rgba(34, 139, 230, 0.3)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 16px rgba(34, 139, 230, 0.4)",
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      size="lg"
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
                  </Group>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Group gap="xl" wrap="wrap">
                    {benefits.map((benefit) => (
                      <Group key={benefit.title} gap="xs">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant="light"
                          color="blue"
                        >
                          <benefit.icon size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>
                          {benefit.title}
                        </Text>
                      </Group>
                    ))}
                  </Group>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Stack gap="xl" mt="xl">
                    <Box>
                      <Group gap="xl" align="center" wrap="nowrap">
                        <IconBulb
                          size={40}
                          style={{
                            color: "#fbbf24",
                            strokeWidth: 1.5,
                            stroke: "currentColor",
                          }}
                        />
                        <Box style={{ flex: 1 }}>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentTipIndex}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Text
                                size="sm"
                                style={{
                                  lineHeight: 1.5,
                                  background:
                                    "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  fontWeight: 500,
                                  "@media (minWidth: 768px)": {
                                    fontSize: rem(16),
                                  },
                                }}
                              >
                                {carTips[currentTipIndex]}
                              </Text>
                            </motion.div>
                          </AnimatePresence>
                        </Box>
                      </Group>
                    </Box>
                  </Stack>
                </motion.div>
              </Stack>
            </Grid.Col>

            <Grid.Col
              span={{ base: 12, md: 6 }}
              display={{ base: "none", md: "block" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ margin: "-100px" }}
              >
                <Box
                  h={{ base: rem(300), md: rem(400) }}
                  style={{
                    position: "relative",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)",
                    borderRadius: rem(20),
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 40px rgba(34, 139, 230, 0.3)",
                    },
                  }}
                >
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(34, 139, 230, 0.1) 0%, transparent 70%)",
                      borderRadius: rem(20),
                    }}
                  />
                  <Stack p="xl" h="100%" justify="center">
                    <Title
                      order={3}
                      mb="md"
                      style={{
                        background:
                          "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: 800,
                      }}
                    >
                      Why Choose MotoCare?
                    </Title>
                    <Stack gap="md">
                      {features.slice(0, 3).map((feature) => (
                        <Stack key={feature.title} gap="xs">
                          <Group gap="md" align="center">
                            <ThemeIcon
                              size="lg"
                              radius="md"
                              variant="gradient"
                              gradient={feature.gradient}
                              style={{
                                boxShadow: `0 4px 12px ${
                                  theme.colors[feature.color][5]
                                }`,
                              }}
                            >
                              <feature.icon size={20} />
                            </ThemeIcon>
                            <Text
                              fw={600}
                              size="lg"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  theme.colors[feature.color][6]
                                } 0%, ${theme.colors[feature.color][8]} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              {feature.title}
                            </Text>
                          </Group>
                          <Text size="sm" c="dimmed">
                            {feature.description}
                          </Text>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Box>
              </motion.div>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* About Us Section */}
      <Box id="about" py={rem(80)}>
        <Container size="lg">
          <Grid gutter="xl" align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ margin: "-100px" }}
              >
                <Stack gap="xl">
                  <Badge
                    size="lg"
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    w="fit-content"
                  >
                    Our Story
                  </Badge>
                  <Title order={2} size={rem(40)}>
                    Born from a{" "}
                    <Text
                      component="span"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                      style={{ fontWeight: 800 }}
                      size={rem(40)}
                    >
                      Car Enthusiast's
                    </Text>{" "}
                    Struggle
                  </Title>
                  <Text size="lg" c="dimmed">
                    Meet Epiphania, a passionate car enthusiast who loved her
                    vehicles but struggled with the chaos of maintenance
                    management. Her garage was home to three cherished cars,
                    each with its own maintenance schedule, service history, and
                    growing pile of receipts.
                  </Text>
                  <Text size="lg" c="dimmed">
                    The breaking point came when her prized Mercedes developed
                    major gearbox issues. She had completely forgotten about the
                    transmission fluid change that was due six months ago. The
                    repair cost her a fortune, and as she sat in the mechanic's
                    waiting room, she wished there was a better way to manage
                    vehicle maintenance - a digital platform that would keep
                    track of everything, from routine oil changes to major
                    service intervals, making it as simple as checking your
                    phone.
                  </Text>
                </Stack>
              </motion.div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ margin: "-100px" }}
              >
                <Box
                  h={{ base: 500, md: 450 }}
                  style={{
                    position: "relative",
                    background:
                      "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                    borderRadius: rem(20),
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    }}
                  />
                  <Stack
                    p={{ base: "md", md: "xs" }}
                    h="100%"
                    justify="center"
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <Paper
                      radius="md"
                      p={{ base: "md", md: "xs" }}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack gap="md">
                        <Group gap="xs">
                          <Text size="sm" style={{ color: "white" }} fw={500}>
                            🫠 The Challenge
                          </Text>
                        </Group>
                        <Text style={{ color: "white" }}>
                          "I was spending hours organizing receipts, trying to
                          remember service dates, and constantly worrying about
                          missing important maintenance. There had to be a
                          better way."
                        </Text>
                      </Stack>
                    </Paper>

                    <Paper
                      radius="md"
                      p={{ base: "md", md: "xs" }}
                      mt={{ base: 30, md: 15 }}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Stack gap="md">
                        <Group gap="xs">
                          <Text size="sm" style={{ color: "white" }} fw={500}>
                            🤔 The Vision
                          </Text>
                        </Group>
                        <Text style={{ color: "white" }}>
                          "Their wish is to have a digital platform that brings
                          all vehicle maintenance needs together - from
                          scheduling services to tracking expenses, making it as
                          simple as checking your phone."
                        </Text>
                      </Stack>
                    </Paper>
                  </Stack>
                </Box>
              </motion.div>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Car Brands Marquee */}
      <Box id="brands">
        <CarBrandMarquee />
      </Box>

      {/* Features Section */}
      <Box id="features" py={rem(80)} bg="gray.0">
        <Container size="lg">
          <Stack gap="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ margin: "-100px" }}
            >
              <Title order={2} ta="center" mb="xl">
                Everything You Need to Manage Your Vehicles
              </Title>
              <Text ta="center" c="dimmed" size="lg" maw={600} mx="auto">
                Comprehensive tools and features to keep your vehicles in
                perfect condition and your expenses under control.
              </Text>
            </motion.div>

            <Grid gutter="xl">
              {features.map((feature, index) => (
                <Grid.Col key={feature.title} span={{ base: 12, sm: 6, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ margin: "-100px" }}
                    style={{ height: "100%" }}
                  >
                    <Card
                      withBorder
                      radius="lg"
                      p="xl"
                      style={{
                        height: "100%",
                        background: `linear-gradient(135deg, ${
                          theme.colors[feature.color][6]
                        } 0%, ${theme.colors[feature.color][8]} 100%)`,
                        color: "white",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = `0 12px 24px ${
                          theme.colors[feature.color][5]
                        }`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Stack gap="md" h="100%">
                        <ThemeIcon
                          size={50}
                          radius="md"
                          variant="filled"
                          color="white"
                          style={{
                            background: "rgba(255, 255, 255, 0.15)",
                            backdropFilter: "blur(8px)",
                            WebkitBackdropFilter: "blur(8px)",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <feature.icon size={30} />
                        </ThemeIcon>

                        <Title order={3} style={{ color: "white" }}>
                          {feature.title}
                        </Title>

                        <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                          {feature.description}
                        </Text>
                      </Stack>
                    </Card>
                  </motion.div>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" py={rem(80)} bg="gray.0">
        <Container size="lg">
          <Stack gap="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ margin: "-100px" }}
            >
              <Title order={2} ta="center" mb="xl">
                Simple, Transparent Pricing
              </Title>
              <Text ta="center" c="dimmed" size="lg" maw={600} mx="auto">
                Choose your preferred payment schedule. All features included.
              </Text>
            </motion.div>

            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: rem(40),
              }}
            >
              <Group gap="md">
                <Text size="sm" fw={500}>
                  Monthly
                </Text>
                <Switch
                  size="md"
                  radius="xl"
                  color="blue"
                  onChange={(event) => {
                    const isAnnual = event.currentTarget.checked;
                    setPricing(isAnnual ? "annual" : "monthly");
                  }}
                  checked={pricing === "annual"}
                />
                <Text size="sm" fw={500}>
                  Annual
                </Text>
                <Badge color="green" variant="light">
                  Save 8%
                </Badge>
              </Group>
            </Box>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ margin: "-100px" }}
            >
              <Card
                withBorder
                radius="lg"
                p="xl"
                style={{
                  background:
                    "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(34, 139, 230, 0.3)",
                  },
                }}
              >
                <Stack gap="xl">
                  <Box>
                    <Title order={3} style={{ color: "white" }} mb="xs">
                      Complete Vehicle Management
                    </Title>
                    <Text style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                      All features included in one simple plan
                    </Text>
                  </Box>

                  <Box>
                    <Group gap="xs" align="baseline">
                      <Text
                        size={rem(48)}
                        fw={700}
                        style={{ lineHeight: 1, color: "white" }}
                      >
                        Tsh {pricing === "monthly" ? "2,000" : "22,000"}
                      </Text>
                      <Text
                        size="sm"
                        style={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        /{pricing === "monthly" ? "month" : "year"}
                      </Text>
                    </Group>
                    {pricing === "annual" && (
                      <Text
                        size="sm"
                        style={{ color: "rgba(255, 255, 255, 0.8)" }}
                        mt="xs"
                      >
                        Save Tsh 2,000 annually
                      </Text>
                    )}
                  </Box>

                  <Stack gap="md">
                    {[
                      "Vehicle management & tracking",
                      "Smart maintenance reminders",
                      "Expense tracking & reports",
                      "Maintenance history records",
                      "Health analytics dashboard",
                      "Service scheduling system",
                    ].map((feature) => (
                      <Group key={feature} gap="sm">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          variant="filled"
                          color="white"
                          style={{ background: "rgba(255, 255, 255, 0.2)" }}
                        >
                          <IconCheck size={14} />
                        </ThemeIcon>
                        <Text size="sm" style={{ color: "white" }}>
                          {feature}
                        </Text>
                      </Group>
                    ))}
                  </Stack>

                  <Button
                    size="lg"
                    component={Link}
                    href="/auth/signup"
                    variant="filled"
                    color="white"
                    fullWidth
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Stack>
              </Card>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box id="testimonials" py={rem(80)}>
        <Container size="lg">
          <Stack gap="xl">
            <Stack gap="md" ta="center">
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                w="fit-content"
                mx="auto"
              >
                Testimonials
              </Badge>
              <Title order={2} size={rem(40)}>
                What Our{" "}
                <Text
                  component="span"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                  style={{ fontWeight: 800 }}
                  size={rem(40)}
                >
                  Users
                </Text>{" "}
                Say
              </Title>
            </Stack>

            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ margin: "-100px" }}
                >
                  <Paper
                    radius="md"
                    p="xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                      color: "white",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(34, 139, 230, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Stack gap="md">
                      <Group gap="md">
                        <Avatar
                          size="lg"
                          radius="xl"
                          color="white"
                          style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                        >
                          HU
                        </Avatar>
                        <Stack gap={0}>
                          <Text fw={600} size="lg">
                            Hashim Udoddy
                          </Text>
                          <Text size="sm" style={{ opacity: 0.8 }}>
                            Young Entrepreneur ~ Probox
                          </Text>
                        </Stack>
                      </Group>
                      <Text size="lg" style={{ fontStyle: "italic" }}>
                        "As a young entrepreneur with multiple vehicles,
                        MotoCare has been a game-changer. It helps me stay on
                        top of maintenance schedules without the stress."
                      </Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ margin: "-100px" }}
                >
                  <Paper
                    radius="md"
                    p="xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                      color: "white",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(34, 139, 230, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Stack gap="md">
                      <Group gap="md">
                        <Avatar
                          size="lg"
                          radius="xl"
                          color="white"
                          style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                        >
                          JC
                        </Avatar>
                        <Stack gap={0}>
                          <Text fw={600} size="lg">
                            Jordan Corleone
                          </Text>
                          <Text size="sm" style={{ opacity: 0.8 }}>
                            Logistics Professional ~ Rumion
                          </Text>
                        </Stack>
                      </Group>
                      <Text size="lg" style={{ fontStyle: "italic" }}>
                        "The analytics and tracking features are exactly what I
                        needed. It's like having a personal car manager in your
                        pocket."
                      </Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ margin: "-100px" }}
                >
                  <Paper
                    radius="md"
                    p="xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                      color: "white",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(34, 139, 230, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Stack gap="md">
                      <Group gap="md">
                        <Avatar
                          size="lg"
                          radius="xl"
                          color="white"
                          style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                        >
                          BA
                        </Avatar>
                        <Stack gap={0}>
                          <Text fw={600} size="lg">
                            Benson Atieno
                          </Text>
                          <Text size="sm" style={{ opacity: 0.8 }}>
                            Tech Professional ~ Rav4
                          </Text>
                        </Stack>
                      </Group>
                      <Text size="lg" style={{ fontStyle: "italic" }}>
                        "The maintenance reminders have saved me from costly
                        repairs. It's like having a personal mechanic who's
                        always looking out for your car."
                      </Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ margin: "-100px" }}
                >
                  <Paper
                    radius="md"
                    p="xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                      color: "white",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(34, 139, 230, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Stack gap="md">
                      <Group gap="md">
                        <Avatar
                          size="lg"
                          radius="xl"
                          color="white"
                          style={{ border: "2px solid rgba(255,255,255,0.3)" }}
                        >
                          HA
                        </Avatar>
                        <Stack gap={0}>
                          <Text fw={600} size="lg">
                            Harun Abi
                          </Text>
                          <Text size="sm" style={{ opacity: 0.8 }}>
                            Software Engineer ~ Picnic
                          </Text>
                        </Stack>
                      </Group>
                      <Text size="lg" style={{ fontStyle: "italic" }}>
                        "Whether I'm on a road trip or just commuting, MotoCare
                        keeps me informed about my vehicle's health. It's peace
                        of mind in an app."
                      </Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        id="cta"
        py={rem(80)}
        style={{
          background: "linear-gradient(135deg, #f6f8fc 0%, #e9f0f7 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(34, 139, 230, 0.1) 0%, transparent 70%)",
          }}
        />
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 0% 0%, rgba(21, 170, 191, 0.1) 0%, transparent 50%)",
          }}
        />
        <Container size="lg" style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px" }}
          >
            <Paper
              radius="xl"
              p="xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Stack gap="xl" align="center">
                <Badge
                  size="lg"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                  w="fit-content"
                >
                  Get Started Today
                </Badge>
                <Title order={2} ta="center" size={rem(40)}>
                  Ready to Transform Your{" "}
                  <Text
                    component="span"
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    style={{ fontWeight: 800 }}
                    size={rem(40)}
                  >
                    Vehicle Management
                  </Text>
                  ?
                </Title>
                <Text ta="center" c="dimmed" size="lg" maw={600}>
                  Join thousands of satisfied users who have simplified their
                  vehicle maintenance with MotoCare.
                </Text>
                <Group gap="md">
                  <Button
                    size="lg"
                    component={Link}
                    href="/auth/signup"
                    rightSection={<IconArrowRight size={16} />}
                    style={{
                      background:
                        "linear-gradient(135deg, #228be6 0%, #15aabf 100%)",
                      boxShadow: "0 4px 12px rgba(34, 139, 230, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(34, 139, 230, 0.4)",
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
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
                </Group>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box
        py={rem(60)}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(34, 139, 230, 0.15) 0%, transparent 70%)",
          }}
        />
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 0% 0%, rgba(21, 170, 191, 0.1) 0%, transparent 50%)",
          }}
        />
        <Container size="lg" style={{ position: "relative", zIndex: 1 }}>
          <Grid
            gutter="xl"
            align="flex-start"
            style={{ marginBottom: rem(40) }}
          >
            <Grid.Col span={{ base: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ margin: "-100px" }}
              >
                <Stack gap="md">
                  <Title
                    order={3}
                    style={{
                      color: "white",
                      background:
                        "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                      fontSize: rem(32),
                    }}
                  >
                    MotoCare
                  </Title>
                  <Text size="sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    From Epiphania's wish to save her Mercedes, to helping
                    thousands of car enthusiasts manage their vehicles better.
                    Her vision of stress-free car maintenance is now a reality,
                    and she probably saved enough to buy a new Merc! 🚗✨
                  </Text>
                </Stack>
              </motion.div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ margin: "-100px" }}
              >
                <Stack gap="md">
                  <Title
                    order={4}
                    style={{
                      color: "white",
                      background:
                        "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                    }}
                  >
                    Quick Links
                  </Title>
                  <Stack gap="xs">
                    {[
                      { label: "About", href: "#about" },
                      { label: "Features", href: "#features" },
                      { label: "Pricing", href: "#pricing" },
                      { label: "Testimonials", href: "#testimonials" },
                    ].map((link) => (
                      <Box
                        key={link.label}
                        component={Link}
                        href={link.href}
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          textDecoration: "none",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)";
                          e.currentTarget.style.webkitBackgroundClip = "text";
                          e.currentTarget.style.webkitTextFillColor =
                            "transparent";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.textShadow =
                            "0 0 8px rgba(96, 165, 250, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.webkitBackgroundClip =
                            "initial";
                          e.currentTarget.style.webkitTextFillColor = "initial";
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.textShadow = "none";
                          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                        }}
                      >
                        {link.label}
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </motion.div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ margin: "-100px" }}
              >
                <Stack gap="md">
                  <Title
                    order={4}
                    style={{
                      color: "white",
                      background:
                        "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: 800,
                    }}
                  >
                    Car Care Tips
                  </Title>
                  <Stack gap="xs">
                    {[
                      "A well-maintained car is a happy car. Regular check-ups are like giving your vehicle a spa day.",
                      "Your car speaks to you - listen to its whispers before they become screams.",
                      "Prevention is better than cure, especially when it comes to your car's health.",
                    ].map((tip, index) => (
                      <Box
                        key={index}
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)";
                          e.currentTarget.style.webkitBackgroundClip = "text";
                          e.currentTarget.style.webkitTextFillColor =
                            "transparent";
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.textShadow =
                            "0 0 8px rgba(96, 165, 250, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.webkitBackgroundClip =
                            "initial";
                          e.currentTarget.style.webkitTextFillColor = "initial";
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.textShadow = "none";
                          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                        }}
                      >
                        {tip}
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </motion.div>
            </Grid.Col>
          </Grid>

          <Divider
            my="xl"
            style={{
              borderColor: "rgba(255,255,255,0.1)",
              background:
                "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.2), transparent)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ margin: "100px" }}
          >
            <Text
              size="sm"
              style={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                background: "linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              © {new Date().getFullYear()} MotoCare. All rights reserved.
            </Text>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
