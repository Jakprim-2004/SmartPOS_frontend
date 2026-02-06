import toast from 'react-hot-toast';

interface ConfirmOptions {
    title?: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const showConfirm = (options: ConfirmOptions | string, onConfirm?: () => void, confirmText = "ตกลง", cancelText = "ยกเลิก") => {
    let opts: ConfirmOptions;

    if (typeof options === 'string') {
        opts = {
            message: options,
            onConfirm: onConfirm || (() => { }),
            confirmText,
            cancelText
        };
    } else {
        opts = options;
    }

    toast.custom((t) => (
        <div
            className={`${t.visible ? 'animate-in fade-in zoom-in-95 duration-300' : 'animate-out fade-out zoom-out-95 duration-200'
                } fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm`}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm m-4 overflow-hidden relative border-0">
                <div className="p-8 text-center flex flex-col items-center">
                    {/* Icon Circle */}
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm text-red-500">
                        <span className="text-3xl font-bold">!</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {opts.title || "ยืนยันการทำรายการ"}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mb-8 px-2 leading-relaxed">
                        {opts.message}
                    </p>

                    <div className="flex gap-3 w-full justify-center">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all active:scale-95 text-sm"
                        >
                            {opts.cancelText || cancelText}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                opts.onConfirm();
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95 text-sm"
                        >
                            {opts.confirmText || confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ), {
        duration: Infinity,
        id: 'confirm-toast',
    });
};
