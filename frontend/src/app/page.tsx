'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [billingType, setBillingType] = useState('monthly');
    const [countryCode, setCountryCode] = useState('US');
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(-1);

    const pricingData: Record<string, { symbol: string, base: number }> = {
        'US': { symbol: '$', base: 6 },
        'IN': { symbol: '₹', base: 500 },
        'GB': { symbol: '£', base: 4 }
    };

    useEffect(() => {
        const savedCountry = localStorage.getItem('crumbledger_country');
        if (!savedCountry) {
            setTimeout(() => {
                setIsCountryModalOpen(true);
            }, 500);
        } else {
            setCountryCode(savedCountry);
        }
    }, []);

    const selectCountry = (code: string) => {
        localStorage.setItem('crumbledger_country', code);
        setCountryCode(code);
        setIsCountryModalOpen(false);
    };

    const currentPricing = pricingData[countryCode] || pricingData['US'];
    let mainPrice = currentPricing.base;
    if (billingType === 'annual') {
        mainPrice = Math.round(mainPrice * 0.8);
    }

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? -1 : index);
    };

    return (
        <div className="min-h-screen bg-paper-white font-data text-ink-grey selection:bg-jupiter-gold selection:text-ledger-navy">


    {/*  NAVIGATION  */}
    <header className="sticky top-0 z-50 bg-ledger-navy text-white border-b border-ledger-navy/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/*  Logo with Dual Typography  */}
            <div className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="CrumbLedger Logo" className="h-10 w-auto object-contain rounded-md shadow-sm bg-white p-1" />
                <div className="flex items-baseline">
                    <span className="font-brand font-bold text-2xl text-white tracking-tight">Crumb</span><span className="font-data font-light text-xl text-jupiter-gold tracking-[0.15em] ml-0.5">LEDGER</span>
                </div>
            </div>

            {/*  Desktop Nav Links  */}
            <nav className="hidden md:flex items-center space-x-8 font-data font-medium text-slate-300">
                <a href="#features" className="hover:text-jupiter-gold transition">Features</a>
                <a href="#costing" className="hover:text-jupiter-gold transition">Recipe Costing</a>
                <a href="#pricing" className="hover:text-jupiter-gold transition">Pricing</a>
                <a href="#faq" className="hover:text-jupiter-gold transition">FAQ</a>
            </nav>

            {/*  CTA Actions  */}
            <div className="hidden md:flex items-center space-x-4">
                <Link href="/login" className="text-slate-300 font-data font-semibold hover:text-white transition">Sign In</Link>
                <Link href="/login" className="bg-jupiter-gold hover:bg-amber-400 text-ledger-navy font-brand font-bold px-5 py-2.5 rounded-md shadow-md transition transform hover:-translate-y-0.5">Start Free Trial</Link>
            </div>

            {/*  Mobile Menu Button  */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-300 focus:outline-none text-2xl">
                <i className="fa-solid fa-bars"></i>
            </button>
        </div>

        {/*  Mobile Menu  */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-ledger-navy border-t border-slate-800 px-6 py-6 space-y-4 shadow-xl`}>
            <a href="#features" className="block text-slate-300 font-medium hover:text-jupiter-gold">Features</a>
            <a href="#costing" className="block text-slate-300 font-medium hover:text-jupiter-gold">Recipe Costing</a>
            <a href="#pricing" className="block text-slate-300 font-medium hover:text-jupiter-gold">Pricing</a>
            <a href="#faq" className="block text-slate-300 font-medium hover:text-jupiter-gold">FAQ</a>
            <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
                <Link href="/login" className="text-center text-slate-300 font-semibold py-2">Sign In</Link>
                <Link href="/login" className="text-center bg-jupiter-gold text-ledger-navy font-bold py-3 rounded-md shadow-md">Start Free Trial</Link>
            </div>
        </div>
    </header>

    {/*  HERO SECTION  */}
    <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36 bg-paper-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

            <h1 className="font-brand text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ledger-navy tracking-tight max-w-4xl mx-auto leading-tight">
                Stop Guessing Profit Margins. <span className="text-amber-600">Master Your Ledger.</span>
            </h1>
            <p className="font-data mt-6 text-lg sm:text-xl text-ink-grey max-w-2xl mx-auto leading-relaxed">
                The ultimate operating system for independent bakers, food creators, and micro-merchants. Automate inventory tracking, precise ingredient costing, POS billing, and tax invoicing in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-5">
                <Link href="/login" className="w-full sm:w-auto bg-jupiter-gold hover:bg-amber-400 text-ledger-navy font-brand font-bold text-lg px-8 py-4 rounded-md shadow-lg transition transform hover:-translate-y-1">
                    Start 14-Day Free Trial <i className="fa-solid fa-arrow-right ml-2 text-sm"></i>
                </Link>
                <a href="#demo" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-ledger-navy font-brand font-bold text-lg px-8 py-4 rounded-md border border-slate-300 shadow-sm transition">
                    <i className="fa-solid fa-play text-jupiter-gold mr-2"></i> Watch 2-Min Demo
                </a>
            </div>
            <p className="mt-4 text-xs text-slate-500 font-data font-medium">No credit card required • Setup takes less than 3 minutes</p>

            {/*  Dashboard Mockup Preview with Tabular Inter Figures  */}
            <div className="mt-14 max-w-5xl mx-auto rounded-md shadow-2xl border border-slate-300 bg-ledger-navy overflow-hidden p-3 sm:p-5 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                        <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                        <span className="w-3 h-3 bg-yield-green rounded-full inline-block"></span>
                        <span className="text-xs text-slate-400 ml-2 font-data font-mono">crumbledger.app/dashboard</span>
                    </div>
                    <span className="text-xs bg-yield-green/20 text-yield-green px-3 py-1 rounded-md font-data font-medium"><i className="fa-solid fa-circle text-[8px] mr-1.5 animate-pulse"></i> Live Sync Active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                    <div className="bg-slate-800/90 p-4 rounded-md border border-slate-700">
                        <p className="text-xs text-slate-400 font-data">Today's Net Revenue</p>
                        <p className="text-2xl font-data font-bold text-white mt-1 tabular-nums">$2,480.50</p>
                        <span className="text-xs text-yield-green font-data font-semibold mt-1 inline-block"><i className="fa-solid fa-arrow-up"></i> +14.2% vs yesterday</span>
                    </div>
                    <div className="bg-slate-800/90 p-4 rounded-md border border-slate-700">
                        <p className="text-xs text-slate-400 font-data">Pending Orders</p>
                        <p className="text-2xl font-data font-bold text-jupiter-gold mt-1 tabular-nums">18 Orders</p>
                        <span className="text-xs text-amber-400 font-data font-semibold mt-1 inline-block"><i className="fa-solid fa-clock"></i> 4 require delivery today</span>
                    </div>
                    <div className="bg-slate-800/90 p-4 rounded-md border border-slate-700">
                        <p className="text-xs text-slate-400 font-data">Low Stock Warning</p>
                        <p className="text-2xl font-data font-bold text-red-400 mt-1 tabular-nums">2 Items</p>
                        <span className="text-xs text-red-400 font-data font-semibold mt-1 inline-block"><i className="fa-solid fa-triangle-exclamation"></i> Butter & Dark Chocolate</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  SOCIAL PROOF / TRUST BADGES  */}
    <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs font-data font-bold tracking-widest text-slate-500 uppercase mb-8">Trusted by over 2,000+ independent patisseries, bakeries & food manufacturers</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70 grayscale hover:grayscale-0 transition duration-300">
                <span className="font-brand text-xl font-extrabold tracking-tighter text-ledger-navy"><i className="fa-solid fa-wheat-awn mr-1 text-jupiter-gold"></i> ArtisanCrust</span>
                <span className="font-brand text-xl font-extrabold tracking-tighter text-ledger-navy"><i className="fa-solid fa-cake-candles mr-1 text-jupiter-gold"></i> SweetBoutique</span>
                <span className="font-brand text-xl font-extrabold tracking-tighter text-ledger-navy"><i className="fa-solid fa-mug-hot mr-1 text-jupiter-gold"></i> MorningPastry</span>
                <span className="font-brand text-xl font-extrabold tracking-tighter text-ledger-navy"><i className="fa-solid fa-cookie mr-1 text-jupiter-gold"></i> TheDailyCookie</span>
            </div>
        </div>
    </section>

    {/*  INTERACTIVE FEATURES SECTION  */}
    <section id="features" className="py-24 bg-paper-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-ledger-navy tracking-tight">Everything You Need to Run Your Business Profitably</h2>
                <p className="font-data mt-4 text-lg text-ink-grey">Built from the ground up for food and retail entrepreneurs who need precision down to the single gram.</p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/*  Feature 1  */}
                <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 hover:shadow-xl transition group">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:bg-jupiter-gold group-hover:text-ledger-navy transition">
                        <i className="fa-solid fa-calculator"></i>
                    </div>
                    <h3 className="font-brand text-xl font-bold text-ledger-navy">Dynamic Recipe Costing</h3>
                    <p className="font-data mt-3 text-ink-grey leading-relaxed">Auto-calculate exact production costs based on real-time ingredient purchases, labor rates, and custom overhead factors.</p>
                </div>

                {/*  Feature 2  */}
                <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 hover:shadow-xl transition group">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:bg-jupiter-gold group-hover:text-ledger-navy transition">
                        <i className="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <h3 className="font-brand text-xl font-bold text-ledger-navy">Granular Inventory Tracking</h3>
                    <p className="font-data mt-3 text-ink-grey leading-relaxed">Track raw materials by precise units (grams, kg, ml), manage stock thresholds, tag allergens, and monitor expiry batches easily.</p>
                </div>

                {/*  Feature 3  */}
                <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 hover:shadow-xl transition group">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:bg-jupiter-gold group-hover:text-ledger-navy transition">
                        <i className="fa-solid fa-cash-register"></i>
                    </div>
                    <h3 className="font-brand text-xl font-bold text-ledger-navy">Lightning-Fast POS & Cart</h3>
                    <p className="font-data mt-3 text-ink-grey leading-relaxed">Ring up walk-in customers instantly with an optimized cart system and auto-sync inventory levels instantly upon checkout.</p>
                </div>

                {/*  Feature 4  */}
                <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 hover:shadow-xl transition group">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:bg-jupiter-gold group-hover:text-ledger-navy transition">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <h3 className="font-brand text-xl font-bold text-ledger-navy">Custom Order Management</h3>
                    <p className="font-data mt-3 text-ink-grey leading-relaxed">Never lose track of custom orders or catering events with scheduled delivery times and linked customer profiles.</p>
                </div>

                {/*  Feature 5  */}
                <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 hover:shadow-xl transition group">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:bg-jupiter-gold group-hover:text-ledger-navy transition">
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <h3 className="font-brand text-xl font-bold text-ledger-navy">B2B Invoicing & Quotes</h3>
                    <p className="font-data mt-3 text-ink-grey leading-relaxed">Generate professional tax-compliant invoices, track accounts receivable, and send polished price quotes for wholesale clients.</p>
                </div>

                {/*  Feature 6  */}
                <div className="bg-white p-8 rounded-md shadow-sm border border-slate-200 hover:shadow-xl transition group">
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:bg-jupiter-gold group-hover:text-ledger-navy transition">
                        <i className="fa-solid fa-address-book"></i>
                    </div>
                    <h3 className="font-brand text-xl font-bold text-ledger-navy">Unified CRM & Suppliers</h3>
                    <p className="font-data mt-3 text-ink-grey leading-relaxed">Keep all supplier logs, ingredient purchase costs, customer contact details, and GSTIN/Tax IDs in a single address book.</p>
                </div>
            </div>
        </div>
    </section>

    {/*  RECIPE COSTING SPOTLIGHT  */}
    <section id="costing" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <span className="font-data text-amber-700 font-bold uppercase tracking-wider text-sm bg-amber-100 px-3 py-1 rounded-md">Precision Engineering</span>
                    <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-ledger-navy mt-4">Stop Guessing Your Margins. Know Your Exact Cost Per Batch.</h2>
                    <p className="font-data mt-4 text-ink-grey leading-relaxed">
                        When ingredient prices fluctuate, your margins shouldn't suffer in silence. CrumbLedger links your inventory purchases directly to your recipe builder. Whenever butter or flour prices change, your product costs update automatically across all recipes.
                    </p>
                    <ul className="font-data mt-6 space-y-4">
                        <li className="flex items-center space-x-3 text-ink-grey font-medium">
                            <i className="fa-solid fa-circle-check text-jupiter-gold text-lg"></i>
                            <span>Labor rate and electricity overhead auto-factoring</span>
                        </li>
                        <li className="flex items-center space-x-3 text-ink-grey font-medium">
                            <i className="fa-solid fa-circle-check text-jupiter-gold text-lg"></i>
                            <span>Batch yield calculation and custom markup overrides</span>
                        </li>
                        <li className="flex items-center space-x-3 text-ink-grey font-medium">
                            <i className="fa-solid fa-circle-check text-jupiter-gold text-lg"></i>
                            <span>Instant profit margin recommendations based on competitor benchmarks</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-ledger-navy p-6 sm:p-8 rounded-md text-white shadow-2xl relative border border-slate-800">
                    <div className="absolute -top-4 -right-4 bg-jupiter-gold text-ledger-navy font-bold text-xs px-4 py-2 rounded-md shadow-lg">
                        <i className="fa-solid fa-fire mr-1"></i> Most Loved Feature
                    </div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-data font-mono">Recipe Breakdown Example</p>
                    <h3 className="font-brand text-xl font-bold mt-1">Signature Chocolate Fudge Cake (10 Units)</h3>
                    <div className="mt-6 space-y-3 font-data text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                            <span>Dark Chocolate (500g)</span>
                            <span className="text-white tabular-nums">$12.50</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                            <span>Unsalted Butter (300g)</span>
                            <span className="text-white tabular-nums">$4.20</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                            <span>Labor & Oven Energy (45 mins)</span>
                            <span className="text-white tabular-nums">$6.80</span>
                        </div>
                        <div className="flex justify-between py-3 text-base font-bold text-jupiter-gold">
                            <span>Total Production Cost:</span>
                            <span className="tabular-nums">$23.50 ($2.35 / unit)</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-400 font-data block">Suggested Retail Price</span>
                            <span className="text-lg font-bold text-yield-green tabular-nums font-data">$8.00 / unit</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-400 font-data block">Net Profit Margin</span>
                            <span className="text-xl font-extrabold text-yield-green tabular-nums font-data">70.6%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  PRICING SECTION  */}
    <section id="pricing" className="py-24 bg-paper-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-ledger-navy tracking-tight">Simple, Transparent Pricing</h2>
                <p className="font-data mt-4 text-lg text-ink-grey">Choose the plan that fits your business scale. No hidden fees. Cancel anytime.</p>
                
                {/*  Billing Toggle  */}
                <div className="mt-8 inline-flex items-center bg-slate-200 p-1.5 rounded-md">
                    <button onClick={() => setBillingType('monthly')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${billingType === 'monthly' ? 'bg-white text-ledger-navy shadow-sm' : 'text-slate-600'}`}>Monthly Billing</button>
                    <button onClick={() => setBillingType('annual')} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${billingType === 'annual' ? 'bg-white text-ledger-navy shadow-sm' : 'text-slate-600'}`}>Annual Billing <span className="text-xs text-amber-700 font-bold ml-1">(Save 20%)</span></button>
                </div>
            </div>

            <div className="mt-16 max-w-3xl mx-auto">
                <div className="bg-ledger-navy text-white p-8 sm:p-12 rounded-md shadow-2xl border-2 border-jupiter-gold flex flex-col relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-jupiter-gold text-ledger-navy font-brand font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-md shadow-lg">
                        All-In-One Plan
                    </div>
                    <div className="text-center">
                        <h3 className="font-brand text-2xl font-bold text-white">CrumbLedger Pro</h3>
                        <p className="font-data text-slate-400 text-sm mt-2">Everything you need to run your business profitably.</p>
                        <div className="mt-6">
                            <span className="font-data text-5xl font-extrabold text-white price-main tabular-nums">{currentPricing.symbol}{mainPrice}</span>
                            <span className="font-data text-slate-400 font-medium">/month</span>
                        </div>
                    </div>
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ul className="font-data space-y-4 text-sm text-slate-300">
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Advanced Dynamic Recipe Costing</li>
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Unlimited Recipes & Ingredients</li>
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Standard POS & Cart System</li>
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Multi-Location Inventory Sync</li>
                        </ul>
                        <ul className="font-data space-y-4 text-sm text-slate-300">
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> B2B Invoicing & Tax Calculation</li>
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Custom Order Pipeline & CRM</li>
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Advanced Financial Accounting Reports</li>
                            <li className="flex items-center"><i className="fa-solid fa-check text-jupiter-gold mr-3"></i> Priority Live Chat Support</li>
                        </ul>
                    </div>
                    <div className="mt-12">
                        <a href="/login" className="block text-center bg-jupiter-gold hover:bg-amber-400 text-ledger-navy font-brand font-bold py-4 text-lg rounded-md shadow-lg transition">Start Free Trial</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  TESTIMONIALS SECTION  */}
    <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-ledger-navy tracking-tight">Loved by Food Entrepreneurs Everywhere</h2>
                <p className="font-data mt-4 text-lg text-ink-grey">See how CrumbLedger transformed daily operations and boosted profit margins.</p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-paper-white p-8 rounded-md border border-slate-200 flex flex-col justify-between">
                    <p className="font-data text-ink-grey italic">"Before CrumbLedger, I was guessing how much to charge for my custom wedding cakes. Now I know down to the cent. My profit margins jumped by 22% in the first month."</p>
                    <div className="mt-6 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-jupiter-gold text-ledger-navy rounded-md flex items-center justify-center font-brand font-bold text-lg">
                            SC
                        </div>
                        <div>
                            <p className="font-brand font-bold text-ledger-navy">Sarah Jenkins</p>
                            <p className="font-data text-xs text-slate-500">Owner, Sweet Craft Patisserie</p>
                        </div>
                    </div>
                </div>

                <div className="bg-paper-white p-8 rounded-md border border-slate-200 flex flex-col justify-between">
                    <p className="font-data text-ink-grey italic">"The inventory low-stock alerts save us from running out of butter and chocolate during peak holiday seasons. The POS and invoicing tools are exceptionally smooth."</p>
                    <div className="mt-6 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-jupiter-gold text-ledger-navy rounded-md flex items-center justify-center font-brand font-bold text-lg">
                            MR
                        </div>
                        <div>
                            <p className="font-brand font-bold text-ledger-navy">Marcus Ross</p>
                            <p className="font-data text-xs text-slate-500">Head Baker, Daily Bread Co.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-paper-white p-8 rounded-md border border-slate-200 flex flex-col justify-between">
                    <p className="font-data text-ink-grey italic">"Managing wholesale B2B clients used to be a paperwork nightmare. With CrumbLedger's tax invoices and customer CRM, everything is streamlined in seconds."</p>
                    <div className="mt-6 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-jupiter-gold text-ledger-navy rounded-md flex items-center justify-center font-brand font-bold text-lg">
                            EL
                        </div>
                        <div>
                            <p className="font-brand font-bold text-ledger-navy">Elena Lin</p>
                            <p className="font-data text-xs text-slate-500">Founder, Flour & Co.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  FAQ ACCORDION  */}
    <section id="faq" className="py-24 bg-paper-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="font-brand text-3xl sm:text-4xl font-extrabold text-ledger-navy tracking-tight">Frequently Asked Questions</h2>
                <p className="font-data mt-4 text-lg text-ink-grey">Got questions? We've got answers.</p>
            </div>

            <div className="mt-12 space-y-4 font-data">
                {/*  FAQ Item 1  */}
                <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <button onClick={() => toggleFaq(0)} className="faq-toggle w-full px-6 py-5 text-left font-bold text-ledger-navy flex justify-between items-center focus:outline-none">
                        <span>How does dynamic recipe costing work?</span>
                        <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-200 ${openFaq === 0 ? 'rotate-180' : ''}`}></i>
                    </button>
                    <div className={`faq-content px-6 pb-5 text-ink-grey text-sm leading-relaxed ${openFaq === 0 ? 'block' : 'hidden'}`}>
                        CrumbLedger links your raw material purchases directly to your recipe builder. Whenever you log a new supplier delivery with updated prices, your recipe costs and profit margins recalculate automatically across all associated products.
                    </div>
                </div>

                {/*  FAQ Item 2  */}
                <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <button onClick={() => toggleFaq(1)} className="faq-toggle w-full px-6 py-5 text-left font-bold text-ledger-navy flex justify-between items-center focus:outline-none">
                        <span>Can I use CrumbLedger on my tablet or phone?</span>
                        <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-200 ${openFaq === 1 ? 'rotate-180' : ''}`}></i>
                    </button>
                    <div className={`faq-content px-6 pb-5 text-ink-grey text-sm leading-relaxed ${openFaq === 1 ? 'block' : 'hidden'}`}>
                        Yes! CrumbLedger is fully responsive and optimized for mobile devices, tablets, and desktop POS terminals so you can check inventory or ring up sales right from the kitchen counter.
                    </div>
                </div>

                {/*  FAQ Item 3  */}
                <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <button onClick={() => toggleFaq(2)} className="faq-toggle w-full px-6 py-5 text-left font-bold text-ledger-navy flex justify-between items-center focus:outline-none">
                        <span>Is my business data secure?</span>
                        <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-200 ${openFaq === 2 ? 'rotate-180' : ''}`}></i>
                    </button>
                    <div className={`faq-content px-6 pb-5 text-ink-grey text-sm leading-relaxed ${openFaq === 2 ? 'block' : 'hidden'}`}>
                        We use enterprise-grade Firebase authentication and secure token-based encryption to safeguard all your financial records, customer details, and proprietary recipes.
                    </div>
                </div>

                {/*  FAQ Item 4  */}
                <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <button onClick={() => toggleFaq(3)} className="faq-toggle w-full px-6 py-5 text-left font-bold text-ledger-navy flex justify-between items-center focus:outline-none">
                        <span>Can I cancel my subscription at any time?</span>
                        <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-200 ${openFaq === 3 ? 'rotate-180' : ''}`}></i>
                    </button>
                    <div className={`faq-content px-6 pb-5 text-ink-grey text-sm leading-relaxed ${openFaq === 3 ? 'block' : 'hidden'}`}>
                        Yes, absolutely. There are no long-term lock-in contracts. You can upgrade, downgrade, or cancel your subscription instantly from your global business profile settings.
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/*  FOOTER CTA  */}
    <section className="py-20 bg-jupiter-gold text-ledger-navy text-center">
        <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-brand text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Take Control of Your Profits?</h2>
            <p className="font-data mt-4 text-ledger-navy/90 text-lg max-w-2xl mx-auto">Join thousands of food entrepreneurs who rely on CrumbLedger for billing, inventory, and recipe costing.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/login" className="bg-ledger-navy text-white hover:bg-slate-800 font-brand font-bold px-8 py-4 rounded-md shadow-xl transition">Start Your 14-Day Free Trial</Link>
            </div>
        </div>
    </section>

    {/*  FOOTER  */}
    <footer className="bg-ledger-navy text-slate-400 py-12 border-t border-slate-800 font-data">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-2.5">
                <img src="/logo.png" alt="CrumbLedger Logo" className="h-8 w-auto object-contain rounded-md shadow-sm bg-white p-0.5" />
                <div className="flex items-baseline">
                    <span className="font-brand font-bold text-xl text-white tracking-tight">Crumb</span><span className="font-data font-light text-base text-jupiter-gold tracking-[0.15em] ml-0.5">LEDGER</span>
                </div>
            </div>
            <p className="text-sm">&copy; 2026 CrumbLedger Technologies Inc. All rights reserved.</p>
            <div className="flex space-x-6 text-xl">
                <a href="#" className="hover:text-white transition"><i className="fa-brands fa-twitter"></i></a>
                <a href="#" className="hover:text-white transition"><i className="fa-brands fa-facebook"></i></a>
                <a href="#" className="hover:text-white transition"><i className="fa-brands fa-instagram"></i></a>
            </div>
        </div>
    </footer>

    {/*  COUNTRY SELECTION MODAL  */}
    {isCountryModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ledger-navy/80 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 mx-4 transition-transform duration-300 scale-100">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 text-jupiter-gold rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fa-solid fa-globe"></i>
                </div>
                <h3 className="font-brand text-2xl font-bold text-ledger-navy">Select Your Region</h3>
                <p className="font-data text-slate-500 mt-2 text-sm">Choose your country to see localized pricing and tax regulations.</p>
            </div>
            
            <div className="space-y-3 font-data">
                <button onClick={() => selectCountry('US')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-md hover:border-jupiter-gold hover:bg-amber-50 transition group">
                    <span className="flex items-center space-x-3 text-ledger-navy font-medium"><i className="fa-solid fa-flag-usa w-6 text-slate-400 group-hover:text-jupiter-gold text-center"></i> <span>United States</span></span>
                </button>
                <button onClick={() => selectCountry('IN')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-md hover:border-jupiter-gold hover:bg-amber-50 transition group">
                    <span className="flex items-center space-x-3 text-ledger-navy font-medium"><i className="fa-solid fa-earth-asia w-6 text-slate-400 group-hover:text-jupiter-gold text-center"></i> <span>India</span></span>
                </button>
                <button onClick={() => selectCountry('GB')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-md hover:border-jupiter-gold hover:bg-amber-50 transition group">
                    <span className="flex items-center space-x-3 text-ledger-navy font-medium"><i className="fa-solid fa-earth-europe w-6 text-slate-400 group-hover:text-jupiter-gold text-center"></i> <span>United Kingdom</span></span>
                </button>
            </div>
        </div>
    </div>
    )}

    {/*  INTERACTIVE JAVASCRIPT  */}
    
        </div>
    );
}
