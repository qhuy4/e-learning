import {useParams, useNavigate} from "react-router-dom";
import {ArrowLeft, CircleDollarSign, Ban} from "lucide-react";
import {Button} from "@fe/components/ui/button.tsx";
import {Badge} from "@fe/components/ui/badge.tsx";
import {Separator} from "@fe/components/ui/separator.tsx";
import {useAdminOrder, useUpdateOrderStatus} from "@/features/orders/hooks/use-admin-order";
import {OrderStatus, orderStatusLabel, orderStatusClassName} from "@/features/orders/types/admin-order";
import {toast} from "sonner";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(amount);
}

function formatDate(date: Date | string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function OrderDetailPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {data: order, isLoading, isError} = useAdminOrder(id ?? "");
    const updateStatusMutation = useUpdateOrderStatus();

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded"/>
                <div className="h-64 bg-muted animate-pulse rounded-xl"/>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
                <Button variant="ghost" className="mt-4" onClick={() => navigate("/orders")}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Quay lại danh sách
                </Button>
            </div>
        );
    }

    const currentStatus = order.status as OrderStatus;

    const handleStatusUpdate = (newStatus: OrderStatus) => {
        const label = newStatus === OrderStatus.REFUNDED ? "hoàn tiền" : "hủy";
        updateStatusMutation.mutate(
            {id: order.id, status: newStatus},
            {
                onSuccess: () => toast.success(`Đã ${label} đơn hàng thành công`),
                onError: () => toast.error(`Không thể ${label} đơn hàng`),
            },
        );
    };

    return (

            <div className="p-6 space-y-4">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Quay lại
                    </Button>
                    {(currentStatus === OrderStatus.PENDING || currentStatus === OrderStatus.PAID) && (
                        <div className="flex gap-2">
                            {currentStatus === OrderStatus.PAID && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(OrderStatus.REFUNDED)}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    <CircleDollarSign className="mr-2 h-4 w-4"/> Hoàn tiền
                                </Button>
                            )}
                            {currentStatus === OrderStatus.PENDING && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(OrderStatus.CANCELLED)}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    <Ban className="mr-2 h-4 w-4"/> Hủy đơn
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Main card */}<div className="flex flex-row gap-4 w-full">
                <div className="grow-1 rounded-xl border bg-card p-6 space-y-5">
                    {/* Header */}
                    <div>
                        <h1 className="text-xl font-bold">{order.orderCode}</h1>
                        <Badge className={`mt-1 ${orderStatusClassName[currentStatus]}`}>
                            {orderStatusLabel[currentStatus]}
                        </Badge>
                    </div>

                    <Separator/>

                    {/* Customer */}
                    <Section title="Khách hàng">
                        <Field label="Họ tên" value={order.userName}/>
                        <Field label="Email" value={order.userEmail}/>
                    </Section>

                    {/* Courses */}
                    <Separator/>

                    {/* Payment */}
                    <Section title="Thanh toán">
                        <Field label="Tổng tiền" value={formatCurrency(order.total)}/>
                        <Field label="Phương thức" value="Chuyển khoản"/>
                        <Field label="Trạng thái" value={orderStatusLabel[currentStatus]}/>
                    </Section>

                    <Separator/>

                    {/* Order */}
                    <Section title="Đơn hàng">
                        <Field label="Ngày tạo" value={formatDate(order.createdAt)}/>
                        <Field label="Ngày thanh toán" value={formatDate(order.paidAt)}/>
                        <Field label="Cập nhật" value={formatDate(order.updatedAt)}/>
                    </Section>
                </div>
              <div className="grow-1 rounded-xl border bg-card p-6 space-y-5">
                <Section title="Khóa học">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-lg border bg-muted/20 p-3"
                        >
                          {/* Thumbnail */}
                          {item.courseThumbnail ? (
                              <img
                                  src={item.courseThumbnail}
                                  alt={item.courseTitle}
                                  className="h-20 w-28 shrink-0 rounded-md object-cover"
                              />
                          ) : (
                              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                No image
                              </div>
                          )}

                          {/* Course info */}
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold leading-5">
                              {item.courseTitle}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Khóa học
                            </p>
                          </div>

                          {/* Price */}
                          <div className="shrink-0 text-right">
                            <div className="text-xs text-muted-foreground">
                              Đơn giá
                            </div>

                            <div className="mt-0.5 text-sm font-medium">
                              {formatCurrency(item.unitPrice)}
                            </div>

                            <div className="mt-2 text-xs text-muted-foreground">
                              Thành tiền
                            </div>

                            <div className="text-sm font-semibold text-primary">
                              {formatCurrency(item.finalPrice)}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
            </div>

    );
}

function Section({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

function Field({label, value}: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-right">{value}</span>
        </div>
    );
}

function FieldInline({label, value}: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-2 text-sm">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
