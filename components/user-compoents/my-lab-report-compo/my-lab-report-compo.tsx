"use client";

import React, { useEffect, useState } from "react";
import { fetchUserInfoFromAuth } from "@/lib/client-actions/current-user";
import { jsPDF } from "jspdf";
import {
  FileText,
  Download,
  Eye,
  X,
  Calendar,
  Image as ImageIcon,
  Loader2,
  File,
} from "lucide-react";

type Report = {
  id?: number | string;
  title?: string;
  reportUrl: string;
  description?: string;
  created_at?: string;
  patientName?: string;
};

const MyLabReportsCompo = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true); // Start true to avoid flash
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const user = await fetchUserInfoFromAuth();
        const email = user?.data?.claims?.email;
        if (!email) {
          setError("Please sign in to view your reports.");
          setReports([]);
          return;
        }

        const res = await fetch("/api/get-reports-by-user-email-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Unable to fetch reports.");
          setReports([]);
          return;
        }
        setReports(data.data || []);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const isPdf = (url: string) => url.toLowerCase().endsWith(".pdf");

  const downloadFile = async (r: Report) => {
    try {
      if (isPdf(r.reportUrl)) {
        const resp = await fetch(r.reportUrl);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${r.title || "medical-report"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        const imgResp = await fetch(r.reportUrl);
        const blob = await imgResp.blob();
        const reader = new FileReader();
        reader.onload = function () {
          const imgData = reader.result as string;
          const doc = new jsPDF({ unit: "pt", format: "a4" });
          const img = new Image();
          img.src = imgData;
          img.onload = function () {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const ratio = Math.min(
              pageWidth / imgWidth,
              pageHeight / imgHeight
            );
            const w = imgWidth * ratio;
            const h = imgHeight * ratio;
            doc.addImage(imgData, "JPEG", (pageWidth - w) / 2, 20, w, h);
            doc.save(`${r.title || "medical-report"}.pdf`);
          };
        };
        reader.readAsDataURL(blob);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to download file");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown Date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/home">CarePlus</a>
        </p>
      </div>
      <div className="max-w-7xl mx-auto mt-14 md:mt-10">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Lab Reports
          </h2>
          <p className="text-gray-500 mt-2">
            Access and download your medical history and test results.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <X size={18} />
            {error}
          </div>
        )}

        {/* Loading State (Skeleton) */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl h-64 shadow-sm animate-pulse border border-gray-100"
              >
                <div className="h-32 bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && reports.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="mx-auto bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <File className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No reports found
            </h3>
            <p className="text-gray-500 mt-1">
              When your lab results are ready, they will appear here.
            </p>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((r) => {
            const isPdfFile = isPdf(r.reportUrl);
            return (
              <div
                key={r.id || r.reportUrl}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Thumbnail Area */}
                <div
                  onClick={() => setSelected(r)}
                  className="relative h-40 w-full cursor-pointer overflow-hidden bg-gray-50 border-b border-gray-100"
                >
                  {isPdfFile ? (
                    // PDF Placeholder
                    <div className="h-full w-full flex flex-col items-center justify-center bg-rose-50/50 group-hover:bg-rose-50 transition-colors">
                      <FileText
                        size={48}
                        className="text-rose-500 mb-2 drop-shadow-sm"
                      />
                      <span className="text-xs font-semibold text-rose-600 tracking-wide uppercase">
                        PDF Document
                      </span>
                    </div>
                  ) : (
                    // Image Thumbnail
                    <div className="h-full w-full relative">
                      <img
                        src={r.reportUrl}
                        alt={r.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-md backdrop-blur-sm">
                        <ImageIcon size={14} />
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg">
                      <Eye size={20} className="text-gray-700" />
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className="font-semibold text-gray-900 truncate pr-2"
                      title={r.title}
                    >
                      {r.title || "Medical Report"}
                    </h3>
                  </div>

                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar size={12} className="mr-1.5" />
                    {formatDate(r.created_at)}
                  </div>

                  {r.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                      {r.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => setSelected(r)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadFile(r);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors group/btn"
                    >
                      <Download
                        size={16}
                        className="mr-1.5 group-hover/btn:-translate-y-0.5 transition-transform"
                      />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Viewer Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelected(null)}
          />

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {selected.title || "Report Viewer"}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selected.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadFile(selected)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
              {isPdf(selected.reportUrl) ? (
                <iframe
                  title="report-pdf"
                  src={selected.reportUrl}
                  className="w-full h-full rounded-lg shadow-sm bg-white"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selected.reportUrl}
                    alt={selected.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Mobile Download Button (Footer) */}
            <div className="sm:hidden p-4 border-t bg-white">
              <button
                onClick={() => downloadFile(selected)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLabReportsCompo;
