import { useState } from "react";
import { Wallet, CreditCard, History } from "lucide-react";
import { cn } from "@fe/lib/utils";
import { WithdrawRequestTab } from "./withdraw-request-tab";
import { PayoutHistoryTab } from "./payout-history-tab";
import { PayoutAccountsTab } from "./payout-accounts-tab";

const TABS = [
  { key: "withdraw", label: "Rút tiền", icon: Wallet },
  { key: "history", label: "Lịch sử thanh toán", icon: History },
  { key: "accounts", label: "Tài khoản nhận tiền", icon: CreditCard },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("withdraw");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thanh toán</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tài khoản nhận tiền và yêu cầu rút tiền.
        </p>
      </div>

      <div className="border-b">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                activeTab === tab.key
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-2">
        {activeTab === "withdraw" && <WithdrawRequestTab />}
        {activeTab === "history" && <PayoutHistoryTab />}
        {activeTab === "accounts" && <PayoutAccountsTab />}
      </div>
    </div>
  );
}
