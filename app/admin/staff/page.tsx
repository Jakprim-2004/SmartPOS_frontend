"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getStaffs, createStaff, updateStaff, deleteStaff, Staff } from "@/lib/api/staff";

// Components
import AdminStaffHeader from "@/components/admin/staff/AdminStaffHeader";
import AdminStaffFilter from "@/components/admin/staff/AdminStaffFilter";
import AdminStaffTable from "@/components/admin/staff/AdminStaffTable";
import AdminStaffModal from "@/components/admin/staff/AdminStaffModal";

export default function StaffManagementPage() {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        shop_name: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await getStaffs();
            // Handle both paginated response { data: [] } and plain array []
            const data = result?.data || result || [];
            setStaffs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load staff:", error);
            toast.error("ไม่สามารถโหลดข้อมูลพนักงานได้");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (staff?: Staff) => {
        if (staff) {
            setEditingStaff(staff);
            setFormData({
                name: staff.name,
                username: staff.username,
                password: "",
                shop_name: staff.shop_name
            });
        } else {
            setEditingStaff(null);
            setFormData({
                name: "",
                username: "",
                password: "",
                shop_name: ""
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingStaff) {
                const updateData: any = { name: formData.name, shop_name: formData.shop_name };
                if (formData.password) updateData.password = formData.password;
                await updateStaff(editingStaff.id, updateData);
                toast.success("อัปเดตข้อมูลพนักงานเรียบร้อย");
            } else {
                await createStaff(formData);
                toast.success("เพิ่มพนักงานใหม่เรียบร้อย");
            }
            setShowModal(false);
            loadData();
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.message || "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("คุณแน่ใจว่าต้องการลบพนักงานคนนี้?")) return;
        try {
            await deleteStaff(id);
            toast.success("ลบพนักงานเรียบร้อย");
            loadData();
        } catch (error) {
            toast.error("ไม่สามารถลบข้อมูลได้");
        }
    };

    const filteredStaff = staffs.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
            <AdminStaffHeader onAddStaff={() => handleOpenModal()} />

            <AdminStaffFilter search={search} setSearch={setSearch} />

            <AdminStaffTable
                staffs={filteredStaff}
                loading={loading}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
            />

            <AdminStaffModal
                show={showModal}
                onClose={() => setShowModal(false)}
                editingStaff={editingStaff}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                saving={saving}
            />
        </div>
    );
}
