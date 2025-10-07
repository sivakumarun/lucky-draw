// Trainer Registration Script
import { apiService } from '../services/api.js';
import { CONFIG, VALIDATION } from '../config.js';

// DOM Elements
const form = document.getElementById('registrationForm');
const employeeIdInput = document.getElementById('employeeId');
const employeeNameInput = document.getElementById('employeeName');
const atmLocationSelect = document.getElementById('atmLocation');
const enrollBtn = document.getElementById('enrollBtn');
const loading = document.getElementById('loading');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const ticketNumberDisplay = document.getElementById('ticketNumber');

// Populate ATM locations dropdown
function populateATMLocations() {
  CONFIG.ATM_LOCATIONS.forEach(atm => {
    const option = document.createElement('option');
    option.value = atm.value;
    option.textContent = atm.label;
    atmLocationSelect.appendChild(option);
  });
}

// Validation functions
function validateEmployeeId(id) {
  return VALIDATION.EMPLOYEE_ID.test(id);
}

function validateEmployeeName(name) {
  return VALIDATION.EMPLOYEE_NAME.test(name);
}

function showError(inputElement, errorElementId, message) {
  const errorElement = document.getElementById(errorElementId);
  inputElement.classList.add('error');
  errorElement.textContent = message;
  errorElement.classList.add('show');
}

function hideError(inputElement, errorElementId) {
  const errorElement = document.getElementById(errorElementId);
  inputElement.classList.remove('error');
  errorElement.classList.remove('show');
}

// Real-time validation
employeeIdInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
  if (e.target.value && !validateEmployeeId(e.target.value)) {
    showError(e.target, 'employeeIdError', 'SSO ID must be exactly 9 digits');
  } else {
    hideError(e.target, 'employeeIdError');
  }
});

employeeNameInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
  if (e.target.value && !validateEmployeeName(e.target.value)) {
    showError(e.target, 'employeeNameError', 'Name should only contain letters and spaces');
  } else {
    hideError(e.target, 'employeeNameError');
  }
});

atmLocationSelect.addEventListener('change', (e) => {
  if (e.target.value) {
    hideError(e.target, 'atmLocationError');
  }
});

// Show custom modal for already registered users
function showAlreadyRegisteredModal(data) {
  const modalContent = successModal.querySelector('.success-content');

  // Update modal content
  modalContent.innerHTML = `
    <div class="success-icon" style="color: #ffc107;">⚠️</div>
    <h2 style="color: #856404;">Already Enrolled!</h2>
    <p>SSO ID <strong>${data.employeeId || 'this ID'}</strong> is already Enrolled.</p>
    <p style="margin-top: 10px;">Your Lucky Draw Coupon number is:</p>
    <div class="ticket-number" style="color: #ffc107;">${data.ticketNumber}</div>
    <p style="font-size: 14px; color: #666; margin-top: 10px;">
      <strong>Name:</strong> ${data.employeeName}<br>
      <strong>ATM:</strong> ${data.atmLocation}<br>

    </p>
    <p style="margin-top: 15px; color: #856404;">
      You cannot register again with the same SSO ID.
    </p>
    <button class="btn-close" id="closeModalBtn" style="background: #ffc107; margin-top: 20px;">Close</button>
  `;

  successModal.classList.add('show');

  // Re-attach close event
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    successModal.classList.remove('show');
    resetModalContent();
  });
}

// Show success modal for new registration
function showSuccessModal(ticketNumber) {
  const modalContent = successModal.querySelector('.success-content');

  modalContent.innerHTML = `
    <div class="success-icon">🎊</div>
    <h2>Registration Successful!</h2>
    <p>Your Coupon number is:</p>
    <div class="ticket-number">${ticketNumber}</div>
    <p>Good luck with the draw!</p>
    <button class="btn-close" id="closeModalBtn">Close</button>
  `;

  successModal.classList.add('show');

  // Re-attach close event
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    successModal.classList.remove('show');
    resetModalContent();
  });
}

// Reset modal to original content
function resetModalContent() {
  const modalContent = successModal.querySelector('.success-content');
  modalContent.innerHTML = `
    <div class="success-icon">🎊</div>
    <h2>Registration Successful!</h2>
    <p>Your Coupon number is:</p>
    <div class="ticket-number" id="ticketNumber">---</div>
    <p>Good luck with the draw!</p>
    <button class="btn-close" id="closeModalBtn">Close</button>
  `;
}

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const employeeId = employeeIdInput.value.trim();
  const employeeName = employeeNameInput.value.trim();
  const atmLocation = atmLocationSelect.value;

  let isValid = true;

  if (!validateEmployeeId(employeeId)) {
    showError(employeeIdInput, 'employeeIdError', 'SSO ID must be exactly 9 digits');
    isValid = false;
  }

  if (!validateEmployeeName(employeeName)) {
    showError(employeeNameInput, 'employeeNameError', 'Name should only contain letters and spaces');
    isValid = false;
  }

  if (!atmLocation) {
    showError(atmLocationSelect, 'atmLocationError', 'Please select an ATM Name');
    isValid = false;
  }

  if (!isValid) return;

  // Show loading
  enrollBtn.disabled = true;
  loading.classList.add('show');

  try {
    const data = await apiService.registerTrainer(employeeId, employeeName, atmLocation);

    if (data.success) {
      // New registration - show success
      showSuccessModal(data.ticketNumber);
      form.reset();
    } else if (data.alreadyRegistered) {
      // Already registered - show existing ticket
      showAlreadyRegisteredModal({
        ...data,
        employeeId: employeeId
      });
      form.reset();
    } else {
      // Other error
      alert(data.message || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please check your internet connection and try again.');
  } finally {
    enrollBtn.disabled = false;
    loading.classList.remove('show');
  }
});

// Close modal (for initial setup)
closeModalBtn.addEventListener('click', () => {
  successModal.classList.remove('show');
});

// Check registration status on page load
async function checkRegistrationStatus() {
  try {
    const data = await apiService.checkRegistrationStatus();

    const statusDiv = document.getElementById('registrationStatus');
    const statusMessage = document.getElementById('statusMessage');

    if (!data.isOpen) {
      statusDiv.classList.add('show', 'closed');
      statusMessage.textContent = 'Registration is currently closed.';
      enrollBtn.disabled = true;
    } else {
      statusDiv.classList.add('show');
      statusMessage.textContent = 'Registration is open. Enroll now!';
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
}

// Initialize
populateATMLocations();
// Uncomment the line below to check registration status on page load
// checkRegistrationStatus();