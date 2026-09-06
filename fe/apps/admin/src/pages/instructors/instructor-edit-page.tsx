import {useEffect, useState} from "react"
import {useParams, useNavigate} from "react-router"
import {ArrowLeft, Plus, Trash2} from "lucide-react"

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

const SOCIAL_PLATFORMS = [
    {value: "facebook", label: "Facebook"},
    {value: "linkedin", label: "LinkedIn"},
    {value: "twitter", label: "Twitter / X"},
    {value: "youtube", label: "YouTube"},
    {value: "instagram", label: "Instagram"},
    {value: "github", label: "GitHub"},
    {value: "website", label: "Website"},
] as const;

interface SocialLinkItem {
    platform: string
    url: string
}

interface FormState {
    name: string
    email: string
    status: UserStatus
    headline: string
    bio: string
    websiteUrl: string
    socialLinks: SocialLinkItem[]
}

function socialLinksToItems(links: Record<string, string> | null | undefined): SocialLinkItem[] {
    if (!links || typeof links !== "object") return []
    return Object.entries(links).map(([platform, url]) => ({platform, url}))
}

function itemsToSocialLinks(items: SocialLinkItem[]): Record<string, string> | null {
    const filtered = items.filter((item) => item.platform && item.url.trim())
    if (filtered.length === 0) return null
    return Object.fromEntries(filtered.map((item) => [item.platform, item.url.trim()]))
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
        socialLinks: socialLinksToItems(p?.socialLinks),
    }
}

function buildUpdateInput(form: FormState) {
    return {
        name: form.name.trim(),
        email: form.email.trim(),
        status: form.status,
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
        socialLinks: itemsToSocialLinks(form.socialLinks),
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

    function addSocialLink() {
        setForm((prev) => {
            if (!prev) return prev
            const usedPlatforms = prev.socialLinks.map((l) => l.platform)
            const available = SOCIAL_PLATFORMS.find((p) => !usedPlatforms.includes(p.value))
            return {
                ...prev,
                socialLinks: [
                    ...prev.socialLinks,
                    {platform: available?.value ?? "", url: ""},
                ],
            }
        })
    }

    function removeSocialLink(index: number) {
        setForm((prev) => {
            if (!prev) return prev
            return {
                ...prev,
                socialLinks: prev.socialLinks.filter((_, i) => i !== index),
            }
        })
    }

    function updateSocialLink(index: number, field: "platform" | "url", value: string) {
        setForm((prev) => {
            if (!prev) return prev
            const updated = [...prev.socialLinks]
            updated[index] = {...updated[index], [field]: value}
            return {...prev, socialLinks: updated}
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!form || !instructor) return

        const fieldErrors: Record<string, string | undefined> = {}
        if (!form.name.trim()) fieldErrors.name = "Tên không được để trống"
        if (!form.email.trim()) fieldErrors.email = "Email không được để trống"

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
                        : "Đã xảy ra lỗi không mong muốn",
            })
        }
    }

    if (isLoading) return <PageSkeleton rows={10}/>

    if (isError || !instructor || !form) {
        return (
            <div className="p-6 max-w-3xl mx-auto">
                <Button variant="ghost" size="sm" onClick={() => navigate("/instructors")} className="mb-6 -ml-2">
                    <ArrowLeft className="size-4"/>
                    Quay lại danh sách
                </Button>
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h2 className="text-lg font-semibold">Không tìm thấy giảng viên</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Giảng viên bạn đang chỉnh sửa không tồn tại.
                    </p>
                    <Button className="mt-6" onClick={() => navigate("/instructors")}>
                        Quay lại danh sách
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
                Quay lại giảng viên
            </Button>

            <div className="rounded-xl border bg-card">
                <div className="px-6 py-4 border-b">
                    <h1 className="text-xl font-bold">Chỉnh sửa giảng viên</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Cập nhật thông tin tài khoản và hồ sơ giảng viên.
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
                                    <label className="text-sm font-medium" htmlFor="instructor-name">
                                        Họ và tên
                                    </label>
                                    <Input
                                        id="instructor-name"
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
                                    <label className="text-sm font-medium">Trạng thái</label>
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
                                <h3 className="text-sm font-semibold text-foreground">Hồ sơ giảng viên</h3>
                                <Separator className="flex-1"/>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="instructor-headline">
                                        Tiêu đề
                                    </label>
                                    <Input
                                        id="instructor-headline"
                                        value={form.headline}
                                        onChange={(e) => setField("headline", e.target.value)}
                                        placeholder="VD: Kỹ sư phần mềm cấp cao"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium" htmlFor="instructor-websiteUrl">
                                        URL Website
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
                                        Giới thiệu
                                    </label>
                                    <textarea
                                        id="instructor-bio"
                                        value={form.bio}
                                        onChange={(e) => setField("bio", e.target.value)}
                                        placeholder="Giới thiệu ngắn..."
                                        rows={4}
                                        className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none dark:bg-input/30"
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Liên kết mạng xã hội</label>
                                    {form.socialLinks.map((link, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Select
                                                value={link.platform}
                                                onValueChange={(val) => updateSocialLink(index, "platform", val)}
                                            >
                                                <SelectTrigger className="w-[140px] shrink-0">
                                                    <SelectValue placeholder="Nền tảng"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SOCIAL_PLATFORMS.map((p) => (
                                                        <SelectItem key={p.value} value={p.value}>
                                                            {p.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                value={link.url}
                                                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => removeSocialLink(index)}
                                            >
                                                <Trash2 className="size-4 text-destructive"/>
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addSocialLink}
                                        disabled={form.socialLinks.length >= SOCIAL_PLATFORMS.length}
                                    >
                                        <Plus className="size-4 mr-1"/>
                                        Thêm liên kết
                                    </Button>
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
