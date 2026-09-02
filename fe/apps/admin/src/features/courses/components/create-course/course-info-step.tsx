import { useState, useEffect } from "react";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Button } from "@fe/components/ui/button";
import {ImagePlus,Type,DollarSign,AlignLeft,CheckCircle2,Plus,Trash2,X,} from "lucide-react";
import {Card,CardContent,CardHeader,CardTitle,CardDescription,
} from "@fe/components/ui/card";
import type { Course } from "../../types/course.types";
import { CourseLevel } from "../../types/course.types";

interface CourseInfoStepProps {
  data: Course;
  updateData: (data: Partial<Course>) => void;
}

export function CourseInfoStep({ data, updateData }: CourseInfoStepProps) {
  const benefits = data.benefits || [""];

  const getInitialPreview = () => {
    if (!data.thumbnail) return null;
    if (data.thumbnail instanceof File) return URL.createObjectURL(data.thumbnail);
    // Already a full URL (from R2)
    if (typeof data.thumbnail === "string" && data.thumbnail.startsWith("http")) return data.thumbnail;
    return null;
  };

  const [imagePreview, setImagePreview] = useState<string | null>(getInitialPreview);

  useEffect(() => {
    if (data.thumbnail instanceof File) {
      const url = URL.createObjectURL(data.thumbnail);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof data.thumbnail === "string" && data.thumbnail.startsWith("http")) {
      setImagePreview(data.thumbnail);
    } else if (!data.thumbnail) {
      setImagePreview(null);
    }
  }, [data.thumbnail]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
    updateData({
      thumbnail: file,
    });
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);

    updateData({
      thumbnail: undefined,
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits];

    newBenefits[index] = value;

    updateData({
      benefits: newBenefits,
    });
  };

  const addBenefit = () => {
    updateData({
      benefits: [...benefits, ""],
    });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);

    updateData({
      benefits: newBenefits.length ? newBenefits : [""],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="w-full bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Type className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              Nội dung chính
            </CardTitle>

            <CardDescription className="text-sm">
              Thông tin cốt lõi hiển thị trên trang chi tiết khóa học.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
    
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="font-medium flex items-center gap-2"
              >
                Tên khóa học
                <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  id="title"
                  placeholder="VD: Lập trình ReactJS cơ bản..."
                  value={data.title}
                  onChange={(e) =>
                    updateData({
                      title: e.target.value,
                    })
                  }
                  className="h-11 pl-10 rounded-sm"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="font-medium flex items-center gap-2"
              >
                Mô tả chi tiết
              </Label>

              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <textarea
                  id="description"
                  className="flex min-h-[140px] w-full rounded-sm border border-input bg-transparent px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                  placeholder="Học viên sẽ học được những gì từ khóa học này?"
                  value={data.description || ""}
                  onChange={(e) =>
                    updateData({
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  Những điều học được
                </Label>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addBenefit}
                  className="h-8 rounded-sm px-2 text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm mục
                </Button>
              </div>

              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />

                      <Input
                        placeholder={`Mục tiêu số ${index + 1}...`}
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        className="h-11 pl-10 rounded-sm"
                      />
                    </div>

                    {benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-sm h-11 w-11 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="w-full bg-card border-border shadow-sm rounded-md">
          <CardHeader className="border-b border-border bg-muted/20">
            <CardTitle className="text-lg font-semibold">
              Cấu hình khóa học
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* LEVEL */}
            <div className="space-y-2">
              <Label htmlFor="level" className="font-medium">
                Trình độ
              </Label>

              <select
                id="level"
                value={data.level ?? CourseLevel.BEGINNER}
                onChange={(e) =>
                  updateData({
                    level: Number(e.target.value) as CourseLevel,
                  })
                }
                className="flex h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={CourseLevel.BEGINNER}>Người mới bắt đầu</option>

                <option value={CourseLevel.INTERMEDIATE}>Trung cấp</option>

                <option value={CourseLevel.ADVANCED}>Nâng cao</option>
              </select>
            </div>


            {/* PRICE */}
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="font-medium flex items-center gap-2"
              >
                Giá tiền (VNĐ)
              </Label>

              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="500000"
                  value={data.price ?? ""}
                  onChange={(e) =>
                    updateData({
                      price: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  className="h-11 pl-10 rounded-sm"
                />
              </div>
            </div>

            {/* THUMBNAIL */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label className="font-medium">Hình ảnh đại diện</Label>

              {imagePreview ? (
                <div className="relative w-full h-48 rounded-md overflow-hidden border border-border group">
                  <img
                    src={imagePreview}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md hover:scale-105 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center gap-3 bg-muted/30 hover:bg-muted/50 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <ImagePlus className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                      Chọn file ảnh
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WEBP (Max: 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
