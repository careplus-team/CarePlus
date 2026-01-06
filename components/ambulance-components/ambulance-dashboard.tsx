"use client";
import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Ambulance, MapPin, Navigation, User, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Leaflet map dynamics
const LeafletMap = dynamic(
  () => import("@/components/common/leaflet-map"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>,
  }
);

// Helper to calc distance (Haversine Formula) 
// Returns km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

// Type definitions
interface EmergencyRequest {
  id: string;
  user : any,
  created_at: string;
  userEmail: string;
  mobileNumber: number;
  latitude: number;
  longitude: number;
  ambulance_lat?: number;
  ambulance_lng?: number;
  note?: string;
  status: 'pending' | 'accepted' | 'assigned' | 'dispatched' | 'arrived' | 'completed' | 'cancelled';
  ambulanceId?: string;
}

interface AmbulanceLocation {
    lat: number;
    lng: number;
}

const AmbulanceDashboard = () => {
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [lastRouteFetch, setLastRouteFetch] = useState<number>(0);
  const [ambulanceLoc, setAmbulanceLoc] = useState<AmbulanceLocation | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const client = createClient();
  
  // State for Ambulance ID
  const [ambulanceId, setAmbulanceId] = useState<string | null>(null);

  // Watch ID for geolocation (using ref for stable cleanup)
  const watchIdRef = React.useRef<number | null>(null);
  
  // Ref to store latest location for on-demand broadcast
  const latestLocRef = React.useRef<AmbulanceLocation | null>(null);

  // State for Route Polyline
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // Connectivity
  const [isPatientOnline, setIsPatientOnline] = useState(true);
  const patientLastSeenRef = useRef<number>(Date.now());

  // Heartbeat
  useEffect(() => {
      const interval = setInterval(() => {
          setIsPatientOnline(Date.now() - patientLastSeenRef.current < 5000);
      }, 2000);
      return () => clearInterval(interval);
  }, []);



  // Channel ref for broadcast
  const channelRef = React.useRef<any>(null);

  // 4. Fetch Route from OSRM
  const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
      // Throttle: only fetch every 5 seconds to be nice to OSRM demo server
      // No throttle here, handled by useEffect debounce for better "catch-up" behavior
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
          console.warn("Route fetch warning (OSRM might be busy/down):", error);
      }
  };

  // 2. Start Live Tracking
  // Defined here to be accessible by other effects/functions
  const startTracking = (requestId: string) => {
    if (!navigator.geolocation) {
       toast.error("Geolocation not supported");
       return;
    }

    // Clear existing watcher if any to prevent duplicates
    if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
         const { latitude, longitude } = pos.coords;
         const newLoc = { lat: latitude, lng: longitude };
         
         setAmbulanceLoc(newLoc);
         latestLocRef.current = newLoc; // Update Ref for broadcast listeners
         
         // Broadcast Location (Fast, Realtime)
         if (channelRef.current) {
             channelRef.current.send({
                 type: 'broadcast',
                 event: 'ambulance-location',
                 payload: { lat: latitude, lng: longitude }
             }).catch((err: any) => console.error("Broadcast error:", err));
         }
      },
      (err) => {
          // Code 1: Permission Denied, 2: Position Unavailable, 3: Timeout
          const msg = `Location watcher warning (${err.code}): ${err.message}`;
          console.warn(msg);
          if (err.code === 1) toast.error("Location permission denied. Please enable GPS.");
          // Don't spam toasts for timeouts/unavailable, just warn in console
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    watchIdRef.current = id;
  };

    const fetchAssignedRequest = async (currentAmbulanceId: string) => {
        try {
            const { data: requestData, error: requestError } = await client
              .from("emergency_request")
              .select("*, user:userEmail(*)") 
              .or(`ambulanceId.eq.${currentAmbulanceId}`)
              .not("status", "in", "(completed,cancelled)") 
              .single();

            if (requestData) {
              console.log("req data" , requestData)
              setRequest(requestData);
              setStatus(requestData.status);
              
              if (requestData.status === 'dispatched') {
                 // Ensure tracking is running if dispatched
                 startTracking(requestData.id);
                 // IMMEDIATE INIT: hydrating location from DB so heartbeat works instantly
                 if (requestData.ambulance_lat && requestData.ambulance_lng) {
                     const initialLoc = { lat: Number(requestData.ambulance_lat), lng: Number(requestData.ambulance_lng) };
                     setAmbulanceLoc(initialLoc);
                     latestLocRef.current = initialLoc; 
                 }
              }
            } else {
                // No active request found (maybe it was cancelled or completed)
                 setRequest(null);
                 setStatus("idle");
            }
        } catch (e) {
            console.error("Error fetching request:", e);
        }
    };

    useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        // 1. Get Logged In User
        const { data: { user } } = await client.auth.getUser();
        
        if (!user || !user.email) {
            toast.error("Please log in as an ambulance operator.");
            setIsLoading(false);
            return;
        }

        // 2. Get Ambulance ID assigned to this operator
        const { data: operatorData, error: operatorError } = await client
            .from("ambulance_operator")
            .select("ambulanceId")
            .eq("userEmail", user.email)
            .single();

        if (operatorError || !operatorData || !operatorData.ambulanceId) {
             console.error("Access Denied: No ambulance assigned.");
             toast.error("Access Denied: You are not a registered ambulance operator.");
             router.push("/"); // Redirect to home
             return;
        }

        const currentAmbulanceId = operatorData.ambulanceId;
        setAmbulanceId(currentAmbulanceId);

        // 3. Fetch Assigned Request for this Ambulance
        await fetchAssignedRequest(currentAmbulanceId);

      } catch (e) {
        console.log("Error initializing dashboard", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();

    return () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []); 
  
  // Realtime Subscription for New Assignments
  useEffect(() => {
      if (!ambulanceId) return;

      const channel = client
        .channel('ambulance-dashboard-assignments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'emergency_request',
            filter: `ambulanceId=eq.${ambulanceId}`,
          },
          (payload) => {
             console.log("Realtime update received:", payload);
             // Refetch to get full data (including user relations)
             fetchAssignedRequest(ambulanceId);
          }
        )
        .subscribe();

      return () => {
          client.removeChannel(channel);
      }
  }, [ambulanceId]); 
 

  // 3. Dispatch Action
  const dispatchAmbulance = async () => {
    if (!request) return;

    try {
      // Get current location for "starting point" persistence
      let startLat = ambulanceLoc?.lat;
      let startLng = ambulanceLoc?.lng;

      if (!startLat || !startLng) {
          // Try to get one-off position
          try {
             const pos: any = await new Promise((resolve, reject) => {
                 navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, maximumAge: 0, timeout: 3000 });
             });
             startLat = pos.coords.latitude;
             startLng = pos.coords.longitude;
             // Update local state too
             startTracking(request.id); // This will also capture it, but let's be safe
          } catch (e) {
             console.warn("Could not get starting location immediately");
          }
      }

      // Update Status AND Starting Location (as per requirement)
      const updatePayload: any = { status: "dispatched" };
      if (startLat && startLng) {
          updatePayload.ambulance_lat = startLat;
          updatePayload.ambulance_lng = startLng;
      }

      const { error } = await client
        .from("emergency_request")
        .update(updatePayload)
        .eq("id", request.id);

      if (error) throw error;

      setStatus("dispatched");
      toast.success("Ambulance Dispatched! Live location sharing started.");
      // Ensure tracking is running
      startTracking(request.id);
    } catch (e:any) {
      toast.error("Failed to dispatch: " + e.message);
    }
  };

  // 4a. Mark as Arrived
  const markAsArrived = async () => {
    if (!request) return;

    try {
        const { error } = await client
            .from("emergency_request")
            .update({ status: "arrived" })
            .eq("id", request.id);

        if (error) throw error;

        setStatus("arrived");
        toast.success("Marked as Arrived. Live tracking stopped.");
        
        // Stop tracking
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

    } catch (e: any) {
        toast.error("Error marking arrival: " + e.message);
    }
  };

  // 4b. Complete Job
  const completeJob = async () => {
    if (!request) return;
    
    // Optional: Confirm with user?
    // Confirmation moved to UI Dialog


    try {
        // 1. Update Request to Completed
        const { error: reqError } = await client
            .from("emergency_request")
            .update({ status: "completed" })
            .eq("id", request.id);

        if (reqError) throw reqError;
        
        // 2. Update Ambulance Availability to AVAILABLE
        if (ambulanceId) {
             const { error: ambError } = await client
                .from("ambulance")
                .update({ availbility: "available" })
                .eq("id", ambulanceId); // Use the state variable we set earlier
             
             if (ambError) {
                 console.error("Failed to update ambulance availability:", ambError);
                 // Don't block completion, but warn
             }
        }

        setStatus("idle");
        setRequest(null);
        setAmbulanceLoc(null);
        toast.success("Mission Completed! Good job.");
        
        // Ensure tracking stopped
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

    } catch (e: any) {
        toast.error("Error completing job: " + e.message);
    }
  };
  
  // 4. Realtime Broadcast Channel
  useEffect(() => {
    if (!request?.id) return;

    // Initialize Broadcast Channel
    const channel = client.channel(`tracking:${request.id}`, {
        config: {
            broadcast: { self: true } 
        }
    });

    channel
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "emergency_request", filter: `id=eq.${request.id}` },
        (payload) => {
           const newReq = { ...request, ...payload.new } as EmergencyRequest;
           setRequest(newReq);
           if (newReq.status) {
               setStatus(newReq.status);
           }
        }
      )
      .on(
          "broadcast",
          { event: "request-ambulance-location" }, // User asking for Ambulance
          (payload) => {
              console.log("Received location request from user. Replying...");
              if (channelRef.current && latestLocRef.current) {
                   channelRef.current.send({
                       type: 'broadcast',
                       event: 'ambulance-location',
                       payload: latestLocRef.current
                   }).catch((err: any) => console.error("Broadcast reply error:", err));
              }
          }
      )
      .on(
          "broadcast",
          { event: "patient-location" }, // User sending their location
          (payload) => {
             if (payload.payload && payload.payload.lat && payload.payload.lng) {
                 setRequest((prev) => prev ? ({ ...prev, latitude: payload.payload.lat, longitude: payload.payload.lng }) : prev);
                 patientLastSeenRef.current = Date.now();
                 setIsPatientOnline(true);
             }
          }
      )
      .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
              console.log("Channel joined for tracking:", request.id);
              channelRef.current = channel;
              
              // Ask user for THEIR location immediately
              channel.send({
                  type: 'broadcast',
                  event: 'request-patient-location',
                  payload: {} 
              });
          }
      });

    return () => {
        client.removeChannel(channel);
        channelRef.current = null;
    }
  }, [request?.id]); 

  // 5. Route Calculation Effect (Updates when either party moves)
  // 5. Keep-Alive Heartbeat (Check inside interval to handle async refs)
  useEffect(() => {
    if (status !== 'dispatched') return;

    const interval = setInterval(() => {
        if (channelRef.current && latestLocRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'ambulance-location',
                payload: latestLocRef.current
            }).catch((err: any) => console.error("Keep-Alive error:", err));
        }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status]);

  // 6. Route Calculation Effect (Updates when either party moves)
  useEffect(() => {
    if (!request || !ambulanceLoc) return;
    
    // Debounced Route Fetching (1s delay to ensure we catch final position)
    const timer = setTimeout(() => {
        if (request.latitude && request.longitude && ambulanceLoc.lat && ambulanceLoc.lng) {
            fetchRoute(ambulanceLoc.lat, ambulanceLoc.lng, request.latitude, request.longitude);
        }
    }, 1000);

    return () => clearTimeout(timer);
  }, [ambulanceLoc, request?.latitude, request?.longitude]);


  const distance = (request && ambulanceLoc) 
      ? getDistanceFromLatLonInKm(ambulanceLoc.lat, ambulanceLoc.lng, request.latitude, request.longitude).toFixed(2)
      : null;

  if (isLoading) {
      return <div className="p-8 flex items-center justify-center min-h-screen"><span className="animate-pulse">Loading Dashboard...</span></div>
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
       {/* Header */}
       <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 pattern-dots"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
               <Ambulance className="h-8 w-8" />
               Ambulance Dashboard
            </h1>
            <p className="text-red-100 mt-2">
               Vehicle ID: <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{ambulanceId || "Loading..."}</span>
            </p>
          </div>
          <div className="hidden md:block">
             <div className="text-right">
                <div className="text-sm opacity-80 uppercase tracking-wider">Status</div>
                <div className="font-bold text-xl flex items-center gap-2 justify-end">
                    {status === 'dispatched' ? (
                        <>
                           <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            ON MISSION (Dispatched)
                        </>
                    ) : request ? (
                        <span className="text-yellow-200">ASSIGNED - STANDBY</span>
                    ) : (
                        <span className="text-emerald-200">IDLE - AVAILABLE</span>
                    )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {request ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[calc(100vh-250px)] lg:min-h-[600px]">
           {/* Map Section (Large) */}
           <div className="lg:col-span-2 bg-slate-200 rounded-2xl shadow-inner border border-slate-300 overflow-hidden relative">
              <LeafletMap 
                  lat={request.latitude || 6.9271} 
                  lng={request.longitude || 79.8612}
                  ambulanceLat={ambulanceLoc?.lat}
                  ambulanceLng={ambulanceLoc?.lng}
                  routeCoordinates={routeCoords}
                  popupText="Patient Location"
                  className="w-full h-[400px] lg:h-full lg:min-h-0"
              />
        
           </div>

           {/* Details & Actions (Right Panel) */}
           <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col">
              <div className="mb-6">
                 <h2 className="text-xl font-bold text-slate-800 mb-1">Emergency Details</h2>
                 <p className="text-sm text-slate-400">Request ID: #{String(request.id).slice(0,8)}</p>
              </div>

              {/* Patient Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                  
                       {request.user?.profilePicture && (
                        <Image src={request.user?.profilePicture} alt="User" width={100} height={100} className=" object-cover aspect-square rounded-full " />
                       )}
                       {/* If user object exists */}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {request.userEmail}
                            {status === 'dispatched' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${isPatientOnline ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {isPatientOnline ? 'LIVE' : 'OFFLINE'}
                                </span>
                            )}
                        </h3> 
                        <div className="flex items-center text-slate-500 text-sm">
                           <Phone className="w-3 h-3 mr-1" /> {request.mobileNumber}
                        </div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex gap-2">
                       <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                       <p className="text-sm text-slate-700 font-medium leading-tight">
                            {/* Uses hardcoded location text if lat/lng used mainly */}
                            Lat: {request.latitude?.toFixed(4)}, Lng: {request.longitude?.toFixed(4)}
                       </p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-900 text-sm">
                       <strong>Note:</strong> {request.note || "No specific details."}
                    </div>
                 </div>
              </div>

              <div className="mt-auto space-y-3">
                  {status === 'assigned' || status === 'accepted' ? (
                       <AlertDialog>
                           <AlertDialogTrigger asChild>
                               <Button 
                                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-md transition-all hover:scale-[1.02]"
                               >
                                  <Navigation className="w-5 h-5 mr-2" />
                                  DISPATCH AMBULANCE
                               </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>Dispatch Ambulance?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                       This will start live location sharing with the patient and mark your status as 'On Mission'. Are you ready to depart?
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={dispatchAmbulance} className="bg-red-600 hover:bg-red-700 text-white">
                                       Confirm Dispatch
                                   </AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                  ) : status === 'dispatched' ? (
                       <div className="space-y-3">
                           <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                               <p className="text-emerald-800 font-bold flex items-center justify-center gap-2">
                                  <span className="relative flex h-3 w-3">
                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                     <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                  </span>
                                  Live Location Sharing Active
                               </p>
                               <p className="text-xs text-emerald-600 mt-1">Patient can see your location</p>
                               {ambulanceLoc && (
                                   <div className="mt-2 text-[10px] bg-white/50 p-1 rounded font-mono text-emerald-800">
                                       GPS: {Number(ambulanceLoc.lat).toFixed(6)}, {Number(ambulanceLoc.lng).toFixed(6)}
                                   </div>
                               )}
                           </div>
                           <Button variant="outline" className="w-full" onClick={() => {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`, '_blank');
                           }}>
                               Open Google Maps
                           </Button>
                           <AlertDialog>
                               <AlertDialogTrigger asChild>
                                   <Button 
                                      className="w-full bg-red-500 hover:bg-red-700"
                                    >
                                       Mark as Arrived
                                   </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent>
                                   <AlertDialogHeader>
                                       <AlertDialogTitle>Confirm Arrival</AlertDialogTitle>
                                       <AlertDialogDescription>
                                           Are you sure you have arrived at the patient's location? This will stop live location tracking and notify the user.
                                       </AlertDialogDescription>
                                   </AlertDialogHeader>
                                   <AlertDialogFooter>
                                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                                       <AlertDialogAction onClick={markAsArrived} className="bg-red-600 hover:bg-red-700 text-white">
                                           Confirm Arrived
                                       </AlertDialogAction>
                                   </AlertDialogFooter>
                               </AlertDialogContent>
                           </AlertDialog>
                       </div>
                  ) : status === 'arrived' ? (
                      <div className="space-y-4">
                          <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl text-center space-y-2">
                              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-2">
                                  <MapPin className="h-6 w-6" />
                              </div>
                              <h3 className="text-blue-900 font-bold text-lg">Arrived at Location</h3>
                              <p className="text-blue-700/80 text-sm">You have reached the patient. Assist them and transport if necessary.</p>
                          </div>
                   
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button 
                                      className="w-full h-14 text-lg font-bold bg-slate-800 hover:bg-slate-900 shadow-md"
                                  >
                                      COMPLETE MISSION
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Complete Mission?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Are you sure you want to complete this job? This will close the request and mark your ambulance as available again.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={completeJob} className="bg-slate-800 hover:bg-slate-900 text-white">
                                          Complete Mission
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  ) : (
                      <div className="text-center text-slate-400 p-4">
                         Request Status: {status}
                      </div>
                  )}
              </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
           <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Ambulance className="w-10 h-10 opacity-50" />
           </div>
           <h2 className="text-xl font-bold text-slate-600">No Assigned Requests</h2>
           <p>You are currently available.</p>
        </div>
      )}
    </div>
  );
};

export default AmbulanceDashboard;
