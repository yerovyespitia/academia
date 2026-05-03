"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Book, Calendar, FileText, Mic, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import ButtonActions from "@/components/my-documents/button-actions";
import NotFiles from "@/components/my-documents/not-files";
import SearchBar from "@/components/my-documents/search-bar";
import UploadFiles from "@/components/my-documents/upload-files";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type StoredDocument = {
  _id: Id<"documents">;
  classId: Id<"classes">;
  className: string;
  title: string;
  type: "image" | "audio" | "pdf";
  content: string;
  originalFileName: string;
  createdAt: number;
  updatedAt: number;
  preview: string;
  wordCount: number;
};

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(timestamp);
}

function downloadTextFile(document: StoredDocument) {
  const blob = new Blob([document.content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  const safeName = document.title.replace(/[^\w.-]+/g, "_");
  link.href = url;
  link.download = `${safeName || "documento"}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function MyDocuments() {
  const { isAuthenticated } = useConvexAuth();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const documents = useQuery(
    api.documents.listForCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const deleteDocument = useMutation(api.documents.remove);

  const normalizedDocuments = (documents ?? []) as StoredDocument[];
  const tags = Array.from(
    new Set(normalizedDocuments.map((doc) => doc.className)),
  );

  const filteredDocuments = useMemo(
    () =>
      normalizedDocuments.filter((doc) => {
        const matchesTag = !selectedTag || doc.className === selectedTag;
        const searchValue = searchQuery.toLowerCase();
        const matchesSearch =
          doc.title.toLowerCase().includes(searchValue) ||
          doc.content.toLowerCase().includes(searchValue);

        return matchesTag && matchesSearch;
      }),
    [normalizedDocuments, searchQuery, selectedTag],
  );

  const documentsByTag = filteredDocuments.reduce(
    (acc, doc) => {
      if (!acc[doc.className]) {
        acc[doc.className] = [];
      }
      acc[doc.className].push(doc);
      return acc;
    },
    {} as Record<string, StoredDocument[]>,
  );

  const handleDeleteDocument = async (id: Id<"documents">) => {
    try {
      await deleteDocument({ id });
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mis Documentos
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus apuntes, imágenes y notas de voz
        </p>
      </div>

      <UploadFiles />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tags={tags}
      />

      {Object.keys(documentsByTag).length === 0 ? (
        <NotFiles />
      ) : (
        <div className="space-y-8">
          {Object.entries(documentsByTag).map(([tag, docs]) => (
            <div key={tag}>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="size-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">{tag}</h2>
                <Badge className="bg-accent-foreground/10 text-primary px-3">
                  {docs.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc) => (
                  <Card
                    key={doc._id}
                    className="p-4 bg-card border-border hover:border-primary/50"
                  >
                    <div className="w-full h-32 bg-secondary rounded-lg mb-3 flex items-center justify-center">
                      {doc.type === "image" ? (
                        <Book className="size-12 text-primary" />
                      ) : doc.type === "audio" ? (
                        <Mic className="size-12 text-primary" />
                      ) : (
                        <FileText className="size-12 text-primary" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-foreground text-sm line-clamp-2">
                          {doc.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
                          {doc.preview}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <Calendar className="size-3" />
                        <span>{formatDate(doc.createdAt)}</span>
                        <span>•</span>
                        <span>{doc.wordCount} palabras</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {doc.type === "image"
                            ? "Imagen"
                            : doc.type === "audio"
                              ? "Audio"
                              : "PDF"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {doc.originalFileName}
                        </Badge>
                      </div>
                    </div>

                    <ButtonActions
                      downloadDocument={() => downloadTextFile(doc)}
                      deleteDocument={() => handleDeleteDocument(doc._id)}
                    />
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
