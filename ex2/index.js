let orders = [];
let processingErrors = [];
let validationResults = {};

// Funkcja dodająca zamówienie
const addOrder = (customerId, items, discount, region) => {
    const order = {
        id: orders.length + 1,
        customerId,
        items,
        discount,
        region,
        timestamp: Date.now(),
        processed: false
    };
    orders = [...orders, order];
    return order;
};

// Walidacja zamówienia
const validateOrder = order => {
    const errors = [
        ...(!order.customerId || order.customerId.length < 3 ? ["Invalid customer ID"] : []),
        ...(!order.items || order.items.length === 0 ? ["No items in order"] : []),
        ...(order.items ? order.items.flatMap(item => [
            ...(!item.price || item.price <= 0 ? [`Invalid price for item: ${item.name}`] : []),
            ...(!item.quantity || item.quantity <= 0 ? [`Invalid quantity for item: ${item.name}`] : [])
        ]) : []),
        ...(order.discount && (order.discount < 0 || order.discount > 100) ? ["Invalid discount percentage"] : [])
    ];

    validationResults[order.id] = errors;
    return errors.length === 0;
};

// Obliczanie całkowitej wartości zamówienia
const calculateOrderTotal = order => {
    const subtotal = order.items.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
    );

    const discountAmount = order.discount ? subtotal * (order.discount / 100) : 0;
    const total = subtotal - discountAmount;

    const taxRates = { EU: 0.23, US: 0.08, Asia: 0.15 };
    const tax = total * (taxRates[order.region] || 0);

    return total + tax;
};

// Przetwarzanie wszystkich zamówień
const processAllOrders = () => {
    const unprocessed = orders.filter(order => !order.processed);

    const results = unprocessed.reduce((acc, order) => {
        if (validateOrder(order)) {
            order.processed = true;
            order.total = calculateOrderTotal(order);
            return { ...acc, processed: acc.processed + 1 };
        } else {
            processingErrors.push({
                orderId: order.id,
                errors: validationResults[order.id]
            });
            return { ...acc, failed: acc.failed + 1 };
        }
    }, { processed: 0, failed: 0 });

    return results;
};

// Filtrowanie zamówień według klienta i regionu
const getCustomerOrdersByRegion = (customerId, region) =>
    orders.filter(order =>
        order.customerId === customerId &&
        order.region === region &&
        order.processed
    );

// Obliczanie statystyk sprzedaży według regionów
const calculateRegionalStats = () => {
    const processedOrders = orders.filter(order => order.processed);

    const stats = processedOrders.reduce((acc, order) => {
        const region = order.region;

        if (!acc[region]) {
            acc[region] = {
                totalRevenue: 0,
                orderCount: 0,
                itemsSold: 0,
                averageOrderValue: 0
            };
        }

        acc[region].totalRevenue += order.total;
        acc[region].orderCount++;
        acc[region].itemsSold += order.items.reduce((sum, item) => sum + item.quantity, 0);

        return acc;
    }, {});

    return Object.entries(stats).reduce((acc, [region, data]) => ({
        ...acc,
        [region]: {
            ...data,
            averageOrderValue: data.totalRevenue / data.orderCount
        }
    }), {});
};

// Znajdowanie najbardziej dochodowych klientów
const getTopCustomers = limit => {
    const processedOrders = orders.filter(order => order.processed);

    const customerTotals = processedOrders.reduce((acc, order) => {
        const customerId = order.customerId;

        if (!acc[customerId]) {
            acc[customerId] = {
                customerId,
                totalSpent: 0,
                orderCount: 0
            };
        }

        acc[customerId].totalSpent += order.total;
        acc[customerId].orderCount++;

        return acc;
    }, {});

    return Object.values(customerTotals)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, limit);
};

// Generowanie raportu sprzedaży
const generateSalesReport = (startDate, endDate) => {
    const relevantOrders = orders.filter(order =>
        order.processed &&
        order.timestamp >= startDate &&
        order.timestamp <= endDate
    );

    const productSales = {};
    const regionalBreakdown = {};
    let totalRevenue = 0;
    let totalItems = 0;

    relevantOrders.forEach(order => {
        totalRevenue += order.total;

        if (!regionalBreakdown[order.region]) {
            regionalBreakdown[order.region] = { orders: 0, revenue: 0 };
        }
        regionalBreakdown[order.region].orders++;
        regionalBreakdown[order.region].revenue += order.total;

        order.items.forEach(item => {
            totalItems += item.quantity;

            if (!productSales[item.name]) {
                productSales[item.name] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
        });
    });

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue);

    return {
        period: { start: startDate, end: endDate },
        summary: {
            totalOrders: relevantOrders.length,
            totalRevenue,
            totalItems,
            averageOrderValue: relevantOrders.length > 0
                ? totalRevenue / relevantOrders.length
                : 0
        },
        regionalBreakdown,
        topProducts
    };
};

// Przykład użycia:
addOrder("CUST001", [
    { name: "Laptop", price: 1200, quantity: 1 },
    { name: "Mouse", price: 25, quantity: 2 }
], 10, "EU");

addOrder("CUST002", [
    { name: "Keyboard", price: 80, quantity: 1 },
    { name: "Monitor", price: 300, quantity: 2 }
], 5, "US");

addOrder("CUST001", [
    { name: "Headphones", price: 150, quantity: 1 }
], 0, "EU");

console.log("Processing:", processAllOrders());
console.log("Top Customers:", getTopCustomers(5));
console.log("Regional Stats:", calculateRegionalStats());