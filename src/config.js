// Configuration file for Lucky Draw System
// Update this file with your Google Apps Script Web App URL

export const CONFIG = {
  // Replace this with your actual Google Apps Script Web App URL
  API_URL: import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbx4ceoareWUSpRbbIuf6wrXjxuERw739GYnOlNtqZ_qu_N_y8Q98IRCAyxZao3sD8BkWg/exec',

  // ATM Locations
  ATM_LOCATIONS: [
    { value: 'Benhur-F', label: 'Benhur F' },
    { value: 'Dinesh-Kumar', label: 'Dinesh Kumar' },
    { value: 'Harish-KS', label: 'Harish KS' },
    { value: 'Sivakumar-Kotipatruni', label: 'Sivakumar Kotipatruni' },
    /*{ value: 'ATM-Central', label: 'ATM Central' }*/
  ],

  // Admin Credentials (Change these for production!)
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'DRAW@2025',

  // Ticket Number Range
  TICKET_MIN: 101,
  TICKET_MAX: 499,

  // Auto-update interval for admin dashboard (milliseconds)
  STATS_UPDATE_INTERVAL: 5000,

  // Draw animation settings
  DRAW_ANIMATION: {
    SPIN_DURATION: 5000,      // Initial fast spin duration
    SLOWDOWN_DURATION: 2000,  // Slowdown phase duration
    SPIN_INTERVAL: 100,       // Fast spin interval
    SLOW_INTERVAL: 300        // Slow spin interval
  }
};

// Validation patterns
export const VALIDATION = {
  EMPLOYEE_ID: /^\d{9}$/,
  EMPLOYEE_NAME: /^[A-Za-z\s]+$/
};

// API endpoints
export const ENDPOINTS = {
  REGISTER: 'register',
  GET_STATS: 'getStats',
  GET_WINNERS: 'getWinners',
  DRAW_WINNER: 'drawWinner',
  CHECK_STATUS: 'checkStatus'
};