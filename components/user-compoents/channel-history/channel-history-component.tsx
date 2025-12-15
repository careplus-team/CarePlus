"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import LoadingUI from "@/lib/UI-helpers/loading-ui";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, CheckCircle } from "lucide-react";

type ChannelRow = {
  id: number;
  name: string;
  description?: string;
  doctorEmail?: string;
  date?: string;
  time?: string;
  roomNumber?: string | number;
};

type HistoryRow = {
  id: number;
  channelId: number;
  patientNumber: number;
  patientEmail: string;
  status: string;
  updated_at?: string | null;
  channel?: ChannelRow | null;
};

export default function ChannelHistoryComponent() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [doctors, setDoctors] = useState<Record<string, any>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;
        if (!user || !user.email) return;
        const res = await axios.post("/api/get-user-channeling-history-api", {
          patientEmail: user.email,
        });
        if (res.data.success) {
          const rows: HistoryRow[] = res.data.data || [];
          if (!mounted) return;
          setHistory(rows);

          // Collect unique doctor emails and fetch names in parallel
          const emails = Array.from(
            new Set(
              rows
                .map((r) => r.channel?.doctorEmail)
                .filter(Boolean) as string[]
            )
          );
          if (emails.length > 0) {
            const promises = emails.map((email) =>
              axios
                .post("/api/doctor-details-get-api", { email })
                .then((r) => ({ email, data: r.data }))
            );
            const results = await Promise.all(promises);
            if (!mounted) return;
            const map: Record<string, any> = {};
            results.forEach((r) => {
              if (r.data && r.data.success) map[r.email] = r.data.data;
            });
            setDoctors(map);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  if (loading) return <LoadingUI />;

  if (history.length === 0)
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No Completed Channelings
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You haven't completed any channelings yet. Your history will
              appear here once you visit a doctor.
            </p>
          </div>
        </div>
      </Card>
    );

  return (
    <div className="space-y-4">
      {history.map((row) => {
        const ch = row.channel as ChannelRow | undefined;
        const visitedAt = row.updated_at
          ? format(new Date(row.updated_at), "PPpp")
          : "-";
        const doc = ch?.doctorEmail ? doctors[ch.doctorEmail] : null;
        const docName = doc?.name || ch?.doctorEmail || "Doctor";

        return (
          <Card
            key={row.id}
            className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary bg-gradient-to-r from-card to-card/30 px-2 sm:px-4 py-2"
          >
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-3 mt-3 text-foreground break-words whitespace-normal">
                    {ch?.name || "Channel"}
                  </CardTitle>
                  <CardDescription className="flex mt-3 items-center gap-2 break-words whitespace-normal">
                    <User className="h-4 w-4" />
                    <span className="truncate">Dr. {docName}</span>
                  </CardDescription>
                </div>
                <div className="text-left mt-3 sm:text-right text-xs min-w-0">
                  <div className="text-muted-foreground uppercase tracking-wide">
                    Visited
                  </div>
                  <div className="text-sm font-medium text-foreground break-words whitespace-normal">
                    {visitedAt}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground truncate break-words whitespace-normal">
                    <span className="hidden sm:inline">Channeled Date </span>
                    {ch?.date || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground truncate break-words whitespace-normal">
                    <span className="hidden sm:inline">Channeled Time </span>
                    {ch?.time || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground truncate break-words whitespace-normal">
                    <span className="hidden sm:inline">Room </span>
                    {ch?.roomNumber || "—"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-t border-border/50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-muted-foreground">Slot</span>
                  <span className="font-semibold text-primary">
                    #{row.patientNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 truncate break-words whitespace-normal">
                    {row.status}
                  </span>
                </div>
              </div>
              {ch?.description && (
                <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground break-words whitespace-normal">
                  {ch.description}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
