'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const message = `*New Contact Inquiry - Pinene Academy*%0A%0A*Name:* ${encodeURIComponent(formData.name)}%0A*Email:* ${encodeURIComponent(formData.email)}%0A*Phone:* ${encodeURIComponent(formData.phone || 'N/A')}%0A*Message:* ${encodeURIComponent(formData.message)}`;
    const whatsappNumber = '9861247722';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
    toast.success('Inquiry submitted! Redirecting to WhatsApp...');
    setFormData({ name: '', email: '', phone: '', message: '' });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Address",
      details: ["123 Education Street", "New Delhi, India 110001"]
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: ["+91 98765 43210", "+91 98612 47722"]
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["info@pineneacademy.com", "admissions@pineneacademy.com"]
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: ["Monday - Saturday", "9:00 AM - 6:30 PM IST"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">Contact Us</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about book purchases, bulk institutional orders, or academic guidance? We would love to assist you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Send Us an Inquiry</h2>
            <p className="text-gray-500 text-sm mb-8">We usually respond within a few hours on business days.</p>

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm">
                  Thank you for reaching out. Our academic team will connect with you via WhatsApp or email shortly.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-xl mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Your Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">Your Message or Inquiry *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us which books or exam prep materials you are interested in..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="min-h-[140px] rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Submit Inquiry via WhatsApp
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center mb-4">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#1e3a5f] text-base mb-2">{info.title}</h3>
                  {info.details.map((detail, dIdx) => (
                    <p key={dIdx} className="text-gray-600 text-sm leading-relaxed">{detail}</p>
                  ))}
                </div>
              ))}
            </div>

            {/* Help Callout */}
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-2">School & Institutional Orders</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                We provide custom bulk publication pricing, teacher sample copies, and dedicated academic curriculum support for schools, coaching institutes, and libraries.
              </p>
              <a
                href="https://wa.me/9861247722?text=Hello%20Pinene%20Academy,%20we%20would%20like%20to%20discuss%20an%20institutional%20or%20bulk%20book%20order."
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold rounded-xl px-6">
                  Contact Institutional Desk
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

