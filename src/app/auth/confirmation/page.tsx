"use client";

import { Container, Paper, Title, Text, Button, Stack, ThemeIcon } from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Container size={420} my={40}>
      <Stack align="center" gap="xl">
        <ThemeIcon
          size={80}
          radius="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
        >
          <IconMail size={40} />
        </ThemeIcon>

        <Title order={2} ta="center">
          Check Your Email
        </Title>

        <Paper p="xl" radius="md" withBorder style={{ width: "100%" }}>
          <Stack gap="md">
            <Text ta="center" c="dimmed">
              We've sent a confirmation email to:
            </Text>
            {email && (
              <Text ta="center" fw={600} size="lg">
                {email}
              </Text>
            )}
            <Text ta="center" c="dimmed" size="sm">
              Please click the confirmation link in the email to activate your account.
            </Text>

            <Stack gap="xs" mt="md">
              <Text size="sm" c="dimmed" ta="center">
                Didn't receive the email?
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                • Check your spam folder
                <br />
                • Make sure you entered the correct email address
                <br />
                • Wait a few minutes and try again
              </Text>
            </Stack>

            <Button
              component={Link}
              href="/auth/signin"
              variant="light"
              fullWidth
              mt="md"
            >
              Back to Sign In
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <Container size={420} my={40}>
        <Stack align="center" gap="xl">
          <ThemeIcon
            size={80}
            radius="xl"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
          >
            <IconMail size={40} />
          </ThemeIcon>
          <Title order={2} ta="center">
            Check Your Email
          </Title>
          <Text ta="center" c="dimmed">
            Loading...
          </Text>
        </Stack>
      </Container>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
