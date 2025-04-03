"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Card,
  Group,
  Avatar,
  TextInput,
  Textarea,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata) {
        setFullName(session.user.user_metadata.full_name || "");
        setBio(session.user.user_metadata.bio || "");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata) {
        setFullName(session.user.user_metadata.full_name || "");
        setBio(session.user.user_metadata.bio || "");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          bio: bio,
        },
      });

      if (error) throw error;

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update profile. Please try again.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" gap="md">
          <Loader size="xl" />
          <Text>Loading profile...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1}>Profile</Title>

        <Card withBorder p="xl" radius="md">
          <Stack gap="xl">
            <Group>
              <Avatar
                src={user?.user_metadata?.avatar_url}
                alt={user?.email ?? ""}
                size={100}
                radius="xl"
              />
              <Stack gap={0}>
                <Text size="xl" fw={500}>
                  {user?.email}
                </Text>
                <Text c="dimmed">
                  Member since{" "}
                  {new Date(user?.created_at ?? "").toLocaleDateString()}
                </Text>
              </Stack>
            </Group>

            <Stack gap="md">
              <TextInput
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                minRows={3}
              />
            </Stack>

            <Group justify="space-between">
              <Button variant="light" color="red" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
