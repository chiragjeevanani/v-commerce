import React from "react";
import { motion } from "framer-motion";
import { RefreshCcw, PackageCheck, Clock, XCircle, CheckCircle, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background">
            <div className="container pt-6 pb-2">
                <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors group" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Button>
            </div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24 border-b">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
                            <RefreshCcw className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Refund & Return Policy
                        </h1>
                        <p className="text-lg text-muted-foreground mb-4">
                            We want you to be completely satisfied with your purchase. If you're not happy,
                            we're here to help with our hassle-free return and refund process.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Last Updated: <span className="font-bold">February 11, 2026</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="container py-12 md:py-16">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Overview Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                            <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center text-white mb-4 shadow-lg">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">30-Day Window</h3>
                            <p className="text-sm text-muted-foreground">
                                Returns accepted within 30 days of delivery for most items.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-4 shadow-lg">
                                <PackageCheck className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Original Condition</h3>
                            <p className="text-sm text-muted-foreground">
                                Items must be unused, unworn, and in original packaging with tags.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                            <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center text-white mb-4 shadow-lg">
                                <RefreshCcw className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Quick Processing</h3>
                            <p className="text-sm text-muted-foreground">
                                Refunds processed within 5-7 business days after we receive your return.
                            </p>
                        </div>
                    </motion.div>

                    {/* Eligibility Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Return Eligibility
                            </h2>
                        </div>
                        <div className="bg-muted/50 rounded-2xl p-8 space-y-6">
                            <div>
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                                        ✓
                                    </div>
                                    Eligible for Return
                                </h3>
                                <ul className="space-y-2 ml-10 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>Items returned within 30 days of delivery</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>Products in original, unused condition with all tags attached</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>Items in original packaging without damage</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>Defective or damaged items received</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>Wrong items shipped to you</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
                                        ✗
                                    </div>
                                    Not Eligible for Return
                                </h3>
                                <ul className="space-y-2 ml-10 text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600">•</span>
                                        <span>Items marked as "Final Sale" or "Non-Returnable"</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600">•</span>
                                        <span>Personalized or custom-made products</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600">•</span>
                                        <span>Perishable goods (food, flowers, etc.)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600">•</span>
                                        <span>Intimate or sanitary goods, hazardous materials</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-600">•</span>
                                        <span>Items returned after 30 days of delivery</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Return Process */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <RefreshCcw className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                How to Return an Item
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                            {[
                                {
                                    step: "1",
                                    title: "Initiate Return",
                                    description: "Go to your order history and select the item you want to return.",
                                    color: "from-blue-500 to-indigo-600"
                                },
                                {
                                    step: "2",
                                    title: "Select Reason",
                                    description: "Choose the reason for your return and provide any additional details.",
                                    color: "from-indigo-500 to-purple-600"
                                },
                                {
                                    step: "3",
                                    title: "Pack & Ship",
                                    description: "Pack the item securely in its original packaging and ship using our provided label.",
                                    color: "from-purple-500 to-pink-600"
                                },
                                {
                                    step: "4",
                                    title: "Get Refund",
                                    description: "Once we receive and inspect your return, your refund will be processed.",
                                    color: "from-pink-500 to-red-600"
                                }
                            ].map((item, index) => (
                                <div key={index} className="relative">
                                    <div className="bg-muted/50 rounded-2xl p-6 h-full border border-muted hover:border-primary/50 transition-all">
                                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg font-black text-xl`}>
                                            {item.step}
                                        </div>
                                        <h3 className="font-bold mb-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                    {index < 3 && (
                                        <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                            <div className="h-1 w-4 bg-gradient-to-r from-muted to-transparent" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Refund Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Refund Information
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                                <h3 className="font-bold mb-3">Refund Timeline</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Once we receive your return, we'll inspect it and notify you of the approval or rejection
                                    of your refund. If approved, your refund will be processed within <strong className="text-foreground">5-7 business days</strong> and
                                    a credit will automatically be applied to your original method of payment.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                                <h3 className="font-bold mb-3">Partial Refunds</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                                    Partial refunds may be granted for items that are returned in less than perfect condition:
                                </p>
                                <ul className="space-y-2 ml-6 text-sm text-muted-foreground list-disc">
                                    <li>Items with obvious signs of use or wear</li>
                                    <li>Items missing parts or accessories (manuals, cables, etc.)</li>
                                    <li>Items not in original packaging or damaged packaging</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                                <h3 className="font-bold mb-3">Shipping Costs</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Return shipping costs are <strong className="text-foreground">non-refundable</strong> unless the return is due to our error
                                    (defective or wrong item received). In such cases, we'll provide a prepaid return label at no cost to you.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Exchanges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Exchanges
                            </h2>
                        </div>
                        <div className="bg-muted/50 rounded-2xl p-8">
                            <p className="text-foreground leading-relaxed mb-4">
                                We currently only replace items if they are defective or damaged. If you need to exchange an item
                                for the same product, please contact our customer support team and we'll guide you through the process.
                            </p>
                            <p className="text-muted-foreground text-sm">
                                For size or color exchanges, we recommend returning the original item for a refund and placing
                                a new order for your preferred variant.
                            </p>
                        </div>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold">Need Help with a Return?</h3>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Our customer support team is here to help you with any questions or concerns about returns and refunds.
                            We're committed to making your return experience as smooth as possible.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/contact">
                                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
                                    Contact Support
                                </button>
                            </Link>
                            <Link to="/orders">
                                <button className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/70 transition-all">
                                    View My Orders
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default RefundPolicy;
