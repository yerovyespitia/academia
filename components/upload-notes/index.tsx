"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { FileText, ImageIcon, Mic, Sparkles, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { extractLatestAssistantText } from "@/lib/transcription-utils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ModalTranscription from "./modal-transcription";

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

type SaveFeedback = {
  tone: "success" | "error";
  message: string;
};

export default function UploadNotes() {
  const { isAuthenticated } = useConvexAuth();
  const classes = useQuery(
    api.classes.listForCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const saveDocument = useMutation(api.documents.create);
  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/transcribe-image",
    }),
  });

  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<Id<"classes"> | "">(
    "",
  );
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);
  const [pendingDocument, setPendingDocument] =
    useState<PendingDocument | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [transcriptionMode, setTranscriptionMode] =
    useState<UploadKind>("image");
  const [transcriptAudio, setTranscriptAudio] =
    useState<TranscriptResult | null>(null);
  const [audioStatus, setAudioStatus] = useState<
    "idle" | "submitted" | "streaming" | "ready"
  >("idle");
  const [audioError, setAudioError] = useState(false);
  const [pdfTranscript, setPdfTranscript] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<
    "idle" | "submitted" | "streaming" | "ready"
  >("idle");
  const [pdfError, setPdfError] = useState(false);

  const hasClasses = (classes?.length ?? 0) > 0;

  const buildImageDocumentName = (files: FileList) => {
    if (files.length === 1) {
      return {
        title: files[0].name,
        originalFileName: files[0].name,
      };
    }

    return {
      title: `Apuntes desde ${files.length} imágenes`,
      originalFileName: Array.from(files)
        .map((file) => file.name)
        .join(", "),
    };
  };

  const handleImageUpload = (files: FileList) => {
    const metadata = buildImageDocumentName(files);
    setSelectedImages(files);
    setTranscriptionMode("image");
    setPendingDocument({
      title: metadata.title,
      originalFileName: metadata.originalFileName,
      type: "image",
    });
    sendMessage({
      text: "Extrae las ideas más importantes de esta imagen con datos puntuales. Si hay poco texto, describe y explica lo que ves de forma útil para estudiar.",
      files,
    });
    setShowTranscriptionModal(true);
    setSelectedImages(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          dataTransfer.items.add(file);
        }
      });
      const imageFiles = dataTransfer.files;
      if (imageFiles.length > 0) {
        handleImageUpload(imageFiles);
      }
    }
  };

  const removeImage = (index: number) => {
    if (!selectedImages) return;
    const dataTransfer = new DataTransfer();
    Array.from(selectedImages).forEach((file, i) => {
      if (i !== index) dataTransfer.items.add(file);
    });
    const newList = dataTransfer.files;
    setSelectedImages(newList.length > 0 ? newList : null);
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const startAudioTranscription = async (file: File) => {
    if (audioStatus === "submitted" || audioStatus === "streaming") {
      return;
    }

    setPendingDocument({
      title: file.name,
      originalFileName: file.name,
      type: "audio",
    });

    setSelectedAudio(file);
    setTranscriptionMode("audio");
    setAudioError(false);
    setAudioStatus("submitted");
    setShowTranscriptionModal(true);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      const response = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = (await response.json()) as TranscriptResult;
      setTranscriptAudio(data);
      setAudioStatus("ready");
      setSelectedAudio(null);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    } catch (transcriptionError) {
      console.error("Error transcribing audio: ", transcriptionError);
      setAudioError(true);
      setAudioStatus("ready");
    }
  };

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("audio/")) {
        startAudioTranscription(file);
      }
    }
  };

  const handleAudioDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(true);
  };

  const handleAudioDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAudio(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/"),
    );
    if (audioFiles.length === 0) return;

    startAudioTranscription(audioFiles[0]);
  };

  const removeAudio = () => {
    setSelectedAudio(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleAudioButtonClick = () => {
    audioInputRef.current?.click();
  };

  const startPdfExtraction = async (file: File) => {
    if (pdfStatus === "submitted" || pdfStatus === "streaming") {
      return;
    }

    setPendingDocument({
      title: file.name,
      originalFileName: file.name,
      type: "pdf",
    });

    setSelectedPdf(file);
    setTranscriptionMode("pdf");
    setPdfError(false);
    setPdfTranscript(null);
    setPdfStatus("submitted");
    setShowTranscriptionModal(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "study");
      formData.append("sectionTitle", "apuntes de estudio");

      const response = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract PDF");
      }

      const text = await response.text();
      setPdfTranscript(text);
      setPdfStatus("ready");
      setSelectedPdf(null);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }
    } catch (extractError) {
      console.error("Error extracting PDF: ", extractError);
      setPdfError(true);
      setPdfStatus("ready");
    }
  };

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        startPdfExtraction(file);
      }
    }
  };

  const handlePdfDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(true);
  };

  const handlePdfDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(false);
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPdf(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const pdfFile = Array.from(files).find(
      (file) => file.type === "application/pdf",
    );
    if (!pdfFile) return;

    startPdfExtraction(pdfFile);
  };

  const removePdf = () => {
    setSelectedPdf(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handlePdfButtonClick = () => {
    pdfInputRef.current?.click();
  };

  const transcriptContent = useMemo(() => {
    if (transcriptionMode === "image") {
      return extractLatestAssistantText(messages);
    }
    if (transcriptionMode === "audio") {
      return transcriptAudio?.text ?? "";
    }
    return pdfTranscript ?? "";
  }, [messages, pdfTranscript, transcriptAudio?.text, transcriptionMode]);

  const canShowSaveSection =
    showTranscriptionModal &&
    !error &&
    ((transcriptionMode === "image" && status === "ready") ||
      (transcriptionMode === "audio" && audioStatus === "ready") ||
      (transcriptionMode === "pdf" && pdfStatus === "ready"));

  const handleSaveTranscript = async () => {
    if (!isAuthenticated) {
      setSaveFeedback({
        tone: "error",
        message: "Inicia sesión para guardar tus apuntes.",
      });
      return;
    }

    if (!hasClasses) {
      setSaveFeedback({
        tone: "error",
        message: "Primero necesitas tener al menos una clase creada.",
      });
      return;
    }

    if (!selectedClassId) {
      setSaveFeedback({
        tone: "error",
        message: "Selecciona una clase para guardar el documento.",
      });
      return;
    }

    if (!pendingDocument || !transcriptContent.trim()) {
      return;
    }

    setIsPersisting(true);
    setSaveFeedback(null);

    try {
      await saveDocument({
        classId: selectedClassId,
        title: pendingDocument.title,
        type: pendingDocument.type,
        content: transcriptContent,
        originalFileName: pendingDocument.originalFileName,
      });
      const savedClassName = classes?.find((item) => item._id === selectedClassId)?.name ?? "la clase seleccionada";
      setPendingDocument(null);
      setSelectedClassId("");
      if (transcriptionMode === "image") {
        setMessages([]);
      } else if (transcriptionMode === "audio") {
        setTranscriptAudio(null);
        setAudioStatus("idle");
        setAudioError(false);
      } else {
        setPdfTranscript(null);
        setPdfStatus("idle");
        setPdfError(false);
      }
      setShowTranscriptionModal(false);
      setSaveFeedback({
        tone: "success",
        message: `Documento guardado en ${savedClassName}.`,
      });
    } catch (saveError) {
      console.error("Error saving document: ", saveError);
      setSaveFeedback({
        tone: "error",
        message:
          "La transcripción salió bien, pero no se pudo guardar en tus documentos.",
      });
    } finally {
      setIsPersisting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5 text-primary" />
          Subir Apuntes
          <span>
            <Sparkles size={15} fill="black" strokeWidth={1} />
          </span>
        </CardTitle>
        <CardDescription>
          Convierte imágenes, audio y PDFs a texto organizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {saveFeedback && (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              saveFeedback.tone === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {saveFeedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            className={`w-full rounded-lg border-2 border-dashed p-6 text-left transition-colors ${
              isDraggingImage
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleImageDragOver}
            onDragLeave={handleImageDragLeave}
            onDrop={handleImageDrop}
            onClick={handleImageButtonClick}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/80">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Subir imagen del tablero
                </p>
                <p className="text-sm text-muted-foreground">
                  Convierte escritura a mano a texto
                </p>
              </div>
              <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs">
                Seleccionar imágenes
              </span>
              <p className="text-xs text-muted-foreground">
                o arrastra las imágenes aquí
              </p>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </button>

          <button
            type="button"
            className={`w-full rounded-lg border-2 border-dashed p-6 text-left transition-colors ${
              isDraggingAudio
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleAudioDragOver}
            onDragLeave={handleAudioDragLeave}
            onDrop={handleAudioDrop}
            onClick={handleAudioButtonClick}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/80">
                <Mic className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Subir nota de voz</p>
                <p className="text-sm text-muted-foreground">
                  Convierte audio a texto
                </p>
              </div>
              <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs">
                Seleccionar audio
              </span>
              <p className="text-xs text-muted-foreground">
                o arrastra el archivo de audio aquí
              </p>
            </div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioSelect}
              className="hidden"
            />
          </button>

          <button
            type="button"
            className={`w-full rounded-lg border-2 border-dashed p-6 text-left transition-colors ${
              isDraggingPdf
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handlePdfDragOver}
            onDragLeave={handlePdfDragLeave}
            onDrop={handlePdfDrop}
            onClick={handlePdfButtonClick}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/80">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Subir PDF</p>
                <p className="text-sm text-muted-foreground">
                  Extrae el contenido del documento a texto
                </p>
              </div>
              <span className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs">
                Seleccionar PDF
              </span>
              <p className="text-xs text-muted-foreground">
                o arrastra el archivo PDF aquí
              </p>
            </div>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePdfSelect}
              className="hidden"
            />
          </button>
        </div>

        {selectedImages && selectedImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Imágenes seleccionadas ({selectedImages.length})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(selectedImages).map((file, index) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="relative group rounded-lg border border-border bg-secondary/30 p-2"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span className="flex-1 truncate text-xs text-foreground">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAudio && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Audio seleccionado
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative group rounded-lg border border-border bg-secondary/30 p-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 flex-shrink-0 text-accent-foreground" />
                  <span className="flex-1 truncate text-xs text-foreground">
                    {selectedAudio.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPdf && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              PDF seleccionado
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative group rounded-lg border border-border bg-secondary/30 p-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                  <span className="flex-1 truncate text-xs text-foreground">
                    {selectedPdf.name}
                  </span>
                  <button
                    type="button"
                    onClick={removePdf}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {showTranscriptionModal && (
        <ModalTranscription
          mode={transcriptionMode}
          error={
            transcriptionMode === "image"
              ? Boolean(error)
              : transcriptionMode === "audio"
                ? audioError
                : pdfError
          }
          messages={messages}
          status={
            transcriptionMode === "image"
              ? status
              : transcriptionMode === "audio"
                ? audioStatus
                : pdfStatus
          }
          transcriptText={
            transcriptionMode === "audio"
              ? (transcriptAudio?.text ?? null)
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
                    setSaveFeedback(null);
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
                    Inicia sesión para guardar tus apuntes en documentos.
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
                  {isPersisting ? "Guardando..." : "Guardar en documentos"}
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
              } else if (transcriptionMode === "audio") {
                setTranscriptAudio(null);
                setAudioStatus("idle");
                setAudioError(false);
              } else {
                setPdfTranscript(null);
                setPdfStatus("idle");
                setPdfError(false);
              }
            }
            setShowTranscriptionModal(show);
          }}
        />
      )}
    </Card>
  );
}
