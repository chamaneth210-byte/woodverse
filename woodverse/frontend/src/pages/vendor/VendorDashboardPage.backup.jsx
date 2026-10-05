import { useEffect, useState } from "react";
import {
  PackagePlus,
  PlusCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import { VendorHeader } from "./VendorHeader";
import { VendorSidebar } from "./VendorSidebar";
import { DonutChart, SalesChart } from "./charts";
import {
  AlertManagerModal,
  NotificationCenterModal,
  RecentOrders,
  StatCard,
  SystemAlerts,
  WorkOrderQueue,
} from "./dashboardParts";
import { getInitials } from "./format.js";
import { AllOrdersModal, NewOrderModal, WorkOrderModal } from "./orderParts";
import {
  createStoredProductionWorkOrder,
  getStoredVendorAdminNotifications,
  getStoredVendorOrders,
} from "./orders.js";
import { initialAlerts, initialNotifications, stats } from "./seed.js";
import { vendorOrdersStorageKey } from "./storageKeys.js";
import { getOrderTone } from "./tone.js";

export function VendorDashboardPage() {
  const [notice, setNotice] = useState("Vendor dashboard loaded.");
  const [range, setRange] = useState("Last 6 Months");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);
  const [orderItems, setOrderItems] = useState(() => getStoredVendorOrders());
  const [workOrders, setWorkOrders] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [notifications, setNotifications] = useState(
    () => [...getStoredVendorAdminNotifications(), ...initialNotifications]
  );
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [notificationSocket, setNotificationSocket] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState("Connecting");

  /*
   * ============================================================
   * SOCKET.IO - LIVE VENDOR NOTIFICATIONS + NEW ORDERS
   * ============================================================
   */
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "/";

    const token = localStorage.getItem("woodverse-auth-token");

    const socket = io(socketUrl, {
      auth: {
        token,
      },
      autoConnect: true,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      console.log("✅ Vendor Socket.IO connected:", socket.id);

      setNotificationStatus("Connected");

      socket.emit("notification:join", {
        room: "woodverse-notifications",
        actor: "Vendor Dashboard",
      });

      console.log("📡 Joined notification room: woodverse-notifications");
    };

    const handleDisconnect = () => {
      console.log("❌ Vendor Socket.IO disconnected");
      setNotificationStatus("Offline");
    };

    const handleConnectError = (error) => {
      console.error("❌ Vendor Socket.IO connection error:", error.message);
      setNotificationStatus("Offline");
    };

    /*
     * This receives:
     *
     * 1. Normal notifications
     * 2. New customer order notifications
     *
     * When a new order arrives, we add it to orderItems.
     */
    const handleNotification = (incoming) => {
      console.log("🔔 Vendor notification received:", incoming);

      /*
       * --------------------------------------------------------
       * Add notification to Notification Center
       * --------------------------------------------------------
       */
      setNotifications((items) => {
        if (items.some((item) => item.id === incoming.id)) {
          return items;
        }

        return [
          {
            ...incoming,
            time: incoming.time || "Just now",
          },
          ...items,
        ];
      });

      /*
       * --------------------------------------------------------
       * Detect NEW ORDER notification
       * --------------------------------------------------------
       */
      const title = String(incoming.title || "").toLowerCase();
      const message = String(incoming.message || "").toLowerCase();

      const isNewOrder =
        incoming.type === "new_order" ||
        incoming.event === "new_order" ||
        title.includes("new stock order") ||
        title.includes("order needs vendor approval") ||
        title.includes("new order") ||
        message.includes("new order");

      if (!isNewOrder) {
        return;
      }

      console.log("🛒 New customer order detected");

      /*
       * --------------------------------------------------------
       * Add the new order to the vendor order list
       * --------------------------------------------------------
       */
      setOrderItems((items) => {
        /*
         * Prefer the real database order ID.
         */
        const incomingOrderId =
          incoming.orderId ||
          incoming.order?.id ||
          incoming.data?.orderId ||
          incoming.data?.order?.id;

        /*
         * Prevent duplicate orders.
         */
        if (
          incomingOrderId &&
          items.some(
            (order) =>
              order.databaseId === incomingOrderId ||
              order.orderId === incomingOrderId ||
              order.id === incomingOrderId
          )
        ) {
          console.log("ℹ️ Order already exists:", incomingOrderId);
          return items;
        }

        /*
         * Extract order information.
         */
        const order = incoming.order || incoming.data?.order || {};

        const customer =
          incoming.customer ||
          order.customer ||
          order.customerName ||
          incoming.customerName ||
          "New Customer";

        const product =
          incoming.product ||
          order.product ||
          order.productName ||
          incoming.productName ||
          "New Customer Order";

        const amount =
          incoming.amount ||
          order.amount ||
          order.totalAmount ||
          incoming.totalAmount ||
          "Pending";

        const status =
          incoming.status ||
          order.status ||
          "Processing";

        const requiresManufacturing =
          incoming.requiresManufacturing ??
          order.requiresManufacturing ??
          false;

        const databaseId =
          incomingOrderId ||
          order.id ||
          `live-${Date.now()}`;

        /*
         * Create dashboard order object.
         */
        const newOrder = {
          id: databaseId,
          databaseId,
          orderId: databaseId,

          customer,
          initials: getInitials(customer),

          product,

          date:
            incoming.date ||
            order.date ||
            order.createdAt ||
            "Today",

          dueDate:
            incoming.dueDate ||
            order.dueDate ||
            "-",

          amount:
            typeof amount === "number"
              ? `LKR ${amount.toLocaleString()}`
              : amount,

          status,

          tone: getOrderTone(status),

          requiresManufacturing,

          fulfillmentPlan:
            incoming.fulfillmentPlan ||
            order.fulfillmentPlan ||
            [],
        };

        console.log("➕ Adding order to vendor dashboard:", newOrder);

        /*
         * NEW ORDER GOES TO THE TOP.
         *
         * This causes the order count/list to update
         * immediately because RecentOrders receives orderItems.
         */
        return [newOrder, ...items];
      });

      setNotice("🔔 New customer order received.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("notification:event", handleNotification);

    setNotificationSocket(socket);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("notification:event", handleNotification);

      socket.disconnect();
    };
  }, []);

  /*
   * ============================================================
   * SAVE VENDOR ORDERS TO LOCAL STORAGE
   * ============================================================
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        vendorOrdersStorageKey,
        JSON.stringify(orderItems)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [orderItems]);

  /*
   * ============================================================
   * ALERTS
   * ============================================================
   */
  const clearAlert = (id) => {
    const alert = alerts.find((item) => item.id === id);

    if (alert) {
      setResolvedAlerts((items) => [
        {
          ...alert,
          resolvedAt: "Just now",
        },
        ...items,
      ]);
    }

    setAlerts((items) => items.filter((item) => item.id !== id));

    setNotice("Alert marked as managed.");
  };

  const resolveAllAlerts = () => {
    if (alerts.length === 0) {
      setNotice("No active alerts to manage.");
      return;
    }

    setResolvedAlerts((items) => [
      ...alerts.map((alert) => ({
        ...alert,
        resolvedAt: "Just now",
      })),
      ...items,
    ]);

    setAlerts([]);

    setNotice("All active alerts marked as managed.");
  };

  const restoreAlert = (id) => {
    const alert = resolvedAlerts.find((item) => item.id === id);

    if (!alert) return;

    const { resolvedAt, ...restoredAlert } = alert;

    setAlerts((items) => [restoredAlert, ...items]);

    setResolvedAlerts((items) =>
      items.filter((item) => item.id !== id)
    );

    setNotice(`${alert.title} restored to active alerts.`);
  };

  /*
   * ============================================================
   * PUBLISH NOTIFICATION
   * ============================================================
   */
  const publishNotification = (notification) => {
    const payload = {
      id: notification.id || `local-notice-${Date.now()}`,
      time: notification.time || "Just now",
      ...notification,
    };

    setNotifications((items) => [payload, ...items]);

    notificationSocket?.emit("notification:send", {
      room: "woodverse-notifications",
      audience: payload.audience,
      source: payload.source,
      title: payload.title,
      message: payload.message,
    });
  };

  /*
   * ============================================================
   * CREATE MANUAL ORDER
   * ============================================================
   */
  const createOrder = (form) => {
    const numericIds = orderItems
      .map((order) =>
        Number(String(order.id).replace("#WV-", ""))
      )
      .filter(Boolean);

    const nextId = `#WV-${Math.max(...numericIds, 9482) + 1}`;

    const amount = form.amount
      .trim()
      .toUpperCase()
      .startsWith("LKR")
      ? form.amount.trim()
      : `LKR ${form.amount.trim()}`;

    setOrderItems((items) => [
      {
        id: nextId,
        customer: form.customer,
        initials: getInitials(form.customer),
        product: form.product,
        date: "Today",
        dueDate: form.dueDate,
        amount,
        status: "Vendor Approval",
        tone: getOrderTone("Vendor Approval"),
        requiresManufacturing: true,
        fulfillmentPlan: [
          {
            name: form.product,
            quantity: 1,
            decision: "manufacture",
            label: "Manufacture",
            reason:
              "Manual vendor order needs stock review before production.",
          },
        ],
      },
      ...items,
    ]);

    publishNotification({
      audience: "Customer",
      source: form.customer,
      title: `Customer order ${nextId} created`,
      message: `${form.product} order was created with ${amount} value and due date ${form.dueDate}.`,
    });

    setActiveModal(null);

    setNotice(
      `New order ${nextId} created for ${form.customer} and waiting for vendor approval.`
    );
  };

  /*
   * ============================================================
   * CREATE WORK ORDER
   * ============================================================
   */
  const createWorkOrder = (form) => {
    const { workOrder } =
      createStoredProductionWorkOrder(form);

    setWorkOrders((items) => [
      workOrder,
      ...items,
    ]);

    publishNotification({
      audience: "Supplier",
      source: "Vendor Production",
      title: `Supplier material check for ${workOrder.id}`,
      message: `${workOrder.quantity} units of ${workOrder.product} moved to ${workOrder.stage}. Confirm material availability before ${workOrder.dueDate}.`,
    });

    setActiveModal(null);

    setNotice(
      `Work order ${workOrder.id} created for ${workOrder.product}. It is now available in Production Tracking.`
    );
  };

  /*
   * ============================================================
   * NOTIFICATION READ STATUS
   * ============================================================
   */
  const markNotificationRead = (id) => {
    setReadNotificationIds((items) =>
      items.includes(id)
        ? items
        : [...items, id]
    );

    setNotice("Notification marked as read.");
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(
      notifications.map((item) => item.id)
    );

    setNotice("All notifications marked as read.");
  };

  /*
   * ============================================================
   * DEMO NOTIFICATION
   * ============================================================
   */
  const sendDemoNotification = (audience) => {
    publishNotification({
      audience,
      source:
        audience === "Supplier"
          ? "Lumbini Timber Co."
          : "Customer Portal",

      title:
        audience === "Supplier"
          ? "Supplier delivery confirmation"
          : "Customer order update",

      message:
        audience === "Supplier"
          ? "Supplier confirmed raw material dispatch for tomorrow morning."
          : "Customer confirmed preferred delivery window for the active order.",
    });

    setNotice(
      `${audience} notification sent through Socket.IO.`
    );
  };

  /*
   * ============================================================
   * UNREAD NOTIFICATIONS
   * ============================================================
   */
  const unreadNotifications = notifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */
  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">

        <VendorSidebar
          active="Dashboard"
          onNavigate={setNotice}
          onNewOrder={() => setActiveModal("newOrder")}
        />

        <section className="min-w-0">

          <VendorHeader
            onAction={setNotice}
            onNotifications={() =>
              setActiveModal("notifications")
            }
            unreadCount={unreadNotifications}
            status={notificationStatus}
          />

          <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-5 py-6 sm:px-8 lg:px-10">

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">

              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">
                  Overview
                </p>

                <h1 className="mt-2 text-2xl font-semibold leading-tight text-[#202621] sm:text-3xl">
                  Welcome back. Here is what is happening with WoodVerse today.
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    setNotice("Add product form opened.")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#bfc6c1] bg-white px-4 text-sm font-extrabold text-[#115745] shadow-sm transition hover:bg-[#eef4ef]"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add New Product
                </button>

                <button
                  onClick={() =>
                    setActiveModal("workOrder")
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0d4638]"
                >
                  <PackagePlus className="h-5 w-5" />
                  Create Work Order
                </button>

              </div>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  stat={stat}
                />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-12">

              <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-8">

                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-semibold text-[#202621]">
                      Monthly Sales Performance
                    </h2>

                    <p className="mt-1 text-sm text-[#66716b]">
                      Revenue tracking for teak and mahogany collections.
                    </p>
                  </div>

                  <select
                    value={range}
                    onChange={(event) => {
                      setRange(event.target.value);
                      setNotice(
                        `Sales range changed to ${event.target.value}.`
                      );
                    }}
                    className="min-h-10 rounded-md border border-[#c4cbc7] bg-[#f8f4ec] px-3 text-sm font-semibold outline-none"
                  >
                    <option>Last 6 Months</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>

                </div>

                <SalesChart range={range} />

              </article>

              <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-4">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-semibold text-[#202621]">
                      Production Stages
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-[#66716b]">
                      Workload distribution across artisan workshops.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eef4ef] px-3 py-1 text-xs font-extrabold uppercase text-[#115745]">
                    Live
                  </span>

                </div>

                <div className="mt-7 grid place-items-center">
                  <DonutChart />
                </div>

                <div className="mt-7 grid gap-3">

                  {[
                    ["Carpentry", "45%", "bg-[#115745]"],
                    ["Polishing", "28%", "bg-[#8b5633]"],
                    ["Upholstery", "27%", "bg-[#334f35]"],
                  ].map(
                    ([label, value, color]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 rounded-lg bg-[#f8f4ec] px-4 py-3 text-sm font-semibold"
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${color}`}
                          />
                          {label}
                        </span>

                        <strong>{value}</strong>
                      </div>
                    )
                  )}

                </div>

              </article>

            </section>

            <section className="grid gap-6 xl:grid-cols-12">

              <RecentOrders
                orders={orderItems}
                onViewAll={() =>
                  setActiveModal("allOrders")
                }
              />

              <SystemAlerts
                alerts={alerts}
                onClear={clearAlert}
                onManageAll={() =>
                  setActiveModal("alerts")
                }
              />

            </section>

            {workOrders.length > 0 && (
              <WorkOrderQueue
                workOrders={workOrders}
              />
            )}

          </div>
        </section>
      </div>

      {activeModal === "newOrder" && (
        <NewOrderModal
          onClose={() => setActiveModal(null)}
          onSubmit={createOrder}
        />
      )}

      {activeModal === "workOrder" && (
        <WorkOrderModal
          onClose={() => setActiveModal(null)}
          onSubmit={createWorkOrder}
        />
      )}

      {activeModal === "allOrders" && (
        <AllOrdersModal
          orders={orderItems}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "alerts" && (
        <AlertManagerModal
          alerts={alerts}
          resolvedAlerts={resolvedAlerts}
          onClose={() => setActiveModal(null)}
          onResolve={clearAlert}
          onResolveAll={resolveAllAlerts}
          onRestore={restoreAlert}
        />
      )}

      {activeModal === "notifications" && (
        <NotificationCenterModal
          notifications={notifications}
          readIds={readNotificationIds}
          status={notificationStatus}
          onClose={() => setActiveModal(null)}
          onRead={markNotificationRead}
          onReadAll={markAllNotificationsRead}
          onSendDemo={sendDemoNotification}
        />
      )}
    </main>
  );
}
