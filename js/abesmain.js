// Current discount amount from promo codes
let discount = 0;

// Store current order data for PDF generation
let currentOrderData = null;


// Firewood product options with name, price, image path, and quantity
const firewoodOptions = [
  { name: 'Oak Bundle', price: 15.99, image: 'images/oak.jpg', quantity: 0 },
  { name: 'Maple Bundle', price: 13.49, image: 'images/maple.jpg', quantity: 0 },
  { name: 'Hickory Bundle', price: 18.25, image: 'images/hickory.jpg', quantity: 0 },
];

/**
 * Render the firewood shop product tiles inside the #shop container.
 * Shows quality information only.
 */
function renderShop() {
  const shop = document.getElementById('shop');
  shop.innerHTML = ''; // Clear previous content

  // Add quality information section
  const qualitySection = document.createElement('div');
  qualitySection.className = 'quality-section';
  qualitySection.innerHTML = `
    <div class="quality-content">
      <h2>Premium Firewood Quality</h2>
      <p>Our firewood is sourced locally from Honest Abe's old stomping grounds.  We select the finest and cleanest burning wood from Midwest.  </p>
      
      <div class="quality-features">
        <div class="feature">
          <h3>🌲 Sustainably Harvested</h3>
          <p>All our firewood comes from responsible wood clearing projects and scrap wood to ensure we preserve the natural beauty of our planet for future generations.</p>
        </div>
        
        <div class="feature">
          <h3>🔥 Perfectly Seasoned</h3>
          <p>Each bundle is properly dried and seasoned to ensure optimal burning efficiency and maximum heat output.</p>
        </div>
        
        <div class="feature">
          <h3>🌿 Natural & Clean</h3>
          <p>No chemicals or artificial treatments - just pure, natural firewood that burns clean and safe for your family.</p>
        </div>
      </div>
    </div>
  `;
  shop.appendChild(qualitySection);
  
  updateCartSummary();
}

/**
 * Update the quantity of a given item by delta (+1 or -1)
 * and re-render the shop and cart summary.
 * @param {number} index - Index of the firewood option.
 * @param {number} delta - Amount to change the quantity by.
 */
function updateQuantity(index, delta) {
  const item = firewoodOptions[index];
  const newQuantity = item.quantity + delta;
  if (newQuantity >= 0) {
    item.quantity = newQuantity;
    renderShop();
  }
}

/**
 * Calculate the total items in the cart.
 * @returns {number}
 */
function getTotalItems() {
  return firewoodOptions.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calculate the total price before discount.
 * @returns {number}
 */
function getTotalPrice() {
  return firewoodOptions.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Update the floating cart summary display with total items and total price.
 */
function updateCartSummary() {
  const itemCountElem = document.getElementById('itemCount');
  const cartTotalElem = document.getElementById('cartTotal');

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  itemCountElem.textContent = totalItems;
  cartTotalElem.textContent = (totalPrice - discount).toFixed(2);
}

/**
 * Toggle the cart modal visibility.
 */
function toggleCartModal() {
  const modal = document.getElementById('cartModal');
  modal.classList.toggle('show');
  if (modal.classList.contains('show')) {
    renderCart();
  }
}

/**
 * Render the detailed cart items inside the cart modal.
 * Shows name, quantity, price, and subtotal per item.
 */
function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  cartItemsContainer.innerHTML = '';

  const itemsInCart = firewoodOptions.filter(item => item.quantity > 0);

  if (itemsInCart.length === 0) {
    cartItemsContainer.textContent = 'No items yet.';
    updateModalTotal();
    return;
  }

  itemsInCart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.textContent = `${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`;
    cartItemsContainer.appendChild(div);
  });

  updateModalTotal();
}

/**
 * Apply promo code discount if valid.
 * Currently supports only 'campfire10' for $10 off.
 */
function applyPromo() {
  const promoInput = document.getElementById('promoCode');
  const code = promoInput.value.trim().toLowerCase();
  if (code === 'campfire10') {
    discount = 10;
    alert('Promo code applied! $10 discount.');
  } else if (code === '') {
    discount = 0;
    alert('Promo code cleared.');
  } else {
    discount = 0;
    alert('Invalid promo code.');
  }
  updateModalTotal();
  updateCartSummary();
}

