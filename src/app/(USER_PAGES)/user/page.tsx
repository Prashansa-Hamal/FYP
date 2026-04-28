import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import {
  MapPin,
  Phone,
  Wifi,
  User,
  Mail,
  Award,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  CreditCard,
  Package,
  Star,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { getCurrentUser } from "@/data/current-user";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import { IconFlagQuestion } from "@tabler/icons-react";

export default async function ProfilePage() {
  const user = await getCurrentUser({
    withFullUser: true,
    redirectIfNotFound: true,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Load Profile
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your profile information. Please try again.
            </p>
            <RefreshButton />
            <Button
              size="lg"
              className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1ed] to-[#e8e3dd] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span className="text-3xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                  {user.name}
                </h1>
                <p className="text-white/90 text-sm flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <Star className="w-3 h-3" />
                    Member since {format(new Date(user.createdAt), "MMM yyyy")}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      user.role === "ADMIN"
                        ? "bg-purple-500/20 text-purple-100"
                        : "bg-amber-500/20 text-amber-100"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {user.loyalityPoints || 0}
                  </div>
                  <div className="text-xs text-white/80">Points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Info Bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">
                  123 Main Street, Kathmandu
                </span>
                <span className="sm:hidden">Kathmandu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+977 9801234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">WiFi: DineEase</span>
                <span className="sm:hidden">WiFi</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Profile Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{user.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </label>
                  <p className="text-gray-900 font-medium mt-1">{user.email}</p>
                </div>
                {user.phone && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <p className="text-gray-900 font-medium mt-1">
                      {user.phone}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </label>
                  <p className="text-gray-900 font-medium mt-1 capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Loyalty Points Card */}
            <Link href="/user/loyality">
              <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Loyalty Points
                    </h2>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">
                    {user.loyalityPoints || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Earn points with every order and redeem them for exclusive
                  rewards!
                </p>
                <div className="mt-3">
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 rounded-full h-2 transition-all duration-500"
                      style={{
                        width: `${Math.min(((user.loyalityPoints || 0) / 1000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {1000 - (user.loyalityPoints || 0)} points until next reward
                  </p>
                </div>
              </div>
            </Link>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/orders"
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">My Orders</p>
                      <p className="text-xs text-gray-500">
                        View order history
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>

                <Link
                  href="/user/addresses"
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Addresses</p>
                      <p className="text-xs text-gray-500">
                        Manage saved addresses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>

                <Link
                  href="/user/reservations"
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Reservations</p>
                      <p className="text-xs text-gray-500">
                        View table bookings
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>

                <Link
                  href="/payments"
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Payment Methods
                      </p>
                      <p className="text-xs text-gray-500">
                        Manage payment options
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>

                <Link
                  href="/faq"
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <IconFlagQuestion className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">FAQs</p>
                      <p className="text-xs text-gray-500">
                        See the list of faqs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>

                <Link
                  href="/chat"
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <MessageCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Chat Support</p>
                      <p className="text-xs text-gray-500">
                        Chat with our support team
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Fixed: Removed the Button wrapper and just use LogoutButton directly */}
                <LogoutButton>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </LogoutButton>
                <Link href="/" className="w-full">
                  <div className="flex items-center justify-center w-full h-10 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    <Package className="mr-2 h-4 w-4" />
                    Browse Menu
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Powered by QR Menu System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
