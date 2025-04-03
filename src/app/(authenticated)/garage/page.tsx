"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Card,
  Grid,
  rem,
  Badge,
  ActionIcon,
  Menu,
  Loader,
  Progress,
  Tooltip,
  Divider,
  Paper,
  RingProgress,
  ThemeIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Switch,
  ColorInput,
  SegmentedControl,
  SimpleGrid,
  UnstyledButton,
  Skeleton,
  Transition,
} from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconCar,
  IconGauge,
  IconCalendar,
  IconNotes,
  IconTag,
  IconLicense,
  IconColorSwatch,
  IconCheckupList,
  IconTruck,
  IconBike,
  IconBus,
  IconQuestionMark,
  IconSearch,
  IconFilter,
  IconChartBar,
  IconGasStation,
  IconTools,
  IconAlertTriangle,
  IconX,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertCircle,
  IconCurrencyDollar,
  IconBuilding,
} from "@tabler/icons-react";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { supabase } from "@/lib/supabase";

interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  type: "car" | "motorcycle" | "truck" | "van" | "other";
  license_plate: string;
  color: string; // Human-readable color name
  color_hex: string; // Hex color code
  purchase_date: string;
  purchase_price: number;
  current_mileage: number;
  last_service_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

const COLOR_MAP: Record<string, { name: string; hex: string }> = {
  "#25262b": { name: "Dark Gray", hex: "#25262b" },
  "#868e96": { name: "Gray", hex: "#868e96" },
  "#fa5252": { name: "Red", hex: "#fa5252" },
  "#e64980": { name: "Pink", hex: "#e64980" },
  "#be4bdb": { name: "Purple", hex: "#be4bdb" },
  "#7950f2": { name: "Violet", hex: "#7950f2" },
  "#4c6ef5": { name: "Blue", hex: "#4c6ef5" },
  "#228be6": { name: "Light Blue", hex: "#228be6" },
  "#15aabf": { name: "Cyan", hex: "#15aabf" },
  "#12b886": { name: "Teal", hex: "#12b886" },
  "#40c057": { name: "Green", hex: "#40c057" },
  "#82c91e": { name: "Lime", hex: "#82c91e" },
  "#fab005": { name: "Yellow", hex: "#fab005" },
  "#fd7e14": { name: "Orange", hex: "#fd7e14" },
  "#212529": { name: "Dark", hex: "#212529" },
  "#ffffff": { name: "White", hex: "#ffffff" },
  "#adb5bd": { name: "Light Gray", hex: "#adb5bd" },
  "#dee2e6": { name: "Lighter Gray", hex: "#dee2e6" },
};

