import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Users, Package, Award, Heart, Shield, Zap, TrendingUp, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const About = () => {
    const navigate = useNavigate();
    const stats = [
        { icon: Users, label: "Active Users", value: "10,000+", color: "from-blue-500 to-indigo-600" },
        { icon: Package, label: "Products", value: "50,000+", color: "from-green-500 to-emerald-600" },
        { icon: ShoppingBag, label: "Orders Delivered", value: "25,000+", color: "from-purple-500 to-pink-600" },
        { icon: Award, label: "Seller Partners", value: "500+", color: "from-orange-500 to-red-600" },
    ];

    const values = [
        {
            icon: Heart,
            title: "Customer First",
            description: "Every decision we make puts our customers at the center. Your satisfaction is our success.",
            color: "from-red-500 to-pink-600"
        },
        {
            icon: Shield,
            title: "Trust & Security",
            description: "We prioritize the security of your data and guarantee authentic products from verified sellers.",
            color: "from-blue-500 to-indigo-600"
        },
        {
            icon: Zap,
            title: "Innovation",
            description: "We continuously evolve our platform with cutting-edge technology to enhance your shopping experience.",
            color: "from-yellow-500 to-orange-600"
        },
        {
            icon: TrendingUp,
            title: "Quality & Growth",
            description: "We're committed to offering premium products and growing together with our community.",
            color: "from-green-500 to-emerald-600"
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <div className="container pt-6 pb-2">
                <Button variant="ghost" className="hover:bg-transparent hover:text-primary transition-colors group" onClick={() => navigate("/")}>
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Button>
            </div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 md:py-24 border-b overflow-hidden">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
                            <ShoppingBag className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            About V-Commerce
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Your trusted destination for quality products, exceptional service,
                            and a shopping experience that puts you first.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container py-12 md:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-card rounded-2xl p-6 border hover:border-primary/50 transition-all hover:shadow-lg text-center group"
                            >
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg mx-auto group-hover:scale-110 transition-transform`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black mb-1">{stat.value}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Story Section */}
            <section className="container py-12 md:py-16">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                            Our Story
                        </h2>
                        <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="space-y-6 text-foreground leading-relaxed"
                    >
                        <p className="text-lg">
                            Founded in 2024, <strong>V-Commerce</strong> was born from a simple vision:
                            to create an e-commerce platform that truly prioritizes customer experience,
                            quality products, and trustworthy partnerships.
                        </p>
                        <p>
                            We started as a small team of passionate entrepreneurs who saw the need for a
                            marketplace that bridges the gap between quality sellers and discerning customers.
                            Today, we've grown into a thriving community of over 10,000 active users and
                            hundreds of verified seller partners.
                        </p>
                        <p>
                            Our platform offers everything from fashion and electronics to home essentials
                            and lifestyle products. Each item is carefully curated, and every seller is
                            thoroughly vetted to ensure you receive only authentic, high-quality products.
                        </p>
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                            <p className="text-center italic text-lg font-medium">
                                "Our mission is to make online shopping not just convenient,
                                but delightful—building trust one order at a time."
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-muted/30 py-12 md:py-16">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                            Our Values
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide everything we do and every decision we make.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                                    className="bg-card rounded-2xl p-8 border hover:border-primary/50 transition-all hover:shadow-lg group"
                                >
                                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="container py-12 md:py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        Meet Our Team
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        A diverse group of talented individuals working together to revolutionize online shopping.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20 text-center max-w-3xl mx-auto"
                >
                    <Users className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-3">We're Growing!</h3>
                    <p className="text-muted-foreground mb-6">
                        Our team is constantly expanding with passionate individuals who share our vision.
                        We believe in fostering a collaborative environment where innovation thrives and
                        every voice is heard.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="bg-background rounded-xl px-6 py-3 border">
                            <p className="text-sm text-muted-foreground">Engineering</p>
                            <p className="font-bold text-lg">15+ Members</p>
                        </div>
                        <div className="bg-background rounded-xl px-6 py-3 border">
                            <p className="text-sm text-muted-foreground">Customer Support</p>
                            <p className="font-bold text-lg">20+ Members</p>
                        </div>
                        <div className="bg-background rounded-xl px-6 py-3 border">
                            <p className="text-sm text-muted-foreground">Operations</p>
                            <p className="font-bold text-lg">10+ Members</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-primary to-primary/80 py-16 md:py-20">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="max-w-3xl mx-auto text-center text-primary-foreground"
                    >
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Ready to Start Shopping?
                        </h2>
                        <p className="text-lg mb-8 opacity-90">
                            Join thousands of happy customers who trust V-Commerce for their shopping needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/shop">
                                <button className="px-8 py-4 bg-background text-foreground rounded-xl font-bold hover:bg-background/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                                    Browse Products
                                </button>
                            </Link>
                            <Link to="/contact">
                                <button className="px-8 py-4 bg-transparent border-2 border-primary-foreground text-primary-foreground rounded-xl font-bold hover:bg-primary-foreground hover:text-primary transition-all">
                                    Contact Us
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;
