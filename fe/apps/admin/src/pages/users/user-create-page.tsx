import { useNavigate } from "react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@fe/components/ui/button"
import { Input } from "@fe/components/ui/input"
import { Separator } from "@fe/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@fe/components/ui/select"
import {type Gender, genderLabel, type UserRole, UserRole as UserRoles, type UserStatus, UserStatus as UserStatuses} from "@/features/users/constants/users.constants.ts";
import {createUserSchema} from "@/features/users/schema/user.schema.ts";
import {useCreateUser} from "@/features/users/hook/use-user.ts";
import {useCreateForm} from "@/features/users/hook/use-create-form.ts";
import {useEffect, useState} from "react";
import {locationService} from "@/shared/service/location.service.ts";
import type {City, Country} from "@fe/api/location";

interface UserCreateFormState {
    name: string; email: string; password: string; status: UserStatus; role: UserRole;
    block_reason: string; firstName: string; lastName: string; gender: Gender | "";
    phone: string; dateOfBirth: string; occupation: string; bio: string; address: string;
    city: string; country: string; avatarUrl: string;
}

function emptyForm(): UserCreateFormState {
    return {
        name: "",
        email: "",
        password: "",
        status: UserStatuses.PENDING,
        role: UserRoles.STUDENT,
        block_reason: "",
        firstName: "",
        lastName: "",
        gender: "",
        phone: "",
        dateOfBirth: "",
        occupation: "",
        bio: "",
        address: "",
        city: "",
        country: "",
        avatarUrl: "",
    }
}

function validate(form: ReturnType<typeof emptyForm>) {
    const result = createUserSchema.safeParse(form)
    if (result.success) return {}
    const fieldErrors: Record<string, string | undefined> = {}
    for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return fieldErrors
}

function buildWriteInput(form: ReturnType<typeof emptyForm>) {
    return {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
        status: form.status,
        role: form.role,
        block_reason: form.status === UserStatuses.BLOCKED ? form.block_reason.trim() : "",
        profile: {
            avatarUrl: form?.avatarUrl.trim() || null,
            gender: form.gender !== "" ? form.gender : null,
            firstName: form.firstName.trim() || null,
            lastName: form.lastName.trim() || null,
            phone: form.phone.trim() || null,
            dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
            address: form.address.trim() || null,
            country: form.country.trim() || null,
            city: form.city.trim() || null,
            occupation: form.occupation.trim() || null,
            bio: form.bio.trim() || null,
        },
    }
}

export function UserCreatePage() {
    const navigate = useNavigate()
    const createUser = useCreateUser()
    const [countries, setCountries] = useState<Country[]>([])
    const [cities, setCities] = useState<City[]>([])


    const { form, errors, setField, handleSubmit } = useCreateForm({
        emptyForm: emptyForm(),
        validate,
        buildOutput: buildWriteInput,
        create: (data) => createUser.mutateAsync(data),
        successMessage: "Tạo người dùng thành công",
        redirectTo: "/users",
    })
    useEffect(() => {
        locationService
            .getCountries()
            .then(setCountries)
            .catch(console.error)
    }, [])
    useEffect(() => {
        if (!form?.country) {
            setCities([])
            return
        }

        locationService
            .getCities(form.country)
            .then(setCities)
            .catch(console.error)
    }, [form?.country])
    return (
        <div className="p-6  mx-auto space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="-ml-2">
                <ArrowLeft className="size-4" />
                Quay lại danh sách
            </Button>

            <div className="rounded-xl border bg-card">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">Tạo người dùng mới</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Nhập thông tin để tạo tài khoản người dùng mới.
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
                    <div className="flex justify-between gap-10">
                        {/* Account Section */}
                        <div className="space-y-4 grow-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-foreground">Tài khoản</h3>
                                <Separator className="flex-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-name">
                                        Họ và tên <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="user-name"
                                        value={form.name}
                                        onChange={(e) => setField("name", e.target.value)}
                                        placeholder="Họ và tên đầy đủ"
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-email">
                                        Email <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="user-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setField("email", e.target.value)}
                                        placeholder="user@example.com"
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-password">
                                        Mật khẩu <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="user-password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setField("password", e.target.value)}
                                        placeholder="Nhập mật khẩu"
                                        aria-invalid={!!errors.password}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Trạng thái</label>
                                        <Select
                                            disabled
                                            value={form.status}
                                            onValueChange={(val) => setField("status", val as UserStatus)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(UserStatuses).map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Vai trò</label>
                                        <Select
                                            value={form.role}
                                            onValueChange={(val) => setField("role", val as UserRole)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(UserRoles).map((r) => (
                                                    <SelectItem key={r} value={r}>
                                                        {r}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {form.status === UserStatuses.BLOCKED && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-block-reason">
                                            Lý do chặn <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="user-block-reason"
                                            value={form.block_reason}
                                            onChange={(e) => setField("block_reason", e.target.value)}
                                            placeholder="Lý do chặn người dùng này"
                                            aria-invalid={!!errors.block_reason}
                                        />
                                        {errors.block_reason && (
                                            <p className="text-xs text-destructive">{errors.block_reason}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Section (commented out in original) */}
                    </div>


                    {errors.submit && (
                        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                            {errors.submit}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/users")}
                            disabled={createUser.isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={createUser.isPending}>
                            {createUser.isPending ? "Đang tạo..." : "Tạo người dùng"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
