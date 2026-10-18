import { Link } from 'react-router-dom'
import { Leaf, MapPin, Shield, Zap, ArrowRight, CheckCircle2, Heart } from 'lucide-react'

const stats = [
  { value: '2B+', label: 'Meals wasted globally every year' },
  { value: '690M', label: 'People go to bed hungry' },
  { value: '8%', label: 'Of global emissions from food waste' },
]

const steps = [
  { icon: '🍱', title: 'Donor lists food', desc: 'Enter details about surplus food: type, quantity, and safe-use deadline.' },
  { icon: '🤖', title: 'AI matches NGOs', desc: 'Our engine ranks nearby NGOs by distance, capacity, and feasibility.' },
  { icon: '✅', title: 'NGO accepts', desc: 'The NGO accepts the request and assigns a volunteer for pickup.' },
  { icon: '🔐', title: 'OTP verified pickup', desc: 'A one-time code confirms safe handoff and marks the donation complete.' },
]

const features = [
  { icon: MapPin,  title: 'Smart Local Matching', desc: 'Haversine distance + safety buffer to find feasible NGOs near you.' },
  { icon: Shield,  title: 'Verified Pickups',     desc: 'OTP-based verification ensures every pickup is confirmed and logged.' },
  { icon: Zap,     title: 'Real-time Tracking',   desc: 'Track every stage of your donation from request to completion.' },
  { icon: Heart,   title: 'Community Impact',     desc: 'Build a record of rescued food and meals provided over time.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-100 font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-cream-100/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center shadow-sm">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">FoodRescue AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          <Leaf size={14} /> AI-powered food rescue
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Turn surplus food into<br />
          <span className="text-forest-600">community meals</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          FoodRescue AI connects food donors with nearby NGOs using intelligent matching, 
          ensuring your surplus food reaches people who need it — before it goes to waste.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register?role=DONOR" className="btn-primary btn-lg gap-2">
            Donate Food <ArrowRight size={18} />
          </Link>
          <Link to="/register?role=NGO" className="btn-secondary btn-lg">
            Register as NGO
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest-700 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {stats.map(s => (
            <div key={s.value}>
              <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-forest-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 text-lg">Four simple steps from donation to rescue</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="card text-center hover:shadow-card-hover transition-shadow">
              <div className="text-4xl mb-3">{s.icon}</div>
              <div className="w-6 h-6 rounded-full bg-forest-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                {i+1}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for reliability</h2>
            <p className="text-gray-500 text-lg">Every feature designed for real-world food rescue</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-forest-200 hover:bg-forest-50 transition-all">
                <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-forest-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to rescue food?</h2>
        <p className="text-xl text-gray-500 mb-8">Join donors and NGOs already making a difference in their communities.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary btn-lg gap-2">
            Create Free Account <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary btn-lg">Sign In</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf size={16} className="text-forest-600" />
            <span className="font-semibold text-gray-700">FoodRescue AI</span>
          </div>
          <p className="text-sm text-gray-400">Built to reduce food waste and fight hunger.</p>
        </div>
      </footer>
    </div>
  )
}
