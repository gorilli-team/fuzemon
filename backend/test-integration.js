#!/usr/bin/env node

const API_BASE_URL = "http://localhost:5001";

async function testBackendIntegration() {
  console.log("🧪 Testing Fuzemon Backend Integration...\n");

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing health check...");
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.message);
    console.log("");

    // Test 2: Create a test order
    console.log("2️⃣ Testing order creation...");
    const testOrder = {
      swapState: {
        fromChain: 1,
        toChain: 137,
        fromToken: {
          symbol: "ETH",
          name: "Ethereum",
          address: "0x0000000000000000000000000000000000000000",
          decimals: 18,
        },
        toToken: {
          symbol: "USDC",
          name: "USD Coin",
          address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          decimals: 6,
        },
        fromAmount: "1000000000000000000",
        toAmount: "2000000000",
        userAddress: "0x1234567890123456789012345678901234567890",
      },
      fromToken: {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
      },
      toToken: {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
      },
      status: "CREATED",
      message: "Test order created via integration test",
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testOrder),
    });

    const createData = await createResponse.json();
    if (createData.success) {
      console.log("✅ Order created successfully:", createData.data.id);
      const orderId = createData.data.id;
      console.log("");

      // Test 3: Get all orders
      console.log("3️⃣ Testing get all orders...");
      const getOrdersResponse = await fetch(`${API_BASE_URL}/api/orders`);
      const getOrdersData = await getOrdersResponse.json();
      console.log(`✅ Retrieved ${getOrdersData.data.length} orders`);
      console.log("");

      // Test 4: Get specific order
      console.log("4️⃣ Testing get order by ID...");
      const getOrderResponse = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}`
      );
      const getOrderData = await getOrderResponse.json();
      console.log("✅ Retrieved order:", getOrderData.data.id);
      console.log("");

      // Test 5: Update order status
      console.log("5️⃣ Testing update order status...");
      const updateResponse = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "COMPLETED",
            message: "Order completed via integration test",
          }),
        }
      );

      const updateData = await updateResponse.json();
      if (updateData.success) {
        console.log("✅ Order status updated to:", updateData.data.status);
        console.log("");

        // Test 6: Get orders by user
        console.log("6️⃣ Testing get orders by user...");
        const userOrdersResponse = await fetch(
          `${API_BASE_URL}/api/orders/user/0x1234567890123456789012345678901234567890`
        );
        const userOrdersData = await userOrdersResponse.json();
        console.log(
          `✅ Retrieved ${userOrdersData.data.length} orders for user`
        );
        console.log("");

        // Test 7: Clean up - delete test order
        console.log("7️⃣ Testing delete order...");
        const deleteResponse = await fetch(
          `${API_BASE_URL}/api/orders/${orderId}`,
          {
            method: "DELETE",
          }
        );

        const deleteData = await deleteResponse.json();
        if (deleteData.success) {
          console.log("✅ Order deleted successfully");
        } else {
          console.log("❌ Failed to delete order");
        }
      } else {
        console.log("❌ Failed to update order status");
      }
    } else {
      console.log("❌ Failed to create order:", createData.error);
    }

    console.log("\n🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n💡 Make sure the backend is running on port 5001:");
    console.log("   cd backend && yarn dev");
  }
}

testBackendIntegration();
