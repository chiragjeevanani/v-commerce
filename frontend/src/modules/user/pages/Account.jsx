import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { Truck, ChevronRight, Package, Eye, Plus, Trash2, MapPin, Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { addressService } from "@/services/address.service";
import { useAuth } from "@/modules/user/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ordersService } from "@/services/orders.service";
import { authService } from "@/services/auth.service";

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, addressesData] = await Promise.all([
          ordersService.getMyOrders(),
          addressService.getAddresses()
        ]);
        setOrders(ordersData);
        setAddresses(addressesData);
      } catch (error) {
        console.error("Error fetching account data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.key]);

  const handleDeleteAddress = async (id) => {
    try {
      const response = await addressService.deleteAddress(id);
      setAddresses(response.data);
      toast({ title: "Success", description: "Address deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await addressService.setDefaultAddress(id);
      setAddresses(response.data);
      toast({ title: "Success", description: "Default address updated" });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = () => {
    authLogout();
    navigate("/");
  };

  return (
    <div className="container py-6 md:py-10 pb-24 md:pb-10 max-w-4xl mx-auto px-4 md:px-6">
      <Button variant="ghost" className="mb-6 -ml-1 hover:bg-transparent hover:text-primary transition-colors group p-0" onClick={() => navigate("/")}>
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your orders, profile & addresses</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="w-full h-auto p-1.5 flex flex-wrap gap-1 md:inline-flex md:flex-nowrap md:w-auto md:rounded-xl bg-muted/60">
          <TabsTrigger value="orders" className="flex-1 md:flex-none min-w-0 px-4 py-2.5 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Package className="h-4 w-4 mr-2 hidden sm:inline" /> Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 md:flex-none min-w-0 px-4 py-2.5 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="address" className="flex-1 md:flex-none min-w-0 px-4 py-2.5 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MapPin className="h-4 w-4 mr-2 hidden sm:inline" /> Address
          </TabsTrigger>
          <TabsTrigger value="logout" className="flex-1 md:flex-none min-w-0 px-4 py-2.5 text-sm rounded-lg data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive">
            Logout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription className="text-sm mt-0.5">View and track your purchases</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto shrink-0" asChild>
                <Link to="/orders" className="flex items-center justify-center">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                </div>
              ) : orders.length > 0 ? (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="group border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 hover:bg-muted/30 transition-all">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold truncate">{order.id}</span>
                          <Badge variant="secondary" className="text-[10px] font-semibold uppercase bg-primary/10 text-primary border-0">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.date ?? order.createdAt).toLocaleDateString()} • {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 text-xs" onClick={() => navigate(`/track-order/${order.id}`)}>
                        <Truck className="mr-1.5 h-3.5 w-3.5" /> Track
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-9 text-xs" onClick={() => navigate(`/orders/${order.id}`)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-14 px-4 border-2 border-dashed border-muted rounded-2xl">
                  <Package className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No orders yet</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">Start shopping to see your orders here</p>
                  <Button variant="default" size="sm" className="mt-4" asChild>
                    <Link to="/shop">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <ProfileTab user={user} />


        <TabsContent value="address" className="mt-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-lg">Saved Addresses</CardTitle>
                <CardDescription className="text-sm mt-0.5">Manage your shipping addresses</CardDescription>
              </div>
              <Button size="sm" className="w-full sm:w-auto gap-2 shrink-0" onClick={() => navigate('/account/address/new')}>
                <Plus className="h-4 w-4" /> Add New
              </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div key={addr._id} className={`group border rounded-2xl p-4 sm:p-5 relative transition-all ${addr.isDefault ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border hover:border-primary/30'}`}>
                    <div className="flex items-start justify-between gap-3 pr-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <MapPin className={`h-4 w-4 shrink-0 ${addr.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-semibold text-xs uppercase tracking-wider">{addr.addressType}</span>
                          {addr.isDefault && <Badge className="text-[10px] font-bold">Default</Badge>}
                        </div>
                        <p className="font-bold text-base sm:text-lg">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zipCode}<br />
                          {addr.country}
                        </p>
                        <p className="text-sm font-medium mt-2">📞 {addr.phoneNumber}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!addr.isDefault && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10" onClick={() => handleSetDefault(addr._id)} aria-label="Set as default">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAddress(addr._id)} aria-label="Delete address">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-14 px-4 border-2 border-dashed border-muted rounded-2xl">
                  <MapPin className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No addresses yet</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">Add an address for faster checkout</p>
                  <Button variant="default" size="sm" className="mt-4 gap-2" onClick={() => navigate('/account/address/new')}>
                    <Plus className="h-4 w-4" /> Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logout" className="mt-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sign Out</CardTitle>
              <CardDescription className="text-sm mt-0.5">You will need to sign in again to access your account</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">Confirm Logout</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};



const ProfileTab = ({ user }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || ""
  });
  const [loading, setLoading] = useState(false);

  // Update form when user data changes (e.g. initial load)
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || ""
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await authService.updateProfile(formData);
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsContent value="profile" className="mt-6">
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription className="text-sm mt-0.5">Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="h-11 max-w-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button onClick={handleUpdate} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default Account;
