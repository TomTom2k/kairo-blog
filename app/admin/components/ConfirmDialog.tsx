"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xóa",
  cancelText = "Hủy",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-destructive" />,
      iconBg: "bg-destructive/10",
      button:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
      iconBg: "bg-orange-500/10",
      button: "bg-orange-500 text-white hover:bg-orange-600",
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-primary" />,
      iconBg: "bg-primary/10",
      button: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  };

  const currentStyle = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${currentStyle.iconBg}`}>
              {currentStyle.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted transition-colors transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${currentStyle.button}`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
