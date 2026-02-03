import React, { useState, useEffect } from 'react';
import {
    Store,
    Settings as SettingsIcon,
    User,
    Shield,
    Key,
    Save,
    Image as ImageIcon,
    CheckCircle2,
    RefreshCw,
    Globe,
    Lock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { settingsService } from '../services/settings.service';

const Settings = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("account"); // Default to Account
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // State for Account Tab
    const [storeSettings, setStoreSettings] = useState({
        storeName: "",
        storeUrl: "",
        storeDescription: "",
        storeLogo: "" // Just a string/URL for now
    });
    const [adminProfile, setAdminProfile] = useState({
        fullName: "",
        email: "",
        avatar: ""
    });

    // References for file inputs
    const storeLogoInputRef = React.useRef(null);
    const avatarInputRef = React.useRef(null);

    // State for Security Tab
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Fetch Initial Data
    useEffect(() => {
        const loadSettings = async () => {
            try {
                // 1. Load Admin Profile
                const user = authService.getCurrentUser();
                if (user) {
                    setAdminProfile({
                        fullName: user.fullName || "",
                        email: user.email || "",
                        avatar: user.avatar || ""
                    });
                }

                // 2. Load Store Settings
                const storeData = await settingsService.getStoreSettings();
                if (storeData) {
                    setStoreSettings({
                        storeName: storeData.storeName || "",
                        storeUrl: storeData.storeUrl || "",
                        storeDescription: storeData.storeDescription || "",
                        storeLogo: storeData.storeLogo || ""
                    });
                } else {
                    // Default fallback if no settings exist yet
                    setStoreSettings({
                        storeName: "V-Commerce",
                        storeUrl: "vcommerce.com",
                        storeDescription: "Modern Shopping Experience for Lifestyle & Electronics."
                    });
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load settings data.",
                    variant: "destructive"
                });
            }
        };

        loadSettings();
    }, []);

    const handleTestConnection = async () => {
        setIsTestLoading(true);
        setTimeout(() => {
            setIsTestLoading(false);
            toast({
                title: "Connection Successful",
                description: "Supplier API is responding correctly.",
            });
        }, 1500);
    };

    // --- Handlers ---

    const handleUpdateStore = async () => {
        setIsLoading(true);
        try {
            await settingsService.updateStoreSettings(storeSettings);
            toast({
                title: "Store Settings Updated",
                description: "Your store details have been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update store settings.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        try {
            await authService.updateProfile(adminProfile);
            toast({
                title: "Profile Updated",
                description: "Your admin details have been saved.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "New passwords do not match.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            await authService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
            });
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to change password.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Upload Handlers ---

    const handleStoreLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const res = await settingsService.uploadStoreLogo(file);
            setStoreSettings(prev => ({ ...prev, storeLogo: res.data.storeLogo }));
            toast({
                title: "Logo Uploaded",
                description: "Store logo updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: "Could not upload logo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const res = await authService.uploadAvatar(file);
            setAdminProfile(prev => ({ ...prev, avatar: res.data.avatar }));
            toast({
                title: "Avatar Uploaded",
                description: "Profile picture updated successfully.",
            });
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: "Could not upload avatar.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Configure your store, API connections, and account preferences.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 border">
                    <TabsTrigger value="account" className="gap-2"><User className="h-4 w-4" /> Account Settings</TabsTrigger>
                    <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
                    <TabsTrigger value="api" className="gap-2"><Key className="h-4 w-4" /> API & Tools</TabsTrigger>
                </TabsList>

                {/* 1. Account Settings (Merged Store + Profile) */}
                <TabsContent value="account">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Store Section */}
                        <div className="space-y-1">
                            <h3 className="font-bold">Store Profile</h3>
                            <p className="text-sm text-muted-foreground">General information about your ecommerce platform.</p>
                        </div>
                        <Card className="md:col-span-2">
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="store-name">Store Name</Label>
                                        <Input
                                            id="store-name"
                                            value={storeSettings.storeName}
                                            onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="store-url">Store URL</Label>
                                        <div className="flex">
                                            <span className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-xs font-medium">https://</span>
                                            <Input
                                                id="store-url"
                                                className="rounded-l-none"
                                                value={storeSettings.storeUrl}
                                                onChange={(e) => setStoreSettings({ ...storeSettings, storeUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="store-desc">Store Description</Label>
                                        <Input
                                            id="store-desc"
                                            value={storeSettings.storeDescription}
                                            onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Store Logo</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                                            {storeSettings.storeLogo ? (
                                                <img src={storeSettings.storeLogo} alt="Store Logo" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-muted-foreground opacity-20" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                ref={storeLogoInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleStoreLogoChange}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => storeLogoInputRef.current?.click()}
                                                disabled={isLoading}
                                            >
                                                Change Logo
                                            </Button>
                                            <p className="text-[10px] text-muted-foreground">Recommended size: 512x512px (PNG, SVG)</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/20 justify-end py-3">
                                <Button className="gap-2" onClick={handleUpdateStore} disabled={isLoading}>
                                    <Save className="h-4 w-4" /> Save Store Settings
                                </Button>
                            </CardFooter>
                        </Card>

                        <Separator className="col-span-1 md:col-span-3 my-4" />

                        {/* Admin Profile Section */}
                        <div className="space-y-1">
                            <h3 className="font-bold">Administrator Profile</h3>
                            <p className="text-sm text-muted-foreground">Update your personal account details.</p>
                        </div>
                        <Card className="md:col-span-2">
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-center gap-6 pb-4">
                                    <div className="h-24 w-24 rounded-full border-4 border-muted overflow-hidden">
                                        <img src={adminProfile.avatar || "https://github.com/shadcn.png"} className="h-full w-full object-cover" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={isLoading}
                                    >
                                        Change Avatar
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={adminProfile.fullName}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            value={adminProfile.email}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t py-3 justify-end gap-2">
                                <Button onClick={handleUpdateProfile} disabled={isLoading}>Update Profile</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* 2. Security Tab */}
                <TabsContent value="security">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <h3 className="font-bold">Security & Login</h3>
                            <p className="text-sm text-muted-foreground">Protect your administrative account.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Lock className="h-4 w-4" /> Change Password
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm New Password</Label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={handleUpdatePassword} disabled={isLoading}>
                                        Update Password
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-red-100 dark:border-red-900/30">
                                <CardHeader>
                                    <CardTitle className="text-red-600 text-lg">Danger Zone</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between border-t pt-4 border-red-50 dark:border-red-900/10">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold">Resign as Admin</p>
                                            <p className="text-xs text-muted-foreground">This will revoke all your management access.</p>
                                        </div>
                                        <Button variant="destructive" size="sm">Deactivate Account</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* 3. API Settings (Unchanged Logic, just moved) */}
                <TabsContent value="api">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <h3 className="font-bold">Supplier API Connections</h3>
                            <p className="text-sm text-muted-foreground">Manage keys for your dropshipping network integrations.</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Globe className="h-5 w-5 text-indigo-700" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Global Dropship Network</CardTitle>
                                            <CardDescription>Main marketplace API Integration</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500">Connected</Badge>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="api-key">Supplier API Key</Label>
                                        <div className="flex gap-2">
                                            <Input id="api-key" type="password" value="••••••••••••••••••••••••••••" readOnly className="font-mono" />
                                            <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg text-xs">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span>Last sync: Oct 23, 2023 - 10:45 AM</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-8 text-primary font-bold"
                                            onClick={handleTestConnection}
                                            disabled={isTestLoading}
                                        >
                                            {isTestLoading ? "Testing..." : "Test Connection"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Automation Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="font-bold">Auto-Sync Inventory</Label>
                                            <p className="text-xs text-muted-foreground">Update stock counts automatically every hour.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="font-bold">Price Protection</Label>
                                            <p className="text-xs text-muted-foreground">Notify me if supplier price increases above my markup.</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;
