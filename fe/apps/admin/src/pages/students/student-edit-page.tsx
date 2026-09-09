import {useEffect, useState} from "react"
import {useParams, useNavigate} from "react-router"
import {ArrowLeft} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Input} from "@fe/components/ui/input"
import {Separator} from "@fe/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@fe/components/ui/select"
import {type Gender, genderLabel, UserStatus} from "@/features/users/constants/users.constants.ts";
import {useUpdateUser, useUser} from "@/features/users/hook/use-user.ts";
import {updateUserSchema} from "@/features/users/schema/user.schema.ts";
import type {User} from "@/features/users/types/user.type.ts";
import {formatDate, parseDate} from "@/features/users/utils/ultis.ts";
import type {City, Country} from "@fe/api/location"
import {locationService} from "@/shared/service/location.service.ts"
import {Field, FieldLabel} from "@fe/components/ui/field.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@fe/components/ui/popover.tsx";
import {PageSkeleton} from "@/features/users/components/skeleton.tsx";
import {Calendar} from "@fe/components/ui/calendar.tsx";
import {AvatarUpload} from "@/features/users/components/avatar-upload.tsx";


interface FormState {
    name: string
    email: string
    password: string
    status: UserStatus
    block_reason: string
    firstName: string
    lastName: string
    gender: Gender
    phone: string
    dateOfBirth: string
    occupation: string
    bio: string
    address: string
    city: string
    country: string
    avatarUrl: string
    avatarFile: File | null
}

function userToForm(user: User): FormState {
    const p = user.profile
    return {
        name: user.name,
        email: user.email,
        password: "",
        status: user.status,
        block_reason: user.blockReason ?? "",
        firstName: p?.firstName ?? "",
        lastName: p?.lastName ?? "",
        gender: p?.gender != null ? String(p.gender) : "",
        phone: p?.phone ?? "",
        dateOfBirth: formatDate(p?.dateOfBirth),
        occupation: p?.occupation ?? "",
        bio: p?.bio ?? "",
        address: p?.address ?? "",
        city: p?.city ?? "",
        country: p?.country ?? "",
        avatarUrl: p?.avatarUrl ?? "",
        avatarFile: null,
    }
}

function validate(form: FormState) {
    const result = updateUserSchema.safeParse({
        ...form,
        role: "STUDENT",
    })
    if (result.success) return {}
    const fieldErrors: Record<string, string | undefined> = {}
    for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return fieldErrors
}

function buildWriteInput(
    form: FormState,
) {
    return {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
        status: form.status,
        role: "STUDENT" as const,
        block_reason:
            form.status === UserStatus.BLOCKED
                ? form.block_reason.trim()
                : "",
        profile: {
            avatarUrl: form.avatarUrl.trim() || null,
            gender: form.gender !== "" ? form.gender : null,
            firstName: form.firstName.trim() || null,
            lastName: form.lastName.trim() || null,
            phone: form.phone.trim() || null,
            dateOfBirth: form.dateOfBirth
                ? new Date(form.dateOfBirth)
                : null,
            address: form.address.trim() || null,
            country: form.country.trim() || null,
            city: form.city.trim() || null,
            occupation: form.occupation.trim() || null,
            bio: form.bio.trim() || null,
        },
    }
}


