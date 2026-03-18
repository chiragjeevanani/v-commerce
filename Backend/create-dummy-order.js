// Simple script to create a dummy order for testing the delivery countdown
// Run with: node create-dummy-order.js

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTU0MTY4NTlhN2VhNGI3YzEyYTI2YyIsImlhdCI6MTc3MzgxMTk2MSwiZXhwIjoxNzc0NDE2NzYxfQ.ZP3zul8IZ-evxAUeN9vg-DEX2m_ckYvyJUwC46t6S7A";
// Backend is currently running on port 3000 with API mounted at /api
const BASE_URL = "http://localhost:3000/api/v1/orders/place";

async function main() {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            pid: "dummy-pid-countdown",
            name: "Dummy Countdown Test Product",
            quantity: 1,
            price: 999,
            image: "/placeholder-product.png",
            isStoreProduct: true,
          },
        ],
        total: 999,
        shipping: {
          fullName: "Countdown Test User",
          street: "Test Street 123",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          zipCode: "400001",
          phoneNumber: "+91-9999999999",
        },
        paymentMethod: "card",
      }),
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Raw response:");
    console.log(text);
  } catch (err) {
    console.error("Error creating dummy order:", err);
  }
}

main();

