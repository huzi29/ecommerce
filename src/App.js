import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./App.css"; 

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
console.log("====>>>keyyy<<<====",process.env.REACT_APP_STRIPE_PUBLIC_KEY)

const booksData = [
  { id: 1, title: "Book 1", price: 100 },
  { id: 2, title: "Book 2", price: 150 },
  { id: 3, title: "Book 3", price: 200 },
  { id: 4, title: "Book 4", price: 120 },
  { id: 5, title: "Book 5", price: 180 },
  { id: 6, title: "Book 6", price: 220 },
];

const App = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const calculateTotal = () => {
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotalPrice(total);
    };
    calculateTotal();
  }, [cart]);

  const addToCart = (book) => {
    const existingItem = cart.find((item) => item.id === book.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...book, quantity: 1 }]);
    }
  };

  
  const handleCheckout = async () => {
    const stripe = await stripePromise;
  
    if (!stripe) {
      console.error("Stripe failed to initialize");
      return;
    }
  
    if (!cart.length) {
      console.error("Cart is empty");
      return;
    }
  
    const lineItems = cart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.title, 
        },
        unit_amount: item.price * 100, 
      },
      quantity: item.quantity,
    }));
  
    const body = { line_items: lineItems };
  
    const response = await fetch(
      "https://m6k29949-2020.inc1.devtunnels.ms/api/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  
    const session = await response.json();
  
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
  
    if (result.error) {
      console.log(result.error.message);
    }
  };
  

  return (
    <div className="App">
      <h1>Book Store</h1>
      <div className="book-grid">
        {booksData.map((book) => (
          <div key={book.id} className="book-item">
            <h2>{book.title}</h2>
            <p>Price: ${book.price}</p>
            <button onClick={() => addToCart(book)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <h2>Cart</h2>
      <div className="cart">
        {cart.map((item) => (
          <div key={item.id}>
            <h3>{item.title}</h3>
            <p>Price: ${item.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>

      <h2>Total: ${totalPrice}</h2>
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
};

export default App;
