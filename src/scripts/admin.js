// Admin Dashboard Script
import { apiService } from '../services/api.js';
import { CONFIG } from '../config.js';

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const drawBtn = document.getElementById('drawBtn');
const drawBox = document.getElementById('drawBox');
const drawNumberElement = document.getElementById('drawNumber');
const winnersBody = document.getElementById('winnersBody');

let updateInterval = null;

// Login functionality
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userId = userIdInput.value;
  const password = passwordInput.value;

  if (userId === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
    loginContainer.style.display = 'none';
    dashboard.classList.add('show');
    startAutoUpdate();
    loadWinners();
    loginError.classList.remove('show');
  } else {
    loginError.classList.add('show');
  }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
  loginContainer.style.display = 'flex';
  dashboard.classList.remove('show');
  stopAutoUpdate();
  loginForm.reset();
  loginError.classList.remove('show');
});

// Fetch enrollment statistics
async function fetchStats() {
  try {
    const data = await apiService.getStats();

    if (data.success) {
      document.getElementById('totalCount').textContent = data.total || 0;
      document.getElementById('atmNorth').textContent = data.atmCounts['Benhur-F'] || 0;
      document.getElementById('atmSouth').textContent = data.atmCounts['Dinesh-Kumar'] || 0;
      document.getElementById('atmEast').textContent = data.atmCounts['Harish-KS'] || 0;
      document.getElementById('atmWest').textContent = data.atmCounts['Sivakumar-Kotipatruni'] || 0;
      /*document.getElementById('atmCentral').textContent = data.atmCounts['ATM-Central'] || 0;*/
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Start auto-update
function startAutoUpdate() {
  fetchStats();
  updateInterval = setInterval(fetchStats, CONFIG.STATS_UPDATE_INTERVAL);
}

// Stop auto-update
function stopAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
}

// Lucky Draw functionality
drawBtn.addEventListener('click', startDraw);

async function startDraw() {
  drawBtn.disabled = true;
  drawBox.classList.add('spinning');

  // Animate random numbers for configured duration
  let animationCount = 0;
  const maxAnimations = CONFIG.DRAW_ANIMATION.SPIN_DURATION / CONFIG.DRAW_ANIMATION.SPIN_INTERVAL;

  const spinInterval = setInterval(() => {
    const randomNum = Math.floor(Math.random() * (CONFIG.TICKET_MAX - CONFIG.TICKET_MIN + 1)) + CONFIG.TICKET_MIN;
    drawNumberElement.textContent = randomNum;
    animationCount++;

    if (animationCount >= maxAnimations) {
      clearInterval(spinInterval);
    }
  }, CONFIG.DRAW_ANIMATION.SPIN_INTERVAL);

  // After spin duration, slow down
  setTimeout(async () => {
    drawBox.classList.remove('spinning');

    // Slow down animation
    const slowInterval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * (CONFIG.TICKET_MAX - CONFIG.TICKET_MIN + 1)) + CONFIG.TICKET_MIN;
      drawNumberElement.textContent = randomNum;
    }, CONFIG.DRAW_ANIMATION.SLOW_INTERVAL);

    setTimeout(async () => {
      clearInterval(slowInterval);

      // Fetch actual winner
      try {
        const data = await apiService.drawWinner();

        if (data.success) {
          drawNumberElement.textContent = data.winner.ticketNumber;
          createConfetti();

          // Reload winners list
          setTimeout(() => {
            loadWinners();
            fetchStats();
          }, 2000);
        } else {
          alert(data.message || 'No eligible participants for the draw.');
          drawNumberElement.textContent = '000';
        }
      } catch (error) {
        console.error('Error during draw:', error);
        alert('An error occurred during the draw. Please try again.');
        drawNumberElement.textContent = '000';
      } finally {
        drawBtn.disabled = false;
      }
    }, CONFIG.DRAW_ANIMATION.SLOWDOWN_DURATION);
  }, CONFIG.DRAW_ANIMATION.SPIN_DURATION);
}

// Load previous winners
async function loadWinners() {
  try {
    const data = await apiService.getWinners();

    if (data.success && data.winners.length > 0) {
      winnersBody.innerHTML = '';

      data.winners.reverse().forEach((winner, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><span class="winner-badge">#${data.winners.length - index}</span></td>
          <td><strong>${winner.ticketNumber}</strong></td>
          <td>${winner.employeeId}</td>
          <td>${winner.employeeName}</td>
          <td>${winner.atmLocation}</td>
          <td>${formatDateTime(winner.drawDate)}</td>
        `;
        winnersBody.appendChild(row);
      });
    } else {
      winnersBody.innerHTML = '<tr><td colspan="6" class="no-winners">No winners yet. Start the first draw!</td></tr>';
    }
  } catch (error) {
    console.error('Error loading winners:', error);
  }
}

// Format date and time
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Create confetti effect
function createConfetti() {
  const colors = ['#f5576c', '#f093fb', '#ffd89b', '#19547b', '#51cf66', '#4dabf7'];

  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }, i * 30);
  }
}