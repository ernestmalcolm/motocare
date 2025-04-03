"use client";

import { useEffect, useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Button,
  Avatar,
  Menu,
  Text,
  rem,
  UnstyledButton,
  Stack,
  Divider,
  Tooltip,
  Badge,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconHome,
  IconCar,
  IconBell,
  IconReceipt,
  IconUser,
  IconLogout,
  IconTools,
  IconSettings,
  IconHelp,
  IconDashboard,
  IconChartBar,
  IconReport,
  IconBellRinging,
  IconCarSuv,
  IconWallet,
  IconChevronDown,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { notifications } from "@mantine/notifications";

const mainNavItems = [
  { icon: IconDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: IconCarSuv, label: "My Garage", href: "/garage" },
  { icon: IconTools, label: "Maintenance", href: "/maintenance" },
  { icon: IconBellRinging, label: "Reminders", href: "/reminders" },
  { icon: IconWallet, label: "Expenses", href: "/expenses" },
];

const secondaryNavItems = [
  { icon: IconChartBar, label: "Analytics", href: "/analytics" },
  { icon: IconReport, label: "Reports", href: "/reports" },
  { icon: IconSettings, label: "Settings", href: "/settings" },
  { icon: IconHelp, label: "Help & Support", href: "/help" },
];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const theme = useMantineTheme();

  useEffect(() => {
    const getUser = async () => {
      try {
        // First, try to get the session from localStorage
        const sessionStr = localStorage.getItem(
          "sb-trtlsmrbrrytlgrdptrf-auth-token"
        );

        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (session?.user) {
              setUser(session.user);
              return;
            }
          } catch (e) {
            console.error("Error parsing session:", e);
          }
        }

        // If no session in localStorage, try to get it from Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      return;
    }
    router.push("/auth/signin");
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-body)",
        },
        navbar: {
          borderRight: "1px solid var(--mantine-color-gray-2)",
          backgroundColor: "var(--mantine-color-body)",
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
          </Group>

          <Group
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <ThemeIcon
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              <IconCar size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} style={{ letterSpacing: "-0.5px" }}>
              MotoCare
            </Text>
          </Group>

          <Group>
            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton
                  className="user-button"
                  style={{
                    padding: "4px 8px",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-gray-0)",
                    },
                  }}
                >
                  <Group>
                    <Avatar
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.email ?? ""}
                      radius="xl"
                      size={32}
                      color="blue"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                    />
                    <Stack gap={0} style={{ flex: 1 }} visibleFrom="sm">
                      <Text
                        size="sm"
                        fw={700}
                        lineClamp={1}
                        style={{
                          letterSpacing: "-0.3px",
                          color: "var(--mantine-color-gray-8)",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {user?.user_metadata?.full_name || "User"}
                      </Text>
                      <Text
                        size="xs"
                        c="dimmed"
                        lineClamp={1}
                        style={{
                          transition: "color 0.2s ease",
                        }}
                      >
                        {user?.email}
                      </Text>
                    </Stack>
                    <ThemeIcon
                      size="sm"
                      variant="light"
                      color="gray"
                      style={{
                        transition: "transform 0.2s ease",
                      }}
                      visibleFrom="sm"
                    >
                      <IconChevronDown size={14} />
                    </ThemeIcon>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={
                    <Avatar
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.email ?? ""}
                      radius="xl"
                      size={24}
                      color="blue"
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                    />
                  }
                  disabled
                >
                  <Stack gap={0}>
                    <Text size="sm" fw={700}>
                      {user?.user_metadata?.full_name || "User"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user?.email}
                    </Text>
                  </Stack>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={handleSignOut}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="xs" fw={500} c="dimmed" px="xs" mb="xs">
            MAIN NAVIGATION
          </Text>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              onClick={() => {
                if (opened) toggle();
              }}
              leftSection={
                <ThemeIcon
                  size="md"
                  radius="md"
                  variant={pathname === item.href ? "filled" : "light"}
                  color={pathname === item.href ? "blue" : "gray"}
                >
                  <item.icon size={18} />
                </ThemeIcon>
              }
              active={pathname === item.href}
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                  "&[dataActive='true']": {
                    backgroundColor: "var(--mantine-color-blue-0)",
                  },
                },
              }}
            />
          ))}

          <Divider my="xs" />

          <Text size="xs" fw={500} c="dimmed" px="xs" mb="xs">
            TOOLS & SETTINGS
          </Text>
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              label={item.label}
              onClick={() => {
                if (opened) toggle();
              }}
              leftSection={
                <ThemeIcon
                  size="md"
                  variant="light"
                  color="gray"
                  className="group-hover:text-blue-500 transition-colors"
                >
                  <item.icon size={18} />
                </ThemeIcon>
              }
              disabled
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              }}
              className="group"
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