/**
 * Update the total displayed in the modal including discount.
 */
function updateModalTotal() {
  const modalTotalElem = document.getElementById('cartModalTotal');
  const total = getTotalPrice();
  const final = Math.max(0, total - discount);
  modalTotalElem.textContent = final.toFixed(2);
}

/**
 * Generate order receipt PDF using jsPDF, including order summary
 * and delivery address.
 */
function generateReceiptPDF(orderDetails) {
  const { items, total, address } = orderDetails;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Firewood Shop - Order Receipt', 14, 20);

  doc.setFontSize(12);
  let y = 40;
  doc.text('Items Ordered:', 14, y);

  items.forEach(item => {
    y += 10;
    doc.text(`${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`, 14, y);
  });

  y += 15;
  doc.text(`Total Amount: $${total.toFixed(2)}`, 14, y);

  y += 20;
  doc.text('Delivery Address:', 14, y);

  // Split address into multiple lines if too long
  const splitAddress = doc.splitTextToSize(address, 180);
  doc.text(splitAddress, 14, y + 10);

  return doc;
}

/**
 * Handler for placing the order:
 * - Validates cart and address
 * - Generates PDF receipt and triggers download
 * - Clears the cart and resets discount & promo code
 */
function placeOrder() {
  const totalItems = getTotalItems();
  if (totalItems === 0) {
    alert('Your cart is empty. Please add some firewood bundles.');
    return;
  }

  const address = document.getElementById('address').value.trim();
  if (!address) {
    alert('Please enter a delivery address.');
    return;
  }

  const totalPrice = Math.max(0, getTotalPrice() - discount);

  // Prepare order details for receipt
  const orderDetails = {
    items: firewoodOptions.filter(i => i.quantity > 0),
    total: totalPrice,
    address: address,
  };

  // Generate and save PDF receipt
  const pdfDoc = generateReceiptPDF(orderDetails);
  pdfDoc.save('FirewoodOrderReceipt.pdf');

  // Clear cart and inputs
  firewoodOptions.forEach(item => item.quantity = 0);
  discount = 0;
  document.getElementById('promoCode').value = '';
  document.getElementById('address').value = '';

  toggleCartModal();
  renderShop();
  updateCartSummary();

  alert('Order placed! Receipt downloaded.');
}

/**
 * Generate a random order number starting with WEB_ followed by 7 random digits
 * @returns {string} Order number in format WEB_xxxxxxx
 */
function generateOrderNumber() {
  const randomDigits = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
  return `WEB_${randomDigits}`;
}

/**
 * Handle Buy Now button click - shows order form
 */
