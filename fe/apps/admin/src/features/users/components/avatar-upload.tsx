import {useState, useRef, useCallback} from "react"
import {Upload, X, Link, ImageIcon} from "lucide-react"

import {Button} from "@fe/components/ui/button"
import {Input} from "@fe/components/ui/input"
import {cn} from "@fe/lib/utils"

interface AvatarUploadProps {
    value: string
    onChange: (file: File) => void
    className?: string
    disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export function AvatarUpload({value, onChange, className, disabled}: AvatarUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        value || null
    )
    const validateFile = (file: File): string | null => {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return "Invalid file type. Please upload JPEG, PNG, WebP, or GIF."
        }
        if (file.size > MAX_FILE_SIZE) {
            return "File too large. Maximum size is 5MB."
        }
        return null
    }
    const handleFile = (file: File) => {
        const validationError = validateFile(file)

        if (validationError) {
            setError(validationError)
            return
        }

        setError(null)

        const previewUrl = URL.createObjectURL(file)

        setPreviewUrl(previewUrl)

        onChange(file)
    }
    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]

            if (!file) return

            handleFile(file)
        },
        [handleFile]
    )

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            const file = e.dataTransfer.files[0]

            if (!file) return

            handleFile(file)
        },
        [handleFile]
    )

    const handleRemove = useCallback(() => {
        onChange("")
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }, [onChange])

    const handleUrlChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value)
            setError(null)
        },
        [onChange]
    )

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant={mode === "upload" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("upload")}
                    disabled={disabled}
                >
                    <Upload className="size-4"/>
                    Upload
                </Button>
                <Button
                    type="button"
                    variant={mode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("url")}
                    disabled={disabled}
                >
                    <Link className="size-4"/>
                    URL
                </Button>
            </div>

            {mode === "upload" ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={disabled}
                    />

                    {previewUrl ? (
                        <div className="relative w-full h-full">
                            <img
                                src={getAvatarUrl(previewUrl)}
                                alt="Avatar preview"
                                className="w-full h-full object-contain rounded-lg"
                            />

                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-xs"
                                className="absolute top-1 right-1"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemove()
                                }}
                                disabled={disabled}
                            >
                                <X className="size-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            {uploading ? (
                                <div
                                    className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                            ) : (
                                <ImageIcon className="size-8"/>
                            )}
                            <p className="text-xs">
                                {uploading ? "Uploading..." : "Drag & drop or click to upload"}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                JPEG, PNG, WebP, GIF (max 5MB)
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <Input
                    type="url"
                    value={value}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={disabled}
                />
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}
