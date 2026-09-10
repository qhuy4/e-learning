import { CreditCard } from "lucide-react";

interface PaymentMethodSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const METHODS = [
  { id: "VNPAY", label: "VNPAY", desc: "Thanh toán qua VNPAY" },
  { id: "STRIPE", label: "Stripe", desc: "Thanh toán qua thẻ quốc tế" },
];

export const PaymentMethodSelect = ({
  value,
  onChange,
}: PaymentMethodSelectProps) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Phương thức thanh toán</h3>

      <div className="space-y-3">
        {METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
              value === method.id
                ? "border-rose-400 bg-rose-50"
                : "border-slate-100 hover:border-slate-200"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={value === method.id}
              onChange={() => onChange(method.id)}
              className="sr-only"
            />
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                value === method.id
                  ? "bg-rose-400 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {method.label}
              </p>
              <p className="text-xs text-slate-500">{method.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