function LicensePlate({ plate }: { plate: string }) {
  // Format the plate number to match Tanzanian format: T 123 ABC
  const formatPlate = (plate: string) => {
    // Remove any existing spaces and convert to uppercase
    const cleanPlate = plate.replace(/\s/g, "").toUpperCase();

    // Extract numbers and letters
    const numbers = cleanPlate.match(/\d+/)?.[0] || "";
    const letters = cleanPlate.match(/[A-Z]+/)?.[0] || "";

    // Format as T 123 ABC
    return `T ${numbers.padStart(3, "0")} ${letters.padEnd(3, " ")}`;
  };

  return (
    <Paper
      p="xs"
      radius="sm"
      style={{
        background: "#FFD700", // Tanzanian yellow
        border: "2px solid #000", // Black border
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        position: "relative",
        overflow: "hidden",
        padding: "4px 8px",
      }}
    >
      <Group
        gap="xs"
        align="center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Text size="lg" style={{ lineHeight: 1 }}>
          🇹🇿
        </Text>
        <Text
          fw={700}
          size="sm"
          style={{
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#000",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
            fontWeight: 800,
          }}
        >
          {formatPlate(plate)}
        </Text>
      </Group>
      {/* Subtle pattern overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05) 75%, transparent 75%, transparent)",
          backgroundSize: "4px 4px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
    </Paper>
  );
}

function getVehicleTypeIcon(type: Vehicle["type"], size: number = 24) {
  switch (type) {
    case "car":
      return <IconCar size={size} color="white" />;
    case "motorcycle":
      return <IconBike size={size} color="white" />;
    case "truck":
      return <IconTruck size={size} color="white" />;
    case "van":
      return <IconBus size={size} color="white" />;
    default:
      return <IconCar size={size} color="white" />;
  }
}

function StatisticsCardSkeleton() {
  return (
    <Card withBorder radius="md" p="md">
      <Group gap="md">
        <Skeleton height={48} circle />
        <Stack gap={4}>
          <Skeleton height={24} width={80} />
          <Skeleton height={16} width={60} />
        </Stack>
      </Group>
    </Card>
  );
}

function VehicleCardSkeleton() {
  return (
    <Card withBorder radius="md" shadow="sm">
      <Card.Section
        p="md"
        bg="linear-gradient(135deg, #228be6 0%, #15aabf 100%)"
        style={{
          borderTopLeftRadius: "var(--mantine-radius-md)",
          borderTopRightRadius: "var(--mantine-radius-md)",
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <Skeleton height={40} circle />
            <Stack gap={4}>
              <Skeleton height={24} width={120} />
              <Skeleton height={16} width={60} />
            </Stack>
          </Group>
          <Skeleton height={32} width={32} circle />
        </Group>
      </Card.Section>

      <Card.Section p="md">
        <Stack gap="md">
          <Skeleton height={32} width="100%" />
          <Divider />
          <Stack gap="md">
            {[1, 2, 3, 4].map((i) => (
              <Group key={i} gap="xs">
                <Skeleton height={24} width={24} circle />
                <Skeleton height={16} width={80} />
                <Skeleton height={16} width={100} ml="auto" />
              </Group>
            ))}
          </Stack>
          <Divider />
          <Group gap="xs">
            <Skeleton height={32} width={120} />
          </Group>
        </Stack>
      </Card.Section>
    </Card>
  );
}

export default function GaragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [
    serviceHistoryModalOpened,
    { open: openServiceHistoryModal, close: closeServiceHistoryModal },
  ] = useDisclosure(false);
  const [
    expensesModalOpened,
    { open: openExpensesModal, close: closeExpensesModal },
  ] = useDisclosure(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [addForm, setAddForm] = useState<Partial<Vehicle>>({
    type: "car",
    current_mileage: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingServiceHistory, setLoadingServiceHistory] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const welcomeMessage = useMemo(() => {
    const messages = [
      "Behind every clean dashboard is a well-kept garage. 🧼🚗",
      "Every vehicle deserves its digital twin. 📱🚘",
      "This is where your cars get their act together. 🛠️🧠",
      "Logged and loaded. Ready for whatever the road throws. 🛣️⚙️",
      "Looks like someone's serious about their rides. 😎🔧",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        console.log("No user ID available");
        setLoading(false);
        return;
      }

      console.log("Fetching vehicles for user:", session.user.id);

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      console.log("Raw Supabase response:", { data, error });
      console.log("Data type:", typeof data);
      console.log("Is data an array?", Array.isArray(data));
      console.log("Data length:", data?.length);

      if (error) {
        console.error("Supabase error:", error);
        notifications.show({
          title: "Error",
          message: `Failed to fetch vehicles: ${error.message}`,
          color: "red",
        });
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No vehicles found for user:", session.user.id);
        setVehicles([]);
      } else {
        console.log(`Found ${data.length} vehicles for user:`, session.user.id);
        console.log("First vehicle:", data[0]);
        setVehicles(data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred. Please try again.",
        color: "red",
      });
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;

    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", selectedVehicle.id);

      if (error) {
        console.error("Error deleting vehicle:", error);
        notifications.show({
          title: "Error",
          message: "Failed to delete vehicle. Please try again.",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Success",
        message: "Vehicle deleted successfully.",
        color: "green",
      });

      closeDeleteModal();
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      notifications.show({
        title: "Error",
        message: "An unexpected error occurred. Please try again.",
        color: "red",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedVehicle) return;

    try {
      const { error } = await supabase
        .from("vehicles")
        .update({
          make: editForm.make,
          model: editForm.model,
          year: editForm.year,
          type: editForm.type,
          license_plate: editForm.license_plate,
          color: editForm.color,
          color_hex: editForm.color_hex,
          current_mileage: editForm.current_mileage,
          last_service_date: editForm.last_service_date,
          notes: editForm.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedVehicle.id);

      if (error) throw error;

      // Refresh the vehicles list
      fetchVehicles();
      closeEditModal();
      notifications.show({
        title: "Success",
        message: "Vehicle updated successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update vehicle",
        color: "red",
      });
    }
  };

  const handleAdd = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error("No user ID available");
      }

      const { error } = await supabase.from("vehicles").insert([
        {
          ...addForm,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Refresh the vehicles list
      fetchVehicles();
      closeAddModal();
      notifications.show({
        title: "Success",
        message: "Vehicle added successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add vehicle",
        color: "red",
      });
    }
  };

  const openEditVehicleModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      color_hex: vehicle.color_hex || vehicle.color_hex,
      current_mileage: vehicle.current_mileage,
      last_service_date: vehicle.last_service_date,
      notes: vehicle.notes,
    });
    openEditModal();
  };

  const openDeleteVehicleModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    openDeleteModal();
  };

  const handleServiceHistoryClick = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setLoadingServiceHistory(true);
    try {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select(
          `
          id,
          vehicle_id,
          type,
          date,
          mileage,
          description,
          cost,
          service_provider,
          notes,
          created_at,
          updated_at
        `
        )
        .eq("vehicle_id", vehicle.id)
        .eq("type", "service")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance records:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch maintenance records",
          color: "red",
        });
        return;
      }

      // Ensure we have valid data
      const validServiceHistory =
        data?.map((service) => ({
          ...service,
          service_date: service.date || new Date().toISOString(),
          service_type: "Service", // Since we're filtering for type="service"
          mileage: Number(service.mileage) || 0,
          cost: Number(service.cost) || 0,
          description: service.description || "No description provided",
          service_provider: service.service_provider || "Not specified",
          notes: service.notes || "",
        })) || [];

      setServiceHistory(validServiceHistory);
    } catch (error) {
      console.error("Error processing maintenance records:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred while processing maintenance records",
        color: "red",
      });
    } finally {
      setLoadingServiceHistory(false);
      openServiceHistoryModal();
    }
  };

  const handleExpensesClick = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setLoadingExpenses(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("vehicle_id", vehicle.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch expenses",
        color: "red",
      });
    } finally {
      setLoadingExpenses(false);
      openExpensesModal();
    }
  };

  useEffect(() => {
    console.log("useEffect triggered");
    fetchVehicles().finally(() => {
      setTimeout(() => setMounted(true), 200);
    });
  }, []);

  // Filter vehicles based on search and type
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.license_plate.toLowerCase().includes(searchLower) ||
      vehicle.color.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower);

    const matchesType = selectedType === "all" || vehicle.type === selectedType;

    // Add date range filtering for purchase date
    const purchaseDate = new Date(vehicle.purchase_date);
    const matchesDateRange =
      (!dateRange[0] || purchaseDate >= dateRange[0]) &&
      (!dateRange[1] || purchaseDate <= dateRange[1]);

    return matchesSearch && matchesType && matchesDateRange;
  });

  // Calculate statistics
  const stats = {
    totalVehicles: vehicles.length,
    totalMileage: vehicles.reduce((sum, v) => sum + v.current_mileage, 0),
    averageMileage: vehicles.length
      ? Math.round(
          vehicles.reduce((sum, v) => sum + v.current_mileage, 0) /
            vehicles.length
        )
      : 0,
    vehiclesNeedingService: vehicles.filter((v) => {
      const lastService = new Date(v.last_service_date);
      const today = new Date();
      const daysSinceService =
        (today.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceService > 180; // Vehicles needing service after 6 months
    }).length,
    serviceDueIn30Days: vehicles.filter((v) => {
      const lastService = new Date(v.last_service_date);
      const today = new Date();
      const daysSinceService =
        (today.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceService > 150 && daysSinceService <= 180; // Vehicles due for service in next 30 days
    }).length,
    totalValue: vehicles.reduce((sum, v) => sum + v.purchase_price, 0),
    averageAge: vehicles.length
      ? Math.round(
          vehicles.reduce(
            (sum, v) =>
              sum +
              (new Date().getFullYear() -
                new Date(v.purchase_date).getFullYear()),
            0
          ) / vehicles.length
        )
      : 0,
  };

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

          {/* Statistics Cards Skeleton */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {[1, 2, 3, 4].map((i) => (
              <StatisticsCardSkeleton key={i} />
            ))}
          </SimpleGrid>

          {/* Search Bar Skeleton */}
          <Card withBorder radius="md" p="md">
            <Stack gap="md">
              <Group>
                <Skeleton height={36} width="100%" />
              </Group>
              <Group gap="xs">
                <Skeleton height={24} width={100} />
              </Group>
            </Stack>
          </Card>

          {/* Vehicle Cards Skeleton */}
          <Grid>
            {[1, 2, 3].map((i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                <VehicleCardSkeleton />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Group gap="md">
            <ThemeIcon
              size={48}
              radius="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 45 }}
            >
              <IconCar size={28} />
            </ThemeIcon>
            <Stack gap={0}>
              <Group gap="xs">
                <Title order={1}>My Garage</Title>
                <Badge variant="light" color="blue" size="lg">
                  {stats.totalVehicles} Vehicles
                </Badge>
              </Group>
              <Text c="dimmed" size="lg">
                {welcomeMessage}
              </Text>
            </Stack>
          </Group>
          <Button
            leftSection={<IconPlus size={20} />}
            onClick={openAddModal}
            size="lg"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 45 }}
          >
            Add Vehicle
          </Button>
        </Group>

        {/* Statistics Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {loading ? (
            <>
              <Card withBorder radius="md" p="md">
                <Group gap="md">
                  <Skeleton height={40} circle />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={16} width="40%" />
                  </Stack>
                </Group>
              </Card>
              <Card withBorder radius="md" p="md">
                <Group gap="md">
                  <Skeleton height={40} circle />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={16} width="40%" />
                  </Stack>
                </Group>
              </Card>
              <Card withBorder radius="md" p="md">
                <Group gap="md">
                  <Skeleton height={40} circle />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={16} width="40%" />
                  </Stack>
                </Group>
              </Card>
            </>
          ) : (
            <>
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={600}
              >
                {(styles) => (
                  <Card withBorder radius="md" p="md" style={styles}>
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="blue"
                      >
                        <IconCar size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          {stats.totalVehicles}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Vehicles in Garage
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {stats.averageAge} years average age
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                )}
              </Transition>

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
                    p="md"
                    style={{ ...styles, transitionDelay: "150ms" }}
                  >
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="green"
                      >
                        <IconGauge size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          {stats.averageMileage.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Average Mileage
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          Per vehicle
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                )}
              </Transition>

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
                    p="md"
                    style={{ ...styles, transitionDelay: "300ms" }}
                  >
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="yellow"
                      >
                        <IconTools size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          {stats.vehiclesNeedingService}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Need Service
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {stats.serviceDueIn30Days} due in 30 days
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                )}
              </Transition>
            </>
          )}
        </SimpleGrid>

        {/* Search and Filter Bar */}
        <Card withBorder radius="md" p="md">
          <Stack gap="md">
            <Group gap="md" wrap="wrap" align="flex-end">
              <Select
                label="Type"
                placeholder="All types"
                value={selectedType}
                onChange={(value) => setSelectedType(value || "all")}
                data={[
                  { value: "all", label: "All types" },
                  { value: "car", label: "Car" },
                  { value: "motorcycle", label: "Motorcycle" },
                  { value: "truck", label: "Truck" },
                  { value: "van", label: "Van" },
                ]}
                leftSection={<IconCar size={16} />}
                style={{ minWidth: 200 }}
                clearable
              />
              <DatePickerInput
                type="range"
                label="Purchase Date Range"
                value={dateRange}
                onChange={setDateRange}
                leftSection={<IconCalendar size={16} />}
                style={{ minWidth: 250 }}
                clearable
              />
              <TextInput
                label="Search"
                placeholder="Search vehicles..."
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
                  setSelectedType("all");
                  setDateRange([null, null]);
                  setSearchQuery("");
                }}
                leftSection={<IconFilter size={16} />}
              >
                Reset Filters
              </Button>
            </Group>
          </Stack>
        </Card>

        {vehicles.length === 0 ? (
          <Card
            withBorder
            p="xl"
            radius="md"
            style={{
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            }}
          >
            <Stack align="center" gap="xl">
              <ThemeIcon size={80} radius="xl" variant="light" color="blue">
                <IconCar size={40} />
              </ThemeIcon>
              <Stack gap="xs" align="center">
                <Text size="xl" fw={700}>
                  Your Garage is Empty
                </Text>
                <Text size="lg" c="dimmed" ta="center" maw={400}>
                  Start by adding your first vehicle to track its maintenance,
                  expenses, and service history.
                </Text>
              </Stack>
              <Button
                leftSection={<IconPlus size={20} />}
                onClick={openAddModal}
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 45 }}
              >
                Add Your First Vehicle
              </Button>
            </Stack>
          </Card>
        ) : (
          <Grid>
            {filteredVehicles.map((vehicle, index) => {
              // Calculate the span based on number of vehicles
              let span;
              if (filteredVehicles.length === 1) {
                span = { base: 12, sm: 12, md: 12, lg: 12 }; // Full width
              } else if (filteredVehicles.length === 2) {
                span = { base: 12, sm: 6, md: 6, lg: 6 }; // Two columns
              } else if (filteredVehicles.length === 3) {
                span = { base: 12, sm: 6, md: 4, lg: 4 }; // Three columns
              } else {
                span = { base: 12, sm: 6, md: 4, lg: 4 }; // Three columns with wrapping
              }

              return (
                <Grid.Col key={vehicle.id} span={span}>
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
                        style={{
                          ...styles,
                          transitionDelay: `${index * 150}ms`,
                        }}
                      >
                        <Card.Section
                          p="md"
                          bg="linear-gradient(135deg, #228be6 0%, #15aabf 100%)"
                          style={{
                            borderTopLeftRadius: "var(--mantine-radius-md)",
                            borderTopRightRadius: "var(--mantine-radius-md)",
                          }}
                        >
                          <Group justify="space-between" align="flex-start">
                            <Group gap="xs">
                              {getVehicleTypeIcon(vehicle.type, 32)}
                              <Stack gap={0}>
                                <Text
                                  fw={700}
                                  size={
                                    filteredVehicles.length === 1 ? "2xl" : "xl"
                                  }
                                  c="white"
                                >
                                  {vehicle.make} {vehicle.model}
                                </Text>
                                <Text size="sm" c="white" opacity={0.8}>
                                  {vehicle.year}
                                </Text>
                              </Stack>
                            </Group>
                            <Menu position="bottom-end" shadow="md">
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="white">
                                  <IconDotsVertical size={20} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconEdit size={14} />}
                                  onClick={() => openEditVehicleModal(vehicle)}
                                >
                                  Edit
                                </Menu.Item>
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() =>
                                    openDeleteVehicleModal(vehicle)
                                  }
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Card.Section>

                        <Card.Section p="md">
                          <Stack gap="md">
                            <Group gap="xs">
                              <LicensePlate plate={vehicle.license_plate} />
                            </Group>

                            <Divider />

                            <Stack gap="md">
                              <Group gap="xs">
                                <ThemeIcon
                                  size="md"
                                  variant="light"
                                  color="blue"
                                >
                                  <IconGauge size={16} />
                                </ThemeIcon>
                                <Text size="sm" fw={500}>
                                  Mileage
                                </Text>
                                <Text size="sm" c="dimmed" ml="auto">
                                  {vehicle.current_mileage.toLocaleString()}{" "}
                                  miles
                                </Text>
                              </Group>

                              <Group gap="xs">
                                <ThemeIcon
                                  size="md"
                                  variant="light"
                                  color="blue"
                                >
                                  <IconCalendar size={16} />
                                </ThemeIcon>
                                <Text size="sm" fw={500}>
                                  Last Service
                                </Text>
                                <Text size="sm" c="dimmed" ml="auto">
                                  {new Date(
                                    vehicle.last_service_date
                                  ).toLocaleDateString()}
                                </Text>
                              </Group>

                              <Group gap="xs">
                                <ThemeIcon
                                  size="md"
                                  variant="light"
                                  color="blue"
                                >
                                  <IconColorSwatch size={16} />
                                </ThemeIcon>
                                <Text size="sm" fw={500}>
                                  Color
                                </Text>
                                <Group gap="xs" ml="auto">
                                  <Text size="sm" c="dimmed">
                                    {vehicle.color}
                                  </Text>
                                  <div
                                    style={{
                                      width: 24,
                                      height: 16,
                                      borderRadius: "4px",
                                      backgroundColor: vehicle.color_hex,
                                      border: "1px solid #dee2e6",
                                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                    }}
                                  />
                                </Group>
                              </Group>
                            </Stack>

                            {vehicle.notes && (
                              <>
                                <Divider />
                                <Group gap="xs">
                                  <ThemeIcon
                                    size="md"
                                    variant="light"
                                    color="blue"
                                  >
                                    <IconNotes size={16} />
                                  </ThemeIcon>
                                  <Text size="sm" fw={500}>
                                    Notes
                                  </Text>
                                </Group>
                                <Paper
                                  withBorder
                                  p="xs"
                                  radius="sm"
                                  bg="gray.0"
                                >
                                  <Text
                                    size="sm"
                                    c="dimmed"
                                    style={{ fontStyle: "italic" }}
                                  >
                                    {vehicle.notes}
                                  </Text>
                                </Paper>
                              </>
                            )}

                            {/* Quick Actions */}
                            <Divider />
                            <Group gap="xs">
                              <UnstyledButton
                                onClick={() =>
                                  handleServiceHistoryClick(vehicle)
                                }
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "var(--mantine-radius-md)",
                                  backgroundColor:
                                    "var(--mantine-color-blue-0)",
                                  color: "var(--mantine-color-blue-7)",
                                  transition: "all 0.2s ease",
                                  border:
                                    "1px solid var(--mantine-color-blue-2)",
                                  flex: 1,
                                  justifyContent: "center",
                                  "&:hover": {
                                    backgroundColor:
                                      "var(--mantine-color-blue-1)",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="blue"
                                >
                                  <IconTools size={16} />
                                </ThemeIcon>
                                <Text size="xs" fw={500}>
                                  Maintenance History
                                </Text>
                              </UnstyledButton>
                              <UnstyledButton
                                onClick={() => handleExpensesClick(vehicle)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "var(--mantine-radius-md)",
                                  backgroundColor:
                                    "var(--mantine-color-green-0)",
                                  color: "var(--mantine-color-green-7)",
                                  transition: "all 0.2s ease",
                                  border:
                                    "1px solid var(--mantine-color-green-2)",
                                  flex: 1,
                                  justifyContent: "center",
                                  "&:hover": {
                                    backgroundColor:
                                      "var(--mantine-color-green-1)",
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="green"
                                >
                                  <IconChartBar size={16} />
                                </ThemeIcon>
                                <Text size="xs" fw={500}>
                                  Expenses
                                </Text>
                              </UnstyledButton>
                            </Group>
                          </Stack>
                        </Card.Section>
                      </Card>
                    )}
                  </Transition>
                </Grid.Col>
              );
            })}
          </Grid>
        )}
      </Stack>

      {/* Service History Modal */}
      <Modal
        opened={serviceHistoryModalOpened}
        onClose={closeServiceHistoryModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" size="sm">
              <IconTools size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              SERVICE HISTORY
            </Text>
          </Group>
        }
        size="lg"
        padding="xl"
      >
        <Stack gap="xl">
          {loadingServiceHistory ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : serviceHistory.length === 0 ? (
            <Card withBorder radius="md" p="xl" className="text-center">
              <Stack gap="md" align="center">
                <ThemeIcon size={80} radius="xl" variant="light" color="blue">
                  <IconTools size={40} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xl" fw={700}>
                    NO SERVICE HISTORY
                  </Text>
                  <Text c="dimmed" size="sm">
                    No service records found for this vehicle.
                  </Text>
                </Stack>
              </Stack>
            </Card>
          ) : (
            <Stack gap="md">
              {serviceHistory.map((service) => (
                <Card key={service.id} withBorder radius="md" p="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Stack gap={0}>
                        <Text fw={600} size="lg" tt="uppercase">
                          {service.service_type}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {service.description}
                        </Text>
                      </Stack>
                      <Badge size="lg" variant="light" color="blue">
                        {new Date(service.service_date).toLocaleDateString()}
                      </Badge>
                    </Group>
                    <Divider />
                    <Stack gap="md">
                      <Group gap="xl">
                        <Group gap="xs">
                          <ThemeIcon size="md" variant="light" color="blue">
                            <IconGauge size={16} />
                          </ThemeIcon>
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed" tt="uppercase">
                              Mileage
                            </Text>
                            <Text fw={500}>
                              {service.mileage.toLocaleString()} miles
                            </Text>
                          </Stack>
                        </Group>
                        {service.cost > 0 && (
                          <Group gap="xs">
                            <ThemeIcon size="md" variant="light" color="green">
                              <IconCurrencyDollar size={16} />
                            </ThemeIcon>
                            <Stack gap={0}>
                              <Text size="xs" c="dimmed" tt="uppercase">
                                Cost
                              </Text>
                              <Text fw={500}>
                                TZS {service.cost.toLocaleString()}
                              </Text>
                            </Stack>
                          </Group>
                        )}
                      </Group>
                      <Group gap="xs">
                        <ThemeIcon size="md" variant="light" color="blue">
                          <IconBuilding size={16} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text size="xs" c="dimmed" tt="uppercase">
                            Service Provider
                          </Text>
                          <Text fw={500}>{service.service_provider}</Text>
                        </Stack>
                      </Group>
                      {service.notes && (
                        <Group gap="xs">
                          <ThemeIcon size="md" variant="light" color="blue">
                            <IconNotes size={16} />
                          </ThemeIcon>
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed" tt="uppercase">
                              Notes
                            </Text>
                            <Text fw={500}>{service.notes}</Text>
                          </Stack>
                        </Group>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Modal>

      {/* Expenses Modal */}
      <Modal
        opened={expensesModalOpened}
        onClose={closeExpensesModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="green" size="sm">
              <IconChartBar size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              EXPENSES
            </Text>
          </Group>
        }
        size="lg"
        padding="xl"
      >
        <Stack gap="xl">
          {loadingExpenses ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : expenses.length === 0 ? (
            <Card withBorder radius="md" p="xl" className="text-center">
              <Stack gap="md" align="center">
                <ThemeIcon size={80} radius="xl" variant="light" color="green">
                  <IconChartBar size={40} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xl" fw={700}>
                    NO EXPENSES
                  </Text>
                  <Text c="dimmed" size="sm">
                    No expense records found for this vehicle.
                  </Text>
                </Stack>
              </Stack>
            </Card>
          ) : (
            <Stack gap="md">
              {expenses.map((expense) => (
                <Card key={expense.id} withBorder radius="md" p="md">
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Stack gap={0}>
                        <Text fw={600} size="lg" tt="uppercase">
                          {expense.category}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {expense.description}
                        </Text>
                      </Stack>
                      <Badge size="lg" variant="light" color="green">
                        {new Date(expense.date).toLocaleDateString()}
                      </Badge>
                    </Group>
                    <Divider />
                    <Group gap="xs">
                      <ThemeIcon size="md" variant="light" color="green">
                        <IconCurrencyDollar size={16} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed" tt="uppercase">
                          Amount
                        </Text>
                        <Text fw={500} size="lg">
                          TZS {expense.amount.toLocaleString()}
                        </Text>
                      </Stack>
                    </Group>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" size="sm">
              <IconEdit size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              EDIT VEHICLE
            </Text>
          </Group>
        }
        size="lg"
        padding="xl"
      >
        <Stack gap="xl">
          <SimpleGrid cols={2} spacing="md">
            <TextInput
              label="Make"
              placeholder="Enter vehicle make"
              value={editForm.make}
              onChange={(e) =>
                setEditForm({ ...editForm, make: e.target.value })
              }
            />
            <TextInput
              label="Model"
              placeholder="Enter vehicle model"
              value={editForm.model}
              onChange={(e) =>
                setEditForm({ ...editForm, model: e.target.value })
              }
            />
            <NumberInput
              label="Year"
              placeholder="Enter vehicle year"
              value={editForm.year}
              onChange={(value) =>
                setEditForm({ ...editForm, year: Number(value) })
              }
            />
            <Select
              label="Type"
              placeholder="Select vehicle type"
              value={editForm.type}
              onChange={(value) =>
                setEditForm({ ...editForm, type: value as Vehicle["type"] })
              }
              data={[
                { value: "car", label: "Car" },
                { value: "motorcycle", label: "Motorcycle" },
                { value: "truck", label: "Truck" },
                { value: "van", label: "Van" },
                { value: "other", label: "Other" },
              ]}
            />
            <TextInput
              label="License Plate"
              placeholder="Enter license plate"
              value={editForm.license_plate}
              onChange={(e) =>
                setEditForm({ ...editForm, license_plate: e.target.value })
              }
            />
          </SimpleGrid>

          <Group grow>
            <TextInput
              label="Color Name"
              placeholder="e.g., Metallic Blue"
              value={editForm.color}
              onChange={(e) =>
                setEditForm({ ...editForm, color: e.target.value })
              }
            />
            <ColorInput
              label="Color"
              placeholder="Select color"
              value={editForm.color_hex}
              onChange={(value) =>
                setEditForm({ ...editForm, color_hex: value })
              }
              format="hex"
              swatches={Object.keys(COLOR_MAP)}
            />
          </Group>

          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Current Mileage"
              placeholder="Enter current mileage"
              value={editForm.current_mileage}
              onChange={(value) =>
                setEditForm({ ...editForm, current_mileage: Number(value) })
              }
            />
            <TextInput
              label="Last Service Date"
              type="date"
              value={editForm.last_service_date}
              onChange={(e) =>
                setEditForm({ ...editForm, last_service_date: e.target.value })
              }
            />
          </SimpleGrid>

          <Textarea
            label="Notes"
            placeholder="Enter any additional notes"
            value={editForm.notes}
            onChange={(e) =>
              setEditForm({ ...editForm, notes: e.target.value })
            }
            minRows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" size="sm">
              <IconPlus size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              ADD NEW VEHICLE
            </Text>
          </Group>
        }
        size="lg"
        padding="xl"
      >
        <Stack gap="xl">
          <SimpleGrid cols={2} spacing="md">
            <TextInput
              label="Make"
              placeholder="Enter vehicle make"
              required
              value={addForm.make}
              onChange={(e) => setAddForm({ ...addForm, make: e.target.value })}
            />
            <TextInput
              label="Model"
              placeholder="Enter vehicle model"
              required
              value={addForm.model}
              onChange={(e) =>
                setAddForm({ ...addForm, model: e.target.value })
              }
            />
            <NumberInput
              label="Year"
              placeholder="Enter vehicle year"
              required
              value={addForm.year}
              onChange={(value) =>
                setAddForm({ ...addForm, year: Number(value) })
              }
            />
            <Select
              label="Vehicle Type"
              placeholder="Select vehicle type"
              required
              value={addForm.type}
              onChange={(value) =>
                setAddForm({ ...addForm, type: value as Vehicle["type"] })
              }
              data={[
                { value: "car", label: "Car" },
                { value: "motorcycle", label: "Motorcycle" },
                { value: "truck", label: "Truck" },
                { value: "van", label: "Van" },
                { value: "other", label: "Other" },
              ]}
            />
          </SimpleGrid>

          <Group grow>
            <TextInput
              label="Color Name"
              placeholder="e.g., Metallic Blue"
              value={addForm.color}
              onChange={(e) =>
                setAddForm({ ...addForm, color: e.target.value })
              }
            />
            <ColorInput
              label="Color"
              placeholder="Select color"
              value={addForm.color_hex}
              onChange={(value) => setAddForm({ ...addForm, color_hex: value })}
              format="hex"
              swatches={Object.keys(COLOR_MAP)}
            />
          </Group>

          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Current Mileage"
              placeholder="Enter current mileage"
              value={addForm.current_mileage}
              onChange={(value) =>
                setAddForm({ ...addForm, current_mileage: Number(value) })
              }
            />
            <DateInput
              label="Purchase Date"
              placeholder="Select purchase date"
              value={
                addForm.purchase_date
                  ? new Date(addForm.purchase_date)
                  : undefined
              }
              onChange={(value) =>
                setAddForm({ ...addForm, purchase_date: value?.toISOString() })
              }
            />
            <NumberInput
              label="Purchase Price"
              placeholder="Enter purchase price"
              value={addForm.purchase_price}
              onChange={(value) =>
                setAddForm({ ...addForm, purchase_price: Number(value) })
              }
            />
            <DateInput
              label="Last Service Date"
              placeholder="Select last service date"
              value={
                addForm.last_service_date
                  ? new Date(addForm.last_service_date)
                  : undefined
              }
              onChange={(value) =>
                setAddForm({
                  ...addForm,
                  last_service_date: value?.toISOString(),
                })
              }
            />
          </SimpleGrid>

          <Textarea
            label="Notes"
            placeholder="Enter any additional notes"
            value={addForm.notes}
            onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
            minRows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Vehicle</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="red" size="sm">
              <IconTrash size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              DELETE VEHICLE
            </Text>
          </Group>
        }
        centered
        padding="xl"
      >
        <Stack gap="xl">
          <Card withBorder radius="md" p="md" bg="red.0">
            <Group gap="md">
              <ThemeIcon size="xl" radius="xl" variant="light" color="red">
                <IconAlertTriangle size={24} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text fw={600} size="lg" tt="uppercase">
                  Are You Sure?
                </Text>
                <Text size="sm" c="dimmed">
                  This action cannot be undone. All associated data will be
                  permanently deleted.
                </Text>
              </Stack>
            </Group>
          </Card>

          <Text>
            You are about to delete{" "}
            <Text fw={600} component="span" tt="uppercase">
              {selectedVehicle?.make} {selectedVehicle?.model}
            </Text>
            . This will remove all service history, expenses, and other
            associated data.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete Vehicle
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
