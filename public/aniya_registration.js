// Aniya Registration Form JavaScript

// Live calculation of total cost
const treeInput = document.getElementById('treeCount');
const totalOutput = document.getElementById('totalAmount');
const totalAmountInput = document.getElementById('totalAmountInput');

if (treeInput && totalOutput && totalAmountInput) {
  treeInput.addEventListener('input', () => {
    const count = parseInt(treeInput.value) || 0;
    const total = count * 407;
    totalOutput.textContent = `P${total.toLocaleString()}`;
    totalAmountInput.value = total;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const intercroppingRadios = document.getElementsByName("intercropping");
  const cropsCheckboxes = document.querySelectorAll("input[name='crops[]']");
  const livestockCheckboxes = document.querySelectorAll("input[name='livestock[]']");

  // Handle intercropping options visibility and functionality
  const toggleIntercroppingFields = () => {
    const selected = [...intercroppingRadios].find(r => r.checked)?.value;
    const enable = selected === "Yes";
    
    // Enable/disable crops checkboxes
    cropsCheckboxes.forEach(checkbox => {
      checkbox.disabled = !enable;
      checkbox.parentElement.style.opacity = enable ? '1' : '0.5';
      checkbox.parentElement.style.pointerEvents = enable ? 'auto' : 'none';
      if (!enable) checkbox.checked = false;
    });
    
    // Enable/disable livestock checkboxes
    livestockCheckboxes.forEach(checkbox => {
      checkbox.disabled = !enable;
      checkbox.parentElement.style.opacity = enable ? '1' : '0.5';
      checkbox.parentElement.style.pointerEvents = enable ? 'auto' : 'none';
      if (!enable) checkbox.checked = false;
    });
  };

  // Add event listeners to intercropping radio buttons
  if (intercroppingRadios.length > 0) {
    intercroppingRadios.forEach(r => r.addEventListener("change", toggleIntercroppingFields));
    toggleIntercroppingFields(); // Initialize state
  }

  // Make all checkboxes clickable with visual feedback
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  allCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      console.log(`Checkbox ${this.name} with value ${this.value} is now ${this.checked ? 'checked' : 'unchecked'}`);
      
      // Add visual feedback
      if (this.checked) {
        this.parentElement.style.fontWeight = 'bold';
        this.parentElement.style.color = '#2e8b57';
      } else {
        this.parentElement.style.fontWeight = '400';
        this.parentElement.style.color = 'inherit';
      }
    });
    
    // Add hover effect
    checkbox.addEventListener('mouseenter', function() {
      if (!this.disabled) {
        this.style.transform = 'scale(1.1)';
        this.style.transition = 'transform 0.2s ease';
      }
    });
    
    checkbox.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Make all radio buttons clickable with visual feedback
  const allRadios = document.querySelectorAll('input[type="radio"]');
  allRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      console.log(`Radio ${this.name} selected value: ${this.value}`);
    });
    
    // Add hover effect
    radio.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.1)';
      this.style.transition = 'transform 0.2s ease';
    });
    
    radio.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Handle notification checkboxes (ensure only one "none" option)
  const notificationCheckboxes = document.querySelectorAll('input[name="notification[]"]');
  const noneCheckbox = document.querySelector('input[name="notification[]"][value="none"]');
  
  notificationCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.value === 'none' && this.checked) {
        // If "none" is selected, uncheck others
        notificationCheckboxes.forEach(cb => {
          if (cb.value !== 'none') cb.checked = false;
        });
      } else if (this.value !== 'none' && this.checked) {
        // If any other option is selected, uncheck "none"
        if (noneCheckbox) noneCheckbox.checked = false;
      }
    });
  });
    
  // Form submission handler
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      // Get all form values
      const fullName = document.querySelector("input[name='fullName']")?.value;
      const email = document.querySelector("input[name='email']")?.value;
      const mobile = document.querySelector("input[name='mobile']")?.value;
      const company = document.querySelector("input[name='company']")?.value;
      const role = document.querySelector("input[name='role']")?.value;
      const contactMethod = document.querySelector("select[name='contactMethod']")?.value;
      const packageType = document.querySelector("select[name='package']")?.value;
      const treeCount = document.querySelector("input[name='treeCount']")?.value;
      const totalAmount = document.querySelector("input[name='totalAmount']")?.value;
      const intercropping = document.querySelector("input[name='intercropping']:checked")?.value;
      
      // Get selected crops
      const selectedCrops = Array.from(document.querySelectorAll("input[name='crops[]']:checked")).map(el => el.value);
      
      // Get selected livestock
      const selectedLivestock = Array.from(document.querySelectorAll("input[name='livestock[]']:checked")).map(el => el.value);
      
      const certificate = document.querySelector("input[name='certificateName']")?.value;
      const dashboard = document.querySelector("input[name='dashboard']:checked")?.value;
      const gift = document.querySelector("input[name='gift']:checked")?.value;
      const notification = Array.from(document.querySelectorAll("input[name='notification[]']:checked")).map(el => el.value);
      const paymentMethod = document.querySelector("input[name='paymentMethod']:checked")?.value;
      const zoom = document.querySelector("input[name='zoomCall']:checked")?.value;
      const agreement = document.querySelector("input[name='agreement']")?.checked;

      // Validate required fields
      let isValid = true;
      const requiredFields = [
        { field: fullName, name: 'Full Name' },
        { field: email, name: 'Email' },
        { field: mobile, name: 'Mobile' },
        { field: contactMethod, name: 'Contact Method' },
        { field: packageType, name: 'Package Type' },
        { field: treeCount, name: 'Tree Count' }
      ];

      requiredFields.forEach(item => {
        if (!item.field || item.field.trim() === '') {
          console.error(`${item.name} is required`);
          isValid = false;
        }
      });

      if (!agreement) {
        alert('Please agree to the terms and conditions');
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        alert('Please fill in all required fields');
        return;
      }

      console.log("Submitting form with values:", {
        fullName,
        email,
        mobile,
        company,
        role,
        contactMethod,
        packageType,
        treeCount,
        totalAmount,
        intercropping,
        selectedCrops,
        selectedLivestock,
        certificate,
        dashboard,
        gift,
        notification,
        paymentMethod,
        zoom,
        agreement
      });
    });
  }
});


// Helper functions for getting form data

// Function to get all selected crops
function getSelectedCrops() {
  return Array.from(document.querySelectorAll('input[name="crops[]"]:checked')).map(cb => cb.value);
}

// Function to get all selected livestock
function getSelectedLivestock() {
  return Array.from(document.querySelectorAll('input[name="livestock[]"]:checked')).map(cb => cb.value);
}

// Function to get all selected notification preferences
function getSelectedNotifications() {
  return Array.from(document.querySelectorAll('input[name="notification[]"]:checked')).map(cb => cb.value);
}

// Function to validate form before submission
function validateForm() {
  const requiredFields = document.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.style.borderColor = '#ff6b6b';
    } else {
      field.style.borderColor = '#ccc';
    }
  });
  
  return isValid;
}
