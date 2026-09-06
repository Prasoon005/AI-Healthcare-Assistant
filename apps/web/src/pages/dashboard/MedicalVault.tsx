import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  deleteDocument,
  getDocuments,
  uploadDocument,
  type MedicalDocument,
} from "../../api/documents";

const MedicalVault = () => {
  const [documents, setDocuments] =
    useState<MedicalDocument[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [selectedDocument, setSelectedDocument] =
    useState<MedicalDocument | null>(
      null
    );

  const fileInput =
    useRef<HTMLInputElement>(null);

  const loadDocuments =
    async () => {
      try {
        setLoading(true);

        const data =
          await getDocuments();

        setDocuments(data);
      } catch (error) {
        console.error(
          "Failed to load documents:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload =
    async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target.files?.[0];

      if (!file) return;

      if (
        ![
          "image/jpeg",
          "image/png",
          "image/jpg",
        ].includes(file.type)
      ) {
        alert(
          "Please upload a JPG, JPEG or PNG image."
        );

        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert(
          "File size must be below 5 MB."
        );

        return;
      }

      try {
        setUploading(true);

        await uploadDocument(file);

        await loadDocuments();
      } catch (error) {
        console.error(
          "Upload failed:",
          error
        );

        alert(
          "Failed to upload document."
        );
      } finally {
        setUploading(false);

        e.target.value = "";
      }
    };

  const handleDelete =
    async (
      documentId: string
    ) => {
      const confirmed =
        window.confirm(
          "Delete this medical document?"
        );

      if (!confirmed) return;

      try {
        await deleteDocument(
          documentId
        );

        setDocuments(
          (current) =>
            current.filter(
              (document) =>
                document.id !==
                documentId
            )
        );

        if (
          selectedDocument?.id ===
          documentId
        ) {
          setSelectedDocument(null);
        }
      } catch (error) {
        console.error(
          "Delete failed:",
          error
        );

        alert(
          "Failed to delete document."
        );
      }
    };

  return (
    <>
      <div className="medical-vault-card glass-card">
        <div className="medical-vault-header">
          <div className="medical-vault-title">
            <div className="medical-vault-icon">
              <FileText size={19} />
            </div>

            <div>
              <h3>
                Medical document vault
              </h3>

              <p>
                Reports and prescriptions in one place
              </p>
            </div>
          </div>

          <button
            type="button"
            className="medical-upload-button"
            onClick={() =>
              fileInput.current?.click()
            }
            disabled={uploading}
          >
            {uploading ? (
              <Loader2
                size={15}
                className="spin"
              />
            ) : (
              <Plus size={15} />
            )}

            {uploading
              ? "Processing..."
              : "Upload"}
          </button>

          <input
            ref={fileInput}
            type="file"
            accept=".jpg,.jpeg,.png"
            hidden
            onChange={
              handleUpload
            }
          />
        </div>

        {loading ? (
          <div className="medical-vault-empty">
            Loading documents...
          </div>
        ) : documents.length ===
          0 ? (
          <div className="medical-vault-empty">
            <Upload size={22} />

            <strong>
              No medical documents
            </strong>

            <span>
              Upload a report or prescription
              to extract its text automatically.
            </span>

            <button
              type="button"
              onClick={() =>
                fileInput.current?.click()
              }
            >
              Upload first document
            </button>
          </div>
        ) : (
          <div className="medical-document-list">
            {documents.map(
              (document) => (
                <div
                  className="medical-document-row"
                  key={document.id}
                  onClick={() =>
                    setSelectedDocument(
                      document
                    )
                  }
                >
                  <div className="document-file-icon">
                    <FileText
                      size={17}
                    />
                  </div>

                  <div className="document-info">
                    <strong>
                      {document.name}
                    </strong>

                    <span>
                      {document.originalName}
                    </span>
                  </div>

                  <div className="document-ocr-status">
                    {document.extractedText
                      ? "OCR ready"
                      : "No text"}
                  </div>

                  <button
                    type="button"
                    className="document-delete"
                    onClick={(
                      e
                    ) => {
                      e.stopPropagation();

                      handleDelete(
                        document.id
                      );
                    }}
                    aria-label="Delete document"
                  >
                    <Trash2
                      size={15}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <p className="medical-vault-note">
          Documents are stored privately for your
          account. OCR extracts text for review and
          does not provide a medical diagnosis.
        </p>
      </div>

      {selectedDocument && (
        <div
          className="document-modal-backdrop"
          onMouseDown={(
            e
          ) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedDocument(
                null
              );
            }
          }}
        >
          <div
            className="document-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="document-modal-header">
              <div>
                <span>
                  Extracted text
                </span>

                <h3>
                  {
                    selectedDocument.name
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(
                    null
                  )
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="document-text">
              {selectedDocument
                .extractedText ||
                "No text could be extracted from this document."}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalVault;