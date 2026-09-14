import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Camera, Save, User } from "lucide-react";

import { useGetProfile, useUpdateProfile } from "@/features/profile/hook/use-profile";
import { getErrorMessage } from "@/shared/utils/error";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Separator } from "@fe/components/ui/separator";
import { LocationForm } from "@/components/location-form";
import { getAvatarUrl } from "@/shared/utils/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { Calendar as CalendarComponent } from "@fe/components/ui/calendar";

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function ProfilePage() {
  const { data: profileData, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (profileData?.data) {
      const { name: userName, profile } = profileData.data;
      setName(userName ?? "");
      if (profile) {
        setFirstName(profile.firstName ?? "");
        setLastName(profile.lastName ?? "");
        setPhone(profile.phone ?? "");
        setBio(profile.bio ?? "");
        setOccupation(profile.occupation ?? "");
        setAddress(profile.address ?? "");
        setCity(profile.city ?? "");
        setCountry(profile.country ?? "");
        setDateOfBirth(
          profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : ""
        );
        if (profile.avatarUrl) {
          setAvatarPreview(getAvatarUrl(profile.avatarUrl) ?? null);
        }
      }
    }
  }, [profileData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    const tid = toast.loading("Đang lưu thay đổi...");
    updateProfile(
      {
        name: name || undefined,
        profile: {
          firstName,
          lastName,
          phone,
          bio,
          occupation,
          address,
          city,
          country,
          dateOfBirth: dateOfBirth || undefined,
        },
        avatar: avatarFile ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật hồ sơ!", { id: tid });
          setAvatarFile(null);
        },
        onError: (err) => toast.error(getErrorMessage(err), { id: tid }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className=" mx-auto p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-4 bg-muted rounded animate-pulse w-64" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ</h1>
        <p className="text-sm text-muted-foreground mt-1">Quản lý thông tin hồ sơ giảng viên</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
            <CardDescription>Quản lý ảnh đại diện của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Nhấn vào ảnh để thay đổi. PNG, JPG (Max: 5MB)
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin hồ sơ của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên hiển thị</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên hiển thị"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Họ</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nguyễn"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Văn A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full justify-start font-normal"
                    >
                      {dateOfBirth
                        ? parseDate(dateOfBirth)?.toLocaleDateString()
                        : "Chọn ngày"}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={parseDate(dateOfBirth)}
                    defaultMonth={parseDate(dateOfBirth) ?? new Date()}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDateOfBirth(date ? date.toISOString().split("T")[0] : "");
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Nghề nghiệp</Label>
              <Input
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Giảng viên"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mô tả về bản thân..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Đường ABC"
              />
            </div>

            <LocationForm
              country={country}
              city={city}
              onCountryChange={setCountry}
              onCityChange={setCity}
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isPending} className="px-6">
                <Save className="w-4 h-4 mr-2" />
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
