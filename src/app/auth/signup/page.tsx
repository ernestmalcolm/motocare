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
  Alert,
  PasswordInputProps,
  Card,
} from "@mantine/core";
import {
  IconCar,
  IconLock,
  IconMail,
  IconUser,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

const welcomeMessages = [
  "Start here. Your car's future self will thank you. 🛠️📅",
  "Join the crew that actually remembers their last oil change. 😎🔧",
  "Sign up. Stay on top of the car stuff. Forget nothing. 🧠✅",
  "From your first log to your next road trip — let's go. 🛣️📲",
  "Car life, upgraded. It starts right here. 🚗✨",
];

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(welcomeMessages[0]);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkAuth();

    // Set random welcome message only on client-side
    setWelcomeMessage(
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
    );
  }, [router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            email_verified: false,
            phone_verified: false,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        notifications.show({
          title: "Success!",
          message: "Please check your email to confirm your account.",
          color: "green",
        });

        // Redirect to a confirmation page or show a message
        router.push("/auth/confirmation");
      } else {
        throw new Error("Failed to create account");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to sign up",
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
                  Create your account to get started
                </Text>
              </motion.div>

              <form onSubmit={handleSignUp}>
                <Stack gap="md">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <TextInput
                      label="Full Name"
                      placeholder="Your full name"
                      leftSection={<IconUser size={16} />}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={errors.fullName}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <TextInput
                      label="Email"
                      placeholder="your@email.com"
                      leftSection={<IconMail size={16} />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={errors.email}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <PasswordInput
                      label="Password"
                      placeholder="Create a password"
                      leftSection={<IconLock size={16} />}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={errors.password}
                      required
                      minLength={6}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      leftSection={<IconLock size={16} />}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
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
                      Create Account
                    </Button>
                  </motion.div>
                </Stack>
              </form>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Divider
                  label="Already have an account?"
                  labelPosition="center"
                  my="lg"
                />
                <Button
                  component={Link}
                  href="/auth/signin"
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
                  Sign In
                </Button>
              </motion.div>
            </Stack>
          </Paper>
        </Group>
      </Container>
    </Box>
  );
}
