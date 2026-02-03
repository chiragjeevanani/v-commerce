import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AddressForm = ({ formData, handleChange, onSubmit, onCancel, isLoading, submitLabel = "Save Address", showSubmitButton = true }) => {

    // We expect formData and handleChange to be provided by parent
    // If not provided, we could fall back to local state, but for this refactor we assume controlled.

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-bold uppercase text-[10px] tracking-widest opacity-70">First Name</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                        placeholder="John"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Last Name</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                        placeholder="Doe"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Phone Number</Label>
                <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                    placeholder="+91 98765-43210"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address" className="font-bold uppercase text-[10px] tracking-widest opacity-70">Street Address</Label>
                <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                    placeholder="123 Main St"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city" className="font-bold uppercase text-[10px] tracking-widest opacity-70">City</Label>
                    <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                        placeholder="Mumbai"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zip" className="font-bold uppercase text-[10px] tracking-widest opacity-70">ZIP Code</Label>
                    <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                        placeholder="400001"
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="state" className="font-bold uppercase text-[10px] tracking-widest opacity-70">State</Label>
                <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="rounded-xl bg-muted border-none p-6 focus-visible:ring-primary/20"
                    placeholder="Maharashtra"
                    required
                />
            </div>

            {showSubmitButton && (
                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading} className="font-bold">
                        {isLoading ? "Saving..." : submitLabel}
                    </Button>
                </div>
            )}
        </form>
    );
};

export default AddressForm;
