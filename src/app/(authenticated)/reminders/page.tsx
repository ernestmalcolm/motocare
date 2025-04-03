"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Stack,
  Title,
  Group,
  Button,
  Card,
  Text,
  Badge,
  Modal,
  TextInput,
  Textarea,
  Select,
  Switch,
  ActionIcon,
  Menu,
  Tabs,
  ThemeIcon,
  NumberInput,
  Skeleton,
  SimpleGrid,
  Transition,
  Paper,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconCalendarTime,
  IconCarSuv,
  IconCheckbox,
  IconClock,
  IconFlag,
  IconTools,
  IconAlertTriangle,
  IconCalendar,
  IconCheckupList,
  IconGasStation,
  IconBell,
  IconBellOff,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCheck,
  IconDroplet,
  IconSettings,
  IconBattery,
  IconFilter,
  IconGauge,
  IconEngine,
  IconBike,
  IconTruck,
  IconPhone,
  IconNotes,
  IconSearch,
  IconX,
  IconRefresh,
  IconCar,
  IconClipboardList,
  IconBellRinging,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import Link from "next/link";

type Reminder = {
  id: string;
  vehicle_id: string;
  title: string;
  description?: string;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  notes?: string;
  created_at: string;
  updated_at: string;
  enable_notifications: boolean;
  notification_frequency?: "daily" | "weekly" | "monthly";
  type: "regular" | "dated";
};

type Car = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  type: "car" | "motorcycle" | "truck" | "van" | "other";
  license_plate: string;
  color?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_mileage?: number;
  last_service_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

const serviceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Air Filter",
  "Battery Check",
  "Transmission Service",
  "Coolant Flush",
  "Fuel Filter",
  "Spark Plugs",
  "Timing Belt",
  "Wheel Alignment",
  "AC Service",
  "Power Steering",
  "Suspension",
  "Exhaust System",
  "Other",
];

const getServiceIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("oil")) return <IconEngine size={16} />;
  if (lowerTitle.includes("tire")) return <IconGauge size={16} />;
  if (lowerTitle.includes("brake")) return <IconCarSuv size={16} />;
  if (lowerTitle.includes("filter")) return <IconFilter size={16} />;
  if (lowerTitle.includes("battery")) return <IconBattery size={16} />;
  if (lowerTitle.includes("transmission")) return <IconSettings size={16} />;
  if (lowerTitle.includes("coolant")) return <IconDroplet size={16} />;
  return <IconTools size={16} />;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return { from: "red", to: "pink" };
    case "medium":
      return { from: "orange", to: "yellow" };
    default:
      return { from: "blue", to: "cyan" };
  }
};

const getVehicleTypeIcon = (type: string) => {
  switch (type) {
    case "car":
      return <IconCarSuv size={16} />;
    case "motorcycle":
      return <IconBike size={16} />;
    case "truck":
      return <IconTruck size={16} />;
    case "van":
      return <IconCarSuv size={16} />;
    default:
      return <IconCarSuv size={16} />;
  }
};

const formatDueDate = (dateString: string | null) => {
  if (!dateString) return { text: "No due date", color: "gray" };

  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time part for comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < today) {
    const daysOverdue = Math.ceil(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      text: `${daysOverdue} ${daysOverdue === 1 ? "day" : "days"} overdue`,
      color: "red",
    };
  } else if (date.getTime() === today.getTime()) {
    return { text: "Due Today", color: "red" };
  } else if (date.getTime() === tomorrow.getTime()) {
    return { text: "Due Tomorrow", color: "orange" };
  } else {
    const daysUntilDue = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue <= 7) {
      return {
        text: `Due in ${daysUntilDue} ${daysUntilDue === 1 ? "day" : "days"}`,
        color: "orange",
      };
    } else if (daysUntilDue <= 30) {
      return {
        text: `Due in ${daysUntilDue} ${daysUntilDue === 1 ? "day" : "days"}`,
        color: "blue",
      };
    } else {
      return {
        text: `Due in ${daysUntilDue} ${daysUntilDue === 1 ? "day" : "days"}`,
        color: "green",
      };
    }
  }
};