export function StudentEditPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()

    const userId = id ? Number(id) : 0
    const {data: user, isLoading, isError} = useUser(userId)
    const updateUser = useUpdateUser()

    const [form, setForm] = useState<FormState | null>(null)
    const [errors, setErrors] = useState<Record<string, string | undefined>>({})
    const [countries, setCountries] = useState<Country[]>([])
    const [cities, setCities] = useState<City[]>([])

    const [open, setOpen] = useState(false)
    useEffect(() => {
        if (user) setForm(userToForm(user))
    }, [user])
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

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => (prev ? {...prev, [key]: value} : prev))
        if (key in errors) {
            setErrors((prev) => ({...prev, [key]: undefined}))
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!form || !user) return

        const validationErrors = validate(form)

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setErrors({})

        try {
            const input = buildWriteInput(form)

            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    ...input,
                    avatarFile: form.avatarFile,
                },
            })

            navigate(`/students/${user.id}`)
        } catch (err) {
            setErrors({
                submit:
                    err instanceof Error
                        ? err.message
                        : "Đã xảy ra lỗi không mong muốn",
            })
        }
    }

    if (isLoading) return <PageSkeleton rows={10}/>

    if (isError || !user || !form) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Quay lại danh sách
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h2 className="text-lg font-semibold">Không tìm thấy học viên</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Học viên bạn đang chỉnh sửa không tồn tại.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/students")}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    const submitting = updateUser.isPending
    const selectedDate = parseDate(form.dateOfBirth)
    return (
        <div className="p-6 mx-auto space-y-6 ">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${user.id}`)} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Quay lại học viên
            </Button>

            <div className="rounded-xl border bg-card">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">Chỉnh sửa học viên</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cập nhật thông tin tài khoản và hồ sơ học viên.
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
                    <div className="flex justify-between gap-10">

                        {/* Account Section */}
                        <div className="space-y-4 grow-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-foreground">Tài khoản</h3>
                                <Separator className="flex-1"/>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-name">
                                        Họ và tên
                                    </label>
                                    <Input
                                        id="user-name"
                                        value={form.name}
                                        onChange={(e) => setField("name", e.target.value)}
                                        placeholder="Họ và tên đầy đủ"
                                        disabled
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-email">
                                        Email
                                    </label>
                                    <Input
                                        id="user-email"
                                        type="email"
                                        disabled
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
                                        Mật khẩu
                                    </label>
                                    <Input
                                        id="user-password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setField("password", e.target.value)}
                                        placeholder="Để trống nếu giữ nguyên"
                                        aria-invalid={!!errors.password}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Trạng thái</label>
                                    <Select
                                        disabled
                                        value={form.status}
                                        onValueChange={(val) => setField("status", val as UserStatus)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue disabled/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(UserStatus).map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {form.status === UserStatus.BLOCKED && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-block-reason">
                                            Lý do chặn
                                        </label>
                                        <Input
                                            id="user-block-reason"
                                            value={form.block_reason}
                                            disabled
                                            onChange={(e) => setField("block_reason", e.target.value)}
                                            placeholder="Lý do chặn học viên này"
                                            aria-invalid={!!errors.block_reason}
                                        />
                                        {errors.block_reason && (
                                            <p className="text-xs text-destructive">{errors.block_reason}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Profile Section */}
                        <div className="space-y-4 grow-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-foreground">Hồ sơ</h3>
                                <Separator className="flex-1"/>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-firstName">
                                            Tên
                                        </label>
                                        <Input
                                            id="user-firstName"
                                            value={form.firstName}
                                            onChange={(e) => setField("firstName", e.target.value)}
                                            placeholder="Tên"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-lastName">
                                            Họ
                                        </label>
                                        <Input
                                            id="user-lastName"
                                            value={form.lastName}
                                            onChange={(e) => setField("lastName", e.target.value)}
                                            placeholder="Họ"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Giới tính</label>
                                    <Select
                                        value={form.gender}
                                        onValueChange={(val) => setField("gender", val as Gender)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn giới tính">
                                                {form.gender ? genderLabel[form.gender] : "Chọn giới tính"}
                                            </SelectValue>
                                        </SelectTrigger>

                                        <SelectContent>
                                            {Object.entries(genderLabel).map(([val, label]) => (
                                                <SelectItem key={val} value={val}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-phone">
                                        Số điện thoại
                                    </label>
                                    <Input
                                        id="user-phone"
                                        value={form.phone}
                                        onChange={(e) => setField("phone", e.target.value)}
                                        placeholder="+84 900 000 000"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Field>
                                        <FieldLabel htmlFor="date">Ngày sinh</FieldLabel>

                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger
                                                render={
                                                    <Button
                                                        variant="outline"
                                                        id="date"
                                                        className="justify-start font-normal"
                                                    >
                                                        {selectedDate
                                                            ? selectedDate.toLocaleDateString()
                                                            : "Chọn ngày"}
                                                    </Button>
                                                }
                                            />

                                            <PopoverContent
                                                className="w-auto overflow-hidden p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    defaultMonth={selectedDate ?? new Date()}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        setField(
                                                            "dateOfBirth",
                                                            date ? date.toISOString().split("T")[0] : null
                                                        )
                                                        setOpen(false)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </Field>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-occupation">
                                        Nghề nghiệp
                                    </label>
                                    <Input
                                        id="user-occupation"
                                        value={form.occupation}
                                        onChange={(e) => setField("occupation", e.target.value)}
                                        placeholder="VD: Kỹ sư phần mềm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-bio">
                                        Giới thiệu
                                    </label>
                                    <textarea
                                        id="user-bio"
                                        value={form.bio}
                                        onChange={(e) => setField("bio", e.target.value)}
                                        placeholder="Giới thiệu ngắn..."
                                        rows={3}
                                        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-address">
                                        Địa chỉ
                                    </label>
                                    <Input
                                        id="user-address"
                                        value={form.address}
                                        onChange={(e) => setField("address", e.target.value)}
                                        placeholder="Địa chỉ"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* City */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">
                                            Tỉnh/Thành phố
                                        </label>

                                        <Select
                                            value={form.city}
                                            onValueChange={(value) => setField("city", value)}
                                            disabled={!form.country}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn tỉnh/thành phố"/>
                                            </SelectTrigger>

                                            <SelectContent>
                                                {cities.map((city) => (
                                                    <SelectItem
                                                        key={city.id}
                                                        value={city.name}
                                                    >
                                                        {city.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">
                                            Quốc gia
                                        </label>

                                        <Select
                                            value={form.country}
                                            onValueChange={(value) => {
                                                setField("country", value)
                                                setField("city", "")
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Chọn quốc gia"/>
                                            </SelectTrigger>

                                            <SelectContent>
                                                {countries.map((country) => (
                                                    <SelectItem
                                                        key={country.id}
                                                        value={country.code}
                                                    >
                                                        {country.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-avatarUrl">
                                        Ảnh đại diện
                                    </label>
                                    <AvatarUpload
                                        value={form.avatarUrl}
                                        onChange={(file) => setField("avatarFile", file)}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

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
                            onClick={() => navigate(`/students/${user.id}`)}
                            disabled={submitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
