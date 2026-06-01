import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return new Response("Unauthorized", { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    // Verify ownership: invoice must belong to user, or user is admin
    if (invoice.userId !== session.userId && session.user?.role !== "ADMIN") {
      // Wait, we need to check if user role is ADMIN. We query user:
      const requestingUser = await prisma.user.findUnique({ where: { id: session.userId } });
      if (requestingUser?.role !== "ADMIN") {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #333;
            background: #fff;
            padding: 40px;
            margin: 0;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            padding: 40px;
            border-radius: 8px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #f9f9f9;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-details h2 {
            margin: 0 0 10px 0;
            color: #000;
            font-weight: 700;
        }
        .invoice-details {
            text-align: right;
        }
        .invoice-details h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            color: #555;
        }
        .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }
        .billing-to h3, .billing-from h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            text-transform: uppercase;
            color: #999;
        }
        .billing-to p, .billing-from p {
            margin: 0 0 5px 0;
            font-size: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        th {
            background: #f9f9f9;
            text-align: left;
            padding: 12px;
            font-size: 14px;
            text-transform: uppercase;
            color: #666;
            border-bottom: 1px solid #eee;
        }
        td {
            padding: 15px 12px;
            font-size: 15px;
            border-bottom: 1px solid #eee;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 15px;
        }
        .totals-row.grand-total {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 18px;
            color: #000;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            color: #999;
            font-size: 13px;
        }
        .print-btn {
            background: #000;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            margin-bottom: 20px;
            display: inline-flex;
            align-items: center;
        }
        @media print {
            .print-btn {
                display: none;
            }
            body {
                padding: 0;
            }
            .invoice-box {
                border: none;
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div style="max-width: 800px; margin: auto; text-align: right;">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
    </div>
    <div class="invoice-box">
        <div class="header">
            <div class="company-details">
                <h2>ShieldAI Inc.</h2>
                <p>100 Pine Street, Suite 1200<br>San Francisco, CA 94111<br>billing@shieldai.com</p>
            </div>
            <div class="invoice-details">
                <h1>INVOICE</h1>
                <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}<br>
                <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}<br>
                <strong>Status:</strong> ${invoice.status}</p>
            </div>
        </div>

        <div class="details-grid">
            <div class="billing-to">
                <h3>Billed To</h3>
                <p><strong>${invoice.user.name || "Customer"}</strong></p>
                <p>${invoice.user.email}</p>
            </div>
            <div class="billing-from">
                <h3>Payment Details</h3>
                <p><strong>Payment Status:</strong> Fully Paid</p>
                <p><strong>Paid Date:</strong> ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "N/A"}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>ShieldAI Subscription Tiers Protection - Plan Change Charge</td>
                    <td class="text-right">$${invoice.amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>$${invoice.amount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>Tax (0%):</span>
                <span>$0.00</span>
            </div>
            <div class="totals-row grand-total">
                <span>Total:</span>
                <span>$${invoice.amount.toFixed(2)} ${invoice.currency}</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing ShieldAI for digital footprint protection.</p>
        </div>
    </div>
</body>
</html>
    `;

    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Invoice generation error", err);
    return new Response("Internal server error", { status: 500 });
  }
}
