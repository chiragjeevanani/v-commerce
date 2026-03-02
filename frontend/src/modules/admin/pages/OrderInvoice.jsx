import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Printer } from "lucide-react";
import { ordersService } from "../services/orders.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const OrderInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await ordersService.getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error("Failed to load order for invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load order invoice.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">Invoice not available.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const shippingAddressDisplay =
    typeof order.shippingAddress === "string"
      ? order.shippingAddress
      : order.shippingAddress
      ? `${order.shippingAddress.fullName || ""}, ${order.shippingAddress.street || ""}, ${
          order.shippingAddress.city || ""
        }, ${order.shippingAddress.state || ""}, ${order.shippingAddress.country || ""} - ${
          order.shippingAddress.zipCode || ""
        }`
      : "N/A";

  const invoiceNumber = order.id?.slice(-8).toUpperCase() || id;
  const createdAt = new Date(order.createdAt || order.date);

  const items = order.items || [];
  const subtotal =
    order.total || order.totalAmount || items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Order</span>
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto bg-white text-black shadow-2xl print:shadow-none">
        <CardContent className="p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                V-Commerce
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Modern online shopping experience
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Invoice
              </p>
              <p className="text-lg font-black text-gray-900">#{invoiceNumber}</p>
              <p className="text-xs text-gray-600 mt-1">
                Date: {createdAt.toLocaleDateString()} <br />
                Time: {createdAt.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Addresses */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">
                Billed To
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {order.user?.name || order.customer?.name || "Guest"}
              </p>
              <p className="text-xs text-gray-700 mt-1 whitespace-pre-line">
                {shippingAddressDisplay}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">
                Payment
              </p>
              <p className="text-sm font-medium text-gray-900">
                Method: {order.paymentMethod || "Online"}
              </p>
              {order.isPartialPayment && (
                <p className="text-xs text-gray-700 mt-1">
                  Paid now: ₹{(order.amountPaid ?? 500).toFixed(2)} • Remaining: ₹
                  {(order.remainingAmount ?? 0).toFixed(2)} (
                  {order.remainingPaymentStatus === "paid" ? "Fully paid" : "Pending"})
                </p>
              )}
              {!order.isPartialPayment && (
                <p className="text-xs text-green-700 mt-1 font-semibold">
                  Status: Paid
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <table className="w-full text-xs md:text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-semibold text-gray-600">
                    Item
                  </th>
                  <th className="py-2 text-left font-semibold text-gray-600">
                    SKU
                  </th>
                  <th className="py-2 text-right font-semibold text-gray-600">
                    Price
                  </th>
                  <th className="py-2 text-center font-semibold text-gray-600">
                    Qty
                  </th>
                  <th className="py-2 text-right font-semibold text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2 pr-2">
                      <p className="font-medium text-gray-900">
                        {item.name || item.title}
                      </p>
                    </td>
                    <td className="py-2 pr-2 text-gray-600">
                      {item.sku || item.pid || "—"}
                    </td>
                    <td className="py-2 text-right text-gray-700">
                      ₹{(item.price || 0).toFixed(2)}
                    </td>
                    <td className="py-2 text-center text-gray-700">
                      {item.quantity || 1}
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="text-xs text-gray-600 max-w-sm">
              <p className="font-semibold mb-1">Notes</p>
              <p>
                Thank you for shopping with V-Commerce. This is a system
                generated invoice and does not require a physical signature.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-1 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>₹0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base md:text-lg text-gray-900">
                <span>Total</span>
                <span>₹{(order.total || order.totalAmount || subtotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderInvoice;

