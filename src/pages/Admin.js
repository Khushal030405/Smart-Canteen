import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getApiUrl } from '../utils/api';
import '../styles/Admin.css';

const STATUS_FLOW = ['Pending', 'Preparing', 'Completed'];

const normalizeStatus = (value) => {
  if (typeof value !== 'string') {
    return STATUS_FLOW[0];
  }

  const match = STATUS_FLOW.find(
    (status) => status.toLowerCase() === value.trim().toLowerCase()
  );

  return match || STATUS_FLOW[0];
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Unknown date';
  }

  try {
    return new Date(value).toLocaleString();
  } catch (_err) {
    return 'Unknown date';
  }
};

export default function Admin() {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const { token, user, isAdmin } = useAuth();
  const { notify } = useNotification();

  const fetchOrders = useCallback(async () => {
    if (!token || !isAdmin) {
      return;
    }

    try {
      const res = await fetch(getApiUrl('/api/orders'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setOrders([]);
        setMessage(data.message || 'Failed to load orders');
        return;
      }

      const mappedOrders = Array.isArray(data)
        ? data.map((order) => ({
            ...order,
            status: normalizeStatus(order.status)
          }))
        : [];

      setOrders(mappedOrders);
    } catch (err) {
      setOrders([]);
      setMessage('Server error while loading orders');
    }
  }, [token, isAdmin]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/menu'));
      const data = await res.json();

      if (!res.ok) {
        return;
      }

      if (Array.isArray(data)) {
        setMenuItems(data);
      }
    } catch (_err) {
      // Ignored: menu listing is non-critical for admin flow
    }
  }, []);

  useEffect(() => {
    if (!token || !isAdmin) {
      setOrders([]);
      setMenuItems([]);
      setMessage('You must be logged in as admin!');
      return;
    }

    setMessage('');
    fetchOrders();
    fetchMenuItems();
  }, [token, isAdmin, fetchOrders, fetchMenuItems]);

  const menuLookup = useMemo(() => {
    const lookup = new Map();
    menuItems.forEach((item) => {
      const key = item ? item._id || item.id : null;
      if (key) {
        lookup.set(String(key), item.itemName || item.name || 'Menu item');
      }
    });
    return lookup;
  }, [menuItems]);

  const resolveMenuName = useCallback(
    (menuId) => {
      if (!menuId) {
        return 'Menu item';
      }

      if (typeof menuId === 'object') {
        const key = menuId._id || menuId.id;
        if (key && menuLookup.has(String(key))) {
          return menuLookup.get(String(key));
        }
        if (menuId.itemName) {
          return menuId.itemName;
        }
        return key ? String(key) : 'Menu item';
      }

      const key = String(menuId);
      return menuLookup.get(key) || key || 'Menu item';
    },
    [menuLookup]
  );

  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce(
      (total, order) => total + Number(order.totalPrice || 0),
      0
    );

    const counts = orders.reduce(
      (acc, order) => {
        const status = normalizeStatus(order.status);
        if (status === 'Pending') {
          acc.pending += 1;
        } else if (status === 'Preparing') {
          acc.preparing += 1;
        } else if (status === 'Completed') {
          acc.completed += 1;
        }
        return acc;
      },
      { pending: 0, preparing: 0, completed: 0 }
    );

    return {
      menuCount: menuItems.length,
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders: counts.pending,
      preparingOrders: counts.preparing,
      completedOrders: counts.completed
    };
  }, [menuItems, orders]);

  const addMenuItem = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!token || !isAdmin) {
      setMessage('You must be logged in as admin!');
      return;
    }

    const menuData = {
      itemName,
      price: Number(price),
      category,
      image,
      available: true
    };

    try {
      const res = await fetch(getApiUrl('/api/menu'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(menuData)
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || 'Failed to add item');
        return;
      }

      notify(data.message || 'Item added', 'success');
      setItemName('');
      setPrice('');
      setCategory('');
      setImage('');
      await fetchMenuItems();
    } catch (_err) {
      setMessage('Server error');
    }
  };

  const updateOrderStatus = useCallback(
    async (orderId, targetStatus) => {
      if (!token || !isAdmin) {
        notify('You must be logged in as admin!', 'error');
        return;
      }

      const normalizedTarget = normalizeStatus(targetStatus);
      setUpdatingOrderId(orderId);

      try {
        const res = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: normalizedTarget })
        });

        const data = await res.json();
        if (!res.ok) {
          notify(data.message || 'Failed to update status', 'error');
          return;
        }

        const updatedOrder = data.order
          ? { ...data.order, status: normalizeStatus(data.order.status) }
          : null;

        if (updatedOrder && updatedOrder._id) {
          setOrders((prev) =>
            prev.map((order) =>
              order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
            )
          );
        } else {
          setOrders((prev) =>
            prev.map((order) =>
              order._id === orderId
                ? { ...order, status: normalizeStatus(normalizedTarget) }
                : order
            )
          );
        }

        notify(`Order marked as ${normalizedTarget}`, 'success');
      } catch (_err) {
        notify('Server error while updating status', 'error');
      } finally {
        setUpdatingOrderId('');
      }
    },
    [token, isAdmin, notify]
  );

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1>Welcome back, {user?.name || 'Admin'}</h1>
          <p className="admin-subtitle">Here’s what’s happening with Smart Canteen today.</p>
        </div>
        <span className="admin-role">Administrator Dashboard</span>
      </header>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <h4>Total Menu Items</h4>
          <p>{dashboardStats.menuCount}</p>
        </article>
        <article className="admin-stat-card">
          <h4>Total Revenue</h4>
          <p>₹{dashboardStats.totalRevenue}</p>
        </article>
        <article className="admin-stat-card">
          <h4>Pending Orders</h4>
          <p>{dashboardStats.pendingOrders}</p>
        </article>
        <article className="admin-stat-card">
          <h4>Preparing Orders</h4>
          <p>{dashboardStats.preparingOrders}</p>
        </article>
        <article className="admin-stat-card">
          <h4>Completed Orders</h4>
          <p>{dashboardStats.completedOrders}</p>
        </article>
      </section>

      <section className="admin-content-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Add a New Menu Item</h3>
            {message && <p className="message">{message}</p>}
          </div>
          <form className="admin-form" onSubmit={addMenuItem}>
            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
            <div className="admin-form-row">
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <button type="submit">Add Menu Item</button>
          </form>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Live Orders</h3>
            <button
              className="admin-refresh"
              type="button"
              onClick={() => {
                fetchOrders();
                fetchMenuItems();
              }}
            >
              Refresh
            </button>
          </div>
          {orders.length === 0 && !message ? (
            <p className="admin-empty">No orders yet</p>
          ) : (
            orders.map((order) => {
              const currentStatus = normalizeStatus(order.status);
              const currentIndex = STATUS_FLOW.indexOf(currentStatus);
              const nextStatus =
                currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
                  ? STATUS_FLOW[currentIndex + 1]
                  : null;

              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <h4>Order #{order._id}</h4>
                      <p className="order-subtext">Placed {formatDateTime(order.createdAt)}</p>
                      <p className="order-subtext">Customer: {order.userId}</p>
                    </div>
                    <span
                      className={`status-pill status-${currentStatus.toLowerCase()}`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-row">
                      <span>Total</span>
                      <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
                    </div>
                    <div className="order-row">
                      <span>Items</span>
                      <ul className="order-items">
                        {order.items?.map((item, index) => (
                          <li key={`${order._id}-${index}`} className="order-item">
                            <span>{resolveMenuName(item?.menuId)}</span>
                            <span className="order-item-qty">× {item?.quantity || 0}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="order-status-controls">
                    <div className="status-stepper">
                      {STATUS_FLOW.map((status, idx) => {
                        const isActive = idx <= currentIndex;
                        return (
                          <div
                            key={status}
                            className={`status-step${isActive ? ' active' : ''}`}
                          >
                            <span className="status-step-dot" />
                            <span className="status-step-label">{status}</span>
                          </div>
                        );
                      })}
                    </div>
                    {nextStatus ? (
                      <button
                        type="button"
                        className="status-advance-btn"
                        onClick={() => updateOrderStatus(order._id, nextStatus)}
                        disabled={updatingOrderId === order._id}
                      >
                        {updatingOrderId === order._id
                          ? 'Updating…'
                          : `Move to ${nextStatus}`}
                      </button>
                    ) : (
                      <span className="status-advance-complete">Order completed</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="admin-card admin-menu-list">
        <div className="admin-card-header">
          <h3>Current Menu</h3>
          <span>{menuItems.length} items</span>
        </div>
        {menuItems.length === 0 ? (
          <p className="admin-empty">No menu items yet.</p>
        ) : (
          <ul>
            {menuItems.map((item) => (
              <li key={item._id || item.id}>
                <div>
                  <strong>{item.itemName || item.name}</strong>
                  {item.category && (
                    <span className="admin-menu-category">{item.category}</span>
                  )}
                </div>
                <span>₹{Number(item.price || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
