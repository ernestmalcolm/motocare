"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  rem,
  Box,
  Paper,
  Divider,
  ThemeIcon,
  Card,
} from "@mantine/core";
import { IconCar, IconLock, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

const welcomeMessages = [
  "Log in. Take control. Drive smarter. 🔐🚗",
  "Your garage called — it missed you. 📞🏠",
  "Car chaos? Not in here. 🧠🛠️",
  "One login away from car peace of mind. 🧘‍♂️🚘",
  "Welcome back, road boss. Let's get to it. 😎🛣️",
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Set random welcome message only on client-side
    setWelcomeMessage(
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    );
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        notifications.show({
          title: "Success!",
          message: "You have been signed in successfully.",
          color: "green",
        });

        // Force a hard refresh to ensure cookies are set
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Error:", error);
      notifications.show({
        title: "Error",
        message: "Failed to sign in. Please check your credentials.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f6f8fc 0%, #e9f0f7 100%)",
      }}
    >
      <Container size="lg" h="100vh">
        <Group h="100%" align="center" justify="center">
          <Paper
            radius="xl"
            p="xl"
            w="100%"
            maw={500}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack gap="xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Group gap="xs" justify="center" mb="md">
                  <Link
                    href="/"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Group gap="xs">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="gradient"
                        gradient={{ from: "blue", to: "cyan" }}
                      >
                        <IconCar size={24} />
                      </ThemeIcon>
                      <Text
                        size="xl"
                        fw={700}
                        style={{ letterSpacing: "-0.5px" }}
                      >
                        MotoCare
                      </Text>
                    </Group>
                  </Link>
                </Group>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={welcomeMessage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Text ta="center" size="lg" fw={500} mb="xs">
                      {welcomeMessage}
                    </Text>
                  </motion.div>
                </AnimatePresence>
                <Text ta="center" c="dimmed" size="sm">
                  Sign in to your account to continue
                </Text>
              </motion.div>

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <TextInput
                      label="Email"
                      placeholder="your@email.com"
                      leftSection={<IconMail size={16} />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <PasswordInput
                      label="Password"
                      placeholder="Your password"
                      leftSection={<IconLock size={16} />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      loading={loading}
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
                      Sign In
                    </Button>
                  </motion.div>
                </Stack>
              </form>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Divider
                  label="Don't have an account?"
                  labelPosition="center"
                  my="lg"
                />
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="light"
                  fullWidth
                  size="md"
                  style={{
                    border: "1px solid rgba(34, 139, 230, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      background: "rgba(34, 139, 230, 0.05)",
                    },
                  }}
                >
                  Create Account
                </Button>
              </motion.div>
            </Stack>
          </Paper>
        </Group>
      </Container>
    </Box>
  );
}
