class ProductsItems extends HTMLElement {
    constructor() {
      super();
      this.templateElement = document.querySelector('#cart-template');
      this.cartContent = document.querySelector('#cart-content');

      this.url = 'https://products-foniuhqsba-uc.a.run.app/TVs'
    
    }
  
    async load() {
      return fetch(this.url).then(response => response.json())
    }
  
    async connectedCallback() {
      this.products = await this.load()
      this.render()
    }
  
    render() {
      this.products.map(product => {
        if (!this.templateElement) return null;
        const card = this.templateElement.content.cloneNode(true);
  
        const img = card.querySelector('img')


        img.src = product.image
  
        const add2Cart = card.querySelector('.add2cart');
      add2Cart.addEventListener('click', () => {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const existingProduct = products.find(p => p.id === product.id);
        if (existingProduct) {
          existingProduct.quantity++; // Incrementa la cantidad si el producto ya existe
        } else {
          product.quantity = 1; // Si es un producto nuevo, establecer cantidad en 1
          products.push(product);
        }

        localStorage.setItem('products', JSON.stringify(products));

        const customCart = document.querySelector('custom-cart');
        customCart.render();
        })
  
        this.appendChild(card)
      })
    }
  }
  
  class CustomCart extends HTMLElement {
    constructor() {
      super();
      this.templateElement = document.querySelector('#product-item');
      this.url = 'https://products-foniuhqsba-uc.a.run.app/TVs'

    }
  
    load() {
      return JSON.parse(localStorage.getItem('products') || '[]')

    }
    save(products) {
        localStorage.setItem('products', JSON.stringify(products));
      }
    
  
    connectedCallback() {
      this.render()
    }
    updateCartCounter() {
        const cartCounter = document.querySelector('#cart-counter');
        const totalItems = this.products.reduce((sum, product) => sum + (product.quantity || 1), 0);
        if (cartCounter) {
          cartCounter.textContent = totalItems;
        }
      }
    
  
    render() {
      this.products = this.load()
      if (this.cartContent) {
        // Limpia el contenido actual de #cart-content
        this.cartContent.innerHTML = '';
      }
  
      let totalPrice = 0;    
      this.products.map(product => {
        if (!this.templateElement) return null;
        const cart = this.templateElement.content.cloneNode(true);
  
        const img = cart.querySelector('img');
        img.src = product.image;
  
        const title = cart.querySelector('.title');
        title.textContent = product.title;
  
        const numericPriceElement = cart.querySelector('.numeric-price');
        numericPriceElement.textContent = product.price.replace('€', '').trim();
  
        const quantityElement = cart.querySelector('.quantity');
        quantityElement.textContent = product.quantity || 1; // Si no existe cantidad, poner 1
        
        const numericPrice = parseFloat(product.price.replace('€', '').trim());
        totalPrice += numericPrice * (product.quantity || 1);
  
        const decreaseButton = cart.querySelector('.decrease-quantity');
        const increaseButton = cart.querySelector('.increase-quantity');
        const removeButton = cart.querySelector('.remove-button');
  
        
        // Disminuir cantidad
        decreaseButton.addEventListener('click', () => {
          if (product.quantity > 1) {
            product.quantity--;
            quantityElement.textContent = product.quantity;
            this.save(this.products);
            this.render();
          }
        });
  
        // Aumentar cantidad
        increaseButton.addEventListener('click', () => {
          product.quantity++;
          quantityElement.textContent = product.quantity;
          this.save(this.products);
          this.render();
        });
  
        // Eliminar producto
        removeButton.addEventListener('click', () => {
          this.products = this.products.filter(p => p.id !== product.id); // Filtra el producto por id
          this.save(this.products);
          this.render(); // Vuelve a renderizar el carrito
        });
  
        const featuresContainer = cart.querySelector('.features');
        featuresContainer.innerHTML = ''; // Limpia cualquier contenido previo
        product.features.map(feature => {
          const featureItem = document.createElement('p');
          featureItem.innerHTML = `${feature.type.charAt(0).toUpperCase() + feature.type.slice(1)}: ${feature.value}`; // Muestra el tipo y valor
          featuresContainer.appendChild(featureItem); // Añade la característica al contenedor
        });
        
        if (this.cartContent) {
          this.cartContent.appendChild(cart); // Añade el producto al contenedor de productos
        }
      });
      const totalPriceElement = document.querySelector('#total-price'); 
      if (totalPriceElement) {
        totalPriceElement.innerHTML = ` Total: <strong>${totalPrice.toFixed(2)} €</strong>`;
      }
      this.updateCartCounter();
   // Código para renderizar el carrito Arriba
  //DIALOG para confirmar compra
      const cartFooter = document.querySelector('.cart-footer');
      const finalizeButton = cartFooter.querySelector('button');
      const dialog = document.querySelector('#confirmation-dialog');
      const closeDialogButton = document.querySelector('#close-dialog');
      const confirmPurchaseButton = document.querySelector('#confirm-purchase');
      const confirmationMessage = document.querySelector('#confirmation-message');
      const emptyCartMessage = document.querySelector('#empty-cart-message'); // Mensaje de carrito vacío
  // Verificar si el carrito está vacío
      if (this.products.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        finalizeButton.textContent = 'Añadir Productos';
        finalizeButton.onclick = () => {
          // Redirigir al usuario a la sección de productos
          window.location.href = "#products"; //  sección de productos
        };
      } else {
        emptyCartMessage.classList.add('hidden'); // Ocultar mensaje si hay productos en el carrito
        finalizeButton.textContent = 'Finalizar compra';
        finalizeButton.onclick = () => {
          // Mostrar el diálogo cuando se hace clic en "Finalizar compra"
          confirmationMessage.textContent = 'Confirma la compra.';
          dialog.showModal();
        };
      }
  
      // Cerrar el diálogo al hacer clic en el "x"
      closeDialogButton.addEventListener('click', () => {
        dialog.close();
      });
  
      // Confirmar la compra
      confirmPurchaseButton.addEventListener('click', () => {
        confirmationMessage.textContent = '¡Compra realizada con éxito! ¡Gracias por tu compra!';
        this.clearCart();
        
        // Cerrar el diálogo después de 3 segundos
        setTimeout(() => {
          dialog.close();
        }, 3000); // Retraso de 3 segundos para que el usuario vea el mensaje
      });
    }
  
    clearCart() {
      // Vaciar el carrito
      localStorage.removeItem('products');
      this.products = []; // Limpiar la lista de productos también en la instancia
      this.render(); // Volver a renderizar el carrito
    }
  }

  customElements.define('custom-cart', CustomCart);
  customElements.define('products-items', ProductsItems);