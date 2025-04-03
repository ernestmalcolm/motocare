"use client";

import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Stack,
  Group,
  Button,
} from "@mantine/core";
import { IconCar, IconBell, IconReceipt } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Title order={1}>Welcome to MotoCare</Title>

        {/* Quick Actions */}
        <Card withBorder p="md" radius="md">
          <Title order={3} mb="md">
            Quick Actions
          </Title>
          <Grid>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Link href="/garage" style={{ textDecoration: "none" }}>
                <Card withBorder p="md" radius="md">
                  <Stack align="center" gap="xs">
                    <IconCar size={32} />
                    <Text>Add Car</Text>
                  </Stack>
                </Card>
              </Link>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Link href="/reminders" style={{ textDecoration: "none" }}>
                <Card withBorder p="md" radius="md">
                  <Stack align="center" gap="xs">
                    <IconBell size={32} />
                    <Text>New Reminder</Text>
                  </Stack>
                </Card>
              </Link>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Link href="/expenses" style={{ textDecoration: "none" }}>
                <Card withBorder p="md" radius="md">
                  <Stack align="center" gap="xs">
                    <IconReceipt size={32} />
                    <Text>Log Expense</Text>
                  </Stack>
                </Card>
              </Link>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Welcome Message */}
        <Card withBorder p="md" radius="md">
          <Stack gap="md">
            <Title order={3}>Getting Started</Title>
            <Text>
              Welcome to MotoCare! This is your central hub for managing your
              vehicles. Here's what you can do:
            </Text>
            <Stack gap="xs">
              <Text>• Add your vehicles to your garage</Text>
              <Text>• Track maintenance and service records</Text>
              <Text>• Set up reminders for important dates</Text>
              <Text>• Monitor your expenses</Text>
            </Stack>
            <Group>
              <Button component={Link} href="/dashboard">
                Go to Dashboard
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
