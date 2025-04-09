
//  DATA STORAGE SETUP

let inventory = [];

function loadSavedData() {
  const savedData = localStorage.getItem('inventory');
  if (savedData) {
    inventory = JSON.parse(savedData);
  }
}
loadSavedData();

//  SEARCH FUNCTIONALITY
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const filteredItems = inventory.filter(item => {
        return item.name.toLowerCase().includes(searchTerm) ||
               item.details.toLowerCase().includes(searchTerm);
      });
      updateTable(filteredItems);
    });
  }
}

//  DELETE ITEM
function deleteItem(itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory = inventory.filter(item => item.id !== itemId);
    saveToLocalStorage();
    updateTable();
    showMessage('Item deleted successfully!');
  }
}

//  SORT FUNCTIONALITY
function setupSorting() {
  const sortDropdown = document.getElementById('sortOptions');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
      const sortBy = this.value;
      let sortedItems = [...inventory];
      
      if (sortBy === 'quantity') {
        sortedItems.sort((a, b) => a.quantity - b.quantity);
      } else if (sortBy === 'price') {
        sortedItems.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'date') {
        sortedItems.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      updateTable(sortedItems);
    });
  }
}

//  UPDATE TABLE DISPLAY
function updateTable(itemsToShow = inventory) {
  const tableBody = document.getElementById('inventoryList');
  if (!tableBody) return;

  tableBody.innerHTML = ''; 

  itemsToShow.forEach(item => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.details}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${new Date(item.date).toLocaleDateString()}</td>
      <td>${item.type}</td>
      <td><img src="${item.image}" width="50"></td>
      <td>
        <button class="edit-btn" onclick="startEditItem('${item.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

//  EDIT ITEM FUNCTION
function startEditItem(itemId) {
  const itemToEdit = inventory.find(item => item.id === itemId);
  if (itemToEdit) {
    localStorage.setItem('itemToEdit', JSON.stringify(itemToEdit));
    window.location.href = 'addItem.html';
  }
}

//  FORM HANDLING
function setupForm() {
  const form = document.querySelector('form');
  if (!form) return;

  const existingItem = JSON.parse(localStorage.getItem('itemToEdit'));
  
  if (existingItem) {
    form.itemName.value = existingItem.name;
    form.details.value = existingItem.details;
    form.quantity.value = existingItem.quantity;
    form.price.value = existingItem.price;
    form.date.value = existingItem.date;
    form.type.value = existingItem.type;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    const formData = {
      id: existingItem ? existingItem.id : Date.now().toString(),
      name: form.itemName.value,
      details: form.details.value,
      quantity: Number(form.quantity.value),
      price: Number(form.price.value),
      date: form.date.value,
      type: form.type.value,
      image: await handleImageUpload(form.image.files[0])
    };

    if (existingItem) {
      inventory = inventory.map(item => 
        item.id === existingItem.id ? formData : item
      );
      localStorage.removeItem('itemToEdit');
    } else {
      inventory.push(formData);
    }

    saveToLocalStorage();
    showMessage(existingItem ? 'Item updated!' : 'Item added!');
    window.location.href = 'Project.html';
  });
}

//  IMAGE UPLOAD HANDLER
function handleImageUpload(imageFile) {
  return new Promise((resolve) => {
    if (!imageFile) {
      resolve('https://via.placeholder.com/50');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(imageFile);
  });
}

//  HELPER FUNCTIONS
function saveToLocalStorage() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

function showMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = text;
  messageDiv.className = 'user-message';
  document.body.appendChild(messageDiv);
  
  setTimeout(() => messageDiv.remove(), 3000);
}

// INITIAL SETUP
function initializeApp() {
  setupSearch();
  setupSorting();
  setupForm();
  updateTable();
}
window.addEventListener('DOMContentLoaded', initializeApp);