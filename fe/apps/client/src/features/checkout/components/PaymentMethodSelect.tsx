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
    <div>
      <h3 className="mb-3 text-base font-bold text-foreground">
        Phương thức thanh toán
      </h3>

      {/* Radio card — 2 cột trên tablet/desktop, 1 cột trên mobile */}
      <div className="grid gap-3 sm:grid-cols-2">
        {METHODS.map((method) => {
          const active = value === method.id;
          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                active
                  ? "border-piemind-pink bg-piemind-pink/[0.04] ring-1 ring-piemind-pink"
                  : "border-border bg-card hover:border-input"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={active}
                onChange={() => onChange(method.id)}
                className="sr-only"
              />
              {/* Radio indicator */}
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  active ? "border-piemind-pink" : "border-input"
                }`}
              >
                {active && (
                  <span className="h-2.5 w-2.5 rounded-full bg-piemind-pink" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-semibold ${
                    active ? "text-foreground" : "text-foreground/75"
                  }`}
                >
                  {method.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {method.desc}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};
