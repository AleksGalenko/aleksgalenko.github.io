document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadSelectedProducts();
  loadPOSData();
  // updatePOSList();
  updatePOSIndicator();
});

let posData = [];
let posIndex = 0;

function loadProducts() {
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      const productSelection = document.getElementById("product-selection");
      data.forEach((product) => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `
                    <input type="checkbox" id="${product.id}" name="${product.name}">
                    <span class="checkmark"></span>
                    <label for="${product.id}">${product.name}</label>
                `;
        productSelection.appendChild(productItem);
      });
    });
}

function openProductModal() {
  document.getElementById("product-modal").style.display = "block";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

function saveProductSelection() {
  const selectedProducts = [];
  document
    .querySelectorAll('#product-selection input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      selectedProducts.push(checkbox.id); 
    });
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  loadSelectedProducts();
  closeProductModal();
}

function loadSelectedProducts() {
  const selectedProducts =
    JSON.parse(localStorage.getItem("selectedProducts")) || [];
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  if (selectedProducts.length > 0) {
    fetch("products.json")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((product) => {
          if (selectedProducts.includes(product.id)) {
            const productRow = document.createElement("div");
            productRow.className = "product-row";
            productRow.innerHTML = `
                            <table class="product-table">
                                <tr>
                                    <td rowspan="2" class="product-image">
                                        <img src="${product.image}" alt="Product Image" width="60">
                                    </td>
                                    <td class="product-name">${product.name}</td>
                                </tr>
                                <tr">
                                    <td class="input-fields">
                                        <input type="tel" class="quantityInput" data-index="${product.id}" maxlength="5" placeholder="-">
                                        <button type="button" class="addButton" data-index="${product.id}">Add</button>
                                        <input type="text" class="totalInput" data-index="${product.id}" readonly value="0" onclick="confirmClearData('${product.id}')">
                                    </td>
                                </tr>
                            </table>
                        `;
            productList.appendChild(productRow);
          }
        });
        renderPOS();
      });
  }
}

function renderPOS() {
  const selectedProducts =
    JSON.parse(localStorage.getItem("selectedProducts")) || [];
  selectedProducts.forEach((productId) => {
    const totalInput = document.querySelector(
      `.totalInput[data-index="${productId}"]`
    );
    totalInput.value = posData[posIndex][productId]?.quantity || 0;
  });
  updatePOSIndicator();
}

function savePOSData() {
  localStorage.setItem("posData", JSON.stringify(posData));
}

function loadPOSData() {
  posData = JSON.parse(localStorage.getItem("posData")) || [];
  if (posData.length === 0) posData.push({});
}

function addPOS() {
  posData.push({});
  posIndex = posData.length - 1;
  savePOSData();
  renderPOS();
  // updatePOSList();
  updatePOSIndicator();
}

// function updatePOSList() {
//   const posList = document.getElementById("posList");
//   posList.innerHTML = "";
//   posData.forEach((_, index) => {
//     const posButton = document.createElement("button");
//     posButton.textContent = index + 1;
//     posButton.addEventListener("click", () => {
//       posIndex = index;
//       renderPOS();
//       updatePOSIndicator();
//     });
//     posList.appendChild(posButton);
//   });
// }

document.getElementById("product-list").addEventListener("click", (event) => {
  if (event.target.classList.contains("addButton")) {
    const skuId = event.target.dataset.index;
    const quantityInput = document.querySelector(
      `.quantityInput[data-index="${skuId}"]`
    );
    const quantity = parseInt(quantityInput.value, 10);

    if (!isNaN(quantity) && quantity > 0) {
      if (!posData[posIndex][skuId]) posData[posIndex][skuId] = { quantity: 0 };
      posData[posIndex][skuId].quantity += quantity;
      savePOSData();
      renderPOS();
      quantityInput.value = "";
    }
  }
});

function confirmResetCurrentPOS() {
  document.getElementById("reset-current-pos-modal").style.display = "block";
}

function closeResetCurrentPOSModal() {
  document.getElementById("reset-current-pos-modal").style.display = "none";
}

function resetCurrentPOS() {
    
    if (posData[(posIndex)]) {
        Object.keys(posData[posIndex]).forEach(skuId => {
            posData[posIndex][skuId] = 0;
        });
        localStorage.setItem('posData', JSON.stringify(posData));
    }
    closeResetCurrentPOSModal();
    loadSelectedProducts();

    console.log(posIndex);
    console.log(posData);
}

function resetAll() {
  posData = [{}];
  posIndex = 0;
  localStorage.removeItem("posData");
  localStorage.removeItem("selectedProducts");
  document.getElementById("product-list").innerHTML = "";
  location.reload();
  // updatePOSList();
  loadSelectedProducts();
}

function confirmClearAllData(productId) {
  document.getElementById("clear-all-modal").style.display = "block";
  document.getElementById("confirm-clear-all").onclick = function () {
    resetAll();
  };
}

function closeClearAllModal() {
  document.getElementById("clear-all-modal").style.display = "none";
}

function confirmClearData(productId) {
  document.getElementById("clear-modal").style.display = "block";
  document.getElementById("confirm-clear").onclick = function () {
    clearData(productId);
  };
}

function clearData(productId) {
  if (posData[posIndex][productId]) {
    posData[posIndex][productId].quantity = 0;
    savePOSData();
    renderPOS();
  }
  closeClearModal();
}

function closeClearModal() {
  document.getElementById("clear-modal").style.display = "none";
}

function showTotal() {
  document.getElementById("total-modal").style.display = "block";
  const totalCounts = document.getElementById("total-counts");
  totalCounts.innerHTML = "";
  const selectedProducts =
    JSON.parse(localStorage.getItem("selectedProducts")) || [];
  selectedProducts.forEach((productId) => {
    let total = 0;
    posData.forEach((pos) => {
      if (pos[productId]) total += pos[productId].quantity;
    });
    const productTotalRow = document.createElement("div");
    productTotalRow.className = "product-total-row";
    productTotalRow.innerHTML = `
            <span style="color: #555">${productId}</span>
            <span> - </span>
            <span style="font-weight: bold">${total}</span>
            <hr>
        `;
    totalCounts.appendChild(productTotalRow);
  });
}

function closeTotalModal() {
  document.getElementById("total-modal").style.display = "none";
}

function switchToNextPOS() {
  if (posIndex < posData.length - 1) {
    posIndex++;
  } else {
    addPOS();
    return; // Exit the function early, as addPOS will handle the rest
  }
  renderPOS();
  updatePOSIndicator();
}

function switchToPreviousPOS() {
  if (posIndex > 0) {
    posIndex--;
    renderPOS();
    updatePOSIndicator();
  }
}

function updatePOSIndicator() {
  console.log("Current POS Index:", posIndex);
  document.getElementById("pos-indicator").textContent = `POS ${posIndex + 1}`;
  document.getElementById("total-pos-indicator").textContent = `Total ${posData.length} POS`;
}
