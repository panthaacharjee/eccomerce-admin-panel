import { Customer } from "@/lib/types/customer";

// Mock data generator
export const generateMockCustomers = (count: number): Customer[] => {
  const firstNames = [
    "John",
    "Jane",
    "Robert",
    "Emily",
    "Michael",
    "Sarah",
    "David",
    "Lisa",
    "James",
    "Maria",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];
  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ];
  const countries = [
    "USA",
    "Canada",
    "UK",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Brazil",
    "India",
    "China",
  ];

  const customers: Customer[] = [];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    customers.push({
      id: `CUS-${1000 + i}`,
      email,
      name,
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      address: `${Math.floor(100 + Math.random() * 900)} ${["Main", "Oak", "Pine", "Maple", "Cedar"][Math.floor(Math.random() * 5)]} St`,
      city: cities[Math.floor(Math.random() * cities.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      status:
        Math.random() > 0.8
          ? "inactive"
          : Math.random() > 0.9
            ? "banned"
            : "active",
      totalOrders: Math.floor(Math.random() * 50) + 1,
      totalSpent: parseFloat((Math.random() * 10000 + 100).toFixed(2)),
      lastOrderDate:
        Math.random() > 0.3
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          : undefined,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(" ", "")}`,
    });
  }

  return customers;
};

// Export mock data
export const mockCustomers = generateMockCustomers(50);

// API simulation functions
export const getCustomers = async (): Promise<Customer[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockCustomers;
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockCustomers.find((customer) => customer.id === id) || null;
};

export const updateCustomerStatus = async (
  id: string,
  status: Customer["status"],
): Promise<Customer> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) throw new Error("Customer not found");

  customer.status = status;
  return customer;
};

export const exportCustomersToCSV = (customers: Customer[]) => {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Status",
    "Total Orders",
    "Total Spent",
    "Join Date",
  ];
  const csvContent = [
    headers.join(","),
    ...customers.map((customer) =>
      [
        customer.id,
        `"${customer.name}"`,
        customer.email,
        customer.phone || "",
        customer.status,
        customer.totalOrders,
        customer.totalSpent,
        customer.joinDate,
      ].join(","),
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `customers_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCustomerStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const activeCustomers = mockCustomers.filter(
    (c) => c.status === "active",
  ).length;
  const totalSpent = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

  // Get new customers this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newCustomersThisMonth = mockCustomers.filter((c) => {
    const joinDate = new Date(c.joinDate);
    return (
      joinDate.getMonth() === currentMonth &&
      joinDate.getFullYear() === currentYear
    );
  }).length;

  return {
    totalCustomers: mockCustomers.length,
    activeCustomers,
    newCustomersThisMonth,
    averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
    totalRevenue: totalSpent,
    averageCustomerValue:
      mockCustomers.length > 0 ? totalSpent / mockCustomers.length : 0,
  };
};
