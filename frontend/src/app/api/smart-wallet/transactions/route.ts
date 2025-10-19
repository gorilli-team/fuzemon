import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const smartWalletAddress = searchParams.get("smartWalletAddress");

    if (!smartWalletAddress) {
      return NextResponse.json(
        { error: "smartWalletAddress is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/smart-wallet/transactions?smartWalletAddress=${smartWalletAddress}`
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch smart wallet transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch smart wallet transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/smart-wallet/transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to track smart wallet transaction:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to track smart wallet transaction",
      },
      { status: 500 }
    );
  }
}
