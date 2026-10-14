import { showPopup, askPopup } from "./popup";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  LogOut,
  Menu,
  X,
  Factory,
  FileSearch,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Building2,
  Info,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  GraduationCap,
  ClipboardCheck,
  Users,
  Eye,
  EyeOff,
  Download,
  Plus,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
  ShieldCheck,
  UserCog,
} from "lucide-react";
const getRequestSubmittedAt = (item) => item?.created_at || item?.submitted_at || item?.application_date || item?.createdAt || item?.submittedAt || null;
const formatRequestSubmittedAt = (item) => {
  const value = getRequestSubmittedAt(item);
  if (!value) return "ไม่พบข้อมูลวันที่และเวลาที่ยื่น";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่พบข้อมูลวันที่และเวลาที่ยื่น";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(date) + " น.";
};



// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = "https://coop-backend-02.vercel.app";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// AXIOS JWT INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// API SERVICE
// ============================================================

const apiService = {
  // ----------------------------------------------------------
  // AUTH / USER
  // ----------------------------------------------------------

  login: (username, password) =>
    api.post("/login", {
      username: String(username),
      password: String(password),
    }),

  getUsers: () => api.get("/users"),

  changeUserRole: (userId, role) =>
    api.put(`/users/${userId}/role`, {
      role,
    }),

  // ----------------------------------------------------------
  // STUDENT
  // ----------------------------------------------------------

  getStudentProfile: () =>
    api.get("/student/me"),

  createStudentProfile: (data) =>
    api.post("/student/me", data),

  updateStudentProfile: (data) =>
    api.put("/student/me", data),

  getMyTeacher: () =>
    api.get("/student/teacher"),

  // ----------------------------------------------------------
  // TEACHER
  // ----------------------------------------------------------

  getTeacherStudents: () =>
    api.get("/teacher/students"),

  getTeacherDashboard: () =>
    api.get("/teacher/dashboard"),

  getTeacherSupervisions: () =>
    api.get("/teacher/supervisions"),

  getTeacherProfile: () =>
    api.get("/teacher/me"),

  updateTeacherProfile: (data) =>
    api.put("/teacher/me", data),

  // ----------------------------------------------------------
  // ADMIN
  // ----------------------------------------------------------

  getAdminDashboard: () =>
    api.get("/admin/dashboard"),

  getAllStudents: () =>
    api.get("/students"),

  deleteStudent: (studentId) =>
    api.delete(`/students/${studentId}`),

  // ----------------------------------------------------------
  // COMPANIES
  // ----------------------------------------------------------

  getCompanies: (params = {}) =>
    api.get("/companies", {
      params,
    }),

  createCompany: (data) =>
    api.post("/companies", data),

  updateCompany: (companyId, data) =>
    api.put(`/companies/${companyId}`, data),

  deleteCompany: (companyId) =>
    api.delete(`/companies/${companyId}`),

  // ----------------------------------------------------------
  // APPLICATIONS
  // ----------------------------------------------------------

  applyCompany: (data) =>
    api.post("/apply", data),

  getApplications: () =>
    api.get("/applications"),

  cancelApplication: (applicationId) => api.put(`/applications/${applicationId}/cancel`),

  approveApplication: (applicationId) =>
    api.put(
      `/applications/${applicationId}/approve`
    ),

  rejectApplication: (applicationId) =>
    api.put(
      `/applications/${applicationId}/reject`
    ),

  // ----------------------------------------------------------
  // SUPERVISION
  // ----------------------------------------------------------

  createSupervision: (data) =>
    api.post("/supervision", data),

  getSupervisions: () =>
    api.get("/supervision"),
};

// ============================================================
// HELPERS
// ============================================================

const normalizeList = (data, keys = []) => {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
};

const getApiErrorMessage = (
  error,
  fallback = "เกิดข้อผิดพลาด"
) => {
  const data = error?.response?.data;

  const stringifyValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => stringifyValue(item))
        .filter(Boolean)
        .join("\n");
    }

    if (typeof value === "object") {
      // FastAPI validation error:
      // { loc: [...], msg: "...", type: "..." }
      if (value.msg !== undefined) {
        const field =
          Array.isArray(value.loc)
            ? value.loc
                .filter(
                  (part) =>
                    part !== "body"
                )
                .join(".")
            : "";

        const message =
          stringifyValue(value.msg);

        return field
          ? `${field}: ${message}`
          : message;
      }

      if (value.message !== undefined) {
        return stringifyValue(
          value.message
        );
      }

      if (value.detail !== undefined) {
        return stringifyValue(
          value.detail
        );
      }

      if (value.error !== undefined) {
        return stringifyValue(
          value.error
        );
      }

      try {
        return JSON.stringify(
          value,
          null,
          2
        );
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  if (!data) {
    return (
      error?.message ||
      fallback
    );
  }

  if (typeof data === "string") {
    return data;
  }

  const detailMessage =
    stringifyValue(data.detail);

  if (detailMessage) {
    return detailMessage;
  }

  const message =
    stringifyValue(data.message);

  if (message) {
    return message;
  }

  const errorMessage =
    stringifyValue(data.error);

  if (errorMessage) {
    return errorMessage;
  }

  const wholeResponse =
    stringifyValue(data);

  return (
    wholeResponse ||
    error?.message ||
    fallback
  );
};

const normalizeProfile = (data) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  if (data.user) {
    if (Array.isArray(data.user)) {
      return data.user[0] || null;
    }

    return data.user;
  }

  if (data.student) {
    return Array.isArray(data.student)
      ? data.student[0]
      : data.student;
  }

  if (data.teacher) {
    return Array.isArray(data.teacher)
      ? data.teacher[0]
      : data.teacher;
  }

  return data;
};

// ============================================================
// ROBOT LOGO
// ============================================================

const RobotLogo = ({
  className = "w-10 h-10",
}) => (
  <svg
    className={className}
    viewBox="0 0 512 512"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M482.3 221.7l-35.9-5.9c-3.9-15.6-9.9-30.4-17.7-44l21.3-29.4c6.3-8.7 5.1-20.9-2.9-28.2l-32.9-30c-7.9-7.2-20.2-7.2-28 0l-22.5 19.3c-14.1-8.9-29.6-15.6-46.1-19.8l-7-35.7C312 36.5 302 28 290.3 28h-44.5c-11.7 0-21.7 8.5-23.4 20l-7 35.7c-16.5 4.2-32 10.9-46.1 19.8L146.8 84.2c-7.8-7.2-20.1-7.2-28 0l-32.9 30c-8 7.3-9.2 19.5-2.9 28.2l21.3 29.4c-7.8 13.6-13.8 28.4-17.7 44l-35.9 5.9C39 223.4 30.5 233.1 30.5 244.7v44.5c0 11.6 8.5 21.3 20.2 23l35.9 5.9c3.9 15.6 9.9 30.4 17.7 44l-21.3 29.4c-6.3 8.7-5.1 20.9 2.9 28.2l32.9 30c7.9 7.2 20.2 7.2 28 0l22.5-19.3c14.1 8.9 29.6 15.6 46.1 19.8l7 35.7c1.7 11.5 11.7 20 23.4 20h44.5c11.7 0 21.7-8.5 23.4-20l7-35.7c16.5-4.2 32-10.9 46.1-19.8l22.5 19.3c7.8 7.2 20.1 7.2 28 0l32.9-30c8-7.3 9.2-19.5 2.9-28.2l-21.3-29.4c7.8-13.6 13.8-28.4 17.7-44l35.9-5.9c11.7-1.7 20.2-11.4 20.2-23v-44.5c0-11.6-8.5-21.3-20.2-23z"
      fill="#ff4d4d"
      stroke="#000"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <circle
      cx="256"
      cy="256"
      r="135"
      fill="#fff"
      stroke="#000"
      strokeWidth="16"
    />

    <rect
      x="180"
      y="210"
      width="152"
      height="100"
      rx="25"
      fill="#e0e0e0"
      stroke="#000"
      strokeWidth="16"
    />

    <circle
      cx="225"
      cy="260"
      r="14"
      fill="#000"
    />

    <circle
      cx="287"
      cy="260"
      r="14"
      fill="#000"
    />

    <rect
      x="148"
      y="235"
      width="32"
      height="50"
      rx="16"
      fill="#b0b0b0"
      stroke="#000"
      strokeWidth="16"
    />

    <rect
      x="332"
      y="235"
      width="32"
      height="50"
      rx="16"
      fill="#b0b0b0"
      stroke="#000"
      strokeWidth="16"
    />

    <line
      x1="256"
      y1="210"
      x2="256"
      y2="175"
      stroke="#000"
      strokeWidth="16"
      strokeLinecap="round"
    />

    <circle
      cx="256"
      cy="160"
      r="18"
      fill="#ff4d4d"
      stroke="#000"
      strokeWidth="12"
    />

    <line
      x1="230"
      y1="290"
      x2="282"
      y2="290"
      stroke="#000"
      strokeWidth="8"
      strokeLinecap="round"
    />
  </svg>
);

// ============================================================
// LOADING
// ============================================================

const LoadingBox = ({
  text = "กำลังโหลดข้อมูล...",
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
    <RefreshCw
      size={28}
      className="animate-spin mb-3 text-[#800000]"
    />
    <p className="font-bold text-sm">{text}</p>
  </div>
);

// ============================================================
// ERROR BOX
// ============================================================

const ErrorBox = ({
  message,
  onRetry,
}) => (
  <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
    <p className="text-red-700 font-black text-sm">
      {message}
    </p>

    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 px-4 py-2 bg-[#800000] text-white rounded-xl text-xs font-black"
      >
        ลองใหม่
      </button>
    )}
  </div>
);

// ============================================================
// COMPANY MANAGEMENT
// ============================================================

