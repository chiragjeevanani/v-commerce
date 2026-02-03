import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { Truck, ChevronRight, Package, Eye, Plus, Trash2, MapPin, Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { addressService } from "@/services/address.service";
import { useAuth } from "@/modules/user/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ordersService } from "@/services/orders.service";
import { authService } from "@/services/auth.service";

const Account = () => {
  const navigate = useNavigate();
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
  }, []);

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
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 hover:bg-transparent hover:text-primary transition-colors group p-0" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
      </Button>
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

        <ProfileTab user={user} />


        <TabsContent value="address">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>Manage your shipping addresses.</CardDescription>
              </div>
              <Button size="sm" className="gap-2" onClick={() => navigate('/account/address/new')}>
                <Plus className="h-4 w-4" /> Add New
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div key={addr._id} className={`border rounded-xl p-5 relative group transition-all ${addr.isDefault ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className={`h-4 w-4 ${addr.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-bold text-sm uppercase tracking-wider">{addr.addressType}</span>
                      {addr.isDefault && <Badge className="text-[10px] font-black uppercase">Default</Badge>}
                    </div>
                    <div className="font-black text-lg mb-1">{addr.fullName}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {addr.street}<br />
                      {addr.city}, {addr.state} {addr.zipCode}<br />
                      {addr.country}
                    </div>
                    <div className="text-sm font-bold mt-2 text-foreground">📞 {addr.phoneNumber}</div>

                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!addr.isDefault && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleSetDefault(addr._id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAddress(addr._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-3xl">
                  <MapPin className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">No addresses saved yet.</p>
                </div>
              )}
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
    <TabsContent value="profile">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default Account;