function buyNow() {
  // Generate random order number
  const orderNumber = generateOrderNumber();
  
  // Create and show the order form modal
  const formModal = document.createElement('div');
  formModal.className = 'form-modal';
  formModal.innerHTML = `
    <div class="form-modal-content">
      <h2>Firewood Order Form</h2>
      <form id="orderForm" onsubmit="submitOrder(event)">
        <div class="form-group">
          <label for="orderNumber">Order Number:</label>
          <input type="text" id="orderNumber" value="${orderNumber}" readonly>
        </div>
        
        <div class="form-group">
          <label for="storeId">Store ID:</label>
          <input type="text" id="storeId" required>
        </div>
        
        <div class="form-group">
          <label for="storeName">Store Name:</label>
          <input type="text" id="storeName" required>
        </div>
        
        <div class="form-group">
          <label for="city">City:</label>
          <input type="text" id="city" required>
        </div>
        
        <div class="form-group">
          <label for="quantity">Quantity Needed (In Pallets):</label>
          <input type="number" id="quantity" min="1" required>
        </div>
        
        <div class="form-group">
          <label for="dateNeeded">Date Needed:</label>
          <input type="date" id="dateNeeded" required>
        </div>
        
        <div class="form-group">
          <label for="currentStock">Current Stock Remaining (optional):</label>
          <input type="number" id="currentStock" min="0">
        </div>
        
        <div class="form-group">
          <label for="managerName">Manager Name:</label>
          <input type="text" id="managerName" required>
        </div>
        
        <div class="form-group">
          <label for="contactNo">Contact Number:</label>
          <input type="tel" id="contactNo" required>
        </div>
        
        <div class="form-buttons">
          <button type="submit" class="submit-btn">Submit Order</button>
          <button type="button" class="cancel-btn" onclick="closeFormModal()">Cancel</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(formModal);
  
  // Set minimum date to today
  const dateInput = document.getElementById('dateNeeded');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  
  // Apply validation to the contact number field immediately
  const phoneField = document.getElementById('contactNo');
  if (phoneField) {
    // Set input type and attributes
    phoneField.type = 'tel';
    phoneField.placeholder = 'Enter 10 digits (e.g., 1234567890)';
    phoneField.setAttribute('maxlength', '10');
    phoneField.setAttribute('pattern', '[0-9]{10}');
    phoneField.setAttribute('inputmode', 'numeric');
    
    // More aggressive input filtering
    phoneField.addEventListener('input', function(e) {
      let value = e.target.value;
      // Remove ALL non-numeric characters
      value = value.replace(/[^0-9]/g, '');
      // Limit to exactly 10 digits
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      e.target.value = value;
    });
    
    // Prevent any non-numeric input
    phoneField.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, home, end, left, right
      if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
          (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1)) {
        return;
      }
      // Block everything else except numbers
      if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
        return false;
      }
    });
    
    // Handle paste events
    phoneField.addEventListener('paste', function(e) {
      e.preventDefault();
      let paste = (e.clipboardData || window.clipboardData).getData('text');
      let cleanPaste = paste.replace(/[^0-9]/g, '').substring(0, 10);
      e.target.value = cleanPaste;
    });
    
    // Additional validation on blur
    phoneField.addEventListener('blur', function(e) {
      let value = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = value; // Clean the value
      
      if (value.length !== 10 && value.length > 0) {
        e.target.style.borderColor = '#e74c3c';
        e.target.style.backgroundColor = '#fdf2f2';
      } else {
        e.target.style.borderColor = '';
        e.target.style.backgroundColor = '';
      }
    });
    
    // Force clean on focus
    phoneField.addEventListener('focus', function(e) {
      let value = e.target.value.replace(/[^0-9]/g, '');
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      e.target.value = value;
    });
  }
}

/**
 * Validate form fields
 */
function validateForm() {
  const errors = [];
  
  // Validate quantity (numbers only, positive starting from 1)
  const quantity = document.getElementById('quantity').value.trim();
  if (!quantity) {
    errors.push('Quantity is required');
  } else if (!/^\d+$/.test(quantity)) {
    errors.push('Quantity must be a number only');
  } else if (parseInt(quantity) < 1) {
    errors.push('Quantity must be at least 1');
  }
  
  // Validate store name (required, characters only)
  const storeName = document.getElementById('storeName').value.trim();
  if (!storeName) {
    errors.push('Store name is required');
  } else if (!/^[a-zA-Z\s\-\.&]+$/.test(storeName)) {
    errors.push('Store name can only contain letters, spaces, hyphens, periods, and ampersands');
  }
  
  // Validate manager name (required, characters only)
  const managerName = document.getElementById('managerName').value.trim();
  if (!managerName) {
    errors.push('Manager name is required');
  } else if (!/^[a-zA-Z\s\-\.']+$/.test(managerName)) {
    errors.push('Manager name can only contain letters, spaces, hyphens, periods, and apostrophes');
  }
  
  // Validate phone number (exactly 10 digits only)
  const contactNo = document.getElementById('contactNo').value.trim();
  if (!contactNo) {
    errors.push('Contact number is required');
  } else {
    // Clean the value first
    const cleanContactNo = contactNo.replace(/[^0-9]/g, '');
    if (cleanContactNo.length !== 10) {
      errors.push('Contact number must be exactly 10 digits (numbers only)');
    }
  }
  
  // Validate date (required, future date)
  const dateNeeded = document.getElementById('dateNeeded').value;
  if (!dateNeeded) {
    errors.push('Date needed is required');
  } else {
    const selectedDate = new Date(dateNeeded);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.push('Date needed must be today or in the future');
    }
  }
  
  // Validate city (required, characters only)
  const city = document.getElementById('city').value.trim();
  if (!city) {
    errors.push('City is required');
  } else if (!/^[a-zA-Z\s\-\.]+$/.test(city)) {
    errors.push('City can only contain letters, spaces, hyphens, and periods');
  }
  
  return errors;
}

/**
 * Show validation errors
 */
function showValidationErrors(errors) {
  // Remove existing error messages
  const existingErrors = document.querySelectorAll('.validation-error');
  existingErrors.forEach(error => error.remove());
  
  // Create error container
  const errorContainer = document.createElement('div');
  errorContainer.className = 'validation-error';
  errorContainer.innerHTML = `
    <div class="error-header">
      <strong>Please fix the following errors:</strong>
    </div>
    <ul class="error-list">
      ${errors.map(error => `<li>${error}</li>`).join('')}
    </ul>
  `;
  
  // Insert before the form
  const form = document.querySelector('.order-form');
  form.parentNode.insertBefore(errorContainer, form);
  
  // Scroll to errors
  errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Add real-time validation to form fields
 */
function addRealTimeValidation() {
  // Quantity field - numbers only, minimum 1
  const quantityField = document.getElementById('quantity');
  if (quantityField) {
    quantityField.addEventListener('input', function(e) {
      // Remove non-numeric characters
      let value = e.target.value.replace(/[^0-9]/g, '');
      
      // If value is 0 or empty, set to 1
      if (value === '0' || value === '') {
        value = '1';
      }
      
      e.target.value = value;
    });
    
    // Also handle on blur to ensure minimum value
    quantityField.addEventListener('blur', function(e) {
      let value = e.target.value.trim();
      if (value === '' || parseInt(value) < 1) {
        e.target.value = '1';
      }
    });
  }
  
  // Phone number field - exactly 10 digits only (more aggressive approach)
  const phoneField = document.getElementById('contactNo');
  if (phoneField) {
    // Set input type and attributes
    phoneField.type = 'tel';
    phoneField.placeholder = 'Enter 10 digits (e.g., 1234567890)';
    phoneField.setAttribute('maxlength', '10');
    phoneField.setAttribute('pattern', '[0-9]{10}');
    phoneField.setAttribute('inputmode', 'numeric');
    
    // More aggressive input filtering
    phoneField.addEventListener('input', function(e) {
      let value = e.target.value;
      // Remove ALL non-numeric characters
      value = value.replace(/[^0-9]/g, '');
      // Limit to exactly 10 digits
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      e.target.value = value;
    });
    
    // Prevent any non-numeric input
    phoneField.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, home, end, left, right
      if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
          (e.ctrlKey && [65, 67, 86, 88, 90].indexOf(e.keyCode) !== -1)) {
        return;
      }
      // Block everything else except numbers
      if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
        return false;
      }
    });
    
    // Handle paste events
    phoneField.addEventListener('paste', function(e) {
      e.preventDefault();
      let paste = (e.clipboardData || window.clipboardData).getData('text');
      let cleanPaste = paste.replace(/[^0-9]/g, '').substring(0, 10);
      e.target.value = cleanPaste;
    });
    
    // Additional validation on blur
    phoneField.addEventListener('blur', function(e) {
      let value = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = value; // Clean the value
      
      if (value.length !== 10 && value.length > 0) {
        e.target.style.borderColor = '#e74c3c';
        e.target.style.backgroundColor = '#fdf2f2';
      } else {
        e.target.style.borderColor = '';
        e.target.style.backgroundColor = '';
      }
    });
    
    // Force clean on focus
    phoneField.addEventListener('focus', function(e) {
      let value = e.target.value.replace(/[^0-9]/g, '');
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      e.target.value = value;
    });
  }
  
  // Name fields - letters, spaces, and common punctuation only
  const nameFields = ['storeName', 'managerName', 'city'];
  nameFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', function(e) {
        // Allow letters, spaces, hyphens, periods, apostrophes, and ampersands
        e.target.value = e.target.value.replace(/[^a-zA-Z\s\-\.'&]/g, '');
      });
    }
  });
}

/**
 * Submit order form data
 */
function submitOrder(event) {
  event.preventDefault();
  
  // Validate form
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    showValidationErrors(validationErrors);
    return;
  }
  
  const formData = {
    orderNumber: document.getElementById('orderNumber').value,
    storeId: document.getElementById('storeId').value,
    storeName: document.getElementById('storeName').value.trim(),
    city: document.getElementById('city').value.trim(),
    quantity: document.getElementById('quantity').value,
    dateNeeded: document.getElementById('dateNeeded').value,
    currentStock: document.getElementById('currentStock').value || 'Not specified',
    managerName: document.getElementById('managerName').value.trim(),
    contactNo: document.getElementById('contactNo').value,
    timestamp: new Date().toISOString()
  };
  
  // Store order data for PDF generation
  currentOrderData = formData;
  
  // Show loading message
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  // Export to Google Sheets
  exportToGoogleSheets(formData)
    .then(response => {
      // Show success modal with order number
      showSuccessModal(formData.orderNumber);
      closeFormModal();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was an error submitting your order. Please try again.');
    })
    .finally(() => {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

/**
 * Export data to Google Sheets using Google Apps Script
 */
async function exportToGoogleSheets(data) {
  // Google Apps Script web app URL with new deployment ID
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoXu6YTMd0lhvbeLFctxcrIf63hcUvWlTNZuHyKI6QX0wpWMnZ5GFH2HLS3ajTDHI/exec';
  
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    // Since we're using no-cors, we can't read the response
    // But if we get here, the request was sent successfully
    console.log('✅ Data sent to Google Apps Script successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending data:', error);
    throw error;
  }
}

/**
 * Close the form modal
 */
function closeFormModal() {
  const modal = document.querySelector('.form-modal');
  if (modal) {
    modal.remove();
  }
}




// On page load, restore saved cart from localStorage if available and render shop
window.onload = () => {
  const saved = localStorage.getItem('firewoodCart');
  if (saved) {
    const parsed = JSON.parse(saved);
    firewoodOptions.forEach((item, i) => {
      item.quantity = parsed[i]?.quantity || 0;
    });
  }
  renderShop();
  updateCartSummary();
  
  // Add form validation
  addRealTimeValidation();
};

// Save cart to localStorage when page unloads (optional feature)
window.onbeforeunload = () => {
  localStorage.setItem('firewoodCart', JSON.stringify(firewoodOptions));
};

/**
 * Show success modal with order number
 */
function showSuccessModal(orderNumber) {
  const modal = document.getElementById('successModal');
  const orderNumberSpan = document.getElementById('successOrderNumber');
  
  // Set the order number
  orderNumberSpan.textContent = orderNumber;
  
  // Show the modal
  modal.classList.add('show');
  
  // Close modal when clicking outside
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeSuccessModal();
    }
  };
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
      closeSuccessModal();
    }
  });
}

/**
 * Close success modal
 */
function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('show');
}

/**
 * Generate and download order PDF
 */
function downloadOrderPDF() {
  if (!currentOrderData) {
    alert('No order data available for PDF generation.');
    return;
  }

  // Create new PDF document
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Add header with logo placeholder and text
  doc.setFontSize(20);
  doc.setTextColor(74, 63, 53); // Using the primary color
  
  // Add company name
  doc.setFontSize(18);
  doc.text('Honest Abe\'s Firewood', 20, 30);
  
  // Generate and save PDF
  generateAndSavePDF(doc);
}


/**
 * Generate and save the PDF content
 */
function generateAndSavePDF(doc) {
  // Mark as saved to prevent duplicate saves
  doc.hasBeenSaved = true;
  
  // Add order details
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Order Confirmation', 20, 50);
  
  // Add order information
  doc.setFontSize(12);
  let yPosition = 70;
  
  const orderDetails = [
    ['Order Number:', currentOrderData.orderNumber],
    ['Store ID:', currentOrderData.storeId],
    ['Store Name:', currentOrderData.storeName],
    ['City:', currentOrderData.city],
    ['Quantity (Pallets):', currentOrderData.quantity],
    ['Date Needed:', currentOrderData.dateNeeded],
    ['Current Stock:', currentOrderData.currentStock],
    ['Manager Name:', currentOrderData.managerName],
    ['Contact Number:', currentOrderData.contactNo],
    ['Order Date:', new Date(currentOrderData.timestamp).toLocaleDateString()]
  ];
  
  orderDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
    yPosition += 8;
  });
  
  // Add footer
  yPosition += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your order! We will contact you shortly to confirm.', 20, yPosition);
  doc.text('Generated on: ' + new Date().toLocaleString(), 20, yPosition + 10);
  
  // Save the PDF
  const fileName = `Order_${currentOrderData.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  console.log('PDF generated and saved:', fileName);
}
