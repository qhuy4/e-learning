import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  GraduationCap,
  Lock,
  Shield,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { useCart } from "@/features/cart/hooks/use-cart";
import { formatCurrency } from "@fe/lib/utils";

export const CartPage = () => {
  const { items, removeItem, total, itemCount } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "PIEMIND2025") {
      setAppliedPromo({ code: "PIEMIND2025", discount: 150000 });
    }
  };

  const subtotal = total;
  const discount = appliedPromo?.discount ?? 0;
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAFAF9]">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-3">
            <Link to="/" className="hover:text-slate-700 transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <Link
              to="/courses"
              className="hover:text-slate-700 transition-colors"
            >
              Courses
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-slate-800">Shopping Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-heading">
                Your Shopping Cart
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <Link
              to="/courses"
              className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#F38181] transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="size-4" />
              Continue browsing
            </Link>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Left Column: Cart Items & Promo */}
          <section className="w-full max-w-3xl flex flex-col gap-6">
            {items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Tag className="size-10 text-slate-300" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2 font-heading">
                  Your cart is empty
                </h2>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                  Browse our courses and add something you love to your cart.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F38181] hover:bg-[#e76e6e] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Explore Courses
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {items.map((item) => (
                  <article
                    key={item.courseId}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start justify-between group hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex gap-4 min-w-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                        {item.thumbnail ? (
                          <img
                            className="w-full h-full object-cover"
                            alt={item.title}
                            src={item.thumbnail}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        {item.instructor?.headline && (
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            {item.instructor.headline}
                          </span>
                        )}
                        <h2 className="font-semibold text-base sm:text-lg text-slate-900 leading-snug hover:text-slate-700 transition-colors cursor-pointer line-clamp-2 font-heading">
                          {item.title}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          {item.statistics?.studentCount != null && (
                            <span className="flex items-center gap-1">
                              <Users className="size-3.5 text-[#146a5f]" />
                              {item.statistics.studentCount} students
                            </span>
                          )}
                          {item.statistics?.averageRating != null && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <BadgeCheck className="size-3.5 text-[#146a5f]" />
                                {item.statistics.averageRating.toFixed(1)}
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 text-[#146a5f]" />
                            Lifetime Access
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Price & Remove */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                      <div className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                        {formatCurrency(item.price)}
                      </div>
                      <button
                        aria-label="Remove item"
                        className="sm:mt-4 text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
                        type="button"
                        onClick={() => removeItem(item.courseId)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sm:hidden font-medium">Remove</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Promo Code Card */}
            {items.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                  htmlFor="promo-code"
                >
                  Discount or Referral Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 uppercase tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F38181]/40 focus:border-[#F38181]"
                      id="promo-code"
                      placeholder="Enter coupon code"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    {appliedPromo && (
                      <CheckCircle className="size-5 text-[#146a5f] absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <button
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-full transition-colors shrink-0"
                    type="button"
                    onClick={handleApplyPromo}
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-[#146a5f] mt-2 font-medium flex items-center gap-1">
                    <Tag className="size-3.5" />
                    Promo code <strong>{appliedPromo.code}</strong> applied (
                    {formatCurrency(appliedPromo.discount)} off).
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Right Column: Order Summary */}
          {items.length > 0 && (
            <aside className="w-full max-w-md sticky top-24">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col gap-6">
                <h2 className="font-bold text-xl text-slate-900 border-b border-slate-100 pb-4 font-heading">
                  Order Summary
                </h2>

                {/* Cost Breakdown */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal ({itemCount} courses)</span>
                    <span className="text-slate-900 font-semibold">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-[#146a5f] font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="size-4" />
                        Voucher Discount
                      </span>
                      <span className="font-semibold">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-3.5 flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-900 font-heading">
                      Estimated Total
                    </span>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                        {formatCurrency(finalTotal)}
                      </span>
                      <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                        Taxes calculated at checkout
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <div>
                  <Link
                    to="/checkout"
                    className="w-full bg-[#F38181] hover:bg-[#e76e6e] active:scale-[0.99] text-white font-bold text-base py-3.5 px-6 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-3.5">
                    <Lock className="size-4 text-[#146a5f]" />
                    <span>
                      30-Day Money-Back Guarantee · SSL 256-bit Secure
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="border-t border-slate-100 pt-5">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-3 text-center">
                    Accepted Payment Methods
                  </span>
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md">
                      Visa
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md">
                      Mastercard
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md">
                      Apple Pay
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md">
                      MoMo
                    </span>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-md">
                      VNPay
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <GraduationCap className="size-4 text-[#146a5f]" />
                  CEFR-Aligned
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="size-4 text-[#146a5f]" />
                  Privacy Protected
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-4 text-[#146a5f]" />
                  ISO 27001
                </span>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
