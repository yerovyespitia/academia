"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { FileText, ImageIcon, Mic } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ModalTranscription from "@/components/upload-notes/modal-transcription";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { extractLatestAssistantText } from "@/lib/transcription-utils";

type TranscriptResult = {
  text: string;
  segments?: Array<{ start: number; end: number; text: string }>;
  language?: string;
  durationInSeconds?: number;
};

type UploadKind = "image" | "audio" | "pdf";

type PendingDocument = {
  title: string;
  originalFileName: string;
  type: UploadKind;
};

export default function UploadFiles() {
  const { isAuthenticated } = useConvexAuth();
  const classes = useQuery(
    api.classes.listForCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const saveDocument = useMutation(api.documents.create);
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/transcribe-image" }),
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [transcriptionMode, setTranscriptionMode] =
    useState<UploadKind>("image");
  const [selectedClassId, setSelectedClassId] = useState<Id<"classes"> | "">(
    "",
  );
  const [pendingDocument, setPendingDocument] =
    useState<PendingDocument | null>(null);
  const [genericTranscript, setGenericTranscript] =
    useState<TranscriptResult | null>(null);
  const [pdfTranscript, setPdfTranscript] = useState<string | null>(null);
  const [genericStatus, setGenericStatus] = useState<
    "idle" | "submitted" | "streaming" | "ready"
  >("idle");
  const [genericError, setGenericError] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);

  const hasClasses = (classes?.length ?? 0) > 0;

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleAudioButtonClick = () => {
    audioInputRef.current?.click();
  };

  const handlePdfButtonClick = () => {
    pdfInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setTranscriptionMode("image");
      setPendingDocument({
        title:
          files.length === 1
            ? files[0].name
            : `Apuntes desde ${files.length} imágenes`,
        originalFileName:
          files.length === 1
            ? files[0].name
            : Array.from(files)
                .map((file) => file.name)
                .join(", "),
        type: "image",
      });
      setSaveMessage(null);
      sendMessage({
        text: "Es están enviando una imagen, transcribe todo el contenido de la imagen, en caso de no ver casi texto en imagen, escribe una explicación de lo que ves, pero siempre que puedas transcribir todo el texto de imagen",
        files,
      });
      setShowTranscriptionModal(true);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const startAudioTranscription = async (file: File) => {
    if (genericStatus === "submitted" || genericStatus === "streaming") {
      return;
    }

    setPendingDocument({
      title: file.name,
      originalFileName: file.name,
      type: "audio",
    });
    setSaveMessage(null);
    setTranscriptionMode("audio");
    setGenericError(false);
    setGenericStatus("submitted");
    setShowTranscriptionModal(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to transcribe audio");
      const data = (await response.json()) as TranscriptResult;
      setGenericTranscript(data);
      setGenericStatus("ready");
      if (audioInputRef.current) audioInputRef.current.value = "";
    } catch (err) {
      console.error("Error transcribing audio: ", err);
      setGenericError(true);
      setGenericStatus("ready");
    }
  };

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("audio/")) startAudioTranscription(file);
    }
  };

  const startPdfExtraction = async (file: File) => {
    if (genericStatus === "submitted" || genericStatus === "streaming") {
      return;
    }

    setPendingDocument({
      title: file.name,
      originalFileName: file.name,
      type: "pdf",
    });
    setSaveMessage(null);
    setTranscriptionMode("pdf");
    setGenericError(false);
    setPdfTranscript(null);
    setGenericStatus("submitted");
    setShowTranscriptionModal(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "study");
      formData.append("sectionTitle", "documentos de estudio");
      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to extract PDF");
      const text = await response.text();
      setPdfTranscript(text);
      setGenericStatus("ready");
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    } catch (err) {
      console.error("Error extracting PDF: ", err);
      setGenericError(true);
      setGenericStatus("ready");
    }
  };

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") startPdfExtraction(file);
    }
  };

  const transcriptContent = useMemo(() => {
    if (transcriptionMode === "image") {
      return extractLatestAssistantText(messages);
    }
    if (transcriptionMode === "audio") {
      return genericTranscript?.text ?? "";
    }
    return pdfTranscript ?? "";
  }, [genericTranscript?.text, messages, pdfTranscript, transcriptionMode]);

  const canShowSaveSection =
    showTranscriptionModal &&
    !error &&
    ((transcriptionMode === "image" && status === "ready") ||
      (transcriptionMode !== "image" && genericStatus === "ready"));

  const handleSaveTranscript = async () => {
    if (!isAuthenticated) {
      setSaveMessage({
        tone: "error",
        text: "Inicia sesión para guardar tus documentos.",
      });
      return;
    }

    if (!hasClasses) {
      setSaveMessage({
        tone: "error",
        text: "Primero necesitas tener al menos una clase creada.",
      });
      return;
    }

    if (!selectedClassId) {
      setSaveMessage({
        tone: "error",
        text: "Selecciona una clase para guardar el documento.",
      });
      return;
    }

    if (!pendingDocument || !transcriptContent.trim()) {
      return;
    }

    setIsPersisting(true);
    setSaveMessage(null);

    try {
      await saveDocument({
        classId: selectedClassId,
        title: pendingDocument.title,
        type: pendingDocument.type,
        content: transcriptContent,
        originalFileName: pendingDocument.originalFileName,
      });
      setSaveMessage({
        tone: "success",
        text: "Documento guardado correctamente.",
      });
      setPendingDocument(null);
    } catch (saveError) {
      console.error("Error saving document: ", saveError);
      setSaveMessage({
        tone: "error",
        text: "La transcripción se generó, pero no se pudo guardar.",
      });
    } finally {
      setIsPersisting(false);
    }
  };

  return (
    <Card className="mb-8 space-y-4 border-border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Subir Documentos
        </h2>
        <p className="text-sm text-muted-foreground">
          Sube primero el archivo y luego decide en qué clase guardarlo.
        </p>
      </div>

      {saveMessage && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            saveMessage.tone === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button
          type="button"
          onClick={handleImageButtonClick}
          variant="outline"
          className="h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
        >
          <ImageIcon className="size-6 text-primary" />
          <span className="text-sm">Subir Imagen</span>
          <span className="text-xs text-muted-foreground">JPG, PNG</span>
        </Button>

        <Button
          type="button"
          onClick={handleAudioButtonClick}
          variant="outline"
          className="h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
        >
          <Mic className="size-6 text-primary" />
          <span className="text-sm">Subir Audio</span>
          <span className="text-xs text-muted-foreground">Máx. 10 minutos</span>
        </Button>

        <Button
          type="button"
          onClick={handlePdfButtonClick}
          variant="outline"
          className="h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 bg-transparent"
        >
          <FileText className="size-6 text-primary" />
          <span className="text-sm">Subir PDF</span>
          <span className="text-xs text-muted-foreground">Documento PDF</span>
        </Button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioSelect}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfSelect}
        className="hidden"
      />

      {showTranscriptionModal && (
        <ModalTranscription
          mode={transcriptionMode}
          error={transcriptionMode === "image" ? !!error : genericError}
          messages={messages}
          status={transcriptionMode === "image" ? status : genericStatus}
          transcriptText={
            transcriptionMode === "audio"
              ? (genericTranscript?.text ?? null)
              : transcriptionMode === "pdf"
                ? pdfTranscript
                : null
          }
          footerContent={
            canShowSaveSection ? (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">
                  Guardar en documentos
                </p>
                <Select
                  value={selectedClassId}
                  onValueChange={(value) => {
                    setSelectedClassId(value as Id<"classes">);
                    setSaveMessage(null);
                  }}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue
                      placeholder={
                        classes === undefined
                          ? "Cargando clases..."
                          : "¿A qué clase pertenece?"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes ?? []).map((classItem) => (
                      <SelectItem key={classItem._id} value={classItem._id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground">
                    Inicia sesión para guardar tus documentos.
                  </p>
                )}
                {isAuthenticated && classes !== undefined && !hasClasses && (
                  <p className="text-xs text-muted-foreground">
                    Necesitas al menos una clase creada para guardar documentos.
                  </p>
                )}
                <Button
                  onClick={handleSaveTranscript}
                  disabled={
                    isPersisting ||
                    !transcriptContent.trim() ||
                    !isAuthenticated ||
                    !hasClasses
                  }
                  className="w-full"
                >
                  {isPersisting ? "Guardando..." : "Guardar documento"}
                </Button>
              </div>
            ) : null
          }
          setShowTranscriptionModal={(show) => {
            if (!show) {
              setPendingDocument(null);
              setSelectedClassId("");
              if (transcriptionMode === "image") {
                setMessages([]);
              } else {
                setGenericTranscript(null);
                setPdfTranscript(null);
                setGenericStatus("idle");
                setGenericError(false);
              }
            }
            setShowTranscriptionModal(show);
          }}
        />
      )}
    </Card>
  );
}
