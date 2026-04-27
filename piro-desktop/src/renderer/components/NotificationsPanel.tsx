/**
 * NotificationsPanel - Notification Center
 */

import React from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onClear: () => void;
}

export function NotificationsPanel({ notifications, onClear }: NotificationsPanelProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✓';
    }
  };
  
  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'var(--color-accent)';
      case 'warning': return 'var(--color-warning)';
      case 'error': return 'var(--color-error)';
      case 'success': return 'var(--color-success)';
    }
  };
  
  return (
    <div className="notifications-panel">
      <div className="panel-header">
        <h2>Notifications</h2>
        <button onClick={onClear}>Clear All</button>
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span>🔔</span>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="notification-item">
              <span className="notification-icon" style={{ color: getColor(n.type) }}>
                {getIcon(n.type)}
              </span>
              <div className="notification-content">
                <span className="notification-title">{n.title}</span>
                <span className="notification-message">{n.message}</span>
                <span className="notification-time">
                  {new Date(n.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <style>{`
        .notifications-panel { display: flex; flex-direction: column; height: 100%; }
        
        .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 24px; border-bottom: 1px solid var(--color-border); }
        .panel-header h2 { font-size: 20px; }
        .panel-header button { padding: 8px 16px; background: var(--color-bg-secondary); border-radius: var(--radius-md); font-size: 12px; }
        .panel-header button:hover { background: var(--color-bg-tertiary); }
        
        .notifications-list { flex: 1; overflow-y: auto; padding: 16px; }
        
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--color-text-muted); }
        .empty-state span { font-size: 48px; margin-bottom: 16px; }
        
        .notification-item { display: flex; gap: 12px; padding: 16px; background: var(--color-bg-secondary); border-radius: var(--radius-md); margin-bottom: 8px; }
        
        .notification-icon { font-size: 20px; }
        .notification-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .notification-title { font-weight: 600; }
        .notification-message { font-size: 13px; color: var(--color-text-secondary); }
        .notification-time { font-size: 11px; color: var(--color-text-muted); }
      `}</style>
    </div>
  );
}