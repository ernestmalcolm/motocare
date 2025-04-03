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
  Table,
  ActionIcon,
  Menu,
  Loader,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Badge,
  ThemeIcon,
  Divider,
  Skeleton,
  SimpleGrid,
  Grid,
  SegmentedControl,
  TextInput as MantineTextInput,
  ComboboxItem,
  Transition,
} from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconTools,
  IconGauge,
  IconCalendar,
  IconNotes,
  IconBuilding,
  IconCurrencyDollar,
  IconAlertTriangle,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconChartBar,
  IconTool,
  IconCar,
  IconStethoscope,
  IconClipboardCheck,
  IconClipboardList,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import Link from "next/link";

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  type: "service" | "repair" | "inspection";
  date: string;
  mileage: number;
  description: string;
  cost: number;
  service_provider: string;
  notes: string;
  created_at: string;
  updated_at: string;
  vehicle?: Database["public"]["Tables"]["cars"]["Row"];
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
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
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<MaintenanceRecord>>({});
  const [addForm, setAddForm] = useState<Partial<MaintenanceRecord>>({
    vehicle_id: undefined,
    type: "service",
    date: undefined,
    mileage: 0,
    description: "",
    cost: 0,
    service_provider: "",
    notes: "",
  });
  const [vehicles, setVehicles] = useState<
    { id: string; make: string; model: string; year: number }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"date" | "cost" | "mileage">(
    "date"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [savingAdd, setSavingAdd] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const welcomeMessage = useMemo(() => {
    const messages = [
      "Keeping track so you don't have to guess what that noise was. 🔊🧠",
      "Because 'I think I fixed it last year?' isn't a maintenance plan. 📆🛠️",
      "Every fix logged is one less surprise down the road. 🛣️🔧",
      "From oil changes to 'uh-ohs' — log it like a pro. 🧰🚗",
      "You handle the repairs, we'll handle the records. 🤝📝",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const fetchVehicles = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year")
        .eq("user_id", session.user.id);

      if (error) throw error;
      setVehicles(data || []);
      setLoading(false);
      setTimeout(() => setMounted(true), 200);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
      setTimeout(() => setMounted(true), 200);
    }
  };

  const fetchRecords = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("maintenance_records")
        .select(
          `
          *,
          vehicle:vehicles(make, model, year)
        `
        )
        .in(
          "vehicle_id",
          vehicles.map((v) => v.id)
        )
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching maintenance records:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch maintenance records",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      fetchRecords();
    }
  }, [vehicles]);

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from("maintenance_records")
        .delete()
        .eq("id", selectedRecord.id);

      if (error) throw error;

      notifications.show({
        title: "Success",
        message: "Maintenance record deleted successfully",
        color: "green",
      });

      closeDeleteModal();
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete maintenance record",
        color: "red",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;

    try {
      setSavingEdit(true);
      const { error } = await supabase
        .from("maintenance_records")
        .update({
          vehicle_id: editForm.vehicle_id,
          type: editForm.type,
          date: editForm.date,
          mileage: editForm.mileage,
          description: editForm.description,
          cost: editForm.cost,
          service_provider: editForm.service_provider,
          notes: editForm.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRecord.id);

      if (error) throw error;

      notifications.show({
        title: "Success",
        message: "Maintenance record updated successfully",
        color: "green",
      });

      closeEditModal();
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      console.error("Error updating record:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update maintenance record",
        color: "red",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAdd = async () => {
    if (
      !addForm.vehicle_id ||
      !addForm.date ||
      !addForm.description ||
      !addForm.service_provider
    ) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields",
        color: "red",
      });
      return;
    }

    try {
      setSavingAdd(true);
      const { error } = await supabase.from("maintenance_records").insert([
        {
          ...addForm,
          notes: addForm.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      notifications.show({
        title: "Success",
        message: "Maintenance record added successfully",
        color: "green",
      });

      closeAddModal();
      setAddForm({
        vehicle_id: undefined,
        type: "service",
        date: undefined,
        mileage: 0,
        description: "",
        cost: 0,
        service_provider: "",
        notes: "",
      });
      fetchRecords();
    } catch (error) {
      console.error("Error adding record:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add maintenance record",
        color: "red",
      });
    } finally {
      setSavingAdd(false);
    }
  };

  const openEditRecordModal = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setEditForm({
      vehicle_id: record.vehicle_id,
      type: record.type,
      date: record.date,
      mileage: record.mileage,
      description: record.description,
      cost: record.cost,
      service_provider: record.service_provider,
      notes: record.notes || "",
    });
    openEditModal();
  };

  const openDeleteRecordModal = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    openDeleteModal();
  };

  const filteredRecords = records
    .filter((record) => {
      const matchesSearch =
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.service_provider
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        `${record.vehicle?.make} ${record.vehicle?.model}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesVehicle =
        !selectedVehicle || record.vehicle_id === selectedVehicle;
      const matchesType = !selectedType || record.type === selectedType;

      const recordDate = new Date(record.date);
      const matchesDateRange =
        (!dateRange[0] || recordDate >= dateRange[0]) &&
        (!dateRange[1] || recordDate <= dateRange[1]);

      return matchesSearch && matchesVehicle && matchesType && matchesDateRange;
    })
    .sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      if (sortField === "date") {
        return (
          multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime())
        );
      }
      if (sortField === "cost") {
        return multiplier * (a.cost - b.cost);
      }
      return multiplier * (a.mileage - b.mileage);
    });

  const stats = {
    totalRecords: filteredRecords.length,
    totalCost: filteredRecords.reduce((sum, record) => sum + record.cost, 0),
    averageMileage:
      filteredRecords.length > 0
        ? Math.round(
            filteredRecords.reduce((sum, record) => sum + record.mileage, 0) /
              filteredRecords.length
          )
        : 0,
    serviceCount: filteredRecords.filter((r) => r.type === "service").length,
    repairCount: filteredRecords.filter((r) => r.type === "repair").length,
    inspectionCount: filteredRecords.filter((r) => r.type === "inspection")
      .length,
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
                        <IconTools size={28} />
                      </ThemeIcon>
                      <Title order={1}>Maintenance</Title>
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
                        Add your vehicles to start tracking maintenance records
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
        <Transition
          mounted={mounted}
          transition="slide-down"
          duration={800}
          timingFunction="ease"
        >
          {(styles) => (
            <Group justify="space-between" style={styles}>
              <Group gap="md">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan", deg: 45 }}
                >
                  <IconTools size={28} />
                </ThemeIcon>
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
                            <IconTools size={28} />
                          </ThemeIcon>
                          <Title order={1}>Maintenance</Title>
                        </Group>
                        <Text c="dimmed" size="lg" mt={4}>
                          {welcomeMessage}
                        </Text>
                      </div>
                    )}
                  </Transition>
                </Stack>
              </Group>
              <Button
                leftSection={<IconPlus size={20} />}
                onClick={openAddModal}
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 45 }}
              >
                Add Record
              </Button>
            </Group>
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
                    clearable
                  />
                  <Select
                    label="Type"
                    placeholder="All types"
                    value={selectedType}
                    onChange={setSelectedType}
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
                  <DatePickerInput
                    type="range"
                    label="Date Range"
                    value={dateRange}
                    onChange={setDateRange}
                    leftSection={<IconCalendar size={16} />}
                    style={{ minWidth: 250 }}
                    clearable
                  />
                  <TextInput
                    label="Search"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                    style={{ minWidth: 200 }}
                    __clearable
                  />
                  <Group gap="xs">
                    <SegmentedControl
                      value={sortField}
                      onChange={(value) =>
                        setSortField(value as typeof sortField)
                      }
                      data={[
                        { label: "Date", value: "date" },
                        { label: "Cost", value: "cost" },
                        { label: "Mileage", value: "mileage" },
                      ]}
                    />
                    <ActionIcon
                      variant="light"
                      onClick={() =>
                        setSortDirection(
                          sortDirection === "asc" ? "desc" : "asc"
                        )
                      }
                    >
                      {sortDirection === "asc" ? (
                        <IconSortAscending size={16} />
                      ) : (
                        <IconSortDescending size={16} />
                      )}
                    </ActionIcon>
                  </Group>
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => {
                      setSelectedVehicle(null);
                      setSelectedType(null);
                      setDateRange([null, null]);
                      setSearchQuery("");
                      setSortField("date");
                      setSortDirection("desc");
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
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={600} size="lg">
                    {selectedVehicle
                      ? `${
                          vehicles.find((v) => v.id === selectedVehicle)?.make
                        } ${
                          vehicles.find((v) => v.id === selectedVehicle)?.model
                        }`
                      : selectedType
                      ? `${
                          selectedType.charAt(0).toUpperCase() +
                          selectedType.slice(1)
                        } Records`
                      : "All Records"}
                    {dateRange[0] && dateRange[1] && (
                      <Text size="sm" c="dimmed" fw={400}>
                        {" "}
                        ({new Date(dateRange[0]).toLocaleDateString()} -{" "}
                        {new Date(dateRange[1]).toLocaleDateString()})
                      </Text>
                    )}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {filteredRecords.length} record
                    {filteredRecords.length !== 1 ? "s" : ""}
                  </Text>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                  <Card withBorder radius="md" p="md">
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="blue"
                      >
                        <IconTools size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          {stats.totalRecords}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Total Records
                        </Text>
                      </Stack>
                    </Group>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="green"
                      >
                        <IconCurrencyDollar size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          TZS {stats.totalCost.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Total Cost
                        </Text>
                      </Stack>
                    </Group>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="yellow"
                      >
                        <IconGauge size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          {stats.averageMileage.toLocaleString()}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Avg. Mileage
                        </Text>
                      </Stack>
                    </Group>
                  </Card>

                  <Card withBorder radius="md" p="md">
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color="violet"
                      >
                        <IconChartBar size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          {stats.serviceCount}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Service Records
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                </SimpleGrid>

                {selectedType && (
                  <Card withBorder radius="md" p="md" bg="blue.0">
                    <Group gap="md">
                      <ThemeIcon
                        size="xl"
                        radius="xl"
                        variant="light"
                        color="blue"
                      >
                        <IconChartBar size={24} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text fw={600} size="lg">
                          Record Type Distribution
                        </Text>
                        <Text size="sm" c="dimmed">
                          {stats.serviceCount} Services • {stats.repairCount}{" "}
                          Repairs • {stats.inspectionCount} Inspections
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                )}
              </Stack>
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
              style={{ ...styles, transitionDelay: "450ms" }}
            >
              {filteredRecords.length === 0 ? (
                <Card withBorder radius="md" p="xl" className="text-center">
                  <Stack gap="xl" align="center">
                    <ThemeIcon
                      size={80}
                      radius="xl"
                      variant="light"
                      color="blue"
                    >
                      <IconTools size={40} />
                    </ThemeIcon>
                    <Stack gap="md">
                      <Stack gap={0}>
                        <Text size="xl" fw={700}>
                          NO RECORDS FOUND
                        </Text>
                        <Text c="dimmed" size="sm">
                          {searchQuery ||
                          selectedVehicle ||
                          selectedType ||
                          (dateRange[0] && dateRange[1])
                            ? "Try adjusting your filters"
                            : "Add your first maintenance record"}
                        </Text>
                      </Stack>
                      {!searchQuery && !selectedVehicle && !selectedType && (
                        <Button
                          leftSection={<IconPlus size={16} />}
                          onClick={openAddModal}
                          variant="light"
                          color="blue"
                        >
                          Add Your First Record
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Vehicle</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>
                        <Group gap="xs" wrap="nowrap">
                          <Text>Date</Text>
                          {sortField === "date" && (
                            <ThemeIcon size="xs" variant="light" color="blue">
                              {sortDirection === "asc" ? (
                                <IconSortAscending size={12} />
                              ) : (
                                <IconSortDescending size={12} />
                              )}
                            </ThemeIcon>
                          )}
                        </Group>
                      </Table.Th>
                      <Table.Th>
                        <Group gap="xs" wrap="nowrap">
                          <Text>Mileage</Text>
                          {sortField === "mileage" && (
                            <ThemeIcon size="xs" variant="light" color="blue">
                              {sortDirection === "asc" ? (
                                <IconSortAscending size={12} />
                              ) : (
                                <IconSortDescending size={12} />
                              )}
                            </ThemeIcon>
                          )}
                        </Group>
                      </Table.Th>
                      <Table.Th>
                        <Group gap="xs" wrap="nowrap">
                          <Text>Cost</Text>
                          {sortField === "cost" && (
                            <ThemeIcon size="xs" variant="light" color="blue">
                              {sortDirection === "asc" ? (
                                <IconSortAscending size={12} />
                              ) : (
                                <IconSortDescending size={12} />
                              )}
                            </ThemeIcon>
                          )}
                        </Group>
                      </Table.Th>
                      <Table.Th>Provider</Table.Th>
                      <Table.Th></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredRecords.map((record, index) => (
                      <Transition
                        key={record.id}
                        mounted={mounted}
                        transition="slide-down"
                        duration={600}
                        timingFunction="ease"
                      >
                        {(styles) => (
                          <Table.Tr
                            style={{
                              ...styles,
                              transitionDelay: `${150 * (index + 1)}ms`,
                            }}
                          >
                            <Table.Td>
                              <Group gap="xs">
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="blue"
                                >
                                  <IconCar size={14} />
                                </ThemeIcon>
                                <Stack gap={0}>
                                  <Text fw={500}>
                                    {record.vehicle?.make}{" "}
                                    {record.vehicle?.model}
                                  </Text>
                                  <Text size="sm" c="dimmed">
                                    {record.vehicle?.year}
                                  </Text>
                                </Stack>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                variant="light"
                                color={
                                  record.type === "service"
                                    ? "blue"
                                    : record.type === "repair"
                                    ? "red"
                                    : "yellow"
                                }
                                leftSection={
                                  record.type === "service" ? (
                                    <IconStethoscope size={12} />
                                  ) : record.type === "repair" ? (
                                    <IconTool size={12} />
                                  ) : (
                                    <IconClipboardCheck size={12} />
                                  )
                                }
                              >
                                {record.type}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="gray"
                                >
                                  <IconCalendar size={14} />
                                </ThemeIcon>
                                <Text>
                                  {new Date(record.date).toLocaleDateString()}
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="yellow"
                                >
                                  <IconGauge size={14} />
                                </ThemeIcon>
                                <Text>
                                  {record.mileage.toLocaleString()} miles
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="green"
                                >
                                  <IconCurrencyDollar size={14} />
                                </ThemeIcon>
                                <Text>TZS {record.cost.toLocaleString()}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ThemeIcon
                                  size="sm"
                                  variant="light"
                                  color="violet"
                                >
                                  <IconBuilding size={14} />
                                </ThemeIcon>
                                <Text>{record.service_provider}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Menu position="bottom-end" shadow="md">
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray">
                                    <IconDotsVertical size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={() => openEditRecordModal(record)}
                                    color="blue"
                                  >
                                    Edit Record
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={() =>
                                      openDeleteRecordModal(record)
                                    }
                                  >
                                    Delete Record
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Table.Td>
                          </Table.Tr>
                        )}
                      </Transition>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Card>
          )}
        </Transition>
      </Stack>

      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" size="sm">
              <IconPlus size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              ADD MAINTENANCE RECORD
            </Text>
          </Group>
        }
        size="lg"
        padding="xl"
      >
        <Stack gap="xl">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Vehicle"
                placeholder="Select vehicle"
                required
                value={addForm.vehicle_id}
                onChange={(value) =>
                  setAddForm({ ...addForm, vehicle_id: value || undefined })
                }
                data={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.make} ${v.model} (${v.year})`,
                }))}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Type"
                placeholder="Select type"
                required
                value={addForm.type}
                onChange={(value) =>
                  setAddForm({
                    ...addForm,
                    type: value as MaintenanceRecord["type"],
                  })
                }
                data={[
                  { value: "service", label: "Service" },
                  { value: "repair", label: "Repair" },
                  { value: "inspection", label: "Inspection" },
                ]}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateInput
                label="Date"
                placeholder="Select date"
                required
                value={addForm.date ? new Date(addForm.date) : null}
                onChange={(value) =>
                  setAddForm({ ...addForm, date: value?.toISOString() })
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Mileage"
                placeholder="Enter mileage"
                required
                value={addForm.mileage}
                onChange={(value) =>
                  setAddForm({ ...addForm, mileage: Number(value) })
                }
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Description"
            placeholder="Enter description"
            required
            value={addForm.description}
            onChange={(e) =>
              setAddForm({ ...addForm, description: e.target.value })
            }
          />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Cost"
                placeholder="Enter cost"
                required
                value={addForm.cost}
                onChange={(value) =>
                  setAddForm({ ...addForm, cost: Number(value) })
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Service Provider"
                placeholder="Enter service provider"
                required
                value={addForm.service_provider}
                onChange={(e) =>
                  setAddForm({ ...addForm, service_provider: e.target.value })
                }
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Notes"
            placeholder="Enter any additional notes"
            value={addForm.notes}
            onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
            minRows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={closeAddModal}
              disabled={savingAdd}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} loading={savingAdd}>
              Add Record
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" size="sm">
              <IconEdit size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              EDIT MAINTENANCE RECORD
            </Text>
          </Group>
        }
        size="lg"
        padding="xl"
      >
        <Stack gap="xl">
          <Select
            label="Vehicle"
            placeholder="Select vehicle"
            required
            value={editForm.vehicle_id}
            onChange={(value) =>
              setEditForm({ ...editForm, vehicle_id: value || undefined })
            }
            data={vehicles.map((v) => ({
              value: v.id,
              label: `${v.make} ${v.model} (${v.year})`,
            }))}
          />

          <Select
            label="Type"
            placeholder="Select type"
            required
            value={editForm.type}
            onChange={(value) =>
              setEditForm({
                ...editForm,
                type: value as MaintenanceRecord["type"],
              })
            }
            data={[
              { value: "service", label: "Service" },
              { value: "repair", label: "Repair" },
              { value: "inspection", label: "Inspection" },
            ]}
          />

          <DateInput
            label="Date"
            placeholder="Select date"
            required
            value={editForm.date ? new Date(editForm.date) : null}
            onChange={(value) =>
              setEditForm({ ...editForm, date: value?.toISOString() })
            }
          />

          <NumberInput
            label="Mileage"
            placeholder="Enter mileage"
            required
            value={editForm.mileage}
            onChange={(value) =>
              setEditForm({ ...editForm, mileage: Number(value) })
            }
          />

          <TextInput
            label="Description"
            placeholder="Enter description"
            required
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />

          <NumberInput
            label="Cost"
            placeholder="Enter cost"
            required
            value={editForm.cost}
            onChange={(value) =>
              setEditForm({ ...editForm, cost: Number(value) })
            }
          />

          <TextInput
            label="Service Provider"
            placeholder="Enter service provider"
            required
            value={editForm.service_provider}
            onChange={(e) =>
              setEditForm({ ...editForm, service_provider: e.target.value })
            }
          />

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
            <Button
              variant="light"
              onClick={closeEditModal}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={savingEdit}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Group gap="xs">
            <ThemeIcon variant="light" color="red" size="sm">
              <IconTrash size={16} />
            </ThemeIcon>
            <Text fw={600} size="lg">
              DELETE RECORD
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
                  This action cannot be undone. The maintenance record will be
                  permanently deleted.
                </Text>
              </Stack>
            </Group>
          </Card>

          <Stack gap="xs">
            <Text fw={500}>Record Details:</Text>
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="blue">
                    <IconCar size={14} />
                  </ThemeIcon>
                  <Text>
                    {selectedRecord?.vehicle?.make}{" "}
                    {selectedRecord?.vehicle?.model} (
                    {selectedRecord?.vehicle?.year})
                  </Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="yellow">
                    <IconCalendar size={14} />
                  </ThemeIcon>
                  <Text>
                    {selectedRecord?.date &&
                      new Date(selectedRecord.date).toLocaleDateString()}
                  </Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="green">
                    <IconCurrencyDollar size={14} />
                  </ThemeIcon>
                  <Text>TZS {selectedRecord?.cost.toLocaleString()}</Text>
                </Group>
              </Stack>
            </Card>
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleting}>
              Delete Record
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
