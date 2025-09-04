import { io, Socket } from 'socket.io-client';

export interface RealTimeNotification {
  type: 'extension_request' | 'new_remark' | 'extension_reviewed';
  title: string;
  message: string;
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  // Event listeners
  private notificationListeners: ((notification: RealTimeNotification) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isConnected) {
        this.requestNotificationPermission();
      }
    });

    // Handle focus events
    window.addEventListener('focus', () => {
      if (this.isConnected) {
        this.requestNotificationPermission();
      }
    });
  }

  // Connect to WebSocket server
  connect(token: string, userType: 'admin' | 'team') {
    if (this.socket && this.isConnected) {
      console.log('🔌 Already connected to notification server');
      return;
    }

          try {
        // For development, always use localhost
        // For production, use the environment variable
        let serverUrl: string;

        serverUrl = 'ws://localhost:3001';
          console.log('🔌 Development mode: Connecting to localhost:3001');
        
       
          // Production: Use your hosted domain
          // serverUrl = 'wss://workflow.bylinelms.com';

          console.log('🔌 Production mode: Connecting to hosted server');
          console.log('🔌 Production mode: Connecting to:', serverUrl);
        
        
        this.socket = io(serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      });

      this.setupSocketEventHandlers();
      console.log('🔌 Connecting to notification server...');

    } catch (error) {
      console.error('❌ Failed to connect to notification server:', error);
      this.notifyConnectionChange(false);
    }
  }

  private setupSocketEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to notification server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.notifyConnectionChange(true);
      
      // Request notification permission when connected
      this.requestNotificationPermission();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Disconnected from notification server:', reason);
      this.isConnected = false;
      this.notifyConnectionChange(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, don't reconnect
        console.log('Server disconnected, not attempting to reconnect');
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Connection error:', error);
      this.isConnected = false;
      this.notifyConnectionChange(false);
      
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Exponential backoff, max 30s
        console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
      }
    });

    // Notification events
    this.socket.on('new-notification', (notification: RealTimeNotification) => {
      console.log('📢 Received real-time notification:', notification);
      
      // Always show browser notification for team members
      // This ensures they see all notifications immediately
      this.showBrowserNotification(notification);
      
      // Notify all listeners
      this.notifyListeners(notification);
    });

    // Room management events
    this.socket.on('joined-project', (projectId: string) => {
      console.log(`✅ Joined project room: ${projectId}`);
    });

    this.socket.on('joined-projects', (projectIds: string[]) => {
      console.log(`✅ Joined project rooms: ${projectIds.join(', ')}`);
    });
  }

  // Join project room (for admins)
  joinProject(projectId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-project', projectId);
    }
  }

  // Join assigned project rooms (for team members)
  joinAssignedProjects(projectIds: string[]) {
    if (this.socket && this.isConnected) {
      console.log('🔗 Team member joining project rooms:', projectIds);
      this.socket.emit('join-assigned-projects', projectIds);
    } else {
      console.log('⚠️ Cannot join project rooms - socket not ready:', {
        socketExists: !!this.socket,
        isConnected: this.isConnected
      });
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.notifyConnectionChange(false);
      console.log('🔌 Disconnected from notification server');
    }
  }

  // Add notification listener
  onNotification(callback: (notification: RealTimeNotification) => void) {
    this.notificationListeners.push(callback);
    return () => {
      const index = this.notificationListeners.indexOf(callback);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  // Add connection status listener
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(notification: RealTimeNotification) {
    this.notificationListeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Notify connection status change
  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Request browser notification permission
  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('🔔 Notification permission:', permission);
      } catch (error) {
        console.error('❌ Failed to request notification permission:', error);
      }
    }
  }

  // Show browser notification
  private showBrowserNotification(notification: RealTimeNotification) {
    console.log('🔔 Attempting to show browser notification:', notification.title);
    
    if (!('Notification' in window)) {
      console.log('❌ Browser notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      console.log('🔔 Requesting notification permission...');
      this.requestNotificationPermission().then(() => {
        // Retry after permission is granted
        this.showBrowserNotification(notification);
      });
      return;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission denied by user');
      // Could show a toast or message to user about enabling notifications
      this.showPermissionDeniedMessage();
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        console.log('🔔 Creating browser notification...');
        
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: `notification-${notification.type}-${notification.data.id}`,
          requireInteraction: notification.priority === 'high',
          silent: false,
          badge: '/logo.png'
        });

        console.log('✅ Browser notification created successfully');

        // Auto-close low priority notifications after 5 seconds
        if (notification.priority === 'low') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Handle click on notification
        browserNotification.onclick = () => {
          console.log('🔔 Notification clicked, focusing window...');
          window.focus();
          browserNotification.close();
          
          // You can add navigation logic here
          // For example, navigate to the specific task or project
        };

        // Handle notification close
        browserNotification.onclose = () => {
          console.log('🔔 Notification closed');
        };

        // Handle notification error
        browserNotification.onerror = (error) => {
          console.error('❌ Notification error:', error);
        };

      } catch (error) {
        console.error('❌ Failed to show browser notification:', error);
        console.error('❌ Error details:', error);
      }
    }
  }

  // Show message when notifications are denied
  private showPermissionDeniedMessage() {
    // Create a temporary toast-like message
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        max-width: 300px;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>🔔</span>
          <span>Notifications are disabled. Please enable them in your browser settings.</span>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          position: absolute;
          top: 4px;
          right: 8px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
        ">×</button>
      </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 8000);
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Test connection
  testConnection(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
