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
        <a class="detail-whatsapp-btn" id="detailWhatsApp" href="#" target="_blank" rel="noopener">
          <svg class="detail-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3z" />
            <path d="M12 2a10 10 0 1 0 8.6 15L22 22l-5.2-1.4A10 10 0 0 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
          </svg>
          <span>Ask on WhatsApp</span>
        </a>
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
