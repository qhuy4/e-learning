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
import {type Gender, genderLabel, UserRole, UserStatus} from "@/features/users/constants/users.constants.ts";
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
    role: UserRole
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
        role: user.role,
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
    const result = updateUserSchema.safeParse(form)
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
        role: form.role,
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


export function UserEditPage() {
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

            navigate(`/users/${user.id}`)
        } catch (err) {
            setErrors({
                submit:
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred",
            })
        }
    }

    if (isLoading) return <PageSkeleton rows={10}/>

    if (isError || !user || !form) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Back to Users
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h2 className="text-lg font-semibold">User not found</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        The user you are trying to edit does not exist.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/users")}>
                        Back to Users
                    </Button>
                </div>
            </div>
        )
    }

    const submitting = updateUser.isPending
    const selectedDate = parseDate(form.dateOfBirth)
    return (
        <div className="p-6 mx-auto space-y-6 ">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${user.id}`)} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Back to User
            </Button>

            <div className="rounded-xl border bg-card">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">Edit User</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update the user's account and profile information.
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
                    <div className="flex justify-between gap-10">

                        {/* Account Section */}
                        <div className="space-y-4 grow-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-foreground">Account</h3>
                                <Separator className="flex-1"/>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-name">
                                        Name
                                    </label>
                                    <Input
                                        id="user-name"
                                        value={form.name}
                                        onChange={(e) => setField("name", e.target.value)}
                                        placeholder="Full name"
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
                                        Password
                                    </label>
                                    <Input
                                        id="user-password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setField("password", e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        aria-invalid={!!errors.password}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Status</label>
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

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select
                                            value={form.role}
                                            onValueChange={(val) => setField("role", val as UserRole)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(UserRole).map((r) => (
                                                    <SelectItem key={r} value={r}>
                                                        {r}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {form.status === UserStatus.BLOCKED && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-block-reason">
                                            Block Reason
                                        </label>
                                        <Input
                                            id="user-block-reason"
                                            value={form.block_reason}
                                            disabled
                                            onChange={(e) => setField("block_reason", e.target.value)}
                                            placeholder="Reason for blocking this user"
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
                                <h3 className="text-sm font-semibold text-foreground">Profile</h3>
                                <Separator className="flex-1"/>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-firstName">
                                            First Name
                                        </label>
                                        <Input
                                            id="user-firstName"
                                            value={form.firstName}
                                            onChange={(e) => setField("firstName", e.target.value)}
                                            placeholder="First"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium" htmlFor="user-lastName">
                                            Last Name
                                        </label>
                                        <Input
                                            id="user-lastName"
                                            value={form.lastName}
                                            onChange={(e) => setField("lastName", e.target.value)}
                                            placeholder="Last"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Gender</label>
                                    <Select
                                        value={form.gender}
                                        onValueChange={(val) => setField("gender", val as Gender)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select gender">
                                                {form.gender ? genderLabel[form.gender] : "Select gender"}
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
                                        Phone
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
                                        <FieldLabel htmlFor="date">Date of birth</FieldLabel>

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
                                                            : "Select date"}
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
                                        Occupation
                                    </label>
                                    <Input
                                        id="user-occupation"
                                        value={form.occupation}
                                        onChange={(e) => setField("occupation", e.target.value)}
                                        placeholder="e.g. Software Engineer"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-bio">
                                        Bio
                                    </label>
                                    <textarea
                                        id="user-bio"
                                        value={form.bio}
                                        onChange={(e) => setField("bio", e.target.value)}
                                        placeholder="Short bio..."
                                        rows={3}
                                        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="user-address">
                                        Address
                                    </label>
                                    <Input
                                        id="user-address"
                                        value={form.address}
                                        onChange={(e) => setField("address", e.target.value)}
                                        placeholder="Street address"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* City */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">
                                            City
                                        </label>

                                        <Select
                                            value={form.city}
                                            onValueChange={(value) => setField("city", value)}
                                            disabled={!form.country}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select city"/>
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
                                            Country
                                        </label>

                                        <Select
                                            value={form.country}
                                            onValueChange={(value) => {
                                                setField("country", value)
                                                setField("city", "")
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select country"/>
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
                                        Avatar
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
                            onClick={() => navigate(`/users/${user.id}`)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
