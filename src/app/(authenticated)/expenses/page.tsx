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
  NumberInput,
  ActionIcon,
  Menu,
  Tabs,
  Grid,
  Paper,
  ThemeIcon,
  Divider,
  Skeleton,
  RingProgress,
  ScrollArea,
  ComboboxItem,
  MultiSelect,
  Tooltip,
  rem,
  Table,
  SimpleGrid,
  Transition,
} from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconGasStation,
  IconTool,
  IconReceipt,
  IconNotes,
  IconSearch,
  IconFilter,
  IconChartBar,
  IconCalendar,
  IconCar,
  IconWallet,
  IconTrendingUp,
  IconReceipt2,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { notifications } from "@mantine/notifications";
import Link from "next/link";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type Vehicle = Database["public"]["Tables"]["cars"]["Row"];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expenseType, setExpenseType] = useState<
    "fuel" | "maintenance" | "insurance" | "taxes" | "accessories" | "other"
  >("fuel");
  const [formData, setFormData] = useState({
    car_id: "",
    category: "fuel" as
      | "fuel"
      | "maintenance"
      | "insurance"
      | "taxes"
      | "accessories"
      | "other",
    date: new Date(),
    amount: 0,
    description: "",
    receipt_url: "",
    notes: "",
  });
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<
    "all" | "month" | "year" | "custom"
  >("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const welcomeMessage = useMemo(() => {
    const messages = [
      "Logging every swipe, spill, and surprise bill. 💳🛠️",
      "From gas to 'oh no' — every coin counts. ⛽😅",
      "The receipts live here now. Don't fight it. 🧾😎",
      "Fuel, fixes, and fun — let the money trail live on. 🔧💰",
      "Your car's financial history, minus the heartbreak. 🪙🧘",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []); // Empty dependency array means this will only run once when component mounts

  useEffect(() => {
    fetchData().finally(() => {
      setTimeout(() => setMounted(true), 200);
    });
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      // Fetch vehicles for the current user
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (vehiclesError) throw vehiclesError;

      setVehicles(vehiclesData || []);

      // Only fetch expenses if there are vehicles
      if (vehiclesData && vehiclesData.length > 0) {
        const vehicleIds = vehiclesData.map((v) => v.id);
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*")
          .in("vehicle_id", vehicleIds)
          .order("date", { ascending: false });

        if (expensesError) throw expensesError;
        setExpenses(expensesData || []);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch data. Please try again.",
        color: "red",
      });
      setVehicles([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("expenses").insert([
        {
          car_id: formData.car_id,
          category: formData.category,
          date: formData.date,
          amount: formData.amount,
          description: formData.description,
          receipt_url: formData.receipt_url,
          notes: formData.notes,
        },
      ]);

      if (error) throw error;

      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      car_id: "",
      category: "fuel",
      date: new Date(),
      amount: 0,
      description: "",
      receipt_url: "",
      notes: "",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const filteredExpenses = expenses
    .filter((expense) => {
      // Filter by vehicle
      if (selectedVehicle && expense.car_id !== selectedVehicle) {
        return false;
      }

      // Filter by date range
      if (dateRange[0] && dateRange[1]) {
        const expenseDate = new Date(expense.date);
        return expenseDate >= dateRange[0] && expenseDate <= dateRange[1];
      }

      // Filter by time range preset
      if (timeRange !== "all") {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        if (timeRange === "month" && expenseDate < startOfMonth) {
          return false;
        }
        if (timeRange === "year" && expenseDate < startOfYear) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          (expense.description?.toLowerCase().includes(searchLower) ?? false) ||
          (expense.notes?.toLowerCase().includes(searchLower) ?? false)
        );
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(expense.category)
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  const filteredTotalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const filteredExpensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        if (dateRange[0] && dateRange[1]) {
          return `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`;
        }
        return "All Time";
      default:
        return "All Time";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fuel":
        return <IconGasStation size={16} />;
      case "maintenance":
        return <IconTool size={16} />;
      case "insurance":
        return <IconReceipt size={16} />;
      default:
        return <IconReceipt size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fuel":
        return "blue";
      case "maintenance":
        return "green";
      case "insurance":
        return "violet";
      case "taxes":
        return "orange";
      case "accessories":
        return "cyan";
      default:
        return "gray";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "fuel":
        return "Fuel";
      case "maintenance":
        return "Maintenance";
      case "insurance":
        return "Insurance";
      case "taxes":
        return "Taxes";
      case "accessories":
        return "Accessories";
      default:
        return "Other";
    }
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
                        <IconWallet size={28} />
                      </ThemeIcon>
                      <Title order={1}>Expenses</Title>
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
                        Add your vehicles to start tracking expenses
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
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Transition
          mounted={mounted}
          transition="slide-down"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <Group justify="space-between" align="flex-start" style={styles}>
              <Stack gap={0}>
                <Group gap="xs">
                  <ThemeIcon
                    size={48}
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan", deg: 45 }}
                  >
                    <IconWallet size={28} />
                  </ThemeIcon>
                  <div>
                    <Group gap="xs">
                      <Title order={1}>Expenses</Title>
                      <Tooltip
                        label={
                          <Stack gap="xs" p="xs">
                            <Text size="sm" fw={500}>
                              Your Vehicles:
                            </Text>
                            {vehicles.map((vehicle) => (
                              <Group key={vehicle.id} gap="xs">
                                <Text size="sm">
                                  {vehicle.make} {vehicle.model} ({vehicle.year}
                                  )
                                </Text>
                              </Group>
                            ))}
                          </Stack>
                        }
                        position="bottom"
                        withArrow
                      >
                        <Badge
                          variant="light"
                          color="blue"
                          style={{ cursor: "help" }}
                        >
                          {vehicles.length}{" "}
                          {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
                        </Badge>
                      </Tooltip>
                    </Group>
                    <Text
                      c="dimmed"
                      size="lg"
                      fw={500}
                      style={{ letterSpacing: "0.3px" }}
                    >
                      {welcomeMessage}
                    </Text>
                  </div>
                </Group>
              </Stack>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setModalOpen(true)}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 45 }}
              >
                Add Expense
              </Button>
            </Group>
          )}
        </Transition>

        {/* Filters and Controls */}
        <Transition
          mounted={mounted}
          transition="slide-down"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <Card withBorder radius="md" p="md" style={styles}>
              <Stack gap="md">
                <Group gap="md" wrap="wrap" align="flex-end">
                  <Select
                    label="Vehicle"
                    placeholder="All vehicles"
                    value={selectedVehicle}
                    onChange={setSelectedVehicle}
                    data={[
                      { value: "", label: "All vehicles" },
                      ...vehicles.map((v) => ({
                        value: v.id,
                        label: `${v.make} ${v.model} ${v.year}`,
                      })),
                    ]}
                    leftSection={<IconCar size={16} />}
                    style={{ minWidth: 200 }}
                  />
                  <MultiSelect
                    label="Categories"
                    placeholder="All categories"
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    data={[
                      { value: "fuel", label: "Fuel" },
                      { value: "maintenance", label: "Maintenance" },
                      { value: "insurance", label: "Insurance" },
                      { value: "taxes", label: "Taxes" },
                      { value: "accessories", label: "Accessories" },
                      { value: "other", label: "Other" },
                    ]}
                    leftSection={<IconReceipt size={16} />}
                    style={{ minWidth: 200 }}
                  />
                  <DatePickerInput
                    type="range"
                    label="Date Range"
                    value={dateRange}
                    onChange={setDateRange}
                    leftSection={<IconCalendar size={16} />}
                    style={{ minWidth: 250 }}
                  />
                  <TextInput
                    label="Search"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ minWidth: 200 }}
                  />
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => {
                      setSelectedVehicle(null);
                      setSelectedCategories([]);
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
          )}
        </Transition>

        {/* Summary Section */}
        <Transition
          mounted={mounted}
          transition="slide-down"
          duration={400}
          timingFunction="ease"
        >
          {(styles) => (
            <Card withBorder radius="md" p="md" style={styles}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconChartBar size={16} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      Summary for{" "}
                      {selectedVehicle
                        ? vehicles.find((v) => v.id === selectedVehicle)?.make +
                          " " +
                          vehicles.find((v) => v.id === selectedVehicle)?.model
                        : "All Vehicles"}
                    </Text>
                  </Group>
                  <Badge variant="light" color="gray">
                    {getTimeRangeLabel()}
                  </Badge>
                </Group>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Transition
                      mounted={mounted}
                      transition="slide-down"
                      duration={400}
                      timingFunction="ease"
                    >
                      {(styles) => (
                        <Card
                          withBorder
                          radius="md"
                          p="md"
                          style={{ ...styles, transition: "transform 0.2s" }}
                          className="hover:scale-105"
                        >
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed">
                              Total Expenses
                            </Text>
                            <ThemeIcon variant="light" color="blue" size="sm">
                              <IconReceipt size={16} />
                            </ThemeIcon>
                          </Group>
                          <Text fw={700} size="xl" mb={4}>
                            TZS {filteredTotalExpenses.toLocaleString()}
                          </Text>
                          <Group gap={4}>
                            <Text size="xs" c="dimmed">
                              Top Category:
                            </Text>
                            <Badge variant="light" color="blue" size="sm">
                              {Object.entries(filteredExpensesByCategory).sort(
                                ([, a], [, b]) => b - a
                              )[0]?.[0] || "None"}
                            </Badge>
                          </Group>
                        </Card>
                      )}
                    </Transition>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Transition
                      mounted={mounted}
                      transition="slide-down"
                      duration={400}
                      timingFunction="ease"
                    >
                      {(styles) => (
                        <Card
                          withBorder
                          radius="md"
                          p="md"
                          style={{ ...styles, transition: "transform 0.2s" }}
                          className="hover:scale-105"
                        >
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed">
                              Average per Month
                            </Text>
                            <ThemeIcon variant="light" color="green" size="sm">
                              <IconTrendingUp size={16} />
                            </ThemeIcon>
                          </Group>
                          <Text fw={700} size="xl" mb={4}>
                            TZS {(filteredTotalExpenses / 12).toLocaleString()}
                          </Text>
                          <Group gap={4}>
                            <Text size="xs" c="dimmed">
                              Highest Month:
                            </Text>
                            <Badge variant="light" color="green" size="sm">
                              {(() => {
                                const monthlyExpenses = filteredExpenses.reduce(
                                  (acc, expense) => {
                                    const month = new Date(
                                      expense.date
                                    ).toLocaleString("default", {
                                      month: "short",
                                    });
                                    acc[month] =
                                      (acc[month] || 0) + expense.amount;
                                    return acc;
                                  },
                                  {} as Record<string, number>
                                );
                                return (
                                  Object.entries(monthlyExpenses).sort(
                                    ([, a], [, b]) => b - a
                                  )[0]?.[0] || "None"
                                );
                              })()}
                            </Badge>
                          </Group>
                        </Card>
                      )}
                    </Transition>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Transition
                      mounted={mounted}
                      transition="slide-down"
                      duration={400}
                      timingFunction="ease"
                    >
                      {(styles) => (
                        <Card
                          withBorder
                          radius="md"
                          p="md"
                          style={{ ...styles, transition: "transform 0.2s" }}
                          className="hover:scale-105"
                        >
                          <Group justify="space-between" mb="xs">
                            <Text size="sm" c="dimmed">
                              Total Categories
                            </Text>
                            <ThemeIcon variant="light" color="violet" size="sm">
                              <IconReceipt2 size={16} />
                            </ThemeIcon>
                          </Group>
                          <Text fw={700} size="xl" mb={4}>
                            {Object.keys(filteredExpensesByCategory).length}
                          </Text>
                          <Group gap={4}>
                            <Text size="xs" c="dimmed">
                              Most Used:
                            </Text>
                            <Badge variant="light" color="violet" size="sm">
                              {(() => {
                                const categoryCounts = filteredExpenses.reduce(
                                  (acc, expense) => {
                                    acc[expense.category] =
                                      (acc[expense.category] || 0) + 1;
                                    return acc;
                                  },
                                  {} as Record<string, number>
                                );
                                return (
                                  Object.entries(categoryCounts).sort(
                                    ([, a], [, b]) => b - a
                                  )[0]?.[0] || "None"
                                );
                              })()}
                            </Badge>
                          </Group>
                        </Card>
                      )}
                    </Transition>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          )}
        </Transition>

        {/* Expenses Grid */}
        <Grid>
          {filteredExpenses.map((expense, index) => (
            <Grid.Col key={expense.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <Card
                    withBorder
                    radius="md"
                    p="md"
                    style={{ ...styles, transition: "transform 0.2s" }}
                    className="hover:scale-105"
                  >
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <ThemeIcon
                          variant="light"
                          color={getCategoryColor(expense.category)}
                          size="sm"
                        >
                          {getCategoryIcon(expense.category)}
                        </ThemeIcon>
                        <Text fw={500} size="sm">
                          {getCategoryLabel(expense.category)}
                        </Text>
                      </Group>
                      <Menu position="bottom-end">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => {
                              setFormData({
                                car_id: expense.car_id,
                                category: expense.category as
                                  | "fuel"
                                  | "maintenance"
                                  | "insurance"
                                  | "taxes"
                                  | "accessories"
                                  | "other",
                                date: new Date(expense.date),
                                amount: expense.amount,
                                description: expense.description || "",
                                receipt_url: expense.receipt_url || "",
                                notes: expense.notes || "",
                              });
                              setModalOpen(true);
                            }}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => handleDelete(expense.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                    <Text size="xl" fw={700} mb="xs">
                      TZS {expense.amount.toLocaleString()}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {expense.description ?? "No description"}
                    </Text>
                    <Group gap="xs" wrap="wrap">
                      <Badge
                        variant="light"
                        color="blue"
                        leftSection={<IconCar size={12} />}
                      >
                        {vehicles.find((v) => v.id === expense.car_id)?.make}{" "}
                        {vehicles.find((v) => v.id === expense.car_id)?.model}
                      </Badge>
                      <Badge
                        variant="light"
                        color="gray"
                        leftSection={<IconCalendar size={12} />}
                      >
                        {new Date(expense.date).toLocaleDateString()}
                      </Badge>
                    </Group>
                  </Card>
                )}
              </Transition>
            </Grid.Col>
          ))}
        </Grid>

        {/* Add/Edit Expense Modal */}
        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          title={
            <Group gap="xs">
              <ThemeIcon
                variant="light"
                color={getCategoryColor(formData.category)}
                size="sm"
              >
                {getCategoryIcon(formData.category)}
              </ThemeIcon>
              <Text fw={500}>
                {formData.car_id ? "Edit Expense" : "Add New Expense"}
              </Text>
            </Group>
          }
          size="lg"
          padding="xl"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="xl">
              {/* Vehicle Selection */}
              <Card withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="blue" size="sm">
                      <IconCar size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      Vehicle Details
                    </Text>
                  </Group>
                  <Select
                    label="Select Vehicle"
                    placeholder="Choose a vehicle"
                    value={formData.car_id}
                    onChange={(value) =>
                      setFormData({ ...formData, car_id: value || "" })
                    }
                    data={vehicles.map((v) => ({
                      value: v.id,
                      label: `${v.make} ${v.model} ${v.year}`,
                    }))}
                    required
                    leftSection={<IconCar size={16} />}
                  />
                </Stack>
              </Card>

              {/* Expense Details */}
              <Card withBorder radius="md" p="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="violet" size="sm">
                      <IconReceipt size={16} />
                    </ThemeIcon>
                    <Text fw={500} size="sm">
                      Expense Details
                    </Text>
                  </Group>
                  <Group grow>
                    <Select
                      label="Category"
                      placeholder="Select category"
                      value={formData.category}
                      onChange={(value: any) =>
                        setFormData({ ...formData, category: value })
                      }
                      data={[
                        { value: "fuel", label: "Fuel" },
                        { value: "maintenance", label: "Maintenance" },
                        { value: "insurance", label: "Insurance" },
                        { value: "taxes", label: "Taxes" },
                        { value: "accessories", label: "Accessories" },
                        { value: "other", label: "Other" },
                      ]}
                      required
                      leftSection={getCategoryIcon(formData.category)}
                    />
                    <NumberInput
                      label="Amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(value) =>
                        setFormData({ ...formData, amount: Number(value) })
                      }
                      min={0}
                      required
                      leftSection={<IconWallet size={16} />}
                    />
                  </Group>
                  <DateInput
                    label="Date"
                    value={formData.date}
                    onChange={(date) =>
                      setFormData({ ...formData, date: date || new Date() })
                    }
                    required
                    leftSection={<IconCalendar size={16} />}
                  />
                </Stack>
              </Card>

              {/* Description and Notes */}
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
                  <TextInput
                    label="Description"
                    placeholder="Enter expense description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    leftSection={<IconNotes size={16} />}
                    style={{ minWidth: 200 }}
                  />
                  <TextInput
                    label="Receipt URL"
                    placeholder="Enter receipt URL (optional)"
                    value={formData.receipt_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receipt_url: e.currentTarget.value,
                      })
                    }
                    leftSection={<IconReceipt size={16} />}
                  />
                  <Textarea
                    label="Notes"
                    placeholder="Enter additional notes (optional)"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.currentTarget.value })
                    }
                    minRows={3}
                    leftSection={<IconNotes size={16} />}
                  />
                </Stack>
              </Card>

              {/* Action Buttons */}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  color="gray"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftSection={<IconPlus size={16} />}
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan", deg: 45 }}
                >
                  {formData.car_id ? "Update Expense" : "Add Expense"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Container>
  );
}
