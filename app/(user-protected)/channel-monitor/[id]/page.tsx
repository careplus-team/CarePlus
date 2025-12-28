"use client";
import React, { useEffect, useState, use } from "react";
import ChannelQueueMonitor from "@/components/user-compoents/channel-monitor/channel-queue-monitor";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingUI from "@/lib/UI-helpers/loading-ui";

export default function ChannelMonitorPage({
  params,
}: {
  params: Promise<any>;
}) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const [userBooking, setUserBooking] = useState<any | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const [channelData, setChannelDat] = useState<any>([]);

  useEffect(() => {
    // verify channel is started and user has a booking; otherwise redirect
    const supabase = createClient();
    let email: string | null = null;
    let unsub: any = null;

    (async () => {
      try {
        const ch = await axios.post("/api/get-one-channel-deatils-api", {
          channelId: Number(id),
        });
        if (!ch.data.success || !ch.data.data) {
          router.push("/home");
          return;
        }
        setChannelDat(ch.data.data);
        const channel = ch.data.data;
        if (channel.state !== "started") {
          // not available if not started
          router.push(`/channel-book/${id}`);
          return;
        }

        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.push("/login");
          return;
        }
        email = data.user.email ?? null;
        if (!email) {
          router.push("/login");
          return;
        }

        const res = await axios.post("/api/get-patient-channeling-info/", {
          channelId: Number(id),
          patientEmail: email,
        });
        if (res.data.success && res.data.data) {
          setUserBooking(res.data.data);
        } else {
          // user has no booking for this channel
          router.push(`/channel-book/${id}`);
          return;
        }

        // subscribe to booking changes for this channel and update if it concerns this user
        const bookingSub = supabase
          .channel(`public:patient_channeling:user-${id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "patient_channeling",
              filter: `channelId=eq.${id}`,
            },
            (payload) => {
              if (!email) return;
              const newRow: any = payload.new;
              const oldRow: any = payload.old;
              if (newRow?.patientEmail === email) setUserBooking(newRow);
              if (
                oldRow?.patientEmail === email &&
                payload.eventType === "DELETE"
              )
                setUserBooking(null);
            }
          )
          .subscribe();

        unsub = bookingSub;
      } catch (e) {
        console.error(e);
        router.push("/home");
      } finally {
        setChecking(false);
      }
    })();

    return () => {
      if (unsub) {
        supabase.removeChannel(unsub);
      }
    };
  }, [id, router]);

  if (checking) return <LoadingUI />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/home">CarePlus</a>
        </p>
      </div>
      <h1 className="text-2xl font-bold mb-4 mt-14 text-center md:text-left">
        Realtime Queue Monitor - {channelData.name}
      </h1>
      <ChannelQueueMonitor channelId={Number(id)} myBooking={userBooking} />
    </div>
  );
}