// Update isOverdue function to handle null dates
const isOverdue = (dateString: string | null) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    vehicles: [] as string[],
    serviceTypes: [] as string[],
    priorities: [] as ("low" | "medium" | "high")[],
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: null as string | null,
    priority: "low" as "low" | "medium" | "high",
    notes: "",
    vehicle_id: "",
    enable_notifications: true,
    notification_frequency: "daily" as "daily" | "weekly" | "monthly",
    type: "regular" as "regular" | "dated",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "low" as "low" | "medium" | "high",
    notes: "",
    vehicle_id: "",
    enable_notifications: true,
    notification_frequency: "daily" as "daily" | "weekly" | "monthly",
  });

  const welcomeMessage = useMemo(() => {
    const messages = [
      "We remember so you don't have to. That's the deal. 🤝⏰",
      "The only kind of reminders you'll actually appreciate. 🔔🚗",
      "Less forgetting, more smooth driving. 🛣️🧠",
      "Because 'I'll do it later' never ends well. 😂🛠️",
      "Log it, set it, forget it. We've got you. 🧠✅",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  useEffect(() => {
    fetchData().finally(() => {
      setTimeout(() => setMounted(true), 200);
    });
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Starting data fetch...");

      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session?.user?.id) {
        console.error("No user session found");
        throw new Error("No user session found");
      }

      console.log("Fetching vehicles for user:", session.user.id);

      // Fetch vehicles with all required fields
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select(
          `
          id,
          user_id,
          make,
          model,
          year,
          type,
          license_plate,
          color,
          purchase_date,
          purchase_price,
          current_mileage,
          last_service_date,
          notes,
          created_at,
          updated_at
        `
        )
        .eq("user_id", session.user.id);

      if (vehiclesError) {
        console.error("Error fetching vehicles:", vehiclesError);
        throw vehiclesError;
      }

      console.log("Fetched vehicles:", vehiclesData);
      setVehicles(vehiclesData || []);

      // Get vehicle IDs for the current user
      const vehicleIds = vehiclesData?.map((v) => v.id) || [];
      console.log("Vehicle IDs:", vehicleIds);

      if (vehicleIds.length === 0) {
        console.log("No vehicles found for user");
        setReminders([]);
        return;
      }

      // Fetch reminders for the user's vehicles
      const { data: remindersData, error: remindersError } = await supabase
        .from("reminders")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .order("due_date", { ascending: true });

      if (remindersError) {
        console.error("Error fetching reminders:", remindersError);
        throw remindersError;
      }

      console.log("Fetched reminders:", remindersData);

      // Transform the data to match our UI expectations
      const transformedReminders =
        remindersData?.map((reminder) => ({
          ...reminder,
          is_completed: reminder.status === "completed",
        })) || [];

      console.log("Transformed reminders:", transformedReminders);
      setReminders(transformedReminders);
    } catch (error) {
      console.error("Error in fetchData:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch data. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      due_date: reminder.due_date,
      priority: reminder.priority,
      notes: reminder.notes || "",
      vehicle_id: reminder.vehicle_id,
      enable_notifications: reminder.enable_notifications,
      notification_frequency: reminder.notification_frequency || "daily",
      type: reminder.type,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const reminderData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.type === "dated" ? formData.due_date : null,
        priority: formData.priority,
        notes: formData.notes,
        vehicle_id: formData.vehicle_id,
        enable_notifications: formData.enable_notifications,
        notification_frequency: formData.notification_frequency,
        type: formData.type,
      };

      if (selectedReminder) {
        const { error } = await supabase
          .from("reminders")
          .update(reminderData)
          .eq("id", selectedReminder.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reminders")
          .insert([reminderData]);

        if (error) throw error;
      }

      setModalOpen(false);
      setSelectedReminder(null);
      setFormData({
        title: "",
        description: "",
        due_date: null,
        priority: "low",
        notes: "",
        vehicle_id: "",
        enable_notifications: true,
        notification_frequency: "daily",
        type: "regular",
      });
      fetchData();
      notifications.show({
        title: "Success",
        message: `Reminder ${
          selectedReminder ? "updated" : "created"
        } successfully!`,
        color: "green",
      });
    } catch (error) {
      console.error("Error saving reminder:", error);
      notifications.show({
        title: "Error",
        message: `Failed to ${
          selectedReminder ? "update" : "create"
        } reminder. Please try again.`,
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ enable_notifications: false })
        .eq("id", reminderId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error completing reminder:", error);
      notifications.show({
        title: "Error",
        message: "Failed to complete reminder. Please try again.",
        color: "red",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReminder) return;

    try {
      const { error } = await supabase
        .from("reminders")
        .update({
          title: editForm.title,
          description: editForm.description,
          due_date: editForm.due_date,
          priority: editForm.priority,
          notes: editForm.notes,
          vehicle_id: editForm.vehicle_id,
          enable_notifications: editForm.enable_notifications,
          notification_frequency: editForm.notification_frequency,
        })
        .eq("id", selectedReminder.id);

      if (error) throw error;

      setModalOpen(false);
      setSelectedReminder(null);
      setEditForm({
        title: "",
        description: "",
        due_date: "",
        priority: "low",
        notes: "",
        vehicle_id: "",
        enable_notifications: true,
        notification_frequency: "daily",
      });
      fetchData();
      notifications.show({
        title: "Success",
        message: "Reminder updated successfully!",
        color: "green",
      });
    } catch (error) {
      console.error("Error updating reminder:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update reminder. Please try again.",
        color: "red",
      });
    }
  };

  const handleDelete = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", reminder.id);

      if (error) throw error;

      notifications.show({
        title: "Success",
        message: "Reminder deleted successfully!",
        color: "green",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete reminder. Please try again.",
        color: "red",
      });
    }
  };

  const handleToggleNotifications = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ enable_notifications: !reminder.enable_notifications })
        .eq("id", reminder.id);

      if (error) throw error;

      notifications.show({
        title: "Success",
        message: `Notifications ${
          reminder.enable_notifications ? "disabled" : "enabled"
        } successfully!`,
        color: "green",
      });

      fetchData();
    } catch (error) {
      console.error("Error toggling notifications:", error);
      notifications.show({
        title: "Error",
        message: "Failed to toggle notifications. Please try again.",
        color: "red",
      });
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch =
      reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicles
        .find((v) => v.id === reminder.vehicle_id)
        ?.make.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      vehicles
        .find((v) => v.id === reminder.vehicle_id)
        ?.model.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesVehicle =
      filters.vehicles.length === 0 ||
      filters.vehicles.includes(reminder.vehicle_id);
    const matchesServiceType =
      filters.serviceTypes.length === 0 ||
      filters.serviceTypes.includes(reminder.title);
    const matchesPriority =
      filters.priorities.length === 0 ||
      filters.priorities.includes(reminder.priority);

    return (
      matchesSearch && matchesVehicle && matchesServiceType && matchesPriority
    );
  });

  const activeReminders = filteredReminders.filter(
    (r) => r.enable_notifications
  );
  const inactiveReminders = filteredReminders.filter(
    (r) => !r.enable_notifications
  );

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <Stack gap={0}>
              <Skeleton height={36} width={200} />
              <Skeleton height={24} width={300} mt={4} />
            </Stack>
            <Skeleton height={36} width={120} />
          </Group>
          <Skeleton height={200} />
        </Stack>
      </Container>
    );
  }

  if (vehicles.length === 0) {
    return (
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <Stack gap={0}>
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={600}
              >
                {(styles) => (
                  <div style={styles}>
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon
                        size={48}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: "blue", to: "cyan", deg: 45 }}
                      >
                        <IconBellRinging size={28} />
                      </ThemeIcon>
                      <Title order={1}>Reminders</Title>
                    </Group>
                    <Text c="dimmed" size="lg" mt={4}>
                      {welcomeMessage}
                    </Text>
                  </div>
                )}
              </Transition>
            </Stack>
          </Group>

          <Transition
            mounted={mounted}
            transition="slide-down"
            duration={600}
            timingFunction="ease"
          >
            {(styles) => (
              <Card
                withBorder
                radius="md"
                p="xl"
                className="text-center"
                style={styles}
              >
                <Stack gap="xl" align="center">
                  <ThemeIcon size={80} radius="xl" variant="light" color="blue">
                    <IconCar size={40} />
                  </ThemeIcon>
                  <Stack gap="md">
                    <Stack gap={0}>
                      <Text size="xl" fw={700}>
                        NO VEHICLES FOUND
                      </Text>
                      <Text c="dimmed" size="sm">
                        Add your vehicles to start setting up maintenance
                        reminders
                      </Text>
                    </Stack>
                    <Button
                      component={Link}
                      href="/garage"
                      leftSection={<IconPlus size={16} />}
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan", deg: 45 }}
                    >
                      Add Your First Vehicle
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            )}
          </Transition>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Transition
          mounted={mounted}
          transition="slide-down"
          duration={800}
          timingFunction="ease"
        >
          {(styles) => (
            <Group justify="space-between" style={styles}>
              <Stack gap={0}>
                <Transition
                  mounted={mounted}
                  transition="slide-down"
                  duration={600}
                >
                  {(styles) => (
                    <div style={styles}>
                      <Group gap="xs" wrap="nowrap">
                        <ThemeIcon
                          size={48}
                          radius="xl"
                          variant="gradient"
                          gradient={{ from: "blue", to: "cyan", deg: 45 }}
                        >
                          <IconBell size={28} />
                        </ThemeIcon>
                        <Title order={1}>Reminders</Title>
                      </Group>
                      <Text c="dimmed" size="lg" mt={4}>
                        {welcomeMessage}
                      </Text>
                    </div>
                  )}
                </Transition>
              </Stack>
              <Button
                leftSection={<IconPlus size={20} />}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                onClick={() => {
                  setSelectedReminder(null);
                  setFormData({
                    title: "",
                    description: "",
                    due_date: null,
                    priority: "low",
                    notes: "",
                    vehicle_id: "",
                    enable_notifications: true,
                    notification_frequency: "daily",
                    type: "regular",
                  });
                  setModalOpen(true);
                }}
              >
                Add Reminder
              </Button>
            </Group>
          )}
        </Transition>

        <Card withBorder radius="md" p="md" className="shadow-sm">
          <Stack gap="md">
            <Group gap="md" wrap="wrap" align="flex-end">
              <Select
                label="Vehicle"
                placeholder="All vehicles"
                value={filters.vehicles[0] || ""}
                onChange={(value) =>
                  setFilters({ ...filters, vehicles: value ? [value] : [] })
                }
                data={[
                  { value: "", label: "All vehicles" },
                  ...vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.make} ${v.model}`,
                  })),
                ]}
                leftSection={<IconCar size={16} />}
                style={{ minWidth: 200 }}
                clearable
              />
              <Select
                label="Priority"
                placeholder="All priorities"
                value={filters.priorities[0] || ""}
                onChange={(value) =>
                  setFilters({
                    ...filters,
                    priorities: value
                      ? [value as "low" | "medium" | "high"]
                      : [],
                  })
                }
                data={[
                  { value: "", label: "All priorities" },
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                leftSection={<IconFlag size={16} />}
                style={{ minWidth: 200 }}
                clearable
              />
              <Select
                label="Type"
                placeholder="All types"
                value={filters.serviceTypes[0] || ""}
                onChange={(value) =>
                  setFilters({ ...filters, serviceTypes: value ? [value] : [] })
                }
                data={[
                  { value: "", label: "All types" },
                  { value: "service", label: "Service" },
                  { value: "repair", label: "Repair" },
                  { value: "inspection", label: "Inspection" },
                ]}
                leftSection={<IconTools size={16} />}
                style={{ minWidth: 200 }}
                clearable
              />
              <TextInput
                label="Search"
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                style={{ minWidth: 200 }}
                __clearable
              />
              <Button
                variant="light"
                color="gray"
                onClick={() => {
                  setFilters({
                    vehicles: [],
                    serviceTypes: [],
                    priorities: [],
                  });
                  setSearchQuery("");
                }}
                leftSection={<IconFilter size={16} />}
              >
                Reset Filters
              </Button>
            </Group>

            <Tabs defaultValue="active" variant="outline" radius="md">
              <Tabs.List>
                <Tabs.Tab
                  value="active"
                  leftSection={<IconBell size={16} />}
                  rightSection={
                    <Badge size="sm" variant="light" color="blue">
                      {activeReminders.length}
                    </Badge>
                  }
                >
                  Active
                </Tabs.Tab>
                <Tabs.Tab
                  value="inactive"
                  leftSection={<IconBellOff size={16} />}
                  rightSection={
                    <Badge size="sm" variant="light" color="gray">
                      {inactiveReminders.length}
                    </Badge>
                  }
                >
                  Inactive
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="active" pt="md">
                <Transition
                  mounted={mounted}
                  transition="slide-down"
                  duration={600}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <Stack gap="md" style={styles}>
                      {activeReminders.length === 0 ? (
                        <Card
                          withBorder
                          radius="md"
                          p="xl"
                          className="text-center"
                        >
                          <Stack gap="md" align="center">
                            <ThemeIcon
                              size="xl"
                              radius="md"
                              variant="light"
                              color="blue"
                            >
                              <IconBell size={24} />
                            </ThemeIcon>
                            <Stack gap={0}>
                              <Text size="xl" fw={500}>
                                No Active Reminders
                              </Text>
                              <Text c="dimmed">
                                All your maintenance notifications are up to
                                date!
                              </Text>
                            </Stack>
                            <Button
                              leftSection={<IconPlus size={20} />}
                              variant="gradient"
                              gradient={{ from: "blue", to: "cyan" }}
                              onClick={() => {
                                setSelectedReminder(null);
                                setFormData({
                                  title: "",
                                  description: "",
                                  due_date: null,
                                  priority: "low",
                                  notes: "",
                                  vehicle_id: "",
                                  enable_notifications: true,
                                  notification_frequency: "daily",
                                  type: "regular",
                                });
                                setModalOpen(true);
                              }}
                            >
                              Add New Reminder
                            </Button>
                          </Stack>
                        </Card>
                      ) : (
                        activeReminders.map((reminder, index) => (
                          <Transition
                            key={reminder.id}
                            mounted={mounted}
                            transition="slide-down"
                            duration={600}
                            timingFunction="ease"
                          >
                            {(styles) => (
                              <Card
                                withBorder
                                p="md"
                                radius="md"
                                className={`hover:shadow-md transition-all duration-200 hover:scale-[1.01] ${
                                  isOverdue(reminder.due_date)
                                    ? "border-red-200 bg-red-50/50"
                                    : ""
                                }`}
                                style={{
                                  ...styles,
                                  transitionDelay: `${150 * (index + 1)}ms`,
                                }}
                              >
                                <Group
                                  justify="space-between"
                                  align="flex-start"
                                >
                                  <Stack gap="xs" style={{ flex: 1 }}>
                                    <Group gap="xs" wrap="nowrap">
                                      <ThemeIcon
                                        size="sm"
                                        radius="md"
                                        variant="gradient"
                                        gradient={
                                          isOverdue(reminder.due_date)
                                            ? { from: "red", to: "pink" }
                                            : { from: "blue", to: "cyan" }
                                        }
                                      >
                                        {getServiceIcon(reminder.title)}
                                      </ThemeIcon>
                                      <Stack gap={0} style={{ flex: 1 }}>
                                        <Group gap="xs" wrap="nowrap">
                                          <Text
                                            fw={500}
                                            size="lg"
                                            className="line-clamp-1"
                                          >
                                            {reminder.title}
                                          </Text>
                                          {isOverdue(reminder.due_date) && (
                                            <Badge color="red" variant="light">
                                              Overdue
                                            </Badge>
                                          )}
                                        </Group>
                                        <Group
                                          gap="md"
                                          wrap="wrap"
                                          align="center"
                                          mt={4}
                                        >
                                          <Group gap="xs">
                                            {reminder.type === "regular" ? (
                                              <IconRefresh
                                                size={16}
                                                color="var(--mantine-color-blue-6)"
                                              />
                                            ) : (
                                              <IconCalendarTime
                                                size={16}
                                                color={`var(--mantine-color-${
                                                  formatDueDate(
                                                    reminder.due_date
                                                  ).color
                                                }-6)`}
                                              />
                                            )}
                                            <Text
                                              size="sm"
                                              c={
                                                reminder.type === "regular"
                                                  ? "blue"
                                                  : formatDueDate(
                                                      reminder.due_date
                                                    ).color
                                              }
                                              fw={
                                                formatDueDate(reminder.due_date)
                                                  .color === "red"
                                                  ? 500
                                                  : 400
                                              }
                                            >
                                              {reminder.type === "regular"
                                                ? "Regular"
                                                : formatDueDate(
                                                    reminder.due_date
                                                  ).text}
                                            </Text>
                                          </Group>
                                          <Group gap="xs">
                                            <ThemeIcon
                                              size="sm"
                                              radius="md"
                                              variant="light"
                                              color="blue"
                                            >
                                              {getVehicleTypeIcon(
                                                vehicles.find(
                                                  (v) =>
                                                    v.id === reminder.vehicle_id
                                                )?.type || "car"
                                              )}
                                            </ThemeIcon>
                                            <Text size="sm" fw={500}>
                                              {
                                                vehicles.find(
                                                  (v) =>
                                                    v.id === reminder.vehicle_id
                                                )?.make
                                              }{" "}
                                              {
                                                vehicles.find(
                                                  (v) =>
                                                    v.id === reminder.vehicle_id
                                                )?.model
                                              }
                                            </Text>
                                          </Group>
                                          <Group gap="xs">
                                            <ThemeIcon
                                              size="sm"
                                              radius="md"
                                              variant="light"
                                              color={
                                                reminder.enable_notifications
                                                  ? "blue"
                                                  : "gray"
                                              }
                                            >
                                              {reminder.enable_notifications ? (
                                                <IconBell size={16} />
                                              ) : (
                                                <IconBellOff size={16} />
                                              )}
                                            </ThemeIcon>
                                            <Text size="sm" c="dimmed">
                                              {reminder.enable_notifications
                                                ? reminder.notification_frequency
                                                  ? reminder.notification_frequency
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    reminder.notification_frequency.slice(
                                                      1
                                                    )
                                                  : "Daily"
                                                : "Notifications Off"}
                                            </Text>
                                          </Group>
                                          {reminder.priority && (
                                            <Group gap="xs">
                                              <ThemeIcon
                                                size="sm"
                                                radius="md"
                                                variant="light"
                                                color={
                                                  reminder.priority === "high"
                                                    ? "red"
                                                    : reminder.priority ===
                                                      "medium"
                                                    ? "orange"
                                                    : "blue"
                                                }
                                              >
                                                <IconFlag size={16} />
                                              </ThemeIcon>
                                              <Text
                                                size="sm"
                                                fw={500}
                                                c={
                                                  reminder.priority === "high"
                                                    ? "red"
                                                    : reminder.priority ===
                                                      "medium"
                                                    ? "orange"
                                                    : "blue"
                                                }
                                              >
                                                {reminder.priority
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  reminder.priority.slice(
                                                    1
                                                  )}{" "}
                                                Priority
                                              </Text>
                                            </Group>
                                          )}
                                        </Group>
                                        {reminder.description && (
                                          <Text
                                            size="sm"
                                            mt="xs"
                                            c="dimmed"
                                            className="line-clamp-2"
                                          >
                                            {reminder.description}
                                          </Text>
                                        )}
                                      </Stack>
                                    </Group>
                                  </Stack>
                                  <Menu position="bottom-end">
                                    <Menu.Target>
                                      <ActionIcon
                                        variant="subtle"
                                        color={
                                          isOverdue(reminder.due_date)
                                            ? "red"
                                            : "gray"
                                        }
                                      >
                                        <IconDotsVertical size={16} />
                                      </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                      <Menu.Item
                                        leftSection={
                                          reminder.enable_notifications ? (
                                            <IconBellOff size={14} />
                                          ) : (
                                            <IconBell size={14} />
                                          )
                                        }
                                        onClick={() =>
                                          handleToggleNotifications(reminder)
                                        }
                                        color={
                                          reminder.enable_notifications
                                            ? "red"
                                            : "blue"
                                        }
                                      >
                                        {reminder.enable_notifications
                                          ? "Disable Notifications"
                                          : "Enable Notifications"}
                                      </Menu.Item>
                                      <Menu.Item
                                        leftSection={<IconEdit size={14} />}
                                        onClick={() => handleEdit(reminder)}
                                      >
                                        Edit
                                      </Menu.Item>
                                      <Menu.Item
                                        leftSection={<IconTrash size={14} />}
                                        color="red"
                                        onClick={() => {
                                          setSelectedReminder(reminder);
                                          openDeleteModal();
                                        }}
                                      >
                                        Delete
                                      </Menu.Item>
                                    </Menu.Dropdown>
                                  </Menu>
                                </Group>
                              </Card>
                            )}
                          </Transition>
                        ))
                      )}
                    </Stack>
                  )}
                </Transition>
              </Tabs.Panel>

              <Tabs.Panel value="inactive" pt="md">
                <Transition
                  mounted={mounted}
                  transition="slide-down"
                  duration={600}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <Stack gap="md" style={styles}>
                      {inactiveReminders.length === 0 ? (
                        <Card
                          withBorder
                          radius="md"
                          p="xl"
                          className="text-center"
                        >
                          <Stack gap="md" align="center">
                            <ThemeIcon
                              size="xl"
                              radius="md"
                              variant="light"
                              color="gray"
                            >
                              <IconBellOff size={24} />
                            </ThemeIcon>
                            <Stack gap={0}>
                              <Text size="xl" fw={500}>
                                No Inactive Reminders
                              </Text>
                              <Text c="dimmed">
                                All your reminders are currently active!
                              </Text>
                            </Stack>
                          </Stack>
                        </Card>
                      ) : (
                        inactiveReminders.map((reminder, index) => (
                          <Transition
                            key={reminder.id}
                            mounted={mounted}
                            transition="slide-down"
                            duration={600}
                            timingFunction="ease"
                          >
                            {(styles) => (
                              <Card
                                withBorder
                                p="md"
                                radius="md"
                                className="hover:shadow-md transition-all duration-200 hover:scale-[1.01] bg-gray-50/50"
                                style={{
                                  ...styles,
                                  transitionDelay: `${150 * (index + 1)}ms`,
                                }}
                              >
                                <Group
                                  justify="space-between"
                                  align="flex-start"
                                >
                                  <Stack gap="xs" style={{ flex: 1 }}>
                                    <Group gap="xs" wrap="nowrap">
                                      <ThemeIcon
                                        size="sm"
                                        radius="md"
                                        variant="gradient"
                                        gradient={{
                                          from: "gray",
                                          to: "dimmed",
                                        }}
                                      >
                                        {getServiceIcon(reminder.title)}
                                      </ThemeIcon>
                                      <Stack gap={0} style={{ flex: 1 }}>
                                        <Group gap="xs" wrap="nowrap">
                                          <Text
                                            fw={500}
                                            size="lg"
                                            c="dimmed"
                                            className="line-clamp-1"
                                          >
                                            {reminder.title}
                                          </Text>
                                          <Badge color="gray" variant="light">
                                            Inactive
                                          </Badge>
                                        </Group>
                                        <Group
                                          gap="md"
                                          wrap="wrap"
                                          align="center"
                                        >
                                          <Group gap="xs">
                                            {reminder.type === "regular" ? (
                                              <IconRefresh
                                                size={16}
                                                color="var(--mantine-color-dimmed)"
                                              />
                                            ) : (
                                              <IconClock
                                                size={16}
                                                color="var(--mantine-color-dimmed)"
                                              />
                                            )}
                                            <Text size="sm" c="dimmed">
                                              {reminder.type === "regular"
                                                ? "Regular reminder"
                                                : `Completed on: ${
                                                    reminder.due_date
                                                      ? new Date(
                                                          reminder.due_date
                                                        ).toLocaleDateString()
                                                      : "N/A"
                                                  }`}
                                            </Text>
                                          </Group>
                                          <Group gap="xs">
                                            <ThemeIcon
                                              size="sm"
                                              radius="md"
                                              variant="light"
                                              color="blue"
                                            >
                                              {getVehicleTypeIcon(
                                                vehicles.find(
                                                  (v) =>
                                                    v.id === reminder.vehicle_id
                                                )?.type || "car"
                                              )}
                                            </ThemeIcon>
                                            <Text size="sm" fw={500}>
                                              {
                                                vehicles.find(
                                                  (v) =>
                                                    v.id === reminder.vehicle_id
                                                )?.make
                                              }{" "}
                                              {
                                                vehicles.find(
                                                  (v) =>
                                                    v.id === reminder.vehicle_id
                                                )?.model
                                              }
                                            </Text>
                                          </Group>
                                          <Group gap="xs">
                                            <ThemeIcon
                                              size="sm"
                                              radius="md"
                                              variant="light"
                                              color={
                                                reminder.enable_notifications
                                                  ? "blue"
                                                  : "gray"
                                              }
                                            >
                                              {reminder.enable_notifications ? (
                                                <IconBell size={16} />
                                              ) : (
                                                <IconBellOff size={16} />
                                              )}
                                            </ThemeIcon>
                                            <Text size="sm" c="dimmed">
                                              {reminder.enable_notifications
                                                ? reminder.notification_frequency
                                                  ? `Every ${reminder.notification_frequency}`
                                                  : "Daily"
                                                : "Notifications Off"}
                                            </Text>
                                          </Group>
                                        </Group>
                                        {reminder.description && (
                                          <Text
                                            size="sm"
                                            mt="xs"
                                            c="dimmed"
                                            className="line-clamp-2"
                                          >
                                            {reminder.description}
                                          </Text>
                                        )}
                                      </Stack>
                                    </Group>
                                  </Stack>
                                  <Menu position="bottom-end">
                                    <Menu.Target>
                                      <ActionIcon variant="subtle" color="gray">
                                        <IconDotsVertical size={16} />
                                      </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                      <Menu.Item
                                        leftSection={
                                          reminder.enable_notifications ? (
                                            <IconBellOff size={14} />
                                          ) : (
                                            <IconBell size={14} />
                                          )
                                        }
                                        onClick={() =>
                                          handleToggleNotifications(reminder)
                                        }
                                        color={
                                          reminder.enable_notifications
                                            ? "red"
                                            : "blue"
                                        }
                                      >
                                        {reminder.enable_notifications
                                          ? "Disable Notifications"
                                          : "Enable Notifications"}
                                      </Menu.Item>
                                      <Menu.Item
                                        leftSection={<IconEdit size={14} />}
                                        onClick={() => handleEdit(reminder)}
                                      >
                                        Edit
                                      </Menu.Item>
                                      <Menu.Item
                                        leftSection={<IconTrash size={14} />}
                                        color="red"
                                        onClick={() => {
                                          setSelectedReminder(reminder);
                                          openDeleteModal();
                                        }}
                                      >
                                        Delete
                                      </Menu.Item>
                                    </Menu.Dropdown>
                                  </Menu>
                                </Group>
                              </Card>
                            )}
                          </Transition>
                        ))
                      )}
                    </Stack>
                  )}
                </Transition>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Card>

        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedReminder(null);
            setFormData({
              title: "",
              description: "",
              due_date: null,
              priority: "low",
              notes: "",
              vehicle_id: "",
              enable_notifications: true,
              notification_frequency: "daily",
              type: "regular",
            });
          }}
          title={
            <Group gap="xs">
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconBell size={16} />
              </ThemeIcon>
              <Text fw={500}>
                {selectedReminder ? "Edit Reminder" : "New Reminder"}
              </Text>
            </Group>
          }
          size="lg"
          padding="xl"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="xl">
              <Card withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconCarSuv size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      Vehicle Details
                    </Text>
                  </Group>
                  <Select
                    label="Select Vehicle"
                    placeholder="Choose a vehicle"
                    value={formData.vehicle_id}
                    onChange={(value) =>
                      setFormData({ ...formData, vehicle_id: value || "" })
                    }
                    data={vehicles.map((v) => ({
                      value: v.id,
                      label: `${v.make} ${v.model} (${v.license_plate})`,
                    }))}
                    required
                    leftSection={<IconCarSuv size={16} />}
                    size="sm"
                  />
                </Stack>
              </Card>

              <Card withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="violet" size="sm">
                      <IconCheckupList size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      Reminder Details
                    </Text>
                  </Group>
                  <Select
                    label="Service Type"
                    placeholder="Select service type"
                    value={formData.title}
                    onChange={(value) =>
                      setFormData({ ...formData, title: value || "" })
                    }
                    data={serviceTypes}
                    required
                    leftSection={<IconTools size={16} />}
                    size="sm"
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter reminder description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    minRows={3}
                    leftSection={<IconCheckupList size={16} />}
                    styles={{
                      input: {
                        paddingTop: "8px",
                      },
                    }}
                    size="sm"
                  />
                  <Group grow>
                    <Select
                      label="Reminder Type"
                      placeholder="Select type"
                      value={formData.type}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          type: (value as "regular" | "dated") || "regular",
                        })
                      }
                      data={[
                        {
                          value: "regular",
                          label: "Regular (no due date)",
                        },
                        { value: "dated", label: "Dated (with due date)" },
                      ]}
                      required
                      leftSection={<IconCalendar size={16} />}
                      size="sm"
                    />
                    {formData.type === "dated" && (
                      <DateInput
                        label="Due Date"
                        placeholder="Select date"
                        value={
                          formData.due_date
                            ? new Date(formData.due_date)
                            : undefined
                        }
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            due_date: date?.toISOString() || null,
                          })
                        }
                        minDate={new Date()}
                        required
                        leftSection={<IconCalendar size={16} />}
                        size="sm"
                        clearable
                      />
                    )}
                  </Group>
                  <Select
                    label="Priority"
                    placeholder="Select priority"
                    value={formData.priority}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: (value as "low" | "medium" | "high") || "low",
                      })
                    }
                    data={[
                      { value: "low", label: "Low Priority" },
                      { value: "medium", label: "Medium Priority" },
                      { value: "high", label: "High Priority" },
                    ]}
                    required
                    leftSection={<IconFlag size={16} />}
                    size="sm"
                  />
                </Stack>
              </Card>

              <Card withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconBell size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      Notification Settings
                    </Text>
                  </Group>
                  <Switch
                    label="Enable Notifications"
                    checked={formData.enable_notifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enable_notifications: e.currentTarget.checked,
                      })
                    }
                  />
                  {formData.enable_notifications && (
                    <Select
                      label="Notification Frequency"
                      placeholder="Select frequency"
                      value={formData.notification_frequency}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          notification_frequency:
                            (value as "daily" | "weekly" | "monthly") ||
                            "daily",
                        })
                      }
                      data={[
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" },
                      ]}
                      leftSection={<IconBell size={16} />}
                      size="sm"
                    />
                  )}
                </Stack>
              </Card>

              <Card withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconNotes size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      Additional Information
                    </Text>
                  </Group>
                  <Textarea
                    label="Notes"
                    placeholder="Add any additional notes or comments"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    minRows={3}
                    leftSection={<IconNotes size={16} />}
                    size="sm"
                  />
                </Stack>
              </Card>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  color="gray"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedReminder(null);
                    setFormData({
                      title: "",
                      description: "",
                      due_date: null,
                      priority: "low",
                      notes: "",
                      vehicle_id: "",
                      enable_notifications: true,
                      notification_frequency: "daily",
                      type: "regular",
                    });
                  }}
                  disabled={isSubmitting}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftSection={<IconPlus size={16} />}
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan", deg: 45 }}
                  loading={isSubmitting}
                  size="sm"
                >
                  {selectedReminder ? "Update Reminder" : "Create Reminder"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        <Modal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          title={
            <Group gap="xs">
              <ThemeIcon variant="light" color="red" size="sm">
                <IconTrash size={16} />
              </ThemeIcon>
              <Text fw={500}>Delete Reminder</Text>
            </Group>
          }
          centered
          size="md"
        >
          <Stack gap="md">
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Are you sure you want to delete this reminder?
                </Text>
                <Text size="sm" c="dimmed">
                  This action cannot be undone. All associated data will be
                  permanently removed.
                </Text>
                {selectedReminder && (
                  <Group gap="xs" mt="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconBell size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      {selectedReminder.title}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                color="gray"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => handleDelete(selectedReminder as Reminder)}
                loading={isDeleting}
              >
                Delete Reminder
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
