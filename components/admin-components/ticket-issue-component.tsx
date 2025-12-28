"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Ticket, Clock, Users, User, Hash } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";

interface OpdSession {
  id: number;
  numberOfPatientsSlots: number;
  orginalSlotsCount: number;
  lastIssuedToken: number;
  doctorName: string;
  timeSlot: string;
}

export default function IssueTicketComponent() {
  const [session, setSession] = useState<OpdSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [lastTicket, setLastTicket] = useState<number | null>(null);
  const supabaseClient = createClient();

  const fetchSession = async () => {
    try {
      const response = await axios.post("/api/get-opd-session-api");
      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setSession(response.data.data[0]);
      } else {
        toast.error("No active OPD session found.");
      }
    } catch (error) {
      toast.error("Failed to fetch session details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    const channel = supabaseClient
      .channel("realtime:opdsession-admin-issue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "opdsession" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setSession(null);
            toast.info("OPD Session has ended.");
          } else if (payload.eventType === "INSERT") {
            setSession(payload.new as unknown as OpdSession);
            toast.success("New OPD Session started.");
          } else if (payload.eventType === "UPDATE") {
            setSession((prev) => {
              if (prev && prev.id === payload.new.id) {
                return payload.new as unknown as OpdSession;
              }
              return payload.new as unknown as OpdSession;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const handleIssueTicket = async () => {
    if (!session) return;
    setIssuing(true);
    try {
      const response = await axios.post("/api/issue-opd-ticket");
      if (response.data.success) {
        toast.success("Ticket issued successfully!");
        setLastTicket(response.data.ticketNumber);
        setSession((prev) =>
          prev
            ? {
                ...prev,
                lastIssuedToken: response.data.ticketNumber,
              }
            : null
        );
      } else {
        toast.error(response.data.message || "Failed to issue ticket.");
      }
    } catch (error) {
      toast.error("An error occurred while issuing the ticket.");
    } finally {
      setIssuing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[80vh] p-4">
        <Card className="w-full max-w-md text-center py-10">
          <CardContent>
            <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Active Session</h3>
            <p className="text-muted-foreground mt-2">
              There is currently no OPD session running.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSlots = session.orginalSlotsCount || 0;
  const issued = session.lastIssuedToken || 0;
  const remaining = totalSlots - issued;
  const isFull = issued >= totalSlots;
  const progressPercentage = Math.min((issued / totalSlots) * 100, 100);

  return (
    <div className="flex items-center justify-center min-h-[85vh] p-4 bg-gray-50/50 dark:bg-background">
   
      <Card className="w-full max-w-md shadow-xl border-2 border-gray-200 dark:ring-gray-800">
        {/* Header Section */}
        <CardHeader className="pb-2 text-center border-b bg-muted/10">
          <div className="flex justify-center mb-2">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Live Session
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {session.doctorName || "Unknown Doctor"}
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="w-4 h-4" />
            <span>{session.timeSlot || "N/A"}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-8 pb-6 px-8">
          {/* Main Counter */}
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Next Issued Ticket
            </span>
            <div className="relative">
              <div className="text-8xl font-mono font-bold tracking-tighter text-primary">
                {issued + 1}
              </div>
              {lastTicket === issued && (
                <div className="absolute -right-6 -top-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Full</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  isFull ? "bg-red-500" : "bg-primary"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <Hash className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-lg font-bold">{totalSlots}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Total
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <Users className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-lg font-bold text-green-600">
                {remaining}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Left
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
              <User className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-lg font-bold text-orange-600">
                {session.numberOfPatientsSlots}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                In Room
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleIssueTicket}
            disabled={issuing || isFull}
            variant={isFull ? "destructive" : "default"}
          >
            {issuing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Ticket className="mr-2 h-5 w-5" />
            )}
            {isFull ? "Session Full" : "Issue Next Ticket"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
