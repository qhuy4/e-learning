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
import {genderLabel, UserRole, UserStatus} from "@/features/users/constants/users.constants.ts";
import {createUserSchema} from "@/features/users/schema/user.schema.ts";
import {useCreateUser} from "@/features/users/hook/use-user.ts";
import {useCreateForm} from "@/features/users/hook/use-create-form.ts";
import {useEffect, useState} from "react";
import {locationService} from "@/shared/service/location.service.ts";
import type {City, Country} from "@fe/api/location";
import {Field, FieldLabel} from "@fe/components/ui/field.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@fe/components/ui/popover.tsx";
import {Calendar} from "@fe/components/ui/calendar.tsx";
import {formatDate} from "@/features/users/utils/ultis.ts";



function emptyForm() {
    return {
        name: "",
        email: "",
        password: "",
        status: UserStatus.PENDING,
        role: UserRole.STUDENT,
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
        block_reason: form.status === UserStatus.BLOCKED ? form.block_reason.trim() : "",
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
    const [open, setOpen] = useState(false)


    const { form, errors, setField, handleSubmit } = useCreateForm({
        emptyForm: emptyForm(),
        validate,
        buildOutput: buildWriteInput,
        create: (data) => createUser.mutateAsync(data),
        successMessage: "User created successfully",
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
                Back to Users
            </Button>

            <div className="rounded-xl border bg-card">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">Create User</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Fill in the details to create a new user account.
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">
                    <div className="flex justify-between gap-10">
                        {/* Account Section */}
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
                                        value={form.name}
                                        onChange={(e) => setField("name", e.target.value)}
                                        placeholder="Full name"
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
                                        Password <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        id="user-password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setField("password", e.target.value)}
                                        placeholder="Enter password"
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
                                                <SelectValue />
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
                                                <SelectValue />
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
                                            Block Reason <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="user-block-reason"
                                            value={form.block_reason}
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
                        {/*<div className="space-y-4 grow-1">*/}
                        {/*    <div className="flex items-center gap-3">*/}
                        {/*        <h3 className="text-sm font-semibold text-foreground">Profile</h3>*/}
                        {/*        <Separator className="flex-1" />*/}
                        {/*    </div>*/}
                        
                        {/*    <div className="grid grid-cols-1 gap-3">*/}
                        {/*        <div className="grid grid-cols-2 gap-3">*/}
                        {/*            <div className="space-y-1.5">*/}
                        {/*                <label className="text-sm font-medium" htmlFor="user-firstName">*/}
                        {/*                    First Name*/}
                        {/*                </label>*/}
                        {/*                <Input*/}
                        {/*                    id="user-firstName"*/}
                        {/*                    value={form.firstName}*/}
                        {/*                    onChange={(e) => setField("firstName", e.target.value)}*/}
                        {/*                    placeholder="First"*/}
                        {/*                />*/}
                        {/*            </div>*/}
                        {/*            <div className="space-y-1.5">*/}
                        {/*                <label className="text-sm font-medium" htmlFor="user-lastName">*/}
                        {/*                    Last Name*/}
                        {/*                </label>*/}
                        {/*                <Input*/}
                        {/*                    id="user-lastName"*/}
                        {/*                    value={form.lastName}*/}
                        {/*                    onChange={(e) => setField("lastName", e.target.value)}*/}
                        {/*                    placeholder="Last"*/}
                        {/*                />*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <label className="text-sm font-medium">Gender <span className="text-destructive">*</span></label>*/}
                        {/*            <Select*/}
                        {/*                value={form.gender}*/}
                        {/*                onValueChange={(val) => setField("gender", val ?? "")}*/}
                        {/*            >*/}
                        {/*                <SelectTrigger className="w-full">*/}
                        {/*                    <SelectValue placeholder="Select gender" />*/}
                        {/*                </SelectTrigger>*/}
                        {/*                <SelectContent>*/}
                        {/*                    {Object.entries(genderLabel).map(([val, label]) => (*/}
                        {/*                        <SelectItem key={val} value={val}>*/}
                        {/*                            {label}*/}
                        {/*                        </SelectItem>*/}
                        {/*                    ))}*/}
                        {/*                </SelectContent>*/}
                        {/*            </Select>*/}
                        {/*            {errors.gender && (*/}
                        {/*                <p className="text-xs text-destructive">{errors.gender}</p>*/}
                        {/*            )}*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <label className="text-sm font-medium" htmlFor="user-phone">*/}
                        {/*                Phone*/}
                        {/*            </label>*/}
                        {/*            <Input*/}
                        {/*                id="user-phone"*/}
                        {/*                value={form.phone}*/}
                        {/*                onChange={(e) => setField("phone", e.target.value)}*/}
                        {/*                placeholder="+84 900 000 000"*/}
                        {/*            />*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <Field className="">*/}
                        {/*                <FieldLabel htmlFor="date">Date of birth</FieldLabel>*/}
                        {/*                <Popover open={open} onOpenChange={setOpen}>*/}
                        {/*                    <PopoverTrigger*/}
                        {/*                        render={*/}
                        {/*                            <Button*/}
                        {/*                                variant="outline"*/}
                        {/*                                id="date"*/}
                        {/*                                className="justify-start font-normal"*/}
                        {/*                            >*/}
                        {/*                                {form.dateOfBirth*/}
                        {/*                                    ? new Date(form.dateOfBirth).toLocaleDateString()*/}
                        {/*                                    : "Select date"}*/}
                        {/*                            </Button>*/}
                        {/*                        }*/}
                        {/*                    /> <PopoverContent className="w-auto overflow-hidden p-0" align="start">*/}
                        {/*                    <Calendar*/}
                        {/*                        mode="single"*/}
                        {/*                        selected={formatDate(form.dateOfBirth)}*/}
                        {/*                        defaultMonth={formatDate(form.dateOfBirth)}*/}
                        {/*                        captionLayout="dropdown"*/}
                        {/*                        onSelect={(date) => {*/}
                        {/*                            setField(*/}
                        {/*                                "dateOfBirth",*/}
                        {/*                                date ? date.toISOString().split("T")[0] : ""*/}
                        {/*                            )*/}
                        {/*                            setOpen(false)*/}
                        {/*                        }}*/}
                        {/*                    />*/}
                        {/*                </PopoverContent>*/}
                        {/*                </Popover>*/}
                        {/*            </Field>*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <label className="text-sm font-medium" htmlFor="user-occupation">*/}
                        {/*                Occupation*/}
                        {/*            </label>*/}
                        {/*            <Input*/}
                        {/*                id="user-occupation"*/}
                        {/*                value={form.occupation}*/}
                        {/*                onChange={(e) => setField("occupation", e.target.value)}*/}
                        {/*                placeholder="e.g. Software Engineer"*/}
                        {/*            />*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <label className="text-sm font-medium" htmlFor="user-bio">*/}
                        {/*                Bio*/}
                        {/*            </label>*/}
                        {/*            <textarea*/}
                        {/*                id="user-bio"*/}
                        {/*                value={form.bio}*/}
                        {/*                onChange={(e) => setField("bio", e.target.value)}*/}
                        {/*                placeholder="Short bio..."*/}
                        {/*                rows={3}*/}
                        {/*                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"*/}
                        {/*            />*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <label className="text-sm font-medium" htmlFor="user-address">*/}
                        {/*                Address*/}
                        {/*            </label>*/}
                        {/*            <Input*/}
                        {/*                id="user-address"*/}
                        {/*                value={form.address}*/}
                        {/*                onChange={(e) => setField("address", e.target.value)}*/}
                        {/*                placeholder="Street address"*/}
                        {/*            />*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="grid grid-cols-2 gap-3">*/}
                        {/*            /!* City *!/*/}
                        {/*            <div className="space-y-1.5">*/}
                        {/*                <label className="text-sm font-medium">*/}
                        {/*                    City*/}
                        {/*                </label>*/}
                        
                        {/*                <Select*/}
                        {/*                    value={form.city}*/}
                        {/*                    onValueChange={(value) => setField("city", value)}*/}
                        {/*                    disabled={!form.country}*/}
                        {/*                >*/}
                        {/*                    <SelectTrigger className="w-full">*/}
                        {/*                        <SelectValue placeholder="Select city"/>*/}
                        {/*                    </SelectTrigger>*/}
                        
                        {/*                    <SelectContent>*/}
                        {/*                        {cities.map((city) => (*/}
                        {/*                            <SelectItem*/}
                        {/*                                key={city.id}*/}
                        {/*                                value={city.name}*/}
                        {/*                            >*/}
                        {/*                                {city.name}*/}
                        {/*                            </SelectItem>*/}
                        {/*                        ))}*/}
                        {/*                    </SelectContent>*/}
                        {/*                </Select>*/}
                        {/*            </div>*/}
                        
                        {/*            /!* Country *!/*/}
                        {/*            <div className="space-y-1.5">*/}
                        {/*                <label className="text-sm font-medium">*/}
                        {/*                    Country*/}
                        {/*                </label>*/}
                        
                        {/*                <Select*/}
                        {/*                    value={form.country}*/}
                        {/*                    onValueChange={(value) => {*/}
                        {/*                        setField("country", value)*/}
                        {/*                        setField("city", "")*/}
                        {/*                    }}*/}
                        {/*                >*/}
                        {/*                    <SelectTrigger className="w-full">*/}
                        {/*                        <SelectValue placeholder="Select country"/>*/}
                        {/*                    </SelectTrigger>*/}
                        
                        {/*                    <SelectContent>*/}
                        {/*                        {countries.map((country) => (*/}
                        {/*                            <SelectItem*/}
                        {/*                                key={country.id}*/}
                        {/*                                value={country.code}*/}
                        {/*                            >*/}
                        {/*                                {country.name}*/}
                        {/*                            </SelectItem>*/}
                        {/*                        ))}*/}
                        {/*                    </SelectContent>*/}
                        {/*                </Select>*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        
                        {/*        <div className="space-y-1.5">*/}
                        {/*            <label className="text-sm font-medium" htmlFor="user-avatarUrl">*/}
                        {/*                Avatar URL*/}
                        {/*            </label>*/}
                        {/*            <Input*/}
                        {/*                id="user-avatarUrl"*/}
                        {/*                value={form?.avatarUrl}*/}
                        {/*                onChange={(e) => setField("avatarUrl", e.target.value)}*/}
                        {/*                placeholder="https://..."*/}
                        {/*            />*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
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
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createUser.isPending}>
                            {createUser.isPending ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
