import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("collection");

  const sections = [
    { id: "collection", title: "Information We Collect", icon: Database },
    { id: "usage", title: "How We Use Your Information", icon: Eye },
    { id: "sharing", title: "Information Sharing", icon: UserCheck },
    { id: "security", title: "Data Security", icon: Lock },
    { id: "rights", title: "Your Rights", icon: FileText },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-muted-foreground">
              Last Updated: <span className="font-bold">February 11, 2026</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 px-4">
                Quick Navigation
              </h3>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-9 space-y-12"
          >
            {/* Introduction */}
            <div className="prose prose-gray max-w-none">
              <p className="text-foreground leading-relaxed">
                Welcome to V-Commerce. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our 
                platform and tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            {/* Information We Collect */}
            <div id="collection" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Database className="h-6 w-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Information We Collect
                </h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>We collect several types of information from and about users of our platform:</p>
                <div className="bg-muted/50 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-lg">Personal Information:</h3>
                  <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                    <li>Name, email address, and phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely through our payment providers)</li>
                    <li>Account credentials</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-lg">Usage Information:</h3>
                  <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
                    <li>Browser type and version</li>
                    <li>IP address and device information</li>
                    <li>Pages visited and time spent on our platform</li>
                    <li>Products viewed and purchased</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div id="usage" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  How We Use Your Information
                </h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>We use the information we collect for the following purposes:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                    <ChevronRight className="h-5 w-5 text-primary mb-3" />
                    <h4 className="font-bold mb-2">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      To process and fulfill your orders, including payment processing and delivery coordination.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                    <ChevronRight className="h-5 w-5 text-primary mb-3" />
                    <h4 className="font-bold mb-2">Communication</h4>
                    <p className="text-sm text-muted-foreground">
                      To send you order confirmations, shipping updates, and customer service communications.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                    <ChevronRight className="h-5 w-5 text-primary mb-3" />
                    <h4 className="font-bold mb-2">Personalization</h4>
                    <p className="text-sm text-muted-foreground">
                      To provide personalized product recommendations and improve your shopping experience.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                    <ChevronRight className="h-5 w-5 text-primary mb-3" />
                    <h4 className="font-bold mb-2">Platform Improvement</h4>
                    <p className="text-sm text-muted-foreground">
                      To analyze usage patterns and improve our platform's functionality and user experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Sharing */}
            <div id="sharing" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Information Sharing
                </h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="space-y-3 ml-6 list-disc text-muted-foreground">
                  <li><strong className="text-foreground">Service Providers:</strong> Third-party vendors who help us operate our platform, process payments, and deliver products.</li>
                  <li><strong className="text-foreground">Sellers:</strong> To facilitate order fulfillment and customer service.</li>
                  <li><strong className="text-foreground">Legal Compliance:</strong> When required by law or to protect our rights and the safety of our users.</li>
                  <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div id="security" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Data Security
                </h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data 
                  against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <div className="bg-muted/50 rounded-2xl p-6 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">Encryption of data in transit and at rest</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">Regular security assessments and updates</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">Access controls and authentication mechanisms</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">Secure payment processing through certified providers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div id="rights" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Your Rights
                </h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>You have the following rights regarding your personal data:</p>
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-6 py-2">
                    <h4 className="font-bold mb-1">Access and Portability</h4>
                    <p className="text-sm text-muted-foreground">
                      Request a copy of your personal data in a structured, commonly used format.
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-6 py-2">
                    <h4 className="font-bold mb-1">Correction</h4>
                    <p className="text-sm text-muted-foreground">
                      Update or correct inaccurate personal information.
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-6 py-2">
                    <h4 className="font-bold mb-1">Deletion</h4>
                    <p className="text-sm text-muted-foreground">
                      Request deletion of your personal data, subject to legal obligations.
                    </p>
                  </div>
                  <div className="border-l-4 border-primary pl-6 py-2">
                    <h4 className="font-bold mb-1">Opt-Out</h4>
                    <p className="text-sm text-muted-foreground">
                      Unsubscribe from marketing communications at any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-xl font-bold mb-3">Questions About Privacy?</h3>
              <p className="text-muted-foreground mb-4">
                If you have any questions or concerns about our privacy policy or data practices, 
                please don't hesitate to contact us.
              </p>
              <Link to="/contact">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
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

export default PrivacyPolicy;
