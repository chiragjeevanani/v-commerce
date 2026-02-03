import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { useAuth } from "@/modules/user/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddressForm from "../components/AddressForm";
import { addressService } from "@/services/address.service";
import { toast } from "@/hooks/use-toast";


const AddAddress = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.fullName?.split(' ')[0] || "",
        lastName: user?.fullName?.split(' ')[1] || "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phoneNumber: user?.phoneNumber || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (data) => {
        // data param is actually formData from state if we pass it, or we rely on state
        // AddressForm calls onSubmit(formData) so 'data' here is correct.
        setLoading(true);
        try {
            await addressService.addAddress({
                fullName: `${data.firstName} ${data.lastName}`,
                street: data.address,
                city: data.city,
                state: data.state,
                country: "India",
                zipCode: data.zip,
                phoneNumber: data.phoneNumber,
                addressType: "Home"
            });
            toast({ title: "Success", description: "Address added successfully" });
            navigate("/account?tab=address");
        } catch (error) {
            toast({ title: "Error", description: error.message || "Failed to add address", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 max-w-2xl">
            <Button variant="ghost" className="mb-6 hover:bg-transparent hover:text-primary transition-colors group p-0" onClick={() => navigate("/account")}>
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Account
            </Button>

            <Card className="border-none shadow-lg">
                <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl">Add New Address</CardTitle>
                    <CardDescription>Enter your delivery details below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddressForm
                        formData={formData}
                        handleChange={handleChange}
                        onSubmit={handleSubmit}
                        isLoading={loading}
                        onCancel={() => navigate("/account")}
                        showSubmitButton={true}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default AddAddress;
