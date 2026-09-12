const productDetail = document.getElementById("productDetail");
const productId = new URLSearchParams(window.location.search).get("id");
const product = productId ? findProductById(productId) : null;

if (productDetail && product) {
  const collectionName = product.category === "gold"
    ? "Gold Collection"
    : product.category === "platinum"
      ? "Platinum Collection"
      : "Korean Collection";

  document.title = `${product.name} — LumiNoor`;
  productDetail.innerHTML = `
    <div class="product-detail-media">
      <span class="badge-sale">Sale</span>
      <img src="${product.image}" alt="${product.name} colored contact lens">
    </div>
    <div class="product-detail-copy">
      <p class="eyebrow">${collectionName}</p>
      <h1 class="display">${product.name}</h1>
      <p class="product-detail-description">A soft, comfort-fit colored lens made for an effortless everyday look.</p>
      <div class="product-detail-price">
        <span class="was">Rs.${product.price.toLocaleString()}.00 PKR</span>
        <strong>Rs.${product.sale.toLocaleString()}.00 PKR</strong>
      </div>
      <p class="product-detail-note">Cash on delivery available across Pakistan.</p>
      <div class="product-detail-actions">
        <button class="detail-add-btn" type="button" id="detailAddToCart">Add to cart</button>
        <a class="detail-whatsapp-btn" id="detailWhatsApp" href="#" target="_blank" rel="noopener">Ask on WhatsApp</a>
      </div>
    </div>
  `;

  const whatsappLink = document.getElementById("detailWhatsApp");
  if (whatsappLink) whatsappLink.href = buildWhatsAppLink(productMessage(product));

  const addButton = document.getElementById("detailAddToCart");
  if (addButton) {
    addButton.addEventListener("click", () => {
      addToCart(product.id, 1);
      addButton.textContent = "Added to cart";
      showToast(`${product.name} added to cart`);
      setTimeout(() => { addButton.textContent = "Add to cart"; }, 1200);
    });
  }

  const relatedGrid = document.getElementById("relatedProductsGrid");
  if (relatedGrid) {
    const relatedProducts = getRandomProducts(
      PRODUCTS.filter((relatedProduct) => relatedProduct.id !== product.id),
      4
    );
    relatedGrid.innerHTML = relatedProducts.map(cardHTML).join("");
    attachBuyButtonListener(relatedGrid);
  }
} else if (productDetail) {
  productDetail.innerHTML = `
    <div class="product-not-found">
      <h1 class="display">Shade not found</h1>
      <p>Return to the collection and choose another lens.</p>
      <a class="detail-add-btn" href="index.html">Browse lenses</a>
    </div>
  `;
}
