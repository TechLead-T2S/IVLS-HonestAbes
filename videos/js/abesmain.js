// Current discount amount from promo codes
let discount = 0;

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
      <p>Our firewood is sourced from the great forests of the Pacific Northwest, where we carefully select only the finest hardwoods for your burning needs.</p>
      
      <div class="quality-features">
        <div class="feature">
          <h3>🌲 Sustainably Harvested</h3>
          <p>All our firewood comes from responsibly managed forests, ensuring we preserve the natural beauty for future generations.</p>
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
 * Handle Buy Now button click - shows order form
 */
function buyNow() {
  // Create and show the order form modal
  const formModal = document.createElement('div');
  formModal.className = 'form-modal';
  formModal.innerHTML = `
    <div class="form-modal-content">
      <h2>Firewood Order Form</h2>
      <form id="orderForm" onsubmit="submitOrder(event)">
        <div class="form-group">
          <label for="storeId">Store ID:</label>
          <input type="text" id="storeId" required>
        </div>
        
        <div class="form-group">
          <label for="storeName">Store Name:</label>
          <input type="text" id="storeName" required>
        </div>
        
        <div class="form-group">
          <label for="quantity">Quantity Needed (max 10):</label>
          <input type="number" id="quantity" min="1" max="10" required>
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
}

/**
 * Submit the order form
 */
function submitOrder(event) {
  event.preventDefault();
  
  const formData = {
    storeId: document.getElementById('storeId').value,
    storeName: document.getElementById('storeName').value,
    quantity: document.getElementById('quantity').value,
    dateNeeded: document.getElementById('dateNeeded').value,
    currentStock: document.getElementById('currentStock').value || 'Not specified',
    contactNo: document.getElementById('contactNo').value,
    timestamp: new Date().toISOString()
  };
  
  // Show loading message
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  // For now, just show success message (no Google Sheets integration)
  setTimeout(() => {
    const confirmation = `
Order Submitted Successfully!

Store ID: ${formData.storeId}
Store Name: ${formData.storeName}
Quantity: ${formData.quantity} bundles
Date Needed: ${formData.dateNeeded}
Current Stock: ${formData.currentStock}
Contact: ${formData.contactNo}

✅ Order details collected successfully.
We will contact you shortly to confirm your order.
    `;
    
    alert(confirmation);
    closeFormModal();
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 1000);
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
};

// Save cart to localStorage when page unloads (optional feature)
window.onbeforeunload = () => {
  localStorage.setItem('firewoodCart', JSON.stringify(firewoodOptions));
};
