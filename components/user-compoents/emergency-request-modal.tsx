"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useTransition } from "react";
import { AlertCircle, CheckCircle2, MapPin } from "lucide-react";

// Import Map dynamically to avoid SSR issues
const LeafletMap = dynamic(
  () => import("../common/leaflet-map"),
  { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
  }
);

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  userEmail?: string;
}

export default function EmergencyRequestModal({
  isOpen,
  onCloseAction,
  userEmail,
}: EmergencyRequestModalProps) {
  const client = createClient();
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  // Ambulance location state
  const [ambulanceLoc, setAmbulanceLoc] = useState<{ lat: number; lng: number } | null>(null);
  const latestUserLocRef = useRef<{ lat: number; lng: number } | null>(null);
  const channelRef = useRef<any>(null);

  const [form, setForm] = useState({ note: "", mobileNumber: "" });
  const [status, setStatus] = useState<"idle" | "pending" | "accepted" | "dispatched" | "arrived" | "assigned" | "completed" | "cancelled">("idle");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State for Route Polyline
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [lastRouteFetch, setLastRouteFetch] = useState<number>(0);

   // Helper: Fetch Route from OSRM
  const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
      // No internal throttle, using debounce in useEffect
      // const now = Date.now();
      // if (now - lastRouteFetch < 2000) return; 

      try {
          // OSRM expects: lon,lat;lon,lat
          const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
              const coordinates = data.routes[0].geometry.coordinates;
              // OSRM returns [lon, lat], Leaflet needs [lat, lon]
              const latLngs = coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
              setRouteCoords(latLngs);
              setLastRouteFetch(Date.now());
          }
      } catch (error) {
          console.error("Error fetching route:", error);
      }
  };

  // Connectivity
  const [isAmbulanceOnline, setIsAmbulanceOnline] = useState(true);
  const ambulanceLastSeenRef = useRef<number>(Date.now());

  // Heartbeat
  useEffect(() => {
      const interval = setInterval(() => {
          setIsAmbulanceOnline(Date.now() - ambulanceLastSeenRef.current < 5000);
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  // 1. Get Location & Check Active Request
  useEffect(() => {

    if (isOpen) {
      let watchId: number | null = null;
      let isActiveRequestFound = false;

      // Check for active request
      const checkActiveRequest = async () => {
        if (!userEmail) return;
        
        try {
          const { data } = await client
            .from("emergency_request")
            .select("*")
            .eq("userEmail", userEmail)
            .not("status", "in", "(completed,cancelled)") 
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data) {
             console.log("Found active request:", data);
             isActiveRequestFound = true;
             
             // If we found an active request, use its data and STOP watching current position for the "New Request" form
             setStatus(data.status);
             setActiveRequestId(data.id);
             
             if (data.latitude && data.longitude) {
               // Ensure numbers
               const userPos = { lat: Number(data.latitude), lng: Number(data.longitude) };
               setLocation(userPos);
               latestUserLocRef.current = userPos;
             }
             if (data.ambulance_lat && data.ambulance_lng) {
                setAmbulanceLoc({ lat: data.ambulance_lat, lng: data.ambulance_lng });
             }

             setForm({ 
               note: data.note || "", 
               mobileNumber: data.mobileNumber ? String(data.mobileNumber) : "" 
             });
             
             // Clear any "idle" watcher if it started
             if (watchId !== null) {
                 navigator.geolocation.clearWatch(watchId);
                 watchId = null;
             }

          } else {
             // No active request -> We are in IDLE mode (New Request Form)
             setStatus("idle");
             setActiveRequestId(null);
             setAmbulanceLoc(null);
             
             // Start Watching Position for the Form
             if ("geolocation" in navigator) {
                 watchId = navigator.geolocation.watchPosition(
                   (pos) => {
                     // Always update location in IDLE mode to reflect real movement/sensor changes
                     setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                     latestUserLocRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                     setErrorMsg(null);
                   },
                   (err) => {
                     console.error(`Location error (${err.code}): ${err.message}`);
                     setErrorMsg("Could not get your location. Please check permissions.");
                   },
                   { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
                 );
             }
          }
        } catch (e) {
             // Error checking request -> Assume IDLE and start watching
             setStatus("idle");
             if ("geolocation" in navigator) {
                 watchId = navigator.geolocation.watchPosition(
                   (pos) => {
                     setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                     latestUserLocRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                     setErrorMsg(null);
                   },
                   (err) => setErrorMsg(`Location error (${err.code}): ${err.message}`),
                   { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
                 );
             }
        }
      };

      checkActiveRequest();

      return () => {
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isOpen, userEmail]);

  // 2. Realtime Subscription for Active Request (Ambulance Location via Broadcast)
  useEffect(() => {
     if (!activeRequestId || !isOpen) return;

     const channel = client.channel(`tracking:${activeRequestId}`)
       
     channelRef.current = channel;

     channel
       .on(
         "broadcast",
         { event: "ambulance-location" },
         (payload) => {
            console.log("Live Location Broadcast:", payload);
            if (payload.payload && payload.payload.lat && payload.payload.lng) {
                setAmbulanceLoc({ lat: Number(payload.payload.lat), lng: Number(payload.payload.lng) });
                ambulanceLastSeenRef.current = Date.now();
                setIsAmbulanceOnline(true);
            }
         }
       )
       .on(
         "postgres_changes",
         { event: "UPDATE", schema: "public", table: "emergency_request", filter: `id=eq.${activeRequestId}` },
         (payload) => {
            console.log("Req update:", payload);
            const newData = payload.new;
            
            if (newData.status === 'completed' || newData.status === 'cancelled') {
                 setStatus("idle");
                 setActiveRequestId(null);
                 setAmbulanceLoc(null);
                 // Keep mobile number for convenience, but reset note
                 setForm(prev => ({ ...prev, note: "" })); 
                 toast.info("Mission Completed. You can make a new request.");
                 return;
            }

            setStatus(newData.status);
            
            // Still check DB for initial value or status changes, but rely on broadcast for live movement
            if (newData.ambulance_lat && newData.ambulance_lng) {
               // Optional: Update if broadcast hasn't already (or use as fallback)
               // setAmbulanceLoc({ lat: newData.ambulance_lat, lng: newData.ambulance_lng });
            }
         }
       )
       .on(
         "broadcast",
         { event: "request-patient-location" }, // Ambulance asking for User
         (payload) => {
            console.log("Ambulance requested my location. Replying...");
            if (channel && latestUserLocRef.current) {
                 channel.send({
                     type: 'broadcast',
                     event: 'patient-location',
                     payload: latestUserLocRef.current
                 });
            }
         }
       )
       .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
              // As soon as we join, ask the ambulance "Where are you?"
              channel.send({
                  type: 'broadcast',
                  event: 'request-ambulance-location',
                  payload: {} 
              });
          }
       });

     return () => {
         client.removeChannel(channel);
     }
  }, [activeRequestId, isOpen]);

  // 2.5 Realtime Route Updates
  useEffect(() => {
     if (!activeRequestId || !isOpen || !ambulanceLoc || !location.lat || !location.lng) return;
     
      const timer = setTimeout(() => {
          // Fetch route if we have both points
          if (status === 'dispatched' && location.lat && location.lng) {
              fetchRoute(ambulanceLoc.lat, ambulanceLoc.lng, location.lat, location.lng);
          }
      }, 1000);

      return () => clearTimeout(timer);
  }, [ambulanceLoc, location, activeRequestId, isOpen, status]);

  // 3. Share User's Live Location (if Active Request exists)
  useEffect(() => {
     if (!activeRequestId || !isOpen || status === 'completed') return;

     let watchId: number | null = null;
     if ("geolocation" in navigator) {
         watchId = navigator.geolocation.watchPosition(
             async (pos) => {
                 const { latitude, longitude } = pos.coords;
                 // Only update DB if significantly changed to avoid spam? For now, just update.
                 // Ideally debounce this.
                 
                  // Update local state visuals
                  setLocation({ lat: latitude, lng: longitude });
                  latestUserLocRef.current = { lat: latitude, lng: longitude };
                  
                  // Broadcast my location to ambulance
                  if (channelRef.current) {
                      channelRef.current.send({
                          type: 'broadcast',
                          event: 'patient-location',
                          payload: { lat: latitude, lng: longitude }
                      }).catch((err: any) => console.error("Broadcast err", err));
                  }

                 // Update DB so ambulance sees us
                 // ERROR HANDLING: If this fails silently, fine.
                 await client.from("emergency_request").update({ 
                     latitude, 
                     longitude 
                 }).eq("id", activeRequestId);
             },
             (err) => console.error(`Watch pos error (${err.code}): ${err.message}`),
             { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
         );
     }
     
     return () => {
         if (watchId !== null) navigator.geolocation.clearWatch(watchId);
     }
  }, [activeRequestId, isOpen, status]);

  // Keep-Alive Heartbeat (Broadcast location even if stationary)
  useEffect(() => {
      if (!activeRequestId || !isOpen || status === 'completed') return;

      const interval = setInterval(() => {
          if (channelRef.current && latestUserLocRef.current) {
              channelRef.current.send({
                  type: 'broadcast',
                  event: 'patient-location',
                  payload: latestUserLocRef.current
              }).catch((err: any) => console.error("Keep-Alive error:", err));
          }
      }, 1000); // 1 second (High reliability)

      return () => clearInterval(interval);
  }, [activeRequestId, isOpen, status]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.lat || !location.lng) {
      toast.error("Location is required for emergency requests.");
      return;
    }

    startTransition(async () => {
      try {
        const { data, error } = await client.from("emergency_request").insert([
          {
            userEmail: userEmail || "anonymous",
            note: form.note,
            mobileNumber: parseInt(form.mobileNumber),
            latitude: location.lat,
            longitude: location.lng,
            status: "pending",
          },
        ]).select().single();

        if (error) {
          throw error;
        }

        if (data) {
           setActiveRequestId(data.id);
           setStatus("pending");
        }
        toast.success("Emergency request sent successfully!");
      } catch (error: any) {
        console.error("Request error:", error);
        toast.error("Failed to send request: " + error.message);
      }
    });
  };

  const handleClose = () => {
    // Reset state only if there's no active request
    if (status === "idle") {
      setForm({ note: "", mobileNumber: "" });
    }
    onCloseAction();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open:any) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600 gap-2">
            <AlertCircle className="h-6 w-6" />
            Emergency Ambulance Request
          </DialogTitle>
          <DialogDescription>
            Request immediate assistance. Please share your exact location.
          </DialogDescription>
        </DialogHeader>

        {status !== "idle" ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
             <div className={`h-20 w-20 rounded-full flex items-center justify-center animate-pulse ${
                 status === 'arrived' ? 'bg-blue-100 text-blue-600 border-4 border-blue-500' :
                 status === 'dispatched' ? 'bg-red-100 text-red-600' : 
                 status === 'accepted' || status === 'assigned' ? 'bg-emerald-100 text-emerald-600' :
                 'bg-yellow-100 text-yellow-600'
             }`}>
                <span className="text-4xl">🚑</span>
             </div>
             <h3 className={`text-xl font-bold ${
                  status === 'arrived' ? 'text-blue-700 animate-bounce' :
                  status === 'dispatched' ? 'text-red-700' : 
                  status === 'accepted' || status === 'assigned' ? 'text-emerald-700' :
                  'text-yellow-700'
             }`}>
                {status === "arrived" ? "AMBULANCE ARRIVED!" :
                 status === "accepted" || status === "assigned" ? "Ambulance Assigned" : 
                 status === "dispatched" ? "Ambulance Dispatched !" : 
                 "Request Pending..."}
             </h3>
             <p className="text-slate-600 max-w-xs">
                {status === 'arrived'
                   ? "The ambulance is at your location. Please get ready for transport."
                   : status === 'dispatched' 
                   ? "The ambulance is sharing its live location. You can track it on the map below."
                   : status === 'accepted' || status === 'assigned'
                   ? "An ambulance has been assigned and is preparing to dispatch. Please wait for live tracking."
                   : "We are locating an ambulance for you. Please stay on this screen or keep your phone nearby."}
             </p>

            {location.lat && location.lng && (
                <div className="w-full h-64 mt-4 relative border border-slate-200 rounded-lg overflow-hidden">
                   <LeafletMap 
                        lat={location.lat} 
                        lng={location.lng} 
                        // Only show ambulance marker if dispatched
                        ambulanceLat={ambulanceLoc?.lat}
                        ambulanceLng={ambulanceLoc?.lng}
                        popupText="Your Location"
                        className="h-full w-full"
                        routeCoordinates={routeCoords}
                    />
                   
                   {status === 'dispatched' && (
                       <>
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs shadow font-bold text-emerald-600 z-[400]">
                               LIVE TRACKING ACTIVE
                           </div>
                           <div className={`absolute bottom-2 left-2 right-2 text-white text-xs py-1 px-2 rounded text-center z-[400] ${isAmbulanceOnline ? 'bg-red-600 animate-pulse' : 'bg-slate-500'}`}>
                                {isAmbulanceOnline ? 'AMBULANCE IS COMING TO YOU' : 'AMBULANCE SIGNAL LOST - WAITING FOR UPDATE...'}
                           </div>
                       </>
                   )}
                </div>
            )}

            {status === 'dispatched' && ambulanceLoc && location.lat && location.lng && (
                 <Button 
                    variant="secondary" 
                    className="w-full mt-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                    onClick={() => {
                        // Open Google Maps showing route FROM Ambulance TO User
                        window.open(`https://www.google.com/maps/dir/?api=1&origin=${ambulanceLoc.lat},${ambulanceLoc.lng}&destination=${location.lat},${location.lng}&travelmode=driving`, '_blank');
                    }}
                 >
                    <MapPin className="w-4 h-4 mr-2" />
                    Open in Google Maps
                 </Button>
            )}
            <Button variant="outline" onClick={handleClose} className="mt-4">
              Minimize
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Your Location</Label>
              {location.lat && location.lng ? (
                <LeafletMap lat={location.lat} lng={location.lng} />
              ) : (
                <div className="h-32 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2 border-2 border-dashed border-slate-300">
                  <MapPin className="h-8 w-8 animate-bounce opacity-50" />
                  <span>{errorMsg || "Detecting location..."}</span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="number"
                placeholder="0771234567"
                required
                value={form.mobileNumber}
                onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Medical Note (Situation)</Label>
              <Textarea
                id="note"
                placeholder="Describe the emergency (e.g., Chest pain, severe injury)..."
                required
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <DialogFooter className="sm:justify-between gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                disabled={!location.lat || isPending}
              >
                {isPending ? "Sending..." : "REQUEST HELP NOW"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
