import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { Truck, ChevronRight, Package, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    // Mock logout
    navigate("/");
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="logout" className="text-destructive">Logout</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>View and track your most recent purchases.</CardDescription>
              </div>
              <Button variant="ghost" className="text-primary hover:text-primary/80" asChild>
                <Link to="/orders">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="group border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{order.id}</span>
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => navigate(`/track-order/${order.id}`)}>
                        <Truck className="mr-2 h-4 w-4" /> Track
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 md:flex-none group-hover:text-primary" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  <Button variant="link" asChild>
                    <Link to="/shop">Start shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 234 567 890" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your shipping addresses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 relative">
                <div className="font-semibold mb-1">Home</div>
                <div className="text-sm text-muted-foreground">
                  123 Main Street, Apt 4B<br />
                  New York, NY 10001<br />
                  United States
                </div>
                <Button variant="link" className="absolute top-2 right-2 h-auto p-0">Edit</Button>
              </div>
              <Button variant="outline" className="w-full">Add New Address</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logout">
          <Card>
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>Are you sure you want to sign out?</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive" onClick={handleLogout}>Confirm Logout</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Account;
