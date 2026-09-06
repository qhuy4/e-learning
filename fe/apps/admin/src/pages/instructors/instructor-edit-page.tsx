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
import {UserStatus} from "@/features/users/constants/users.constants.ts";
import {useInstructor, useUpdateInstructor} from "@/features/instructors/hook/use-instructors.ts";
import type {Instructor} from "@/features/instructors/type/instructor.ts";
import {PageSkeleton} from "@/features/users/components/skeleton.tsx";


interface FormState {
    name: string
    email: string
    status: UserStatus
    headline: string
    bio: string
    websiteUrl: string
    socialLinks: string
}

function instructorToForm(instructor: Instructor): FormState {
    const p = instructor.profile
    return {
        name: instructor.name,
        email: instructor.email,
        status: instructor.status,
        headline: p?.headline ?? "",
        bio: p?.bio ?? "",
        websiteUrl: p?.websiteUrl ?? "",
        socialLinks: p?.socialLinks ? JSON.stringify(p.socialLinks, null, 2) : "",
    }
}

function buildUpdateInput(form: FormState) {
    let parsedSocialLinks: Record<string, string> | null = null
    if (form.socialLinks.trim()) {
        try {
            parsedSocialLinks = JSON.parse(form.socialLinks)
        } catch {
            // keep null on parse error
        }
    }

    return {
        name: form.name.trim(),
        email: form.email.trim(),
        status: form.status,
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
        socialLinks: parsedSocialLinks,
    }
}


export function InstructorEditPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()

    const instructorId = id ? Number(id) : 0
    const {data: instructor, isLoading, isError} = useInstructor(instructorId)
    const updateInstructor = useUpdateInstructor()

    const [form, setForm] = useState<FormState | null>(null)
    const [errors, setErrors] = useState<Record<string, string | undefined>>({})

    useEffect(() => {
        if (instructor) setForm(instructorToForm(instructor))
    }, [instructor])

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => (prev ? {...prev, [key]: value} : prev))
        if (key in errors) {
            setErrors((prev) => ({...prev, [key]: undefined}))
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!form || !instructor) return

        const fieldErrors: Record<string, string | undefined> = {}
        if (!form.name.trim()) fieldErrors.name = "Name is required"
        if (!form.email.trim()) fieldErrors.email = "Email is required"

        if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
            return
        }

        setErrors({})

        try {
            const input = buildUpdateInput(form)

            await updateInstructor.mutateAsync({
                id: instructor.id,
                data: input,
            })

            navigate(`/instructors/${instructor.id}`)
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

    if (isError || !instructor || !form) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/instructors")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Back to Instructors
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h2 className="text-lg font-semibold">Instructor not found</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        The instructor you are trying to edit does not exist.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/instructors")}>
                        Back to Instructors
                    </Button>
                </div>
            </div>
        )
    }

    const submitting = updateInstructor.isPending

    return (
        <div className="p-6 mx-auto space-y-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/instructors/${instructor.id}`)} className="-ml-2">
                <ArrowLeft className="size-4"/>
                Back to Instructor
            </Button>

            <div className="rounded-xl border bg-card">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">Edit Instructor</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update the instructor's account and profile information.
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
                                    <label className="text-sm font-medium" htmlFor="instructor-name">
                                        Name
                                    </label>
                                    <Input
                                        id="instructor-name"
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
                                    <label className="text-sm font-medium" htmlFor="instructor-email">
                                        Email
                                    </label>
                                    <Input
                                        id="instructor-email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setField("email", e.target.value)}
                                        placeholder="instructor@example.com"
                                        aria-invalid={!!errors.email}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={form.status}
                                        onValueChange={(val) => setField("status", val as UserStatus)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue/>
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
                            </div>
                        </div>

                        {/* Instructor Profile Section */}
                        <div className="space-y-4 grow-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-semibold text-foreground">Instructor Profile</h3>
                                <Separator className="flex-1"/>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="instructor-headline">
                                        Headline
                                    </label>
                                    <Input
                                        id="instructor-headline"
                                        value={form.headline}
                                        onChange={(e) => setField("headline", e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="instructor-websiteUrl">
                                        Website URL
                                    </label>
                                    <Input
                                        id="instructor-websiteUrl"
                                        value={form.websiteUrl}
                                        onChange={(e) => setField("websiteUrl", e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="instructor-bio">
                                        Bio
                                    </label>
                                    <textarea
                                        id="instructor-bio"
                                        value={form.bio}
                                        onChange={(e) => setField("bio", e.target.value)}
                                        placeholder="Short bio..."
                                        rows={4}
                                        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="instructor-socialLinks">
                                        Social Links (JSON)
                                    </label>
                                    <textarea
                                        id="instructor-socialLinks"
                                        value={form.socialLinks}
                                        onChange={(e) => setField("socialLinks", e.target.value)}
                                        placeholder={'{"facebook": "https://...", "linkedin": "https://..."}'}
                                        rows={3}
                                        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm font-mono transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"
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
                            onClick={() => navigate(`/instructors/${instructor.id}`)}
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
