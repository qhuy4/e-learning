import { Input } from "@fe/components/ui/input"
import { Separator } from "@fe/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select"
import { UserRole, UserStatus } from "@/features/users/constants/users.constants.ts"

export interface AccountFieldsValues {
    name: string
    email: string
    password: string
    status: UserStatus
    role: UserRole
    blockReason: string
}
interface AccountFieldsProps {
    values: AccountFieldsValues
    errors: Partial<Record<keyof AccountFieldsValues, string>>
    onChange: <K extends keyof AccountFieldsValues>(key: K, value: AccountFieldsValues[K]) => void
    passwordRequired?: boolean
    passwordLabel?: string
    passwordPlaceholder?: string
}

export function AccountFields({
    values,
    errors,
    onChange,
    passwordRequired = false,
    passwordLabel = "Password",
    passwordPlaceholder = "Enter password",
}: AccountFieldsProps) {
    return (
        <div className="space-y-4 grow-1">
            <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-foreground">Account</h3>
                <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="user-name">
                        Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="user-name"
                        value={values.name}
                        onChange={(e) => onChange("name", e.target.value)}
                        placeholder="Full name"
                        aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="user-email">
                        Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id="user-email"
                        type="email"
                        value={values.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        placeholder="user@example.com"
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="user-password">
                        {passwordLabel} {passwordRequired && <span className="text-destructive">*</span>}
                    </label>
                    <Input
                        id="user-password"
                        type="password"
                        value={values.password}
                        onChange={(e) => onChange("password", e.target.value)}
                        placeholder={passwordPlaceholder}
                        aria-invalid={!!errors.password}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={values.status} onValueChange={(val) => onChange("status", val as UserStatus)}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.values(UserStatus).map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Role</label>
                        <Select value={values.role} onValueChange={(val) => onChange("role", val as UserRole)}>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {Object.values(UserRole).map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {values.status === UserStatus.BLOCKED && (
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="user-block-reason">
                            Block Reason <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="user-block-reason"
                            value={values.blockReason}
                            onChange={(e) => onChange("blockReason", e.target.value)}
                            placeholder="Reason for blocking this user"
                            aria-invalid={!!errors.blockReason}
                        />
                        {errors.blockReason && <p className="text-xs text-destructive">{errors.blockReason}</p>}
                    </div>
                )}
            </div>
        </div>
    )
}