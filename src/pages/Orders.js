import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/api';
import '../styles/Orders.css';

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

const getMenuLabel = (item, index) => {
  if (!item) {
    return `Item ${index + 1}`;
  }

  const { menuId } = item;
  if (typeof menuId === 'object' && menuId !== null) {
    return menuId.itemName || menuId.name || menuId._id || `Item ${index + 1}`;
  }

  return menuId || `Item ${index + 1}`;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, token, isAdmin } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user || !token) {
      setOrders([]);
      setMessage('Please login first to view orders');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    const url = isAdmin
      ? getApiUrl('/api/orders')
      : getApiUrl(`/api/orders/${user._id}`);

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setOrders([]);
        setMessage(data.message || 'Failed to fetch orders');
        return;
      }

      if (Array.isArray(data)) {
        const mapped = data.map((order) => ({
          ...order,
          status: normalizeStatus(order.status)
        }));
        setOrders(mapped);
        setMessage('');
      } else {
        setOrders([]);
        setMessage('No orders found');
      }
    } catch (_err) {
      setOrders([]);
      setMessage('Server error');
    } finally {
      setIsLoading(false);
    }
  }, [user, token, isAdmin]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
          <h2>{isAdmin ? 'All Orders' : 'Your Orders'}</h2>
          <p className="orders-subtext">Auto-refreshes every 15 seconds.</p>
        </div>
        <button
          type="button"
          className="orders-refresh"
          onClick={fetchOrders}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      {orders.length === 0 && !message ? (
        <p className="orders-empty">No orders yet</p>
      ) : (
        orders.map((order) => {
          const currentStatus = normalizeStatus(order.status);
          const currentIndex = STATUS_FLOW.indexOf(currentStatus);

          return (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h4>Order #{order._id}</h4>
                  <p className="order-subtext">Placed {formatDateTime(order.createdAt)}</p>
                  {isAdmin && (
                    <p className="order-subtext">Customer: {order.userId}</p>
                  )}
                </div>
                <span className={`status-pill status-${currentStatus.toLowerCase()}`}>
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
                        <span>{getMenuLabel(item, index)}</span>
                        <span className="order-item-qty">× {item?.quantity || 0}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="status-stepper">
                {STATUS_FLOW.map((status, idx) => {
                  const isActive = idx <= currentIndex;
                  return (
                    <div key={status} className={`status-step${isActive ? ' active' : ''}`}>
                      <span className="status-step-dot" />
                      <span className="status-step-label">{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
