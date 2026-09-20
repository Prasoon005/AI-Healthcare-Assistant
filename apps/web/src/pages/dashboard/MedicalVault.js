import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState, } from "react";
import { FileText, Loader2, Plus, Trash2, Upload, X, } from "lucide-react";
import { deleteDocument, getDocuments, uploadDocument, } from "../../api/documents";
const MedicalVault = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const fileInput = useRef(null);
    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await getDocuments();
            setDocuments(data);
        }
        catch (error) {
            console.error("Failed to load documents:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadDocuments();
    }, []);
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (![
            "image/jpeg",
            "image/png",
            "image/jpg",
        ].includes(file.type)) {
            alert("Please upload a JPG, JPEG or PNG image.");
            return;
        }
        if (file.size >
            5 * 1024 * 1024) {
            alert("File size must be below 5 MB.");
            return;
        }
        try {
            setUploading(true);
            await uploadDocument(file);
            await loadDocuments();
        }
        catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload document.");
        }
        finally {
            setUploading(false);
            e.target.value = "";
        }
    };
    const handleDelete = async (documentId) => {
        const confirmed = window.confirm("Delete this medical document?");
        if (!confirmed)
            return;
        try {
            await deleteDocument(documentId);
            setDocuments((current) => current.filter((document) => document.id !==
                documentId));
            if (selectedDocument?.id ===
                documentId) {
                setSelectedDocument(null);
            }
        }
        catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete document.");
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "medical-vault-card glass-card", children: [_jsxs("div", { className: "medical-vault-header", children: [_jsxs("div", { className: "medical-vault-title", children: [_jsx("div", { className: "medical-vault-icon", children: _jsx(FileText, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Medical document vault" }), _jsx("p", { children: "Reports and prescriptions in one place" })] })] }), _jsxs("button", { type: "button", className: "medical-upload-button", onClick: () => fileInput.current?.click(), disabled: uploading, children: [uploading ? (_jsx(Loader2, { size: 15, className: "spin" })) : (_jsx(Plus, { size: 15 })), uploading
                                        ? "Processing..."
                                        : "Upload"] }), _jsx("input", { ref: fileInput, type: "file", accept: ".jpg,.jpeg,.png", hidden: true, onChange: handleUpload })] }), loading ? (_jsx("div", { className: "medical-vault-empty", children: "Loading documents..." })) : documents.length ===
                        0 ? (_jsxs("div", { className: "medical-vault-empty", children: [_jsx(Upload, { size: 22 }), _jsx("strong", { children: "No medical documents" }), _jsx("span", { children: "Upload a report or prescription to extract its text automatically." }), _jsx("button", { type: "button", onClick: () => fileInput.current?.click(), children: "Upload first document" })] })) : (_jsx("div", { className: "medical-document-list", children: documents.map((document) => (_jsxs("div", { className: "medical-document-row", onClick: () => setSelectedDocument(document), children: [_jsx("div", { className: "document-file-icon", children: _jsx(FileText, { size: 17 }) }), _jsxs("div", { className: "document-info", children: [_jsx("strong", { children: document.name }), _jsx("span", { children: document.originalName })] }), _jsx("div", { className: "document-ocr-status", children: document.extractedText
                                        ? "OCR ready"
                                        : "No text" }), _jsx("button", { type: "button", className: "document-delete", onClick: (e) => {
                                        e.stopPropagation();
                                        handleDelete(document.id);
                                    }, "aria-label": "Delete document", children: _jsx(Trash2, { size: 15 }) })] }, document.id))) })), _jsx("p", { className: "medical-vault-note", children: "Documents are stored privately for your account. OCR extracts text for review and does not provide a medical diagnosis." })] }), selectedDocument && (_jsx("div", { className: "document-modal-backdrop", onMouseDown: (e) => {
                    if (e.target ===
                        e.currentTarget) {
                        setSelectedDocument(null);
                    }
                }, children: _jsxs("div", { className: "document-modal", onMouseDown: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "document-modal-header", children: [_jsxs("div", { children: [_jsx("span", { children: "Extracted text" }), _jsx("h3", { children: selectedDocument.name })] }), _jsx("button", { type: "button", onClick: () => setSelectedDocument(null), "aria-label": "Close", children: _jsx(X, { size: 18 }) })] }), _jsx("div", { className: "document-text", children: selectedDocument
                                .extractedText ||
                                "No text could be extracted from this document." })] }) }))] }));
};
export default MedicalVault;
