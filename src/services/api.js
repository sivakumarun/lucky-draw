// API Service for Lucky Draw System
import { CONFIG, ENDPOINTS } from '../config.js';

class ApiService {
  constructor() {
    this.baseURL = CONFIG.API_URL;
    this.mockData = {
      registrations: [],
      winners: []
    };
  }

  // Check if we should use mock data
  useMockData() {
    return !this.baseURL || CONFIG.USE_MOCK_DATA;
  }

  // Generate mock ticket number
  generateMockTicket() {
    const existingTickets = new Set(this.mockData.registrations.map(r => r.ticketNumber));
    let ticket;
    do {
      ticket = Math.floor(Math.random() * (CONFIG.TICKET_MAX - CONFIG.TICKET_MIN + 1)) + CONFIG.TICKET_MIN;
    } while (existingTickets.has(ticket));
    return ticket;
  }

  // Make API request with proper CORS handling
  async makeRequest(url, options = {}) {
    try {
      // For Google Apps Script, we need to use specific settings
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // If CORS error or fetch fails, log and fall back to mock data
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        console.warn('⚠️ CORS error detected. Falling back to mock data mode.');
        console.warn('To fix: Redeploy Google Apps Script with correct settings (see instructions below)');
        throw new Error('CORS_ERROR');
      }
      throw error;
    }
  }

  // Register a new trainer
  async registerTrainer(employeeId, employeeName, atmLocation) {
    // Mock data mode
    if (this.useMockData()) {
      console.warn('⚠️ Using mock data. Configure API_URL in .env or src/config.js for real backend.');

      // Check duplicate
      const existingReg = this.mockData.registrations.find(r => r.employeeId === employeeId);
      if (existingReg) {
        return {
          success: false,
          message: 'Already enrolled',
          alreadyRegistered: true,
          ticketNumber: existingReg.ticketNumber,
          status: existingReg.status,
          employeeName: existingReg.employeeName,
          atmLocation: existingReg.atmLocation
        };
      }

      const ticketNumber = this.generateMockTicket();
      this.mockData.registrations.push({
        employeeId,
        employeeName,
        atmLocation,
        ticketNumber,
        status: 'Active',
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Registration successful',
        ticketNumber
      };
    }

    // Real API mode with CORS handling
    try {
      return await this.makeRequest(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid CORS preflight
        },
        body: JSON.stringify({
          action: ENDPOINTS.REGISTER,
          employeeId,
          employeeName,
          atmLocation
        })
      });
    } catch (error) {
      if (error.message === 'CORS_ERROR') {
        // Fall back to mock data
        console.warn('🔄 Automatically switching to mock data mode due to CORS issue.');
        CONFIG.USE_MOCK_DATA = true;
        return this.registerTrainer(employeeId, employeeName, atmLocation);
      }
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Get enrollment statistics
  async getStats() {
    // Mock data mode
    if (this.useMockData()) {
      const atmCounts = {
        'Benhur-F': 0,
        'Dinesh-Kumar': 0,
        'Harish-KS': 0,
        'Sivakumar-Kotipatruni': 0,
        /*'ATM-Central': 0*/
      };

      this.mockData.registrations.forEach(reg => {
        if (atmCounts.hasOwnProperty(reg.atmLocation)) {
          atmCounts[reg.atmLocation]++;
        }
      });

      return {
        success: true,
        message: 'Stats retrieved',
        total: this.mockData.registrations.length,
        atmCounts
      };
    }

    // Real API mode with CORS handling
    try {
      return await this.makeRequest(`${this.baseURL}?action=${ENDPOINTS.GET_STATS}`);
    } catch (error) {
      if (error.message === 'CORS_ERROR') {
        CONFIG.USE_MOCK_DATA = true;
        return this.getStats();
      }
      console.error('Get stats error:', error);
      throw error;
    }
  }

  // Get winners list
  async getWinners() {
    // Mock data mode
    if (this.useMockData()) {
      return {
        success: true,
        message: 'Winners retrieved',
        winners: this.mockData.winners
      };
    }

    // Real API mode with CORS handling
    try {
      return await this.makeRequest(`${this.baseURL}?action=${ENDPOINTS.GET_WINNERS}`);
    } catch (error) {
      if (error.message === 'CORS_ERROR') {
        CONFIG.USE_MOCK_DATA = true;
        return this.getWinners();
      }
      console.error('Get winners error:', error);
      throw error;
    }
  }

  // Draw a winner
  async drawWinner() {
    // Mock data mode
    if (this.useMockData()) {
      const activeRegistrations = this.mockData.registrations.filter(r => r.status === 'Active');

      if (activeRegistrations.length === 0) {
        return {
          success: false,
          message: 'No eligible participants for the draw'
        };
      }

      const randomIndex = Math.floor(Math.random() * activeRegistrations.length);
      const winner = activeRegistrations[randomIndex];

      // Mark as winner
      const registration = this.mockData.registrations.find(r => r.ticketNumber === winner.ticketNumber);
      registration.status = 'Winner';

      // Add to winners
      this.mockData.winners.push({
        ...winner,
        drawDate: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Winner selected',
        winner
      };
    }

    // Real API mode with CORS handling
    try {
      return await this.makeRequest(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: ENDPOINTS.DRAW_WINNER
        })
      });
    } catch (error) {
      if (error.message === 'CORS_ERROR') {
        CONFIG.USE_MOCK_DATA = true;
        return this.drawWinner();
      }
      console.error('Draw winner error:', error);
      throw error;
    }
  }

  // Check registration status
  async checkRegistrationStatus() {
    // Mock data mode
    if (this.useMockData()) {
      return {
        success: true,
        message: 'Status retrieved',
        isOpen: true
      };
    }

    // Real API mode with CORS handling
    try {
      return await this.makeRequest(`${this.baseURL}?action=${ENDPOINTS.CHECK_STATUS}`);
    } catch (error) {
      if (error.message === 'CORS_ERROR') {
        CONFIG.USE_MOCK_DATA = true;
        return this.checkRegistrationStatus();
      }
      console.error('Check status error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();