import Link from 'next/link';
import { ArrowRight, BarChart3, DollarSign, PieChart, Shield, TrendingUp, Wallet } from 'lucide-react';

export default async function Home() {
  return (
    <>

    <div className="min-h-screen bg-ghost-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-glaucous">
                <span className="text-bittersweet">Finance</span> Tracker
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">

              <Link href="/sign-in" className="bg-bittersweet text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                Sign In
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link href="/sign-in" className="bg-bittersweet text-white px-4 py-2 rounded-lg text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-paynes-gray mb-6">
              Take Control of Your
              <span className="text-bittersweet block mt-2">Financial Future</span>
            </h1>
            <p className="text-xl text-paynes-gray opacity-80 mb-8 max-w-3xl mx-auto">
              Track your income, expenses, and purchases with ease. Get insights into your spending habits
              and make informed financial decisions with our intuitive dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/sign-in"
                className="bg-bittersweet text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center"
              >
                Start Tracking Now
                <ArrowRight size={20} className="ml-2" />
              </Link>
              {/* <button className="border-2 border-columbia-blue text-columbia-blue px-8 py-4 rounded-lg text-lg font-medium hover:bg-columbia-blue hover:text-white transition-colors">
                Watch Demo
              </button> */}
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
                <div className="w-12 h-12 bg-bittersweet bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={24} className="text-bittersweet" />
                </div>
                <h3 className="text-2xl font-bold text-paynes-gray mb-2">Real-time</h3>
                <p className="text-paynes-gray opacity-70">Track your finances as they happen</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
                <div className="w-12 h-12 bg-columbia-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} className="text-columbia-blue" />
                </div>
                <h3 className="text-2xl font-bold text-paynes-gray mb-2">Secure</h3>
                <p className="text-paynes-gray opacity-70">Your data is protected and private</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-50">
                <div className="w-12 h-12 bg-glaucous bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PieChart size={24} className="text-glaucous" />
                </div>
                <h3 className="text-2xl font-bold text-paynes-gray mb-2">Insights</h3>
                <p className="text-paynes-gray opacity-70">Understand your spending patterns</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-paynes-gray mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-xl text-paynes-gray opacity-70 max-w-2xl mx-auto">
              Powerful features designed to make financial tracking simple and insightful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="w-16 h-16 bg-bittersweet bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <DollarSign size={32} className="text-bittersweet" />
              </div>
              <h3 className="text-xl font-bold text-paynes-gray mb-4">Income Tracking</h3>
              <p className="text-paynes-gray opacity-70 mb-4">
                Monitor all your income sources including salary, freelance work, and bonuses.
                Track gross income, taxes, and net earnings with detailed breakdowns.
              </p>
              <Link href="/sign-in" className="text-bittersweet font-medium hover:text-opacity-80 transition-colors">
                Learn more →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="w-16 h-16 bg-columbia-blue bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 size={32} className="text-columbia-blue" />
              </div>
              <h3 className="text-xl font-bold text-paynes-gray mb-4">Expense Management</h3>
              <p className="text-paynes-gray opacity-70 mb-4">
                Categorize and track all your expenses. Set budgets, monitor spending patterns,
                and get alerts when you're approaching your limits.
              </p>
              <Link href="/sign-in" className="text-columbia-blue font-medium hover:text-opacity-80 transition-colors">
                Learn more →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="w-16 h-16 bg-glaucous bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <Wallet size={32} className="text-glaucous" />
              </div>
              <h3 className="text-xl font-bold text-paynes-gray mb-4">Purchase History</h3>
              <p className="text-paynes-gray opacity-70 mb-4">
                Keep detailed records of all your purchases. Search, filter, and analyze
                your buying habits to make better financial decisions.
              </p>
              <Link href="/purchases" className="text-glaucous font-medium hover:text-opacity-80 transition-colors">
                Learn more →
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="w-16 h-16 bg-bittersweet bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <PieChart size={32} className="text-bittersweet" />
              </div>
              <h3 className="text-xl font-bold text-paynes-gray mb-4">Visual Analytics</h3>
              <p className="text-paynes-gray opacity-70 mb-4">
                Beautiful charts and graphs help you understand your financial data at a glance.
                Spot trends and make data-driven decisions.
              </p>
              <Link href="/dashboard" className="text-bittersweet font-medium hover:text-opacity-80 transition-colors">
                View dashboard →
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="w-16 h-16 bg-columbia-blue bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={32} className="text-columbia-blue" />
              </div>
              <h3 className="text-xl font-bold text-paynes-gray mb-4">Financial Goals</h3>
              <p className="text-paynes-gray opacity-70 mb-4">
                Set savings goals and track your progress. Get personalized recommendations
                to help you reach your financial objectives faster.
              </p>
              <span className="text-columbia-blue font-medium opacity-50">
                Coming soon
              </span>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="w-16 h-16 bg-glaucous bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <Shield size={32} className="text-glaucous" />
              </div>
              <h3 className="text-xl font-bold text-paynes-gray mb-4">Secure & Private</h3>
              <p className="text-paynes-gray opacity-70 mb-4">
                Your financial data is encrypted and stored securely. We never share your
                personal information with third parties.
              </p>
              <span className="text-glaucous font-medium">
                Bank-level security
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ghost-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-paynes-gray mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-paynes-gray opacity-70 mb-8">
            Join thousands of users who are already managing their money better with Finance Tracker.
          </p>
          <Link
            href="/dashboard"
            className="bg-bittersweet text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors inline-flex items-center"
          >
            Start Your Financial Journey
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-glaucous mb-4">
                <span className="text-bittersweet">Finance</span> Tracker
              </h3>
              <p className="text-paynes-gray opacity-70 mb-6 max-w-md">
                Empowering individuals to make better financial decisions through intuitive
                tracking and insightful analytics.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-paynes-gray hover:text-bittersweet transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-paynes-gray hover:text-bittersweet transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="md:col-start-4">
              <h4 className="font-bold text-paynes-gray mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors">Help Center</a></li>
                <li><a href="#" className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors">FAQ</a></li>
                <li><a href="#" className="text-paynes-gray opacity-70 hover:text-bittersweet transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-12 pt-8 text-center">
            <p className="text-paynes-gray opacity-70">
              © 2025 Finance Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>

    </>
  );
}
