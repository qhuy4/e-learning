import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { adminInstructorService } from "@/features/instructors/service";
import type {
  InstructorApplicationStatus,
  PendingInstructorProfile,
} from "@/features/instructors/type/pending-instructor.ts";
import { DataTable } from "@/components/common/data-table/data-table.tsx";
import { createInstructorApprovalColumns } from "@/features/instructors/approval-columns.tsx";
import { Tabs, TabsList, TabsTrigger } from "@fe/components/ui/tabs";

const STATUS_TABS: {
  label: string;
  value: InstructorApplicationStatus | undefined;
}[] = [
  { label: "Chờ duyệt", value: "PENDING_REVIEW" },
  { label: "Chờ bổ sung", value: "PENDING_SUBMISSION" },
  { label: "Cần bổ sung", value: "PENDING_INFORMATION" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Tất cả hồ sơ", value: undefined },
];

function normalizeApplications(list: PendingInstructorProfile[]) {
  return list.map((application) => ({
    ...application,
    profileId: application.id,
    certificateCount:
      application.certificateCount ?? application.certificates?.length ?? 0,
  }));
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: { data?: { error?: { message?: string }; message?: string } };
    message?: string;
  };
  return (
    err.response?.data?.error?.message ||
    err.response?.data?.message ||
    err.message ||
    fallback
  );
}

export const InstructorApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<PendingInstructorProfile[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<InstructorApplicationStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const fetchApplications = async (status?: InstructorApplicationStatus) => {
    try {
      const list = await adminInstructorService.getPendingProfiles(status);
      setApplications(normalizeApplications(list));
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, "Không thể tải danh sách đơn đăng ký giảng viên."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    adminInstructorService
      .getPendingProfiles(statusFilter)
      .then((list) => {
        if (!cancelled) setApplications(normalizeApplications(list));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(
            getErrorMessage(err, "Không thể tải danh sách đơn đăng ký giảng viên."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const filteredApplications = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi");
    if (!keyword) return applications;

    return applications.filter((application) =>
      [
        application.fullName,
        application.email,
        application.headline,
        application.bio,
      ].some((value) => value?.toLocaleLowerCase("vi").includes(keyword)),
    );
  }, [applications, search]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const visibleApplications = useMemo(
    () =>
      filteredApplications.slice((page - 1) * pageSize, page * pageSize),
    [filteredApplications, page, pageSize],
  );
  const columns = useMemo(() => createInstructorApprovalColumns(), []);

  const openDetail = (application: PendingInstructorProfile) => {
    navigate(`/instructors/applications/${application.id}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Đơn đăng ký giảng viên</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xét duyệt hồ sơ, chứng chỉ và gửi liên kết kích hoạt tài khoản giảng viên.
        </p>
      </div>

      <div className="mb-4 overflow-x-auto">
        <Tabs
          value={statusFilter ?? "ALL"}
          onValueChange={(value) => {
            setLoading(true);
            setStatusFilter(
              value === "ALL"
                ? undefined
                : (value as InstructorApplicationStatus),
            );
            setPage(1);
          }}
        >
          <TabsList variant="line">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value ?? "ALL"}
                value={tab.value ?? "ALL"}
                className="flex-none px-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        columns={columns}
        data={visibleApplications}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        refetch={() => fetchApplications(statusFilter)}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        onRowClick={openDetail}
        tableMeta={{ onView: openDetail }}
        text={{
          searchPlaceholder: "Tìm tên, email hoặc chuyên môn...",
          reload: "Làm mới",
          rowsPerPage: "Dòng trên trang",
          noResults: "Không có đơn đăng ký nào trong mục này.",
          pageOf: (current, total) => `Trang ${current} / ${total || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
};
