
import { useState, useRef, useEffect } from "react";
import { X, Camera, Save, Loader2 } from "lucide-react";
import { updateCustomer } from "@/lib/api/customers";
import { Customer } from "@/lib/types";
import toast from "react-hot-toast";

interface CustomerProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer & { image_url?: string };
    onUpdate?: (data: any) => void;
}

export default function CustomerProfileModal({ isOpen, onClose, customer, onUpdate }: CustomerProfileModalProps) {
    const [newName, setNewName] = useState(customer.name);
    const [newImage, setNewImage] = useState(customer.image_url || "");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setNewName(customer.name);
            setNewImage(customer.image_url || "");
        }
    }, [isOpen, customer]);

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!newName.trim()) {
            toast.error("กรุณาระบุชื่อ");
            return;
        }

        setIsSaving(true);
        try {
            await updateCustomer(customer.id, {
                name: newName,
            } as any);

            // Mock update local storage
            const stored = localStorage.getItem('customerData');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.name = newName;
                parsed.image_url = newImage;
                localStorage.setItem('customerData', JSON.stringify(parsed));
            }

            toast.success("บันทึกข้อมูลเรียบร้อย");
            if (onUpdate) {
                onUpdate({ name: newName, image_url: newImage });
            }
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">แก้ไขข้อมูลส่วนตัว</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50">
                                {newImage ? (
                                    <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-3xl font-bold">
                                        {newName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <span className="text-xs text-slate-400">แตะเพื่อเปลี่ยนรูปโปรไฟล์</span>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">ชื่อ-นามสกุล</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                            placeholder="ใส่ชื่อของคุณ"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-50 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                        disabled={isSaving}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
}
