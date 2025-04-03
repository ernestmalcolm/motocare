"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  RingProgress,
  Badge,
  Button,
  ThemeIcon,
  rem,
  Timeline,
  Paper,
  Divider,
  Skeleton,
  Transition,
  Box,
  Title,
} from "@mantine/core";
import {
  IconCar,
  IconTools,
  IconBell,
  IconWallet,
  IconGasStation,
  IconCalendar,
  IconChartBar,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconClock,
  IconCalendarTime,
  IconPlus,
  IconDashboard,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { DatePickerInput } from "@mantine/dates";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  type: "car" | "motorcycle" | "truck" | "van" | "other";
  license_plate: string;
  color: string;
  color_hex: string;
  purchase_date: string;
  purchase_price: number;
  current_mileage: number;
  last_service_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
};

type MaintenanceRecord = {
  id: string;
  vehicle_id: string;
  type: string;
  date: string;
  cost: number;
  description: string;
};

type Reminder = {
  id: string;
  vehicle_id: string;
  title: string;
  due_date: string;
  priority: "high" | "medium" | "low";
};

type Expense = {
  id: string;
  vehicle_id: string;
  category: string;
  amount: number;
  date: string;
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const welcomeMessage = useMemo(() => {
    const messages = [
      "You bring the car drama, we'll keep it organized. 🧰🚗",
      "Tracking your car life like it's a Netflix series. 🍿📅",
      "If your car had a diary, this would be it. 📖🔧",
      "Not all heroes wear capes — some just log oil changes on time. 🛠️🦸",
      "Welcome back, Captain. All systems nominal. 🧑‍✈️🚘",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        }

        // Fetch vehicles
        const { data: vehiclesData } = await supabase
          .from("vehicles")
          .select("*");
        setVehicles(vehiclesData || []);

        // Fetch maintenance records
        const { data: maintenanceData } = await supabase
          .from("maintenance_records")
          .select("*")
          .order("date", { ascending: false })
          .limit(5);
        setMaintenanceRecords(maintenanceData || []);

        // Fetch reminders - increased to 3
        const { data: remindersData } = await supabase
          .from("reminders")
          .select("*")
          .order("due_date", { ascending: true })
          .limit(3);
        setReminders(remindersData || []);

        // Fetch expenses
        const { data: expensesData } = await supabase
          .from("expenses")
          .select("*")
          .order("date", { ascending: false })
          .limit(5);
        setExpenses(expensesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setMounted(true), 200);
      }
    };

    fetchData();
  }, []);

  const filteredMaintenanceRecords = maintenanceRecords.filter((record) => {
    if (!dateRange[0] || !dateRange[1]) return true;
    const recordDate = new Date(record.date);
    return recordDate >= dateRange[0] && recordDate <= dateRange[1];
  });

  const filteredExpenses = expenses.filter((expense) => {
    if (!dateRange[0] || !dateRange[1]) return true;
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateRange[0] && expenseDate <= dateRange[1];
  });

  const totalVehicles = vehicles.length;
  const totalMaintenanceCost = filteredMaintenanceRecords.reduce(
    (sum, record) => sum + record.cost,
    0
  );
  const upcomingReminders = reminders.filter(
    (reminder) => new Date(reminder.due_date) > new Date()
  );
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const calculateVehicleHealth = (vehicle: Vehicle) => {
    const now = new Date();

    // Handle invalid or missing dates
    const lastService = vehicle.last_service_date
      ? new Date(vehicle.last_service_date)
      : null;

    // If no service dates are available, return a poor health status
    if (!lastService) {
      return {
        score: 0,
        status: "poor",
        daysUntilNextService: 0,
        daysSinceLastService: 0,
        issues: ["No service history available"],
      };
    }

    // Calculate days since last service
    const daysSinceLastService = Math.floor(
      (now.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days until next service
    const daysUntilNextService = Math.floor(
      (lastService.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate health score (0-100)
    let healthScore = 100;
    const issues: string[] = [];

    // Service Schedule Factors (60% of total score)
    // Deduct points for overdue service
    if (daysUntilNextService < 0) {
      const overdueDays = Math.abs(daysUntilNextService);
      const serviceDeduction = Math.min(30, overdueDays * 1.5);
      healthScore -= serviceDeduction;
      issues.push(`Service overdue by ${overdueDays} days`);
    }

    // Deduct points for long time since last service
    if (daysSinceLastService > 90) {
      const delayDeduction = Math.min(15, (daysSinceLastService - 90) / 30);
      healthScore -= delayDeduction;
      issues.push(`No service for ${daysSinceLastService} days`);
    }

    // Service History Factors (40% of total score)
    // Check if service intervals are consistent
    const serviceInterval = Math.abs(
      daysUntilNextService - daysSinceLastService
    );
    if (serviceInterval > 30) {
      const intervalDeduction = Math.min(15, serviceInterval / 30);
      healthScore -= intervalDeduction;
      issues.push(`Inconsistent service intervals`);
    }

    // Check if there are any recent maintenance records
    const recentMaintenance = maintenanceRecords.filter(
      (record) =>
        record.vehicle_id === vehicle.id &&
        new Date(record.date) >
          new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    );

    if (recentMaintenance.length === 0 && daysSinceLastService > 30) {
      healthScore -= 10;
      issues.push(`No maintenance records in the last 90 days`);
    }

    // Ensure score stays between 0 and 100
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Determine status based on score and issues
    let status: "good" | "fair" | "poor";
    if (healthScore >= 80 && issues.length === 0) {
      status = "good";
    } else if (healthScore >= 60) {
      status = "fair";
    } else {
      status = "poor";
    }

    return {
      score: healthScore,
      status,
      daysUntilNextService,
      daysSinceLastService,
      issues,
    };
  };

  const getHealthColor = (status: "good" | "fair" | "poor") => {
    switch (status) {
      case "good":
        return "green";
      case "fair":
        return "yellow";
      case "poor":
        return "red";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️ Good Morning";
    if (hour < 18) return "🌤️ Good Afternoon";
    return "🌙 Good Evening";
  };

  const getWelcomeMessage = () => {
    const messages = [
      "You bring the car drama, we'll keep it organized. 🧰🚗",
      "Tracking your car life like it's a Netflix series. 🍿📅",
      "If your car had a diary, this would be it. 📖🔧",
      "Not all heroes wear capes — some just log oil changes on time. 🛠️🦸",
      "Welcome back, Captain. All systems nominal. 🧑‍✈️🚘",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const StatCardSkeleton = () => (
    <Card withBorder>
      <Group>
        <Skeleton height={40} circle />
        <Stack gap={4} style={{ flex: 1 }}>
          <Skeleton height={12} width="60%" />
          <Skeleton height={24} width="40%" />
        </Stack>
      </Group>
    </Card>
  );

  const ListCardSkeleton = () => (
    <Card withBorder>
      <Group justify="space-between" mb="md">
        <Group>
          <Skeleton height={40} circle />
          <Stack gap={4}>
            <Skeleton height={16} width={120} />
            <Skeleton height={12} width={80} />
          </Stack>
        </Group>
        <Skeleton height={24} width={60} />
      </Group>
      <Stack gap="md">
        {[1, 2, 3].map((i) => (
          <Paper key={i} withBorder p="xs">
            <Group justify="space-between">
              <Stack gap={4} style={{ flex: 1 }}>
                <Skeleton height={16} width="60%" />
                <Skeleton height={12} width="40%" />
              </Stack>
              <Skeleton height={24} width={80} />
            </Group>
          </Paper>
        ))}
      </Stack>
    </Card>
  );

  if (loading) {
    return (
      <Container size="xl">
        <Stack gap="lg">
          <Group justify="space-between">
            <Stack gap={0}>
              <Skeleton height={28} width={200} />
              <Skeleton height={16} width={120} />
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
                    <Text size="xl" fw={700}>
                      {getGreeting()}, {userName || "User"}!
                    </Text>
                    <Text c="dimmed" size="lg">
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
                        Add your vehicles to start tracking maintenance,
                        expenses, and service history
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
    <Container size="xl">
      <Stack gap="lg">
        {/* Welcome Section */}
        <Group justify="space-between">
          <Stack gap={0}>
            {loading ? (
              <>
                <Skeleton height={28} width={200} />
                <Skeleton height={16} width={120} />
              </>
            ) : (
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={600}
              >
                {(styles) => (
                  <div style={styles}>
                    <Text size="xl" fw={700}>
                      {getGreeting()}, {userName || "User"}!
                    </Text>
                    <Text c="dimmed" size="lg">
                      {welcomeMessage}
                    </Text>
                  </div>
                )}
              </Transition>
            )}
          </Stack>
          <Button
            component={Link}
            href="/garage"
            leftSection={<IconCar size={16} />}
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 45 }}
          >
            View All Vehicles
          </Button>
        </Group>

        {/* Date Range Filter */}
        {loading ? (
          <Card withBorder>
            <Group align="flex-end">
              <Skeleton height={36} style={{ flex: 1 }} />
              <Skeleton height={36} width={100} />
            </Group>
          </Card>
        ) : (
          <Transition mounted={mounted} transition="slide-down" duration={600}>
            {(styles) => (
              <Card withBorder style={styles}>
                <Group align="flex-end">
                  <DatePickerInput
                    type="range"
                    label="Filter by Date Range"
                    placeholder="Select date range"
                    value={dateRange}
                    onChange={setDateRange}
                    clearable
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="light"
                    onClick={() => setDateRange([null, null])}
                    disabled={(!dateRange[0] && !dateRange[1]) || loading}
                    mb={4}
                  >
                    Reset Filter
                  </Button>
                </Group>
              </Card>
            )}
          </Transition>
        )}

        {/* Quick Stats */}
        <Grid>
          {loading ? (
            <>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCardSkeleton />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCardSkeleton />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCardSkeleton />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <StatCardSkeleton />
              </Grid.Col>
            </>
          ) : (
            <>
              {[
                { span: { base: 12, sm: 6, md: 3 }, delay: 0 },
                { span: { base: 12, sm: 6, md: 3 }, delay: 150 },
                { span: { base: 12, sm: 6, md: 3 }, delay: 300 },
                { span: { base: 12, sm: 6, md: 3 }, delay: 450 },
              ].map(({ span, delay }, index) => (
                <Grid.Col key={index} span={span}>
                  <Transition
                    mounted={mounted}
                    transition="slide-down"
                    duration={600}
                    timingFunction="ease"
                  >
                    {(styles) => (
                      <Card
                        withBorder
                        style={{
                          ...styles,
                          transitionDelay: `${delay}ms`,
                        }}
                      >
                        <Group>
                          <ThemeIcon
                            size="lg"
                            radius="md"
                            variant="light"
                            color={
                              index === 0
                                ? "blue"
                                : index === 1
                                ? "green"
                                : index === 2
                                ? "yellow"
                                : "red"
                            }
                          >
                            {index === 0 ? (
                              <IconCar size={20} />
                            ) : index === 1 ? (
                              <IconTools size={20} />
                            ) : index === 2 ? (
                              <IconBell size={20} />
                            ) : (
                              <IconWallet size={20} />
                            )}
                          </ThemeIcon>
                          <Stack gap={0}>
                            <Text size="xs" c="dimmed" tt="uppercase">
                              {index === 0
                                ? "Total Vehicles"
                                : index === 1
                                ? "Maintenance Cost"
                                : index === 2
                                ? "Upcoming Reminders"
                                : "Total Expenses"}
                            </Text>
                            <Text fw={700} size="xl">
                              {index === 0
                                ? totalVehicles
                                : index === 1
                                ? `TZS ${totalMaintenanceCost.toLocaleString()}`
                                : index === 2
                                ? upcomingReminders.length
                                : `TZS ${totalExpenses.toLocaleString()}`}
                            </Text>
                          </Stack>
                        </Group>
                      </Card>
                    )}
                  </Transition>
                </Grid.Col>
              ))}
            </>
          )}
        </Grid>

        {/* Main Content */}
        <Grid>
          {/* Upcoming Reminders */}
          {loading ? (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ListCardSkeleton />
            </Grid.Col>
          ) : (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={600}
                timingFunction="ease"
              >
                {(styles) => (
                  <Card withBorder style={styles}>
                    <Group justify="space-between" mb="md">
                      <Group>
                        <ThemeIcon
                          size="lg"
                          radius="md"
                          variant="light"
                          color="yellow"
                        >
                          <IconBell size={20} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500} tt="uppercase">
                            Upcoming Reminders
                          </Text>
                          <Text size="xs" c="dimmed">
                            {upcomingReminders.length} reminders to address
                          </Text>
                        </Stack>
                      </Group>
                      <Button
                        component={Link}
                        href="/reminders"
                        variant="light"
                        size="xs"
                      >
                        View All
                      </Button>
                    </Group>
                    <Stack gap="md">
                      {upcomingReminders.map((reminder, index) => {
                        const dueDate = new Date(reminder.due_date);
                        const daysUntilDue = Math.ceil(
                          (dueDate.getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const isUrgent = daysUntilDue <= 3;

                        return (
                          <Transition
                            key={reminder.id}
                            mounted={mounted}
                            transition="slide-down"
                            duration={600}
                            timingFunction="ease"
                          >
                            {(styles) => (
                              <Paper
                                withBorder
                                p="md"
                                radius="md"
                                style={{
                                  ...styles,
                                  transitionDelay: `${index * 150}ms`,
                                }}
                              >
                                <Group
                                  justify="space-between"
                                  align="flex-start"
                                >
                                  <Stack gap={4}>
                                    <Group gap="xs">
                                      <Text size="sm" fw={500} tt="capitalize">
                                        {reminder.title}
                                      </Text>
                                      {isUrgent && (
                                        <Badge
                                          size="sm"
                                          variant="light"
                                          color="red"
                                          leftSection={
                                            <IconAlertTriangle size={12} />
                                          }
                                        >
                                          Urgent
                                        </Badge>
                                      )}
                                    </Group>
                                    <Group gap="xs">
                                      <IconCalendarTime
                                        size={14}
                                        style={{
                                          color: "var(--mantine-color-dimmed)",
                                        }}
                                      />
                                      <Text size="xs" c="dimmed">
                                        Due{" "}
                                        {daysUntilDue === 0
                                          ? "today"
                                          : daysUntilDue === 1
                                          ? "tomorrow"
                                          : `in ${daysUntilDue} days`}
                                      </Text>
                                    </Group>
                                  </Stack>
                                  <Badge
                                    size="sm"
                                    variant="light"
                                    color={getPriorityColor(reminder.priority)}
                                    tt="capitalize"
                                  >
                                    {reminder.priority}
                                  </Badge>
                                </Group>
                              </Paper>
                            )}
                          </Transition>
                        );
                      })}
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>
          )}

          {/* Recent Maintenance */}
          {loading ? (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ListCardSkeleton />
            </Grid.Col>
          ) : (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={600}
                timingFunction="ease"
              >
                {(styles) => (
                  <Card withBorder style={styles}>
                    <Group justify="space-between" mb="md">
                      <Group>
                        <ThemeIcon
                          size="lg"
                          radius="md"
                          variant="light"
                          color="green"
                        >
                          <IconTools size={20} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500} tt="uppercase">
                            Recent Maintenance
                          </Text>
                          <Stack gap={4}>
                            <Text size="xs" c="dimmed">
                              Latest service records
                              {dateRange[0] && dateRange[1] && (
                                <Text size="xs" c="dimmed">
                                  {dateRange[0].toLocaleDateString()} -{" "}
                                  {dateRange[1].toLocaleDateString()}
                                </Text>
                              )}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Total: TZS {totalMaintenanceCost.toLocaleString()}
                            </Text>
                          </Stack>
                        </Stack>
                      </Group>
                      <Button
                        component={Link}
                        href="/maintenance"
                        variant="light"
                        size="xs"
                      >
                        View All
                      </Button>
                    </Group>
                    <Stack gap="md">
                      {filteredMaintenanceRecords.map((record, index) => {
                        const vehicle = vehicles.find(
                          (v) => v.id === record.vehicle_id
                        );
                        return (
                          <Transition
                            key={record.id}
                            mounted={mounted}
                            transition="slide-down"
                            duration={600}
                            timingFunction="ease"
                          >
                            {(styles) => (
                              <Paper
                                withBorder
                                p="md"
                                radius="md"
                                style={{
                                  ...styles,
                                  transitionDelay: `${index * 150}ms`,
                                }}
                              >
                                <Group justify="space-between">
                                  <Stack gap={4}>
                                    <Text size="sm" fw={500} tt="capitalize">
                                      {record.type}
                                    </Text>
                                    <Group gap="xs">
                                      <IconCar
                                        size={14}
                                        style={{
                                          color: "var(--mantine-color-dimmed)",
                                        }}
                                      />
                                      <Text size="xs" c="dimmed">
                                        {vehicle
                                          ? `${vehicle.make} ${vehicle.model}`
                                          : "Unknown Vehicle"}
                                      </Text>
                                      <IconCalendar
                                        size={14}
                                        style={{
                                          color: "var(--mantine-color-dimmed)",
                                        }}
                                      />
                                      <Text size="xs" c="dimmed">
                                        {new Date(
                                          record.date
                                        ).toLocaleDateString()}
                                      </Text>
                                    </Group>
                                  </Stack>
                                  <Text fw={500} c="green">
                                    TZS {record.cost.toLocaleString()}
                                  </Text>
                                </Group>
                              </Paper>
                            )}
                          </Transition>
                        );
                      })}
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>
          )}

          {/* Recent Expenses */}
          {loading ? (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ListCardSkeleton />
            </Grid.Col>
          ) : (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Transition
                mounted={mounted}
                transition="slide-down"
                duration={600}
                timingFunction="ease"
              >
                {(styles) => (
                  <Card withBorder style={styles}>
                    <Group justify="space-between" mb="md">
                      <Group>
                        <ThemeIcon
                          size="lg"
                          radius="md"
                          variant="light"
                          color="red"
                        >
                          <IconWallet size={20} />
                        </ThemeIcon>
                        <Stack gap={0}>
                          <Text fw={500} tt="uppercase">
                            Recent Expenses
                          </Text>
                          <Stack gap={4}>
                            <Text size="xs" c="dimmed">
                              Latest transactions
                              {dateRange[0] && dateRange[1] && (
                                <Text size="xs" c="dimmed">
                                  {dateRange[0].toLocaleDateString()} -{" "}
                                  {dateRange[1].toLocaleDateString()}
                                </Text>
                              )}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Total: TZS {totalExpenses.toLocaleString()}
                            </Text>
                          </Stack>
                        </Stack>
                      </Group>
                      <Button
                        component={Link}
                        href="/expenses"
                        variant="light"
                        size="xs"
                      >
                        View All
                      </Button>
                    </Group>
                    <Stack gap="md">
                      {filteredExpenses.map((expense, index) => {
                        const vehicle = vehicles.find(
                          (v) => v.id === expense.vehicle_id
                        );
                        return (
                          <Transition
                            key={expense.id}
                            mounted={mounted}
                            transition="slide-down"
                            duration={600}
                            timingFunction="ease"
                          >
                            {(styles) => (
                              <Paper
                                withBorder
                                p="md"
                                radius="md"
                                style={{
                                  ...styles,
                                  transitionDelay: `${index * 150}ms`,
                                }}
                              >
                                <Group justify="space-between">
                                  <Stack gap={4}>
                                    <Text size="sm" fw={500} tt="capitalize">
                                      {expense.category}
                                    </Text>
                                    <Group gap="xs">
                                      <IconCar
                                        size={14}
                                        style={{
                                          color: "var(--mantine-color-dimmed)",
                                        }}
                                      />
                                      <Text size="xs" c="dimmed">
                                        {vehicle
                                          ? `${vehicle.make} ${vehicle.model}`
                                          : "Unknown Vehicle"}
                                      </Text>
                                      <IconCalendar
                                        size={14}
                                        style={{
                                          color: "var(--mantine-color-dimmed)",
                                        }}
                                      />
                                      <Text size="xs" c="dimmed">
                                        {new Date(
                                          expense.date
                                        ).toLocaleDateString()}
                                      </Text>
                                    </Group>
                                  </Stack>
                                  <Text fw={500} c="red">
                                    TZS {expense.amount.toLocaleString()}
                                  </Text>
                                </Group>
                              </Paper>
                            )}
                          </Transition>
                        );
                      })}
                    </Stack>
                  </Card>
                )}
              </Transition>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Container>
  );
}
