import { authService } from './apiService';

interface TokenResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  message: string;
}

class TokenService {
  private refreshTimeout: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<TokenResponse> | null = null;
  private userType: 'admin' | 'team' | null = null;

  // Initialize auto-refresh for admin tokens
  initializeAutoRefresh() {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (accessToken && refreshToken) {
      this.userType = 'admin';
      this.scheduleTokenRefresh();
    }
  }

  // Initialize auto-refresh for team member tokens
  initializeTeamAutoRefresh() {
    const teamToken = localStorage.getItem('teamToken');
    const refreshToken = localStorage.getItem('teamRefreshToken');
    
    if (teamToken && refreshToken) {
      this.userType = 'team';
      this.scheduleTeamTokenRefresh();
    }
  }

  // Schedule token refresh before expiration
  private scheduleTokenRefresh() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    try {
      // Decode JWT to get expiration time
      const payload = this.decodeJWT(accessToken);
      if (!payload) return;

      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh token 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 1000);
      
      console.log('🔄 Admin token expires in:', Math.round(timeUntilExpiry / 1000), 'seconds');
      console.log('🔄 Will refresh in:', Math.round(refreshTime / 1000), 'seconds');

      // Clear existing timeout
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }

      // Schedule refresh
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);

    } catch (error) {
      console.error('❌ Error scheduling admin token refresh:', error);
    }
  }

  // Schedule team token refresh before expiration
  private scheduleTeamTokenRefresh() {
    const teamToken = localStorage.getItem('teamToken');
    if (!teamToken) return;

    try {
      // Decode JWT to get expiration time
      const payload = this.decodeJWT(teamToken);
      if (!payload) return;

      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh token 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 1000);
      
      console.log('🔄 Team token expires in:', Math.round(timeUntilExpiry / 1000), 'seconds');
      console.log('🔄 Will refresh in:', Math.round(refreshTime / 1000), 'seconds');

      // Clear existing timeout
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
      }

      // Schedule refresh
      this.refreshTimeout = setTimeout(() => {
        this.refreshTeamToken();
      }, refreshTime);

    } catch (error) {
      console.error('❌ Error scheduling team token refresh:', error);
    }
  }

  // Decode JWT token (without verification)
  private decodeJWT(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ Error decoding JWT:', error);
      return null;
    }
  }

  // Refresh the access token
  async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the existing promise
      if (this.refreshPromise) {
        try {
          await this.refreshPromise;
          return true;
        } catch (error) {
          return false;
        }
      }
    }

    this.isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');
      
      this.refreshPromise = authService.refreshToken({ refresh_token: refreshToken });
      const response = await this.refreshPromise;

      if (response && response.success && response.data) {
        // Store new tokens
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        console.log('✅ Token refreshed successfully');
        
        // Schedule next refresh
        this.scheduleTokenRefresh();
        
        return true;
      } else {
        throw new Error(response?.message || 'Failed to refresh token');
      }

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // Clear invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login
      this.handleTokenExpiration();
      
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Refresh the team member token
  async refreshTeamToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the existing promise
      if (this.refreshPromise) {
        try {
          await this.refreshPromise;
          return true;
        } catch (error) {
          return false;
        }
      }
    }

    this.isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem('teamRefreshToken');
      if (!refreshToken) {
        throw new Error('No team refresh token available');
      }

      console.log('🔄 Refreshing team member token...');
      
      this.refreshPromise = authService.refreshTeamToken({ refresh_token: refreshToken });
      const response = await this.refreshPromise;

      if (response && response.success && response.data) {
        // Store new tokens
        localStorage.setItem('teamToken', response.data.access_token);
        localStorage.setItem('teamRefreshToken', response.data.refresh_token);
        
        console.log('✅ Team token refreshed successfully');
        
        // Schedule next refresh
        this.scheduleTeamTokenRefresh();
        
        return true;
      } else {
        throw new Error(response?.message || 'Failed to refresh team token');
      }

    } catch (error) {
      console.error('❌ Team token refresh failed:', error);
      
      // Clear invalid tokens
      localStorage.removeItem('teamToken');
      localStorage.removeItem('teamRefreshToken');
      
      // Redirect to login
      this.handleTeamTokenExpiration();
      
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  // Handle admin token expiration
  private handleTokenExpiration() {
    console.log('🚨 Admin token expired, redirecting to login...');
    
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('adminUserData');
    
    // Show user-friendly message
    this.showExpirationMessage('admin');
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  // Handle team token expiration
  private handleTeamTokenExpiration() {
    console.log('🚨 Team token expired, redirecting to login...');
    
    // Clear all auth data
    localStorage.removeItem('teamToken');
    localStorage.removeItem('teamRefreshToken');
    localStorage.removeItem('teamUserData');
    
    // Show user-friendly message
    this.showExpirationMessage('team');
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  }

  // Show user-friendly expiration message
  private showExpirationMessage(userType: 'admin' | 'team') {
    const userLabel = userType === 'admin' ? 'Admin' : 'Team Member';
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fef3c7;
        color: #92400e;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        z-index: 10000;
        font-family: system-ui, sans-serif;
        text-align: center;
        max-width: 400px;
        border: 2px solid #f59e0b;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
        <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
          ${userLabel} Session Expired
        </h3>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">
          Your session has expired for security reasons. You'll be redirected to the login page in a few seconds.
        </p>
        <div style="font-size: 12px; opacity: 0.7;">
          This is normal after 24 hours of inactivity
        </div>
      </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 5000);
  }

  // Check if admin token is expired
  isTokenExpired(): boolean {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return true;

    try {
      const payload = this.decodeJWT(accessToken);
      if (!payload) return true;

      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      
      return now >= expiresAt;
    } catch (error) {
      console.error('❌ Error checking admin token expiration:', error);
      return true;
    }
  }

  // Check if team token is expired
  isTeamTokenExpired(): boolean {
    const teamToken = localStorage.getItem('teamToken');
    if (!teamToken) return true;

    try {
      const payload = this.decodeJWT(teamToken);
      if (!payload) return true;

      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      
      return now >= expiresAt;
    } catch (error) {
      console.error('❌ Error checking team token expiration:', error);
      return true;
    }
  }

  // Get admin token expiration time
  getTokenExpirationTime(): Date | null {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return null;

    try {
      const payload = this.decodeJWT(accessToken);
      if (!payload) return null;

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('❌ Error getting admin token expiration:', error);
      return null;
    }
  }

  // Get team token expiration time
  getTeamTokenExpirationTime(): Date | null {
    const teamToken = localStorage.getItem('teamToken');
    if (!teamToken) return null;

    try {
      const payload = this.decodeJWT(teamToken);
      if (!payload) return null;

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('❌ Error getting team token expiration:', error);
      return null;
    }
  }

  // Get time until admin token expires
  getTimeUntilExpiry(): number {
    const expiresAt = this.getTokenExpirationTime();
    if (!expiresAt) return 0;

    return Math.max(expiresAt.getTime() - Date.now(), 0);
  }

  // Get time until team token expires
  getTeamTimeUntilExpiry(): number {
    const expiresAt = this.getTeamTokenExpirationTime();
    if (!expiresAt) return 0;

    return Math.max(expiresAt.getTime() - Date.now(), 0);
  }

  // Clear refresh timeout
  clearRefreshTimeout() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // Cleanup
  cleanup() {
    this.clearRefreshTimeout();
    this.isRefreshing = false;
    this.refreshPromise = null;
  }
}

// Create singleton instance
const tokenService = new TokenService();

export default tokenService;