const CompanyManagement = ({
  userRole,
}) => {
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedCompany, setSelectedCompany] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [showFilterMenu, setShowFilterMenu] =
    useState(false);

  const [filterIndustry, setFilterIndustry] =
    useState("All");

  const [showCompanyForm, setShowCompanyForm] =
    useState(false);

  const [editingCompany, setEditingCompany] =
    useState(null);

  const [savingCompany, setSavingCompany] =
    useState(false);

  const emptyCompany = {
    company_name: "",
    address: "",
    phone: "",
    industry: "",
    allowance: "",
    accommodation: "",
    shuttle: "",
    welfare: "",
  };

  const [companyForm, setCompanyForm] =
    useState(emptyCompany);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiService.getCompanies(
          searchTerm
            ? { search: searchTerm }
            : {}
        );

      setCompanies(
        normalizeList(response.data, [
          "companies",
          "data",
          "items",
        ])
      );
    } catch (err) {
      console.error(
        "Fetch companies error:",
        err
      );

      setError(
        getApiErrorMessage(
          err,
          "ไม่สามารถโหลดข้อมูลบริษัทได้"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCompanies =
    companies.filter((company) => {
      if (filterIndustry === "All") {
        return true;
      }

      const industry = String(
        company.industry || ""
      ).toLowerCase();

      if (
        filterIndustry === "Industry"
      ) {
        return (
          industry.includes("อุตสาหกรรม") ||
          industry.includes("manufacture") ||
          industry.includes("factory")
        );
      }

      if (filterIndustry === "IT") {
        return (
          industry.includes("เทคโนโลยี") ||
          industry.includes("it") ||
          industry.includes("tech")
        );
      }

      if (filterIndustry === "Other") {
        return !company.industry;
      }

      return true;
    });

  const openCreateCompany = () => {
    setEditingCompany(null);
    setCompanyForm(emptyCompany);
    setShowCompanyForm(true);
  };

  const openEditCompany = (
    company
  ) => {
    setEditingCompany(company);

    setCompanyForm({
      company_name:
        company.company_name || "",
      address:
        company.address || "",
      phone:
        company.phone || "",
      industry:
        company.industry || "",
      allowance:
        company.allowance || "",
      accommodation:
        company.accommodation || "",
      shuttle:
        company.shuttle || "",
      welfare:
        company.welfare || "",
    });

    setShowCompanyForm(true);
  };

  const saveCompany = async () => {
    if (!companyForm.company_name.trim()) {
      showPopup("กรุณากรอกชื่อบริษัท");
      return;
    }

    try {
      setSavingCompany(true);

      const payload = {
        company_name: companyForm.company_name.trim(),
        address: companyForm.address.trim(),
        phone: companyForm.phone.trim(),
        industry: companyForm.industry.trim(),
        allowance: companyForm.allowance.trim(),
        accommodation: companyForm.accommodation.trim(),
        shuttle: companyForm.shuttle.trim(),
        welfare: companyForm.welfare.trim(),
      };

      console.log("COMPANY PAYLOAD:", payload);

      if (editingCompany) {
        const companyId =
          editingCompany.id || editingCompany.company_id;

        await apiService.updateCompany(companyId, payload);
      } else {
        // POST https://coop-backend-02.vercel.app/companies
        const response = await apiService.createCompany(payload);
        console.log("POST /companies RESPONSE:", response.data);
      }

      const wasEditing = Boolean(editingCompany);

      setShowCompanyForm(false);
      setEditingCompany(null);
      setCompanyForm(emptyCompany);

      // GET /companies again so the new company appears immediately
      await fetchCompanies();

      showPopup(
        wasEditing
          ? "แก้ไขข้อมูลบริษัทเรียบร้อยแล้ว"
          : "เพิ่มบริษัทเรียบร้อยแล้ว"
      );
    } catch (err) {
      console.error(
        "SAVE COMPANY ERROR:",
        err?.response?.data || err
      );

      showPopup(
        getApiErrorMessage(
          err,
          "ไม่สามารถบันทึกข้อมูลบริษัทได้"
        )
      );
    } finally {
      setSavingCompany(false);
    }
  };

  const removeCompany = async (
    company
  ) => {
    const id =
      company.id ||
      company.company_id;

    if (!id) {
      showPopup("ไม่พบ ID บริษัท");
      return;
    }

    if (
      !await askPopup(
        `ต้องการลบบริษัท "${company.company_name}" หรือไม่?`
      )
    ) {
      return;
    }

    try {
      await apiService.deleteCompany(id);

      setSelectedCompany(null);

      await fetchCompanies();

      showPopup("ลบบริษัทเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);

      showPopup(
        getApiErrorMessage(
          err,
          "ไม่สามารถลบบริษัทได้"
        )
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* ====================================================
          COMPANY LIST
      ==================================================== */}

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <h3 className="text-[#800000] font-black flex items-center gap-2 text-lg">
            <Factory size={24} />
            รายชื่อสถานประกอบการ
          </h3>

          <div className="flex items-center gap-2 w-full md:w-auto">

            <input
              type="text"
              placeholder="ค้นหาบริษัท..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="flex-1 md:w-64 px-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#800000] font-bold"
            />

            {userRole === "coordinator" && (
              <button
                onClick={
                  openCreateCompany
                }
                className="p-2.5 rounded-xl bg-[#800000] text-white hover:bg-black"
                title="เพิ่มบริษัท"
              >
                <Plus size={18} />
              </button>
            )}

            <div className="relative">

              <button
                onClick={() =>
                  setShowFilterMenu(
                    !showFilterMenu
                  )
                }
                className={`p-2.5 rounded-xl border transition-all ${
                  showFilterMenu
                    ? "bg-[#800000] text-white border-[#800000]"
                    : "bg-gray-50 text-gray-500 border-gray-100"
                }`}
              >
                <Filter size={18} />
              </button>

              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">

                  <p className="px-4 py-1.5 text-[10px] font-black text-gray-400">
                    ประเภทธุรกิจ
                  </p>

                  {[
                    {
                      id: "All",
                      name: "ทั้งหมด",
                    },
                    {
                      id: "Industry",
                      name: "โรงงาน / อุตสาหกรรม",
                    },
                    {
                      id: "IT",
                      name: "IT / เทคโนโลยี",
                    },
                    {
                      id: "Other",
                      name: "ทั่วไป / ไม่ระบุ",
                    },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setFilterIndustry(
                          type.id
                        );

                        setShowFilterMenu(
                          false
                        );
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold ${
                        filterIndustry ===
                        type.id
                          ? "bg-red-50 text-[#800000]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      • {type.name}
                    </button>
                  ))}

                </div>
              )}

            </div>
          </div>
        </div>

        {filterIndustry !== "All" && (
          <div className="mb-4 flex items-center gap-2">

            <span className="text-xs font-bold text-gray-400">
              ตัวกรอง:
            </span>

            <span className="inline-flex items-center gap-1 bg-red-50 text-[#800000] text-xs font-black px-3 py-1 rounded-full">
              {filterIndustry ===
                "Industry" &&
                "โรงงาน / อุตสาหกรรม"}

              {filterIndustry === "IT" &&
                "IT / เทคโนโลยี"}

              {filterIndustry ===
                "Other" &&
                "ทั่วไป / ไม่ระบุ"}

              <X
                size={12}
                className="cursor-pointer"
                onClick={() =>
                  setFilterIndustry(
                    "All"
                  )
                }
              />
            </span>

          </div>
        )}

        {error ? (
          <ErrorBox
            message={error}
            onRetry={fetchCompanies}
          />
        ) : loading ? (
          <LoadingBox text="กำลังดึงข้อมูลบริษัท..." />
        ) : filteredCompanies.length ===
          0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">
            ไม่พบข้อมูลสถานประกอบการ
          </div>
        ) : (
          <div className="space-y-4">

            {filteredCompanies.map(
              (company, index) => (
                <div
                  key={
                    company.id ||
                    company.company_id ||
                    index
                  }
                  onClick={() =>
                    setSelectedCompany(
                      company
                    )
                  }
                  className="flex items-center justify-between p-5 border border-gray-50 rounded-2xl hover:bg-red-50/50 transition-all cursor-pointer group"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#800000] group-hover:text-white rounded-lg flex items-center justify-center font-bold text-[#800000]">
                      {index + 1}
                    </div>

                    <div>

                      <p className="font-black text-gray-800">
                        {company.company_name ||
                          company.name ||
                          "-"}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">

                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <MapPin size={12} />
                          {company.address ||
                            "ไม่ระบุที่อยู่"}
                        </p>

                        {company.industry && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                            {company.industry}
                          </span>
                        )}

                      </div>
                    </div>
                  </div>

                  <ChevronRight className="text-gray-300 group-hover:text-[#800000]" />

                </div>
              )
            )}

          </div>
        )}
      </div>

      {/* ====================================================
          COMPANY DETAIL MODAL
      ==================================================== */}

      {selectedCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative">

            <div className="bg-[#800000] p-8 text-white">

              <button
                onClick={() =>
                  setSelectedCompany(null)
                }
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#800000]">
                  <Building2 size={32} />
                </div>

                <div>

                  <h4 className="text-xl md:text-2xl font-black">
                    {selectedCompany.company_name ||
                      selectedCompany.name ||
                      "-"}
                  </h4>

                  <span className="inline-block mt-1 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {selectedCompany.industry ||
                      "ทั่วไป"}
                  </span>

                </div>

              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex gap-3">

                  <MapPin
                    className="text-[#800000]"
                    size={20}
                  />

                  <div>
                    <p className="text-[10px] font-black text-gray-400">
                      ที่ตั้ง
                    </p>

                    <p className="text-gray-800 font-bold">
                      {selectedCompany.address ||
                        "ไม่ระบุ"}
                    </p>
                  </div>

                </div>

                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex gap-3">

                  <Phone
                    className="text-[#800000]"
                    size={20}
                  />

                  <div>
                    <p className="text-[10px] font-black text-gray-400">
                      เบอร์โทรศัพท์
                    </p>

                    <p className="text-gray-800 font-black text-lg">
                      {selectedCompany.phone ||
                        "ไม่ระบุ"}
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-6 bg-red-50/30 rounded-3xl border border-red-100">

                <p className="text-[10px] font-black text-[#800000] mb-3 flex items-center gap-2">
                  <Info size={14} />
                  รายละเอียดและสวัสดิการ
                </p>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">

                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      เบี้ยเลี้ยง
                    </p>

                    <p className="text-sm font-bold text-gray-700">
                      {selectedCompany.allowance ||
                        "ไม่มี"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      ที่พัก
                    </p>

                    <p className="text-sm font-bold text-gray-700">
                      {selectedCompany.accommodation ||
                        "ไม่มี"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      รถรับส่ง
                    </p>

                    <p className="text-sm font-bold text-gray-700">
                      {selectedCompany.shuttle ||
                        "ไม่มี"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">
                      สวัสดิการอื่นๆ
                    </p>

                    <p className="text-sm font-bold text-gray-700">
                      {selectedCompany.welfare ||
                        "ไม่มี"}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-between">

              {userRole === "coordinator" ? (
                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      openEditCompany(
                        selectedCompany
                      )
                    }
                    className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center gap-2"
                  >
                    <Pencil size={14} />
                    แก้ไข
                  </button>

                  <button
                    onClick={() =>
                      removeCompany(
                        selectedCompany
                      )
                    }
                    className="px-5 py-3 bg-red-600 text-white rounded-2xl font-black text-xs flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    ลบ
                  </button>

                </div>
              ) : (
                <div />
              )}

              <button
                onClick={() =>
                  setSelectedCompany(null)
                }
                className="px-8 py-3 bg-white text-gray-600 rounded-2xl font-black border border-gray-200"
              >
                ปิด
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          COMPANY FORM
      ==================================================== */}

      {showCompanyForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">

          <div className="bg-white w-full max-w-2xl rounded-[35px] shadow-2xl p-8 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">

              <h3 className="text-xl font-black text-[#800000]">
                {editingCompany
                  ? "แก้ไขข้อมูลบริษัท"
                  : "เพิ่มสถานประกอบการ"}
              </h3>

              <button
                onClick={() =>
                  setShowCompanyForm(false)
                }
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[
                [
                  "company_name",
                  "ชื่อบริษัท",
                ],
                [
                  "phone",
                  "เบอร์โทรศัพท์",
                ],
                [
                  "industry",
                  "ประเภทธุรกิจ",
                ],
                [
                  "address",
                  "ที่อยู่",
                ],
                [
                  "allowance",
                  "เบี้ยเลี้ยง",
                ],
                [
                  "accommodation",
                  "ที่พัก",
                ],
                [
                  "shuttle",
                  "รถรับส่ง",
                ],
                [
                  "welfare",
                  "สวัสดิการอื่นๆ",
                ],
              ].map(
                ([field, label]) => (
                  <div key={field}>

                    <label className="text-xs font-black text-gray-500">
                      {label}
                    </label>

                    <input
                      value={
                        companyForm[field]
                      }
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          [field]:
                            e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#800000]"
                    />

                  </div>
                )
              )}

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() =>
                  setShowCompanyForm(false)
                }
                className="px-6 py-3 bg-gray-100 rounded-xl font-black text-xs"
              >
                ยกเลิก
              </button>

              <button
                onClick={saveCompany}
                disabled={savingCompany}
                className="px-6 py-3 bg-[#800000] text-white rounded-xl font-black text-xs disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={15} />
                {savingCompany
                  ? "กำลังบันทึก..."
                  : "บันทึกข้อมูล"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// STUDENT PROFILE
// ============================================================

const StudentProfile = ({profileData,onSaved}) => {
  const fields = [["first_name","ชื่อ"],["last_name","นามสกุล"],["phone","เบอร์โทรศัพท์"],["email","อีเมล"],["address","ที่อยู่"],["guardian_name","ชื่อผู้ปกครอง"],["guardian_phone","เบอร์ผู้ปกครอง"]];
  const [form,setForm] = useState({});const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");
  useEffect(()=>{setForm({...Object.fromEntries(fields.map(([k])=>[k,profileData?.[k]||""])),title:profileData?.title||""});},[profileData]);
  const save = async()=>{try{setSaving(true);setMessage("");await apiService.updateStudentProfile(form);setMessage("บันทึกข้อมูลสำเร็จ");await onSaved?.();}catch(e){setMessage(getApiErrorMessage(e,"บันทึกไม่สำเร็จ"));}finally{setSaving(false);}};
  return <div className="bg-white p-6 rounded-3xl border space-y-4"><h3 className="text-[#800000] font-black text-lg">โปรไฟล์ของฉัน</h3><p className="text-sm text-gray-500">สามารถแก้ไขคำนำหน้าและข้อมูลติดต่อได้ ส่วนสำนักวิชา สาขา และภาคเรียนจัดการโดยเจ้าหน้าที่</p>
    <div className="grid md:grid-cols-2 gap-4"><div><label className="text-sm font-bold">คำนำหน้า</label><select className="w-full p-3 rounded-xl border bg-white" value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})}><option value="">เลือกคำนำหน้า</option><option value="นาย">นาย</option><option value="นางสาว">นางสาว</option></select></div>
    {[['faculty','สำนักวิชา'],['major','สาขาวิชา'],['semester','ภาคเรียน']].map(([k,l])=><div key={k}><label className="text-sm font-bold">{l}</label><input disabled className="w-full p-3 rounded-xl border bg-gray-100" value={profileData?.[k]||"ยังไม่ระบุ"} readOnly/></div>)}
    {fields.map(([k,l])=><div key={k}><label className="text-sm font-bold">{l}</label><input className="w-full p-3 rounded-xl border" value={form[k]||""} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div>
    {message&&<p role="status">{message}</p>}<button disabled={saving} onClick={save} className="px-6 py-3 bg-[#800000] text-white rounded-xl disabled:opacity-50">{saving?"กำลังบันทึก...":"บันทึกโปรไฟล์"}</button></div>;
};

// ============================================================
// STUDENT TEACHER
// ============================================================

const MyTeacher = () => {
  const [teacher, setTeacher] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiService.getMyTeacher();

      console.log(
        "STUDENT TEACHER RESPONSE JSON:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      const data = response.data;

      // Backend /student/teacher ส่งข้อมูลเป็น Array
      // เช่น [{ teacher_name: "ฐิมาพร เพชรแก้ว", ... }]
      const teacherData =
        Array.isArray(data)
          ? data[0]
          : data;

      if (!teacherData) {
        setTeacher(null);
        return;
      }

      const teacherName =
        teacherData?.teacher_name ||
        teacherData?.name ||
        "";

      const teacherNameParts =
        teacherName
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      setTeacher({
        ...teacherData,

        teacher_name:
          teacherName,

        name:
          teacherName,

        // รองรับ UI เดิมที่อ่าน first_name / last_name
        first_name:
          teacherData?.first_name ||
          teacherNameParts[0] ||
          "",

        last_name:
          teacherData?.last_name ||
          teacherNameParts
            .slice(1)
            .join(" ") ||
          "",
      });
    } catch (error) {
      console.error(
        "GET /student/teacher ERROR:",
        error
      );

      setError(
        getApiErrorMessage(
          error,
          "ไม่สามารถโหลดข้อมูลอาจารย์ได้"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100">

      <h3 className="text-[#800000] font-black text-lg mb-6 flex items-center gap-2">
        <GraduationCap size={24} />
        อาจารย์นิเทศก์ของฉัน
      </h3>

      {loading ? (
        <LoadingBox text="กำลังโหลดข้อมูลอาจารย์..." />
      ) : error ? (
        <ErrorBox
          message={error}
          onRetry={fetchTeacher}
        />
      ) : !teacher ? (
        <div className="text-center py-10 text-gray-400 font-bold">
          ยังไม่มีข้อมูลอาจารย์นิเทศก์
        </div>
      ) : (
        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#800000] flex items-center justify-center">
            <GraduationCap size={30} />
          </div>

          <div>

            <h4 className="font-black text-gray-800 text-lg">
              {teacher.first_name || ""}
              {" "}
              {teacher.last_name || ""}
            </h4>

            <p className="text-xs text-gray-400 font-bold mt-1">
              {teacher.email ||
                "ไม่ระบุ Email"}
            </p>

            <p className="text-xs text-gray-400 font-bold">
              {teacher.phone ||
                "ไม่ระบุเบอร์โทร"}
            </p>

          </div>
        </div>
      )}

    </div>
  );
};

// ============================================================
// STUDENT APPLICATION
// ============================================================

const StudentApplication = () => {
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [position, setPosition] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notice, setNotice] = useState("");
  const loadData = async () => {
    try {
      setLoadingData(true);
      const [c, a] = await Promise.all([apiService.getCompanies(), apiService.getApplications()]);
      setCompanies(normalizeList(c.data, ["companies", "data", "items"]));
      setApplications(normalizeList(a.data, ["applications", "data", "items"]));
    } catch (e) { setNotice(getApiErrorMessage(e, "โหลดข้อมูลไม่สำเร็จ")); }
    finally { setLoadingData(false); }
  };
  useEffect(() => { loadData(); }, []);
  const active = applications.some(a => ["pending", "approved"].includes(String(a.status).toLowerCase()));
  const selected = companies.find(c => String(c.id || c.company_id) === String(companyId));
  const positions = selected ? (Array.isArray(selected.positions) ? selected.positions.map(p => typeof p === "string" ? p : p.position_name || p.name).filter(Boolean) : []) : [];
  const statusMeta = (status) => ({pending:["รอพิจารณา","bg-amber-100 text-amber-800"],approved:["อนุมัติแล้ว","bg-green-100 text-green-800"],rejected:["ไม่อนุมัติ","bg-red-100 text-red-800"],cancelled:["ยกเลิกแล้ว","bg-gray-200 text-gray-700"]}[String(status).toLowerCase()] || [status,"bg-gray-100 text-gray-700"]);
  const formatDate = (date) => date ? new Intl.DateTimeFormat("th-TH", {dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Bangkok"}).format(new Date(date)) : "ไม่มีข้อมูลวันที่ (คำร้องเก่า)";
  const sorted = [...applications].filter(a => ["pending", "approved"].includes(String(a.status).toLowerCase())).filter(a => filter === "all" || a.status === filter).sort((a,b) => (Date.parse(b.created_at || 0) || 0) - (Date.parse(a.created_at || 0) || 0) || (b.application_id || b.id || 0) - (a.application_id || a.id || 0));
  const apply = async () => {
    setConfirm(false);
    try { setLoading(true); await apiService.applyCompany({company_id:Number(companyId),position}); setCompanyId("");setPosition("");setNotice("ส่งคำร้องสำเร็จ");await loadData(); }
    catch(e){setNotice(getApiErrorMessage(e,"ส่งคำร้องไม่สำเร็จ"));}
    finally{setLoading(false);}
  };
  const cancel = async id => {
    if (!await askPopup("ยืนยันยกเลิกคำร้องนี้?")) return;
    try { await apiService.cancelApplication(id); setNotice("ยกเลิกคำร้องแล้ว");await loadData(); }
    catch(e){setNotice(getApiErrorMessage(e,"ยกเลิกไม่สำเร็จ"));}
  };
  return <div className="space-y-6">
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 space-y-4">
      <h3 className="text-[#800000] font-black text-lg">ยื่นคำร้องเลือกสถานประกอบการ</h3>
      {notice && <div role="status" className="rounded-xl bg-blue-50 p-3 text-blue-800">{notice}<button className="ml-4" onClick={()=>setNotice("")}>✕</button></div>}
      {active && <p className="p-3 bg-amber-50 rounded-xl text-amber-800">มีคำร้องรอพิจารณาหรืออนุมัติแล้ว สามารถยื่นใหม่ได้เมื่อคำร้องถูกปฏิเสธหรือยกเลิกเท่านั้น</p>}
      <label className="block font-bold">สถานประกอบการ</label>
      <select className="w-full p-3 rounded-xl border" value={companyId} disabled={active || loadingData} onChange={e=>{setCompanyId(e.target.value);setPosition("");}}><option value="">-- เลือกบริษัท --</option>{companies.map(c=><option key={c.id||c.company_id} value={c.id||c.company_id}>{c.company_name||c.name}</option>)}</select>
      <label className="block font-bold">ตำแหน่งงาน</label>
      {positions.length ? <select className="w-full p-3 rounded-xl border" value={position} disabled={!companyId||active} onChange={e=>setPosition(e.target.value)}><option value="">-- เลือกตำแหน่ง --</option>{positions.map(p=><option key={p} value={p}>{p}</option>)}</select> : <input className="w-full p-3 rounded-xl border" value={position} disabled={!companyId||active} onChange={e=>setPosition(e.target.value)} placeholder={companyId?"กรอกตำแหน่ง (บริษัทนี้ยังไม่มีรายการตำแหน่งใน API)":"กรุณาเลือกบริษัทก่อน"}/>}
      <button className="px-6 py-3 bg-[#800000] text-white rounded-xl font-bold disabled:opacity-40" disabled={active||!companyId||!position.trim()||loading} onClick={()=>setConfirm(true)}>ยื่นคำร้อง</button>
    </div>
    <div className="bg-white p-6 rounded-3xl border space-y-4"><div className="flex justify-between items-center gap-2"><h3 className="font-black">ประวัติคำร้อง (ล่าสุดก่อน)</h3><select aria-label="กรองสถานะ" className="p-2 border rounded-xl" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">ทั้งหมด</option><option value="pending">รอพิจารณา</option><option value="approved">อนุมัติ</option><option value="rejected">ปฏิเสธ</option><option value="cancelled">ยกเลิก</option></select></div>
      {loadingData?<LoadingBox/>:sorted.length===0?<p>ไม่มีคำร้องในรายการนี้</p>:sorted.map(a=><div key={a.application_id||a.id} className="p-4 rounded-2xl border bg-gray-50"><div className="flex justify-between gap-2"><strong>{a.company_name||"-"}</strong><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMeta(a.status)[1]}`}>{statusMeta(a.status)[0]}</span></div><p className="text-sm">ตำแหน่ง: {a.position||"ไม่ระบุ"}</p><p className="text-xs text-gray-500">คำร้อง #{a.application_id||a.id} · ยื่นเมื่อ {formatRequestSubmittedAt(a)}</p>{a.status==="pending"&&<button className="mt-2 text-red-700 text-sm underline" onClick={()=>cancel(a.application_id||a.id)}>ยกเลิกคำร้อง</button>}</div>)}
    </div>
    {confirm&&<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true"><div className="bg-white max-w-md w-full rounded-3xl p-7 shadow-2xl"><h3 className="text-xl font-black text-[#800000] mb-3">ยืนยันการยื่นคำร้อง</h3><p>บริษัท: <strong>{selected?.company_name||selected?.name}</strong></p><p>ตำแหน่ง: <strong>{position}</strong></p><p className="text-sm text-gray-500 mt-3">เมื่อยื่นแล้วจะไม่สามารถยื่นคำร้องอื่นได้จนกว่าคำร้องนี้จะถูกปฏิเสธหรือยกเลิก</p><div className="flex justify-end gap-3 mt-6"><button className="px-4 py-2 rounded-xl bg-gray-100" onClick={()=>setConfirm(false)}>กลับไปแก้ไข</button><button className="px-4 py-2 rounded-xl bg-[#800000] text-white" onClick={apply}>ยืนยันส่งคำร้อง</button></div></div></div>}
  </div>;
};

// ============================================================
// COORDINATOR MANAGEMENT
// ============================================================

const CoordinatorManagement = ({ activeTab }) => {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");
  const [events, setEvents] = useState([]);

  const [loadingApplications, setLoadingApplications] =
    useState(false);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingEvents, setLoadingEvents] =
    useState(false);

  const [error, setError] = useState("");

  // Role editing for Coordinator > All Students
  const [editingRoleId, setEditingRoleId] =
    useState(null);

  const [selectedRole, setSelectedRole] =
    useState("student");

  const [savingRole, setSavingRole] =
    useState(false);

  // -------------------------------------------------------
  // แปลง Error จาก FastAPI ไม่ให้กลายเป็น [object Object]
  // -------------------------------------------------------
  const getApiErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
      return (
        error?.message ||
        "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      );
    }

    if (typeof data === "string") {
      return data;
    }

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            const field = Array.isArray(item.loc)
              ? item.loc.join(".")
              : "";

            return field
              ? `${field}: ${item.msg}`
              : item.msg;
          }

          return JSON.stringify(item);
        })
        .join("\n");
    }

    if (data.message) {
      return typeof data.message === "string"
        ? data.message
        : JSON.stringify(data.message, null, 2);
    }

    if (data.error) {
      return typeof data.error === "string"
        ? data.error
        : JSON.stringify(data.error, null, 2);
    }

    return JSON.stringify(data, null, 2);
  };

  // -------------------------------------------------------
  // แปลงข้อมูลที่อาจเป็น object ให้แสดงเป็นข้อความ
  // -------------------------------------------------------
  const displayValue = (
    value,
    fallback = "-"
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) =>
          displayValue(item, "")
        )
        .filter(Boolean)
        .join(", ");
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.company_name ||
        value.full_name ||
        value.first_name ||
        value.username ||
        value.student_id ||
        value.id ||
        "-"
      );
    }

    return String(value);
  };

  // -------------------------------------------------------
  // ดึงชื่อจาก object นักศึกษา
  // -------------------------------------------------------
  const getStudentName = (
    application
  ) => {
    const student =
      application.student ||
      application.user ||
      application.student_profile ||
      null;

    if (application.student_name) {
      return displayValue(
        application.student_name
      );
    }

    if (application.full_name) {
      return displayValue(
        application.full_name
      );
    }

    if (student) {
      if (student.full_name) {
        return displayValue(
          student.full_name
        );
      }

      if (
        student.first_name ||
        student.last_name
      ) {
        return [
          student.first_name,
          student.last_name,
        ]
          .filter(Boolean)
          .join(" ");
      }

      if (student.name) {
        return displayValue(
          student.name
        );
      }

      if (student.username) {
        return displayValue(
          student.username
        );
      }
    }

    return "-";
  };

  // -------------------------------------------------------
  // ดึงรหัสนักศึกษา
  // -------------------------------------------------------
  const getStudentId = (
    application
  ) => {
    const student =
      application.student ||
      application.user ||
      application.student_profile ||
      null;

    return displayValue(
      application.student_id ||
        application.studentId ||
        student?.student_id ||
        student?.studentId ||
        student?.id,
      "-"
    );
  };

  // -------------------------------------------------------
  // ดึงบริษัท
  // -------------------------------------------------------
  const getCompanyName = (
    application
  ) => {
    const company =
      application.company ||
      application.company_data ||
      null;

    return displayValue(
      application.company_name ||
        application.companyName ||
        company?.company_name ||
        company?.name ||
        application.company_id,
      "-"
    );
  };

  // -------------------------------------------------------
  // ดึงสถานะ
  // -------------------------------------------------------
  const getApplicationStatus = (
    application
  ) => {
    return (
      application.status ||
      application.application_status ||
      application.approval_status ||
      "pending"
    );
  };

  // -------------------------------------------------------
  // ดึง Applications
  // -------------------------------------------------------
  const fetchApplications =
    async () => {
      try {
        setLoadingApplications(true);
        setError("");

        const response =
          await api.get(
            "/applications"
          );

        console.log(
          "APPLICATION API RESPONSE:",
          response.data
        );

        let data = [];

        if (
          Array.isArray(
            response.data
          )
        ) {
          data = response.data;
        } else if (
          Array.isArray(
            response.data?.applications
          )
        ) {
          data =
            response.data.applications;
        } else if (
          Array.isArray(
            response.data?.data
          )
        ) {
          data =
            response.data.data;
        } else if (
          response.data
        ) {
          data = [response.data];
        }

        setApplications(data);
      } catch (error) {
        console.error(
          "Fetch Applications Error:",
          error
        );

        setError(
          getApiErrorMessage(error)
        );

        setApplications([]);
      } finally {
        setLoadingApplications(false);
      }
    };

  // -------------------------------------------------------
  // ดึงนักศึกษาทั้งหมด
  // -------------------------------------------------------
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setUsersError("");
      const [studentsResult, usersResult] = await Promise.allSettled([
        api.get("/students"),
        apiService.getUsers(),
      ]);

      if (studentsResult.status === "fulfilled") {
        const payload = studentsResult.value.data;
        setStudents(
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.students) ? payload.students :
          Array.isArray(payload?.data) ? payload.data : []
        );
      } else {
        console.error("GET /students ERROR:", studentsResult.reason);
        setStudents([]);
        setError(getApiErrorMessage(studentsResult.reason));
      }

      if (usersResult.status === "fulfilled") {
        const payload = usersResult.value.data;
        const userList =
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.users) ? payload.users :
          Array.isArray(payload?.data) ? payload.data : [];
        setUsers(userList);
        console.log("GET /users:", userList);
      } else {
        console.error("GET /users ERROR:", usersResult.reason);
        setUsers([]);
        setUsersError(getApiErrorMessage(usersResult.reason));
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  // -------------------------------------------------------
  // ดึงผู้ใช้งานทั้งหมด
  // -------------------------------------------------------
  const fetchUsers = async () => {
    try {
      setLoadingStudents(true);
      setUsersError("");
      setError("");

      const response = await apiService.getUsers();
      const payload = response.data;
      const userList =
        Array.isArray(payload) ? payload :
        Array.isArray(payload?.users) ? payload.users :
        Array.isArray(payload?.data) ? payload.data : [];

      console.log("GET /users:", userList);
      setUsers(userList);
    } catch (error) {
      console.error("GET /users ERROR:", error);
      setUsers([]);
      const message = getApiErrorMessage(error);
      setUsersError(message);
      setError(message);
    } finally {
      setLoadingStudents(false);
    }
  };

  // -------------------------------------------------------
  // โหลดข้อมูลเมื่อเข้าหน้าจัดการคำร้อง
  // -------------------------------------------------------
  useEffect(() => {
    if (
      activeTab ===
      "manage_requests"
    ) {
      fetchApplications();
    }

    if (
      activeTab ===
      "MANAGE_USER_ID"
    ) {
      fetchUsers();
    }
  }, [activeTab]);

  // -------------------------------------------------------
  // อนุมัติคำร้อง
  // -------------------------------------------------------
  const handleApprove =
    async (applicationId) => {
      if (!applicationId) {
        showPopup(
          "ไม่พบ ID ของคำร้อง"
        );
        return;
      }

      try {
        await api.put(
          `/applications/${applicationId}/approve`
        );

        showPopup(
          "อนุมัติคำร้องเรียบร้อยแล้ว"
        );

        await fetchApplications();
      } catch (error) {
        console.error(
          "Approve Error:",
          error
        );

        showPopup(
          `ไม่สามารถอนุมัติคำร้องได้\n\n${getApiErrorMessage(
            error
          )}`
        );
      }
    };

  // -------------------------------------------------------
  // ปฏิเสธคำร้อง
  // -------------------------------------------------------
  const handleReject =
    async (applicationId) => {
      if (!applicationId) {
        showPopup(
          "ไม่พบ ID ของคำร้อง"
        );
        return;
      }

      const confirmReject =
        await askPopup(
          "คุณต้องการปฏิเสธคำร้องนี้ใช่หรือไม่?"
        );

      if (!confirmReject) {
        return;
      }

      try {
        await api.put(
          `/applications/${applicationId}/reject`
        );

        showPopup(
          "ปฏิเสธคำร้องเรียบร้อยแล้ว"
        );

        await fetchApplications();
      } catch (error) {
        console.error(
          "Reject Error:",
          error
        );

        showPopup(
          `ไม่สามารถปฏิเสธคำร้องได้\n\n${getApiErrorMessage(
            error
          )}`
        );
      }
    };

  // -------------------------------------------------------
  // แก้ไข Role ของ User โดยใช้ users.id โดยตรง
  // -------------------------------------------------------
  const startEditRole = (user) => {
    if (!user?.id) {
      showPopup("ไม่พบ User ID สำหรับแก้ไข Role");
      return;
    }

    setEditingRoleId(String(user.id));
    setSelectedRole(user?.role || "student");
  };

  const handleSaveRole = async (user) => {
    const userId = user?.id;

    if (!userId) {
      showPopup("ไม่พบ User ID สำหรับแก้ไข Role");
      return;
    }

    if (!selectedRole) {
      showPopup("กรุณาเลือก Role");
      return;
    }

    try {
      setSavingRole(true);

      console.log("CHANGE ROLE REQUEST:", {
        userId,
        username: user?.username,
        oldRole: user?.role,
        role: selectedRole,
      });

      await apiService.changeUserRole(
        userId,
        selectedRole
      );

      showPopup("แก้ไข Role เรียบร้อยแล้ว");
      setEditingRoleId(null);
      await fetchUsers();
    } catch (error) {
      console.error("Change User Role Error:", error);
      showPopup(
        `ไม่สามารถแก้ไข Role ได้\n\n${getApiErrorMessage(error)}`
      );
    } finally {
      setSavingRole(false);
    }
  };

  // -------------------------------------------------------
  // แสดงสถานะ
  // -------------------------------------------------------
  const renderStatus = (
    status
  ) => {
    const normalized =
      String(status || "")
        .toLowerCase()
        .trim();

    if (
      normalized ===
        "approved" ||
      normalized ===
        "approve" ||
      normalized ===
        "accepted"
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
          อนุมัติแล้ว
        </span>
      );
    }

    if (
      normalized ===
        "rejected" ||
      normalized ===
        "reject" ||
      normalized ===
        "denied"
    ) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-600 border border-red-100">
          ปฏิเสธ
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-600 border border-amber-100">
        รอตรวจสอบ
      </span>
    );
  };

  // =======================================================
  // MANAGE REQUESTS
  // =======================================================
  if (
    activeTab ===
    "manage_requests"
  ) {
    const approvedCount =
      applications.filter(
        (item) => {
          const status =
            String(
              getApplicationStatus(
                item
              )
            ).toLowerCase();

    return (
            status ===
              "approved" ||
            status ===
              "approve" ||
            status ===
              "accepted"
          );
        }
      ).length;

          // แสดงเฉพาะคำร้องที่ยังใช้งาน และเรียงจากวันที่ยื่นล่าสุด
    const visibleApplications = applications
      .filter((item) => !["rejected", "reject", "denied", "cancelled", "canceled"].includes(
        String(getApplicationStatus(item)).toLowerCase()
      ))
      .sort((a, b) => {
        const submittedAt = (item) => Date.parse(
          item.created_at || item.submitted_at || item.application_date || item.createdAt || ""
        ) || 0;
        return submittedAt(b) - submittedAt(a) ||
          Number(b.application_id || b.id || 0) - Number(a.application_id || a.id || 0);
      });

    const pendingCount =
      applications.filter(
        (item) => {
          const status =
            String(
              getApplicationStatus(
                item
              )
            ).toLowerCase();

          return (
            status ===
              "pending" ||
            status === "wait" ||
            status ===
              "waiting"
          );
        }
      ).length;

    const rejectedCount =
      applications.filter(
        (item) => {
          const status =
            String(
              getApplicationStatus(
                item
              )
            ).toLowerCase();

          return (
            status ===
              "rejected" ||
            status === "reject" ||
            status ===
              "denied"
          );
        }
      ).length;

    return (
      <div className="space-y-6">

        {/* ================================================
            STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-white p-5 rounded-3xl border border-emerald-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-black text-emerald-600">
                อนุมัติแล้ว
              </p>

              <h4 className="text-2xl font-black text-emerald-700 mt-1">
                {approvedCount}

                <span className="text-xs font-bold text-gray-400 ml-1">
                  รายการ
                </span>
              </h4>
            </div>

            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black">
              OK
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-black text-amber-600">
                รอตรวจสอบ
              </p>

              <h4 className="text-2xl font-black text-amber-700 mt-1">
                {pendingCount}

                <span className="text-xs font-bold text-gray-400 ml-1">
                  รายการ
                </span>
              </h4>
            </div>

            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black">
              WAIT
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-red-100 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-black text-red-600">
                ปฏิเสธ
              </p>

              <h4 className="text-2xl font-black text-red-700 mt-1">
                {rejectedCount}

                <span className="text-xs font-bold text-gray-400 ml-1">
                  รายการ
                </span>
              </h4>
            </div>

            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center font-black">
              REJ
            </div>
          </div>

        </div>

        {/* ================================================
            APPLICATION TABLE
        ================================================= */}

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">

            <div>
              <h3 className="text-[#800000] font-black flex items-center gap-2 text-lg">
                <ClipboardCheck size={24} />

                จัดการและอนุมัติคำร้องเลือกสถานประกอบการ
              </h3>

              <p className="text-xs text-gray-400 font-bold mt-1">
                ข้อมูลจากระบบ Applications
              </p>
            </div>

            <button
              onClick={
                fetchApplications
              }
              disabled={
                loadingApplications
              }
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-xs font-black text-gray-600"
            >
              {loadingApplications
                ? "กำลังโหลด..."
                : "รีเฟรชข้อมูล"}
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600 whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">

                  {/* รหัสนักศึกษา */}

                  <th className="pb-3 pr-4">
                    รหัสนักศึกษา
                  </th>

                  {/* ชื่อ */}

                  <th className="pb-3 pr-4">
                    ชื่อ
                  </th>

                  {/* บริษัท */}

                  <th className="pb-3 pr-4">
                    บริษัท
                  </th>

                  <th className="pb-3 pr-4">วันที่และเวลาที่ยื่น</th>

                  {/* สถานะ */}

                  <th className="pb-3 pr-4 text-center">
                    สถานะ
                  </th>

                  {/* การจัดการ */}

                  <th className="pb-3 text-right">
                    การจัดการ
                  </th>

                </tr>

              </thead>

              <tbody className="text-sm font-bold text-gray-700 divide-y divide-gray-50">

                {loadingApplications ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-gray-400"
                    >
                      กำลังโหลดข้อมูลคำร้อง...
                    </td>
                  </tr>

                ) : visibleApplications.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center"
                    >

                      <div className="text-gray-300 mb-2">

                        <ClipboardCheck
                          size={40}
                          className="mx-auto"
                        />

                      </div>

                      <p className="text-gray-400 font-black">
                        ยังไม่มีคำร้องสถานประกอบการ
                      </p>

                      <p className="text-xs text-gray-300 mt-1">
                        เมื่อมีนักศึกษายื่นคำร้อง ข้อมูลจะแสดงที่นี่
                      </p>

                    </td>
                  </tr>

                ) : (

                  visibleApplications.map(
                    (
                      application,
                      index
                    ) => {

                      const applicationId =
                        application.id ||
                        application.application_id ||
                        application.applicationId;

                      const status =
                        getApplicationStatus(
                          application
                        );

                      const studentName =
                        getStudentName(
                          application
                        );

                      const studentId =
                        getStudentId(
                          application
                        );

                      const companyName =
                        getCompanyName(
                          application
                        );

                      return (
                        <tr
                          key={
                            applicationId ||
                            `application-${index}`
                          }
                          className="hover:bg-gray-50/50 transition-colors"
                        >

                          {/* STUDENT ID */}

                          <td className="py-4 pr-4">

                            <span className="font-mono text-xs font-black text-gray-500">
                              {studentId}
                            </span>

                          </td>

                          {/* NAME */}

                          <td className="py-4 pr-4">

                            <div className="font-black text-gray-800">
                              {studentName}
                            </div>

                          </td>

                          {/* COMPANY */}

                          <td className="py-4 pr-4">

                            <div className="font-black text-[#800000]">
                              {companyName}
                            </div>

                          </td>

                          <td className="py-4 pr-4 text-xs text-gray-600 whitespace-nowrap">
                            {formatRequestSubmittedAt(application)}
                          </td>

                          {/* STATUS */}

                          <td className="py-4 pr-4 text-center">
                            {renderStatus(
                              status
                            )}
                          </td>

                          {/* ACTION */}

                          <td className="py-4 text-right">

                            <div className="flex justify-end gap-2">

                              <button
                                onClick={() =>
                                  handleApprove(
                                    applicationId
                                  )
                                }
                                disabled={
                                  !applicationId ||
                                  String(
                                    status
                                  ).toLowerCase() ===
                                    "approved"
                                }
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                              >
                                อนุมัติ
                              </button>

                              <button
                                onClick={() =>
                                  handleReject(
                                    applicationId
                                  )
                                }
                                disabled={
                                  !applicationId ||
                                  String(
                                    status
                                  ).toLowerCase() ===
                                    "rejected"
                                }
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-xs font-black transition-all shadow-sm"
                              >
                                ปฏิเสธ
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    );
  }

  // =======================================================
  // ALL USERS
  // =======================================================

  if (
    activeTab ===
    "MANAGE_USER_ID"
  ) {
    return (
      <div className="space-y-6">

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">

          <div className="mb-6">
            <h3 className="text-[#800000] font-black flex items-center gap-2 text-lg">
              <Users size={24} />
              จัดการผู้ใช้งานทั้งหมด
            </h3>

            <p className="text-xs text-gray-400 font-bold mt-1">
              รายชื่อบัญชีผู้ใช้งานทั้งหมดจาก GET /users
            </p>
          </div>

          {usersError && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
              {usersError}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                  <th className="pb-3">
                    ID
                  </th>

                  <th className="pb-3">
                    Username
                  </th>

                  <th className="pb-3">
                    Role
                  </th>

                  <th className="pb-3 text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loadingStudents ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-gray-400 font-bold"
                    >
                      กำลังโหลดข้อมูลผู้ใช้งาน...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-gray-400 font-bold"
                    >
                      ไม่พบข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => {
                    const isEditingRole =
                      user?.id &&
                      editingRoleId ===
                        String(user.id);

                    return (
                      <tr
                        key={
                          user?.id ||
                          user?.username ||
                          index
                        }
                        className="hover:bg-gray-50/50"
                      >
                        <td className="py-4 font-bold text-gray-500">
                          {user?.id ?? "-"}
                        </td>

                        <td className="py-4 font-black text-gray-700">
                          {user?.username || "-"}
                        </td>

                        <td className="py-4">
                          {isEditingRole ? (
                            <select
                              value={selectedRole}
                              onChange={(event) =>
                                setSelectedRole(
                                  event.target.value
                                )
                              }
                              className="border border-gray-200 rounded-xl px-3 py-2 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-[#800000]/20"
                            >
                              <option value="student">
                                student
                              </option>

                              <option value="teacher">
                                teacher
                              </option>

                              <option value="admin">
                                admin
                              </option>
                            </select>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                              {user?.role || "-"}
                            </span>
                          )}
                        </td>

                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            {isEditingRole ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveRole(user)
                                  }
                                  disabled={savingRole}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  <Save size={15} />
                                  {savingRole
                                    ? "กำลังบันทึก..."
                                    : "บันทึก"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingRoleId(null)
                                  }
                                  disabled={savingRole}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-black hover:bg-gray-200 disabled:opacity-50"
                                >
                                  <X size={15} />
                                  ยกเลิก
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  startEditRole(user)
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#800000] text-white text-xs font-black hover:bg-[#660000]"
                              >
                                <Pencil size={15} />
                                แก้ไข Role
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    );
  }

  return null;
};



// ============================================================
// ADVISOR MANAGEMENT
// ============================================================

const AdvisorManagement = ({
  activeTab,
}) => {
  const [myStudents, setMyStudents] =
    useState([]);

  const [supervisions, setSupervisions] =
    useState([]);

  const [dashboard, setDashboard] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [profileForm, setProfileForm] =
    useState({
      username: "",
      rank: "",
      role: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
    });

  // ป้องกัน React error #31: ห้าม render object ตรง ๆ ใน JSX
  const safeText = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (["string", "number", "boolean"].includes(typeof value)) return String(value);
    if (Array.isArray(value)) {
      return value.map((item) => safeText(item, "")).filter(Boolean).join(", ") || fallback;
    }
    if (typeof value === "object") {
      return safeText(
        value.student_name || value.company_name || value.full_name || value.name ||
          value.username || value.student_id || value.id,
        fallback
      );
    }
    return String(value);
  };

  const fetchAdvisorData = async () => {
      try {
        setLoading(true);

        // โหลด Profile แยกจาก API อื่น เพื่อไม่ให้ dashboard/supervisions
        // ที่ error 500 ทำให้ rank/role ของอาจารย์หาย
        try {
          const profileResponse =
            await apiService.getTeacherProfile();

          console.log(
            "GET /teacher/me RAW RESPONSE:",
            profileResponse.data
          );

          const teacherProfile =
            normalizeProfile(
              profileResponse.data
            );

          console.log(
            "NORMALIZED TEACHER PROFILE:",
            teacherProfile
          );

          setProfile(teacherProfile);

          if (teacherProfile?.username) {
            localStorage.setItem(
              "username",
              String(
                teacherProfile.username
              )
            );
          }

          if (teacherProfile?.rank) {
            localStorage.setItem(
              "teacherRank",
              String(
                teacherProfile.rank
              )
            );
          }

          if (teacherProfile?.role) {
            localStorage.setItem(
              "backendRole",
              String(
                teacherProfile.role
              )
            );
          }

          setProfileForm((prev) => ({
            ...prev,
            username:
              teacherProfile?.username ||
              localStorage.getItem(
                "username"
              ) ||
              "",
            rank:
              teacherProfile?.rank ||
              localStorage.getItem(
                "teacherRank"
              ) ||
              "",
            role:
              teacherProfile?.role ||
              localStorage.getItem(
                "backendRole"
              ) ||
              "teacher",
            first_name:
              teacherProfile?.first_name ||
              "",
            last_name:
              teacherProfile?.last_name ||
              "",
            email:
              teacherProfile?.email ||
              "",
          }));
        } catch (profileError) {
          console.error(
            "Teacher Profile API Error:",
            profileError
          );

          // ใช้ค่าที่เคยโหลดสำเร็จเป็น fallback
          setProfileForm((prev) => ({
            ...prev,
            username:
              prev?.username ||
              localStorage.getItem(
                "username"
              ) ||
              "",
            rank:
              prev?.rank ||
              localStorage.getItem(
                "teacherRank"
              ) ||
              "",
            role:
              prev?.role ||
              localStorage.getItem(
                "backendRole"
              ) ||
              "teacher",
          }));
        }

        // API ส่วนอื่นโหลดแยกกัน แต่ละตัว fail ได้โดยไม่กระทบ Profile
        const otherRequests = [];

        // โหลดนักศึกษาในความดูแลของอาจารย์
        otherRequests.push(
          apiService
            .getTeacherStudents()
            .then((response) => {
              console.log(
                "GET /teacher/students RAW RESPONSE:",
                response?.data
              );

              const payload =
                response?.data;

              const studentList =
                Array.isArray(payload)
                  ? payload
                  : Array.isArray(payload?.students)
                  ? payload.students
                  : Array.isArray(payload?.data)
                  ? payload.data
                  : Array.isArray(payload?.items)
                  ? payload.items
                  : [];

              console.log(
                "NORMALIZED TEACHER STUDENTS:",
                studentList
              );

              setMyStudents(
                studentList
              );
            })
            .catch((error) => {
              console.error(
                "Teacher Students API Error:",
                error
              );

              setMyStudents([]);
            })
        );

        otherRequests.push(
          apiService
            .getTeacherDashboard()
            .then((response) => {
              setDashboard(
                response?.data || null
              );
            })
            .catch((error) => {
              console.error(
                "Teacher Dashboard API Error:",
                error
              );
            })
        );

        otherRequests.push(
          apiService
            .getTeacherSupervisions()
            .then((response) => {
              const data =
                response?.data?.supervisions ||
                response?.data ||
                [];
              setSupervisions(
                Array.isArray(data)
                  ? data
                  : []
              );
            })
            .catch((error) => {
              console.error(
                "Teacher Supervisions API Error:",
                error
              );
            })
        );

        await Promise.allSettled(
          otherRequests
        );
      } catch (error) {
        console.error(
          "Advisor API:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAdvisorData();
  }, []);

  // ----------------------------------------------------------
  // CREATE SUPERVISION
  // ----------------------------------------------------------

  const findCompanyId = async (student) => {
    const directId =
      student?.company_id ||
      student?.companyId ||
      (typeof student?.company === "object"
        ? student.company?.id || student.company?.company_id
        : null);

    if (directId) return Number(directId);

    const companyName =
      student?.company_name ||
      (typeof student?.company === "string"
        ? student.company
        : student?.company?.company_name || student?.company?.name);

    if (!companyName) return null;

    try {
      const response = await apiService.getCompanies();
      const companies = normalizeList(response?.data, ["companies", "data", "items"]);
      const matched = companies.find((company) =>
        String(company?.company_name || company?.name || "").trim().toLowerCase() ===
        String(companyName).trim().toLowerCase()
      );
      return matched ? Number(matched.id || matched.company_id) : null;
    } catch (error) {
      console.error("Find company_id error:", error);
      return null;
    }
  };

  const saveSupervision = async (student, note, details) => {
    if (!details.date || !details.position.trim() || !details.project.trim()) {
      showPopup("กรุณากรอกวันที่นิเทศ ตำแหน่ง และโปรเจกต์ของนักศึกษา");
      return;
    }
    const cleanNote = String(note || "").trim();
    if (!cleanNote) {
      showPopup("กรุณากรอกผลการนิเทศ");
      return;
    }

    const studentId = student?.student_id || student?.id;
    if (!studentId) {
      showPopup("ไม่พบรหัสนักศึกษา");
      return;
    }

    try {
      setSaving(true);
      const companyId = await findCompanyId(student);
      if (!companyId) {
        showPopup(`ไม่พบ company_id ของบริษัท ${safeText(student?.company_name || student?.company)}`);
        return;
      }

      const payload = {
        student_id: String(studentId),
        company_id: Number(companyId),
        date: details.date,
        type: details.type,
        position: details.position.trim(),
        project: details.project.trim(),
        note: cleanNote,
        status: "completed",
      };

      console.log("POST /supervision PAYLOAD:", payload);
      await apiService.createSupervision(payload);
      showPopup("บันทึกผลการนิเทศเรียบร้อยแล้ว");

      const response = await apiService.getTeacherSupervisions();
      setSupervisions(normalizeList(response?.data, ["supervisions", "data", "items"]));
    } catch (error) {
      console.error("Create Supervision Error:", error);
      showPopup(getApiErrorMessage(error, "ไม่สามารถบันทึกผลการนิเทศได้"));
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // UPDATE TEACHER PROFILE
  // ----------------------------------------------------------

  const updateProfile =
    async () => {
      try {
        setSaving(true);

        const username =
          profile?.username ||
          profileForm?.username ||
          localStorage.getItem("username") ||
          "";

        if (!username) {
          showPopup(
            "ไม่พบ username ของอาจารย์ กรุณาเข้าสู่ระบบใหม่"
          );
          return;
        }

        localStorage.setItem(
          "username",
          String(username)
        );

        const teacherRank =
          profileForm?.rank?.trim() ||
          profile?.rank ||
          localStorage.getItem(
            "teacherRank"
          ) ||
          "";

        console.log(
          "TEACHER RANK BEFORE SAVE:",
          {
            formRank:
              profileForm?.rank,
            profileRank:
              profile?.rank,
            savedRank:
              localStorage.getItem(
                "teacherRank"
              ),
            finalRank:
              teacherRank,
          }
        );

        if (!teacherRank) {
          showPopup(
            "กรุณากรอกตำแหน่ง (rank)"
          );
          return;
        }

        localStorage.setItem(
          "teacherRank",
          String(teacherRank)
        );

        const teacherRole =
          profileForm?.role ||
          profile?.role ||
          localStorage.getItem("backendRole") ||
          "teacher";

        localStorage.setItem(
          "backendRole",
          String(teacherRole)
        );

        const payload = {
          username: String(username),

          rank: teacherRank,

          role: teacherRole,

          first_name:
            profileForm?.first_name || "",

          last_name:
            profileForm?.last_name || "",

          email:
            profileForm?.email || "",
        };

        console.log(
          "PUT /teacher/me PAYLOAD:",
          payload
        );

        await apiService.updateTeacherProfile(
          payload
        );

        showPopup(
          "บันทึก Profile อาจารย์เรียบร้อยแล้ว"
        );

        await fetchAdvisorData();
      } catch (error) {
        console.error(
          "Update Teacher Profile Error:",
          error
        );

        showPopup(
          getApiErrorMessage(
            error,
            "ไม่สามารถแก้ไข Profile ได้"
          )
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl">
        <LoadingBox text="กำลังโหลดข้อมูลอาจารย์..." />
      </div>
    );
  }

  // ==========================================================
  // SUPERVISE
  // ==========================================================

  if (
    activeTab ===
    "supervise"
  ) {
    return (
      <div className="space-y-6">

        {/* DASHBOARD */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-white p-5 rounded-3xl border border-gray-100">

            <p className="text-xs text-gray-400 font-black">
              นักศึกษาในความดูแล
            </p>

            <p className="text-3xl text-[#800000] font-black mt-2">
              {myStudents.length}
            </p>

          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100">

            <p className="text-xs text-gray-400 font-black">
              รายการ Supervision
            </p>

            <p className="text-3xl text-[#800000] font-black mt-2">
              {supervisions.length}
            </p>

          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100">

            <p className="text-xs text-gray-400 font-black">
              สถานะ Dashboard
            </p>

            <p className="text-lg text-emerald-600 font-black mt-2">
              Connected
            </p>

          </div>

        </div>

        {/* SUPERVISION */}

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">

          <div className="mb-6">

            <h3 className="text-[#800000] font-black flex items-center gap-2 text-lg">
              <ClipboardCheck size={24} />
              บันทึกผลนิเทศงาน
            </h3>

            <p className="text-xs text-gray-400 font-bold mt-1">
              ข้อมูลจะถูกบันทึกผ่าน API `/supervision`
            </p>

          </div>

          <div className="space-y-6">

            {myStudents.length ===
            0 ? (
              <div className="text-center py-10 text-gray-400">
                ยังไม่มีนักศึกษาในความดูแล
              </div>
            ) : (
              myStudents.map(
                (student) => {

                  const studentId =
                    student.student_id ||
                    student.id;

                  return (
                    <div
                      key={studentId}
                      className="p-6 bg-gray-50 rounded-3xl border border-gray-100"
                    >

                      <div className="border-b border-gray-200/60 pb-4 mb-4">

                        <h4 className="font-black text-gray-800">
                          {student.student_name ||
                            student.name ||
                            `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                            "-"}
                        </h4>

                        <p className="text-xs text-gray-400 font-bold mt-1">
                          รหัส:{" "}
                          {studentId}
                        </p>

                        <p className="text-xs text-gray-400 font-bold mt-1">
                          บริษัท:{" "}
                          <span className="text-gray-700">
                            {safeText(
                              student.company_name || student.company
                            )}
                          </span>
                        </p>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <label className="text-xs font-black text-gray-500">วันที่ไปนิเทศ
                          <input id={`supervision-date-${studentId}`} type="date" required className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl" />
                        </label>
                        <label className="text-xs font-black text-gray-500">รูปแบบการนิเทศ
                          <select id={`supervision-type-${studentId}`} defaultValue="onsite" className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl">
                            <option value="online">Online</option>
                            <option value="onsite">Onsite</option>
                          </select>
                        </label>
                        <label className="text-xs font-black text-gray-500">ตำแหน่งฝึกงาน
                          <input id={`supervision-position-${studentId}`} type="text" defaultValue={student.position || ""} placeholder="ระบุตำแหน่ง" className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl" />
                        </label>
                        <label className="text-xs font-black text-gray-500">โปรเจกต์ที่นักศึกษาทำ
                          <input id={`supervision-project-${studentId}`} type="text" placeholder="ชื่อโปรเจกต์" className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl" />
                        </label>
                      </div>
                      <div className="space-y-2">

                        <label className="text-xs font-black text-gray-500">
                          ผลการตรวจนิเทศและข้อเสนอแนะ
                        </label>

                        <div className="flex flex-col md:flex-row gap-2">

                          <textarea
                            id={`note-${studentId}`}
                            defaultValue={
                              student.note ||
                              ""
                            }
                            placeholder="กรอกผลการนิเทศ..."
                            className="flex-1 p-4 text-xs font-bold bg-white border border-gray-100 rounded-2xl outline-none focus:border-[#800000] min-h-[110px]"
                          />

                          <button
                            disabled={saving}
                            onClick={() => {

                              const element =
                                document.getElementById(
                                  `note-${studentId}`
                                );

                              saveSupervision(
                                student,
                                element?.value || "",
                                {
                                  date: document.getElementById(`supervision-date-${studentId}`)?.value || "",
                                  type: document.getElementById(`supervision-type-${studentId}`)?.value || "onsite",
                                  position: document.getElementById(`supervision-position-${studentId}`)?.value || "",
                                  project: document.getElementById(`supervision-project-${studentId}`)?.value || "",
                                }
                              );
                            }}
                            className="md:w-32 bg-[#800000] hover:bg-black text-white font-black text-xs px-4 py-3 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Save
                              size={15}
                            />

                            {saving
                              ? "กำลังบันทึก"
                              : "บันทึก"}
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </div>

        {/* ประวัติการนิเทศจาก GET /teacher/supervisions */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h3 className="text-[#800000] font-black flex items-center gap-2 text-lg">
              <ClipboardCheck size={24} />
              ประวัติการนิเทศ
            </h3>
            <button
              type="button"
              onClick={fetchAdvisorData}
              className="p-2.5 bg-gray-50 hover:bg-red-50 text-[#800000] rounded-xl border border-gray-100"
              title="รีเฟรชข้อมูล"
              aria-label="รีเฟรชประวัติการนิเทศ"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {supervisions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold">
              ยังไม่มีประวัติการนิเทศ
            </div>
          ) : (
            <div className="space-y-4">
              {supervisions.map((item, index) => {
                const student = item.student || {};
                const company = item.company || {};
                const studentName = safeText(
                  item.student_name ||
                    item.full_name ||
                    student.student_name ||
                    student.full_name ||
                    `${student.first_name || item.first_name || ""} ${student.last_name || item.last_name || ""}`.trim()
                );
                const studentId = safeText(item.student_id || student.student_id);
                const companyName = safeText(
                  item.company_name ||
                    (typeof company === "string" ? company : company.company_name || company.name)
                );
                const note = safeText(
                  item.note || item.supervision_note || item.description || item.result
                );
                const rawDate = item.supervision_date || item.date || item.created_at;
                const parsedDate = rawDate ? new Date(rawDate) : null;
                const displayDate =
                  parsedDate && !Number.isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-";

                return (
                  <div
                    key={item.id ?? item.supervision_id ?? index}
                    className="p-5 border border-gray-100 rounded-2xl"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-red-50 text-[#800000] rounded-xl flex items-center justify-center shrink-0">
                          <GraduationCap size={23} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-gray-800">{studentName}</h4>
                          <p className="text-[11px] text-gray-400 font-bold mt-1">
                            รหัสนักศึกษา: {studentId}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-bold">
                            <Building2 size={13} />
                            <span>{companyName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
                        <Calendar size={14} />
                        {displayDate}
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <p className="text-[10px] uppercase font-black text-gray-400 mb-1">
                        ผลการนิเทศ
                      </p>
                      <p className="text-sm text-gray-700 font-bold whitespace-pre-wrap">
                        {note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ==========================================================
  // MY STUDENTS
  // ==========================================================

  if (
    activeTab ===
    "my_students"
  ) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">

        <h3 className="text-[#800000] font-black flex items-center gap-2 text-lg mb-6">
          <Users size={24} />
          นักศึกษาในความดูแล
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {myStudents.map(
            (student) => {

              const id =
                student.student_id ||
                student.id;

              return (
                <div
                  key={id}
                  className="p-5 border border-gray-100 rounded-2xl hover:bg-red-50/20 flex items-start gap-4"
                >

                  <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#800000] flex items-center justify-center font-black text-xs">
                    CPE
                  </div>

                  <div className="flex-1">

                    <h4 className="font-black text-gray-800">
                      {student.student_name ||
                        student.name ||
                        `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                        "-"}
                    </h4>

                    <p className="text-[11px] text-gray-400 font-bold">
                      รหัส: {id}
                    </p>

                    <p className="text-xs text-gray-600 font-bold mt-2">
                      บริษัท:{" "}
                      {safeText(
                        student.company_name || student.company
                      )}
                    </p>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>
    );
  }

  // ==========================================================
  // TEACHER PROFILE
  // ==========================================================

  if (
    activeTab ===
    "teacher_profile"
  ) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100">

        <h3 className="text-[#800000] font-black text-lg mb-6 flex items-center gap-2">
          <UserCog size={24} />
          Profile อาจารย์
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {[
            [
              "first_name",
              "ชื่อ",
            ],
            [
              "last_name",
              "นามสกุล",
            ],
            [
              "rank",
              "ตำแหน่ง (rank)",
            ],
            [
              "email",
              "Email",
            ],
          ].map(
            ([field, label]) => (
              <div key={field}>

                <label className="text-xs font-black text-gray-500">
                  {label}
                </label>

                <input
                  value={
                    profileForm[field]
                  }
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      [field]:
                        e.target.value,
                    })
                  }
                  className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#800000]"
                />

              </div>
            )
          )}

        </div>

        <button
          onClick={updateProfile}
          disabled={saving}
          className="mt-6 px-6 py-3 bg-[#800000] text-white rounded-xl font-black text-xs"
        >
          {saving
            ? "กำลังบันทึก..."
            : "บันทึก Profile"}
        </button>

      </div>
    );
  }

  return null;
};

// ============================================================
// MAIN APP
// ============================================================

const MainAppContainer = () => {
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem("token")
    );

  const [userRole, setUserRole] =
    useState(
      localStorage.getItem(
        "userRole"
      ) || "student"
    );

  const [activeTab, setActiveTab] =
    useState("overview");

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [profileData, setProfileData] =
    useState(null);

  const [fetchingUser, setFetchingUser] =
    useState(false);

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (
      userRole ===
      "coordinator"
    ) {
      return;
    }

    const fetchUserProfile =
      async () => {
        try {
          setFetchingUser(true);

          let response;

          if (
            userRole ===
            "student"
          ) {
            response =
              await apiService.getStudentProfile();
          }

          if (
            userRole ===
            "advisor"
          ) {
            response =
              await apiService.getTeacherProfile();
          }

          if (!response) {
            return;
          }

          console.log(
            "Profile:",
            response.data
          );

          setProfileData(
            normalizeProfile(
              response.data
            )
          );
        } catch (error) {
          console.error(
            "Profile error:",
            error
          );

          if (
            error.response?.status ===
            401
          ) {
            handleLogout();
          }
        } finally {
          setFetchingUser(false);
        }
      };

    fetchUserProfile();
  }, [
    isLoggedIn,
    userRole,
  ]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "userRole"
    );

    localStorage.removeItem(
      "backendRole"
    );

    localStorage.removeItem(
      "userId"
    );

    setIsLoggedIn(false);
    setProfileData(null);
    setUserRole("student");
    setActiveTab("overview");
  };

  // ==========================================================
  // LOGIN SUCCESS
  // ==========================================================

  const handleLoginSuccess =
    (
      role,
      username
    ) => {
      if (username) {
        localStorage.setItem(
          "username",
          String(username)
        );
      }

      setUserRole(role);

      setProfileData(
        username
          ? {
              username,
            }
          : null
      );

      setIsLoggedIn(true);
    };

  // ==========================================================
  // DISPLAY
  // ==========================================================

  const displayId =
    profileData?.student_id ||
    profileData?.staff_id ||
    profileData?.username ||
    localStorage.getItem(
      "userId"
    ) ||
    "-";

  const displayFullName =
    profileData?.first_name &&
    profileData?.last_name
      ? `${profileData.first_name} ${profileData.last_name}`
      : fetchingUser
      ? "กำลังโหลด..."
      : profileData?.username ||
        "ผู้ใช้งานระบบ";

  // ==========================================================
  // MENU
  // ==========================================================

  const getMenuItems =
    () => {
      if (
        userRole ===
        "student"
      ) {
        return [
          {
            id: "overview",
            name: "หน้าหลัก",
            icon: (
              <BarChart3 size={20} />
            ),
          },
          {
            id: "company",
            name: "บริษัท",
            icon: (
              <Factory size={20} />
            ),
          },
          {
            id: "request",
            name: "คำร้องของฉัน",
            icon: (
              <FileSearch size={20} />
            ),
          },
          {
            id: "teacher",
            name: "อาจารย์ของฉัน",
            icon: (
              <GraduationCap size={20} />
            ),
          },
          {
            id: "profile",
            name: "Profile",
            icon: (
              <User size={20} />
            ),
          },
        ];
      }

      if (
        userRole ===
        "coordinator"
      ) {
        return [
          {
            id: "overview",
            name: "แผงควบคุมหลัก",
            icon: (
              <BarChart3 size={20} />
            ),
          },
          {
            id: "company",
            name: "จัดการบริษัท",
            icon: (
              <Factory size={20} />
            ),
          },
          {
            id: "manage_requests",
            name: "อนุมัติคำร้อง",
            icon: (
              <ClipboardCheck
                size={20}
              />
            ),
          },
          {
            id: "MANAGE_USER_ID",
            name: "จัดการผู้ใช้งาน",
            icon: (
              <Users size={20} />
            ),
          },
        ];
      }

      return [
        {
          id: "overview",
          name: "หน้าแรก",
          icon: (
            <BarChart3 size={20} />
          ),
        },
        {
          id: "company",
          name: "สถานประกอบการ",
          icon: (
            <Factory size={20} />
          ),
        },
        {
          id: "supervise",
          name: "นิเทศงาน",
          icon: (
            <ClipboardCheck
              size={20}
            />
          ),
        },
        {
          id: "my_students",
          name: "นักศึกษาในที่ปรึกษา",
          icon: (
            <Users size={20} />
          ),
        },
        {
          id: "teacher_profile",
          name: "Profile",
          icon: (
            <User size={20} />
          ),
        },
      ];
    };

  // ==========================================================
  // LOGIN
  // ==========================================================

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={
          handleLoginSuccess
        }
      />
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] font-['Sarabun'] antialiased overflow-hidden">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 bg-[#800000] text-white transition-all duration-300 flex flex-col shrink-0 ${
          isSidebarOpen
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full md:translate-x-0 md:w-24"
        }`}
      >

        <div className="p-6 flex items-center justify-center border-b border-white/10 relative h-24">

          <div className="flex items-center gap-3">

            <RobotLogo className="w-12 h-12" />

            {(isSidebarOpen ||
              window.innerWidth <
                768) && (
              <span className="font-black text-base uppercase tracking-tighter">
                CO-OP SYSTEM
                <br />
                <span className="text-xs opacity-70">
                  {userRole ===
                  "student"
                    ? "STUDENT"
                    : "STAFF"}
                </span>
              </span>
            )}

          </div>

          {isSidebarOpen && (
            <button
              onClick={() =>
                setIsSidebarOpen(
                  false
                )
              }
              className="absolute right-4 md:hidden p-2 hover:bg-white/10 rounded-xl"
            >
              <X size={20} />
            </button>
          )}

        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2 overflow-y-auto">

          {getMenuItems().map(
            (item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(
                    item.id
                  );

                  setIsSidebarOpen(
                    false
                  );
                }}
                className={`flex items-center w-full p-4 rounded-2xl transition-all ${
                  activeTab ===
                  item.id
                    ? "bg-white text-[#800000] shadow-lg"
                    : "text-red-100/70 hover:bg-white/5"
                }`}
              >
                {item.icon}

                {isSidebarOpen && (
                  <span className="ml-4 text-xs font-black">
                    {item.name}
                  </span>
                )}
              </button>
            )
          )}

        </nav>

        <button
          onClick={
            handleLogout
          }
          className="p-8 flex items-center text-red-200 hover:text-white border-t border-white/5"
        >
          <LogOut size={20} />

          {isSidebarOpen && (
            <span className="ml-4 font-black text-xs">
              LOGOUT
            </span>
          )}
        </button>

      </aside>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}

        <header className="h-20 bg-white border-b flex items-center justify-between px-4 md:px-8 shrink-0">

          <div className="flex items-center gap-4">

            {!isSidebarOpen && (
              <button
                onClick={() =>
                  setIsSidebarOpen(
                    true
                  )
                }
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl"
              >
                <Menu size={20} />
              </button>
            )}

            <h2 className="font-black text-gray-800 uppercase tracking-wide text-sm md:text-base">

              {activeTab ===
              "overview"
                ? "Dashboard Overview"
                : activeTab}

            </h2>

          </div>

          <div className="flex items-center gap-3 bg-gray-50 pl-4 pr-3 py-1.5 rounded-2xl border border-gray-100">

            <div className="text-right hidden sm:block">

              <p className="text-xs font-black text-gray-700">
                {userRole ===
                "student"
                  ? `ST-ID: ${displayId}`
                  : `STAFF-ID: ${displayId}`}
              </p>

              <div className="flex items-center justify-end gap-1.5 mt-0.5">

                <span className="w-2 h-2 bg-green-500 rounded-full" />

                <span className="text-[9px] font-black text-red-800 uppercase bg-red-50 px-1.5 py-0.5 rounded">

                  {userRole ===
                  "student"
                    ? "นักศึกษา"
                    : userRole ===
                      "coordinator"
                    ? "ผู้ประสานงาน"
                    : "อาจารย์นิเทศก์"}

                </span>

              </div>

            </div>

            <div className="w-10 h-10 rounded-xl bg-[#800000] flex items-center justify-center text-white">
              <User size={20} />
            </div>

          </div>

        </header>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <section className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">

          <div className="max-w-6xl mx-auto space-y-6">

            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activeTab ===
              "overview" && (
              <>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  <div className="lg:col-span-2 bg-gradient-to-br from-[#800000] to-red-950 p-8 md:p-10 rounded-[35px] text-white shadow-xl relative overflow-hidden">

                    <h3 className="text-xl md:text-2xl font-black mb-2">
                      สวัสดีคุณ{" "}
                      {displayFullName}!
                    </h3>

                    <p className="opacity-80 text-xs max-w-sm leading-relaxed">

                      {userRole ===
                      "student"
                        ? "ยินดีต้อนรับเข้าสู่ระบบจัดการสหกิจศึกษา ตรวจสอบสถานะคำร้องและข้อมูลบริษัทได้ทันที"
                        : "ระบบจัดการสำหรับคณาจารย์และเจ้าหน้าที่ ตรวจสอบคำร้อง นักศึกษา และการนิเทศงาน"}

                    </p>

                    <Factory
                      className="absolute -right-6 -bottom-10 w-48 h-48 text-white/5 rotate-12"
                    />

                  </div>

                  <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">

                    <span className="text-[10px] bg-red-50 text-[#800000] font-black px-2.5 py-1 rounded-md">
                      บัญชีผู้ใช้งาน
                    </span>

                    <div className="flex items-center gap-3 mt-4">

                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
                        <GraduationCap size={24} />
                      </div>

                      <div>

                        <p className="text-xs font-black text-gray-800">
                          {displayFullName}
                        </p>

                        <p className="text-[11px] text-gray-400 font-bold">
                          สิทธิ์:{" "}
                          {userRole}
                        </p>

                      </div>

                    </div>

                    <div className="border-t border-gray-50 pt-3 mt-4 space-y-1.5 text-xs text-gray-500 font-bold">

                      {userRole ===
                      "student" ? (
                        <>
                          <p>
                            คณะ:{" "}
                            <span className="text-gray-700">
                              {profileData?.faculty ||
                                "ไม่ระบุ"}
                            </span>
                          </p>

                          <p>
                            สาขา:{" "}
                            <span className="text-gray-700">
                              {profileData?.major ||
                                "ไม่ระบุ"}
                            </span>
                          </p>

                          <p>
                            ภาคเรียน:{" "}
                            <span className="text-[#800000]">
                              {profileData?.semester ||
                                "1"}
                            </span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            สังกัด:
                            <span className="text-gray-700">
                              สาขาวิศวกรรมคอมพิวเตอร์และปัญญาประดิษฐ์
                            </span>
                          </p>

                          <p>
                            สถานะ:
                            <span className="text-green-600">
                              Authorized
                            </span>
                          </p>
                        </>
                      )}

                    </div>

                  </div>

                </div>

                {/* DASHBOARD DATA */}

                <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-gray-100">

                  <h4 className="text-gray-800 font-black mb-6 flex items-center gap-2">
                    <BarChart3
                      size={20}
                      className="text-[#800000]"
                    />

                    {userRole ===
                    "student"
                      ? "สรุปสถานะคำร้อง"
                      : "ภาพรวมระบบ"}
                  </h4>

                  {userRole ===
                  "student" ? (
                    <StudentDashboardStats />
                  ) : userRole ===
                    "coordinator" ? (
                    <AdminDashboardStats />
                  ) : (
                    <TeacherDashboardStats />
                  )}

                </div>

                {/* STUDENT TIMELINE */}

                {userRole ===
                  "student" && (
                  <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-gray-100">

                    <h4 className="text-gray-800 font-black mb-8 flex items-center gap-2">
                      <Calendar
                        size={20}
                        className="text-[#800000]"
                      />
                      Timeline
                    </h4>

                    <div className="relative border-l-2 border-red-100 ml-4 space-y-8">

                      <div className="relative pl-8">

                        <div className="absolute -left-[13px] top-0 bg-emerald-500 text-white p-1 rounded-full">
                          <CheckCircle2 size={16} />
                        </div>

                        <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-md">
                          ขั้นตอนระบบ
                        </span>

                        <h5 className="text-sm font-black text-gray-800 mt-1">
                          ยื่นใบสมัครและเลือกสถานประกอบการ
                        </h5>

                      </div>

                      <div className="relative pl-8">

                        <div className="absolute -left-[13px] top-0 bg-amber-400 text-white p-1 rounded-full">
                          <Clock size={16} />
                        </div>

                        <span className="text-[10px] text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-md">
                          กำลังดำเนินงาน
                        </span>

                        <h5 className="text-sm font-black text-gray-800 mt-1">
                          เจ้าหน้าที่ตรวจสอบคำร้อง
                        </h5>

                      </div>

                    </div>

                  </div>
                )}

              </>
            )}

            {/* =================================================
                COMPANY
            ================================================= */}

            {activeTab ===
              "company" && (
              <CompanyManagement
                userRole={
                  userRole
                }
              />
            )}

            {/* =================================================
                COORDINATOR
            ================================================= */}

            {userRole ===
              "coordinator" && (
              <CoordinatorManagement
                activeTab={
                  activeTab
                }
              />
            )}

            {/* =================================================
                ADVISOR
            ================================================= */}

            {userRole ===
              "advisor" && (
              <AdvisorManagement
                activeTab={
                  activeTab
                }
              />
            )}

            {/* =================================================
                STUDENT PROFILE
            ================================================= */}

            {userRole ===
              "student" &&
              activeTab ===
                "profile" && (
                <StudentProfile
                  profileData={
                    profileData
                  }
                  onSaved={async () => {
                    try {
                      const response =
                        await apiService.getStudentProfile();

                      setProfileData(
                        normalizeProfile(
                          response.data
                        )
                      );
                    } catch (error) {
                      console.error(
                        error
                      );
                    }
                  }}
                />
              )}

            {/* =================================================
                STUDENT TEACHER
            ================================================= */}

            {userRole ===
              "student" &&
              activeTab ===
                "teacher" && (
                <MyTeacher />
              )}

            {/* =================================================
                STUDENT APPLICATION
            ================================================= */}

            {userRole ===
              "student" &&
              activeTab ===
                "request" && (
                <StudentApplication />
              )}

          </div>

        </section>

      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700;800&display=swap');

            body {
              font-family: 'Sarabun', sans-serif;
            }
          `,
        }}
      />

    </div>
  );
};

// ============================================================
// STUDENT DASHBOARD STATS
// ============================================================

const StudentDashboardStats =
  () => {
    const [applications, setApplications] =
      useState([]);

    const [loading, setLoading] =
      useState(true);

    useEffect(() => {
      const load =
        async () => {
          try {
            const response =
              await apiService.getApplications();

            setApplications(
              normalizeList(
                response.data,
                [
                  "applications",
                  "data",
                  "items",
                ]
              )
            );
          } catch (error) {
            console.error(
              error
            );
          } finally {
            setLoading(false);
          }
        };

      load();
    }, []);

    if (loading) {
      return (
        <LoadingBox />
      );
    }

    const approved =
      applications.filter(
        (x) =>
          String(
            x.status || ""
          ).toLowerCase() ===
          "approved"
      ).length;

    const rejected =
      applications.filter(
        (x) =>
          String(
            x.status || ""
          ).toLowerCase() ===
          "rejected"
      ).length;

    const pending =
      applications.length -
      approved -
      rejected;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <StatCard
          title="อนุมัติแล้ว"
          value={approved}
          color="emerald"
        />

        <StatCard
          title="รอตรวจสอบ"
          value={pending}
          color="amber"
        />

        <StatCard
          title="ปฏิเสธ"
          value={rejected}
          color="red"
        />

      </div>
    );
  };

// ============================================================
// ADMIN STATS
// ============================================================

const AdminDashboardStats =
  () => {
    const [data, setData] =
      useState(null);

    const [loading, setLoading] =
      useState(true);

    useEffect(() => {
      const load =
        async () => {
          try {
            const response =
              await apiService.getAdminDashboard();

            setData(
              response.data
            );
          } catch (error) {
            console.error(
              error
            );
          } finally {
            setLoading(false);
          }
        };

      load();
    }, []);

    if (loading) {
      return (
        <LoadingBox />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <StatCard
          title="นักศึกษา"
          value={
            data?.students_count ??
            data?.total_students ??
            data?.students ??
            0
          }
          color="emerald"
        />

        <StatCard
          title="คำร้อง"
          value={
            data?.applications_count ??
            data?.total_applications ??
            data?.applications ??
            0
          }
          color="amber"
        />

        <StatCard
          title="บริษัท"
          value={
            data?.companies_count ??
            data?.total_companies ??
            data?.companies ??
            0
          }
          color="red"
        />

      </div>
    );
  };

// ============================================================
// TEACHER STATS
// ============================================================

const TeacherDashboardStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiService.getTeacherDashboard();
        console.log("GET /teacher/dashboard RESPONSE:", response?.data);
        setData(response?.data || null);
      } catch (error) {
        console.error("Teacher Dashboard Error:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingBox />;

  const toCount = (preferred, fallback) => {
    if (preferred !== undefined && preferred !== null) {
      return Number(preferred) || 0;
    }
    if (Array.isArray(fallback)) return fallback.length;
    if (typeof fallback === "number" || typeof fallback === "string") {
      return Number(fallback) || 0;
    }
    return 0;
  };

  const studentCount = toCount(
    data?.students_count ?? data?.total_students,
    data?.students
  );
  const supervisionCount = toCount(
    data?.supervisions_count ?? data?.total_supervisions,
    data?.supervisions
  );
  const pendingCount = toCount(data?.pending_count, data?.pending);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="นักศึกษาในความดูแล" value={studentCount} color="emerald" />
      <StatCard title="Supervision" value={supervisionCount} color="amber" />
      <StatCard title="งานที่ต้องตรวจ" value={pendingCount} color="red" />
    </div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  color,
}) => {
  const colors = {
    emerald: {
      box: "bg-emerald-50/50 border-emerald-100",
      title: "text-emerald-600",
      number: "text-emerald-700",
    },

    amber: {
      box: "bg-amber-50/50 border-amber-100",
      title: "text-amber-600",
      number: "text-amber-700",
    },

    red: {
      box: "bg-red-50/40 border-red-100",
      title: "text-red-600",
      number: "text-red-700",
    },
  };

  const style =
    colors[color] ||
    colors.red;

  return (
    <div
      className={`p-5 border rounded-2xl ${style.box}`}
    >

      <p
        className={`text-xs font-bold ${style.title}`}
      >
        {title}
      </p>

      <h5
        className={`text-3xl font-black mt-1 ${style.number}`}
      >
        {value}
      </h5>

    </div>
  );
};

// ============================================================
// LOGIN PAGE
// ============================================================

const LoginPage = ({
  onLogin,
}) => {
  const [role, setRole] =
    useState("student");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setLoading(true);

      try {
        const response =
          await apiService.login(
            username,
            password
          );

        console.log(
          "LOGIN RESPONSE:",
          response.data
        );

        const token =
          typeof response.data ===
          "string"
            ? response.data
            : response.data
                ?.access_token;

        const backendRole =
          typeof response.data ===
          "object"
            ? response.data
                ?.role
            : null;

        const loggedInUsername =
          typeof response.data ===
          "object"
            ? response.data
                ?.username ||
              username
            : username;

        const userId =
          typeof response.data ===
          "object"
            ? response.data
                ?.user_id ||
              response.data
                ?.id
            : null;

        const frontendRoleMap =
          {
            student: "student",
            teacher: "advisor",
            admin: "coordinator",
          };

        const frontendRole =
          frontendRoleMap[
            backendRole
          ];

        if (
          token &&
          frontendRole
        ) {
          localStorage.setItem(
            "token",
            token
          );

          localStorage.setItem(
            "userRole",
            frontendRole
          );

          localStorage.setItem(
            "backendRole",
            backendRole
          );

          if (userId) {
            localStorage.setItem(
              "userId",
              String(userId)
            );
          }

          if (loggedInUsername) {
            localStorage.setItem(
              "username",
              String(loggedInUsername)
            );
          }

          onLogin(
            frontendRole,
            loggedInUsername
          );

          return;
        }

        if (
          token &&
          !backendRole
        ) {
          showPopup(
            "เข้าสู่ระบบสำเร็จ แต่ Backend ไม่ได้ส่ง role กลับมา"
          );

          return;
        }

        if (
          token &&
          backendRole &&
          !frontendRole
        ) {
          showPopup(
            `ไม่พบสิทธิ์ที่ระบบ Frontend รองรับ: ${backendRole}`
          );

          return;
        }

        showPopup(
          "ไม่พบ Token จากระบบ"
        );
      } catch (error) {
        console.error(
          "Login Error:",
          error
        );

        if (error.response) {
          if (
            error.response
              .status === 404
          ) {
            showPopup(
              "ไม่พบ endpoint /login"
            );
          } else if (
            error.response
              .status === 401 ||
            error.response
              .status === 422
          ) {
            showPopup(
              "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือข้อมูลไม่ครบ"
            );
          } else {
            showPopup(
              getApiErrorMessage(
                error,
                `เกิดข้อผิดพลาดจาก Server (${error.response.status})`
              )
            );
          }
        } else {
          showPopup(
            "ไม่สามารถเชื่อมต่อ Backend ได้"
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const getUsernamePlaceholder =
    () => {
      if (
        role === "student"
      ) {
        return "รหัสนักศึกษา";
      }

      if (
        role ===
        "coordinator"
      ) {
        return "ชื่อบัญชีผู้ประสานงาน";
      }

      return "ชื่อบัญชีอาจารย์";
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">

      <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl w-full max-w-lg border border-gray-50">

        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">

          <RobotLogo className="w-20 h-20" />

        </div>

        <h1 className="text-xl font-black text-gray-800 text-center uppercase mb-6">
          เข้าสู่ระบบระบบสหกิจศึกษา
        </h1>

        {/* ROLE SELECT */}

        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1.5 rounded-2xl mb-6">

          <button
            type="button"
            onClick={() => {
              setRole(
                "student"
              );
              setUsername("");
              setPassword("");
            }}
            className={`py-2.5 rounded-xl font-black text-xs ${
              role === "student"
                ? "bg-[#800000] text-white shadow-md"
                : "text-gray-500"
            }`}
          >
            นักศึกษา
          </button>

          <button
            type="button"
            onClick={() => {
              setRole(
                "coordinator"
              );
              setUsername("");
              setPassword("");
            }}
            className={`py-2.5 rounded-xl font-black text-xs ${
              role ===
              "coordinator"
                ? "bg-[#800000] text-white shadow-md"
                : "text-gray-500"
            }`}
          >
            ผู้ประสานงาน
          </button>

          <button
            type="button"
            onClick={() => {
              setRole(
                "advisor"
              );
              setUsername("");
              setPassword("");
            }}
            className={`py-2.5 rounded-xl font-black text-xs ${
              role ===
              "advisor"
                ? "bg-[#800000] text-white shadow-md"
                : "text-gray-500"
            }`}
          >
            อาจารย์นิเทศก์
          </button>

        </div>

        {/* LOGIN FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4 text-left"
        >

          <div>

            <label className="text-xs font-black text-gray-400 block mb-1.5 pl-1">
              ชื่อบัญชีผู้ใช้งาน
            </label>

            <input
              type="text"
              placeholder={getUsernamePlaceholder()}
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              required
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:border-[#800000] text-sm"
            />

          </div>

          <div>

            <label className="text-xs font-black text-gray-400 block mb-1.5 pl-1">
              รหัสผ่าน
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:border-[#800000] text-sm"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#800000] text-white py-4 mt-2 rounded-2xl font-black shadow-xl hover:bg-black transition-all text-sm disabled:opacity-50"
          >
            {loading
              ? "กำลังเข้าสู่ระบบ..."
              : `เข้าสู่ระบบในฐานะ${
                  role ===
                  "student"
                    ? "นักศึกษา"
                    : role ===
                      "coordinator"
                    ? "ผู้ประสานงาน"
                    : "อาจารย์นิเทศก์"
                }`}
          </button>

        </form>

      </div>

    </div>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default MainAppContainer;
