"use client";
import React, { useTransition, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(
  () => import("@/components/common/leaflet-map"),
  {
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>,
    ssr: false,
  }
);

const EmergencyManagerDashboard = () => {
  const [dbUserInfo, setDbUserInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [isPendingEmgData , startTransitionEmgData] = useTransition();
  const [initialRequestFetch , setInitialRequestFetch] = useState<boolean>(false);
  const client = createClient();
  
  // Details Modal State
  const [detailsConfig, setDetailsConfig] = useState<{
    isOpen: boolean;
    request: any | null;
  }>({
    isOpen: false,
    request: null,
  });

  // Map Route State
  const [ambulanceLoc, setAmbulanceLoc] = useState<{lat: number, lng: number} | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [lastRouteFetch, setLastRouteFetch] = useState<number>(0);
  
  // Helper: Fetch Route from OSRM
  const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
      // Debounced controlled by useEffect
      try {
          const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
              const coordinates = data.routes[0].geometry.coordinates;
              const latLngs = coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
              setRouteCoords(latLngs);
              setLastRouteFetch(Date.now());
          }
      } catch (error) {
          console.error("Error fetching route:", error);
      }
  };

  useEffect(()=>{
    fetchUserInfoFromAuth();
    
    startTransitionEmgData(()=>{
      if(!initialRequestFetch){
         getEmgData();
      }
    })

  },[])

  const getUserInfoFromDb = (email: any) => {
    startTransition(async () => {
      const client = createClient();
      console.log("used mail", email);
      const dbUserInfo = await client
        .from("user")
        .select("*")
        .eq("email", email);
      if (dbUserInfo.data) {
        if (dbUserInfo.data?.length <= 0) {
          const doctorInfor = await axios.post("/api/doctor-details-get-api", {
            email,
          });
          setDbUserInfo(doctorInfor.data.data);
        } else {
          setDbUserInfo(dbUserInfo.data ? dbUserInfo.data[0] : null);
          console.log(dbUserInfo);
        }
      } else {
        toast.error("Error fetching user data from database");
        return;
      }
    });
  };

  const fetchUserInfoFromAuth = () => {
    startTransition(async () => {
      const client = createClient();
      const { data, error } = await client.auth.getUser();
      console.log("user auth info", data);
      setUserInfo(data.user);

      if (data?.user?.email != null) {
        console.log("hree", data.user.email);
        getUserInfoFromDb(data.user.email);
      }
    });
  };

  // Realtime subscription
  useEffect(() => {
    const channel = client
      .channel("realtime:emergency_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergency_request" },
        async (payload) => {
          console.log("Realtime change:", payload);
          if (payload.eventType === "INSERT") {
             // Fetch user details for the new request
             const newItem = payload.new;
             let userData = null;
             
             // Try fetching from user table first
             const { data: userDb } = await client.from("user").select("*").eq("email", newItem.userEmail).single();
             if (userDb) {
               userData = userDb;
             } else {
               // Try doctor API as fallback
               try {
                 const docRes = await axios.post("/api/doctor-details-get-api", { email: newItem.userEmail });
                 if (docRes.data?.success) userData = docRes.data.data;
               } catch (e) { console.error("Error fetching doc details for realtime", e); }
             }

             setRequests((prev) => [...prev, { ...newItem, user: userData }]);
             toast.info("New Emergency Request Received!");
          } else if (payload.eventType === "UPDATE") {
             setRequests((prev) => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
             // Also update details modal if open and matching
             setDetailsConfig((prev) => {
                if (prev.isOpen && prev.request?.id === payload.new.id) {
                    return { ...prev, request: { ...prev.request, ...payload.new } };
                }
                return prev;
             });

          } else if (payload.eventType === "DELETE") {
             setRequests((prev) => prev.filter(r => r.id !== payload.old.id));
             // Close details if deleted
             setDetailsConfig((prev) => {
                if (prev.isOpen && prev.request?.id === payload.old.id) {
                    return { isOpen: false, request: null };
                }
                return prev;
             });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [client]);

  const [requests, setRequests] = useState<Array<any>>([
  
  ]);


  const getEmgData = ()=>{

    setInitialRequestFetch(true);
    startTransitionEmgData(async()=>{
      const emgData = await axios.get("/api/get-emg-req-api");
      console.log("emg data" , emgData.data)
      if(!emgData.data.data){
        toast.error("Error fetching emergency data");
        return;
      }
      if(emgData.data.data.length <= 0){
        toast.error("No emergency data found");
        return;
      }
      if(!emgData.data.success){
        toast.error("Error fetching emergency data");
        return;
      }
      emgData.data.data.map(async (item:any)=>{
          const emgUserInfo = await client
          .from("user")
          .select("*")
          .eq("email", item.userEmail);
        if (emgUserInfo.data) {
          if (emgUserInfo.data.length <= 0) {
            console.log("reached01")
            const doctorInfor = await axios.post(
              "/api/doctor-details-get-api",
              { email : item.userEmail }
            );
            setRequests((prev)=>{
              return [...prev , {
                ...item,
                user : doctorInfor.data.data
              }]
            })
          } else {
                 console.log("reached02")
            setRequests((prev)=>{
              return [...prev , {
                ...item,
                user : emgUserInfo.data[0]
              }]
            })
          }
        } else {
          toast.error("Error fetching user data from database");
        }
 
        
      })

    })
    
  }

  useEffect(()=>{
    console.log("Request Data" ,requests)
  })


  const [ambulances, setAmbulances] = useState<any[]>([]);

  // Fetch ambulances on mount
  // Fetch ambulances on mount (Filtered by Active Operators)
  useEffect(() => {
      const fetchAmbulances = async () => {
          try {
            // 1. Get active operators (those with userEmail)
            const { data: activeOps, error: opError } = await client
                .from("ambulance_operator")
                .select("ambulanceId")
                .not("userEmail", "is", null); // Ensure they have a user assigned

            if (opError) {
                console.error("Error fetching operators:", opError);
                return;
            }

            if (!activeOps || activeOps.length === 0) {
                setAmbulances([]);
                return;
            }

            const activeIds = activeOps.map((op: any) => op.ambulanceId);

            // 2. Fetch ambulances that match these IDs
            const { data, error } = await client
                .from("ambulance")
                .select("*")
                .in("id", activeIds);

            if (data) {
                setAmbulances(data);
            }
          } catch (e) {
              console.error("Error fetching ambulances:", e);
          }
      };
      fetchAmbulances();
  }, [client]);

  // Accept & Assign Dialog State
  const [acceptAssignDialog, setAcceptAssignDialog] = useState<{
      isOpen: boolean;
      requestId: string | null;
      selectedAmbulanceId: string;
  }>({
      isOpen: false,
      requestId: null,
      selectedAmbulanceId: "",
  });

  // Decline Dialog State
  const [declineDialog, setDeclineDialog] = useState<{
      isOpen: boolean;
      requestId: string | null;
  }>({
      isOpen: false,
      requestId: null,
  });

  const openAcceptAssign = (requestId: string) => {
      setAcceptAssignDialog({
          isOpen: true,
          requestId,
          selectedAmbulanceId: "", // Reset selection
      });
  };

  const handleAcceptAssignConfirm = async () => {
      const { requestId, selectedAmbulanceId } = acceptAssignDialog;
      if (!requestId || !selectedAmbulanceId) {
          toast.error("Please select an ambulance to dispatch.");
          return;
      }

      await assignAmbulance(requestId, selectedAmbulanceId);
      setAcceptAssignDialog({ isOpen: false, requestId: null, selectedAmbulanceId: "" });
      toast.success("Request Accepted & Ambulance Assigned");
  };

  const assignAmbulance = async (requestId: string, ambulanceId: string) => {
    try {
      // 1. Update Request Status
      const { error: reqError } = await client
        .from("emergency_request")
        .update({ 
          status: "assigned", // Directly to assigned
          ambulanceId: ambulanceId 
        })
        .eq("id", requestId);

      if (reqError) throw reqError;

      // 2. Update Ambulance Availability to BUSY
      const { error: ambError } = await client
        .from("ambulance")
        .update({ availbility: "busy" })
        .eq("id", ambulanceId);

      if (ambError) {
         console.error("Error updating ambulance availability:", ambError);
         toast.error("Warning: Ambulance status update failed, but request assigned.");
      }

      // Optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, assigned: ambulanceId, status: "assigned", ambulanceId: ambulanceId } // Ensure distinct ID kept
            : r
        )
      );
      
      // Update details modal if open
      setDetailsConfig((prev) => {
        if (prev.isOpen && prev.request?.id === requestId) {
           return { ...prev, request: { ...prev.request, status: "assigned", assigned: ambulanceId, ambulanceId: ambulanceId } };
        }
        return prev;
      });

    } catch (e: any) {
      console.error("Error assigning ambulance:", e);
      toast.error("Failed to assign ambulance: " + e.message);
    }
  };

  const confirmDecline = (requestId: string) => {
      setDeclineDialog({ isOpen: true, requestId });
  };

  const handleDeclineConfirm = async () => {
      const { requestId } = declineDialog;
      if (!requestId) return;

      try {
          const { error } = await client
              .from("emergency_request")
              .update({ status: "cancelled" })
              .eq("id", requestId);

          if (error) throw error;

          toast.success("Request Declined & Cancelled");
          
          // Optimistic Update
          setRequests((prev) => prev.filter((r) => r.id !== requestId));
          
          setDeclineDialog({ isOpen: false, requestId: null });

      } catch (e: any) {
          console.error("Error declining request:", e);
          toast.error("Failed to decline request: " + e.message);
      }
  };

  // ... (Keep existing helpers like getUserInfoFromDb etc if needed, or rely on existing ones) ...

  const openDetails = (req: any) => {
    setDetailsConfig({
      isOpen: true,
      request: req,
    });
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const assignedCount = requests.filter((r) => r.status === "assigned" || r.status === "dispatched").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl text-center md:text-left md:text-4xl font-bold mb-2">
              Welcome back,{" "}
              {isPending ? (
                <Skeleton className="inline-block h-8 w-32 bg-white/20 rounded mx-1 align-middle" />
              ) : (
                dbUserInfo?.name || "there"
              )}
              !
            </h2>
            <p className="text-blue-100 text-lg text-center md:text-left">
              Here's your emergency manager dashboard.
            </p>
          </div>
          <div className="flex items-center space-x-4">
             {/* Profile image etc */}
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
              {isPending ? (
                 <Skeleton className="w-full h-full rounded-full bg-white/30" />
              ) : (
                <Image
                  src={dbUserInfo?.profilePicture || "/temp_user.webp"}
                  alt="Profile"
                  width={70}
                  height={70}
                  className="rounded-full object-cover aspect-square"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Requests list (2/3 width on md+) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section 1: New Requests (Pending) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                New Requests
              </h3>
              <div className="text-sm text-slate-500">
                {requests.filter(r => r.status === 'pending').length} Pending
              </div>
            </div>

            <div className="space-y-4">
              {isPendingEmgData ? (
                 <>
                   {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                         <Skeleton className="w-12 h-12 rounded-full" />
                         <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                         </div>
                         <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                         </div>
                      </div>
                   ))}
                 </>
              ) : (
                 <>
              {requests.filter(r => r.status === 'pending').map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center overflow-hidden border border-amber-100">
                      <Image
                        src={req.user?.profilePicture || "/temp_user.webp"}
                        alt={req.user?.name || "Request User"}
                        width={48}
                        height={48}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {req.user?.name || req.userEmail || "Unknown User"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {req.note || "No details provided"}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                         <span>•</span>
                         <span>{req.created_at ? new Date(req.created_at).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}) : "Time N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                        onClick={() => openAcceptAssign(req.id)}
                      >
                        Accept & Assign
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDecline(req.id)}
                      >
                        Decline
                      </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetails(req)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.status === 'pending').length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No new emergency requests.
                  </div>
              )}

                 </>
              )}
            </div>
          </div>

          {/* Section 2: Accepted / Ongoing Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Ongoing / Assigned Requests
              </h3>
              <div className="text-sm text-slate-500">
                {requests.filter(r => r.status !== 'pending' && r.status !== 'completed').length} Active
              </div>
            </div>

            <div className="space-y-4">
              {isPendingEmgData ? (
                  <>
                   {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-4 border border-l-4 border-slate-200 border-l-slate-300 shadow-sm flex items-center gap-4">
                         <Skeleton className="w-12 h-12 rounded-full" />
                         <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                         </div>
                         <Skeleton className="h-8 w-24" />
                      </div>
                   ))}
                  </>
              ) : (
                  <>
              {requests.filter(r => r.status !== 'pending' && r.status !== 'completed').map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg shadow-sm border border-l-4 border-l-emerald-500 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100">
                      <Image
                        src={req.user?.profilePicture || "/temp_user.webp"}
                        alt={req.user?.name || "Request User"}
                        width={48}
                        height={48}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {req.user?.name || req.userEmail || "Unknown User"}
                      </div>
                       <div className="text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block mb-1">
                          Current State: {req.status === 'dispatched' ? 'Dispatched' : 'Ambulance Assigned'}
                       </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>•</span>
                         {req.ambulanceId && (
                             <span className="text-slate-600 font-medium">Ambulance: {req.ambulanceId}</span>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(req)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
              {requests.filter(r => r.status !== 'pending' && r.status !== 'completed').length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No accepted requests yet.
                  </div>
              )}

                 </>
              )}
            </div>
          </div>

          {/* Section 3: Completed Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                Completed History
              </h3>
              <div className="text-sm text-slate-500">
                {requests.filter(r => r.status === 'completed').length} Completed
              </div>
            </div>

            <div className="space-y-4">
              {isPendingEmgData ? (
                  <>
                   {[1].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm flex items-center gap-4 opacity-70">
                         <Skeleton className="w-12 h-12 rounded-full" />
                         <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                         </div>
                         <Skeleton className="h-8 w-24" />
                      </div>
                   ))}
                  </>
              ) : (
                  <>
              {requests.filter(r => r.status === 'completed').map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:shadow-md opacity-80 hover:opacity-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      <Image
                        src={req.user?.profilePicture || "/temp_user.webp"}
                        alt={req.user?.name || "Request User"}
                        width={48}
                        height={48}
                        className="object-cover rounded-full grayscale"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700">
                        {req.user?.name || req.userEmail || "Unknown User"}
                      </div>
                       <div className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1">
                          Completed
                       </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>•</span>
                         {req.ambulanceId && (
                             <span className="text-slate-500 font-medium">Ambulance: {req.ambulanceId}</span>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(req)}
                      className="text-slate-500 border-slate-200"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
               {requests.filter(r => r.status === 'completed').length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No completed requests yet.
                  </div>
              )}

                 </>
              )}
            </div>
          </div>

        </div>

        {/* Right: Quick actions and stats */}
        <aside className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold mb-2">Live Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded bg-slate-50">
                <div className="text-xs text-slate-400">Total</div>
                <div className="font-semibold">{isPendingEmgData ? <Skeleton className="h-5 w-8 inline-block" /> : requests.length}</div>
              </div>
              <div className="p-2 rounded bg-slate-50">
                <div className="text-xs text-slate-400">Pending</div>
                <div className="font-semibold">{isPendingEmgData ? <Skeleton className="h-5 w-8 inline-block" /> : pendingCount}</div>
              </div>
              <div className="p-2 rounded bg-slate-50">
                <div className="text-xs text-slate-400">Assigned</div>
                <div className="font-semibold">{isPendingEmgData ? <Skeleton className="h-5 w-8 inline-block" /> : assignedCount}</div>
              </div>
              <div className="p-2 rounded bg-slate-50">
                <div className="text-xs text-slate-400">Completed</div>
                <div className="font-semibold text-emerald-600">{isPendingEmgData ? <Skeleton className="h-5 w-8 inline-block" /> : completedCount}</div>
              </div>
               <div className="p-2 rounded bg-slate-50">
                <div className="text-xs text-slate-400">Available Ambs</div>
                <div className="font-semibold">{ambulances.length}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Accept & Assign Dialog */}
      <Dialog
        open={acceptAssignDialog.isOpen}
        onOpenChange={(isOpen) =>
             setAcceptAssignDialog((prev) => ({ ...prev, isOpen }))
        }
      >
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Accept Request & Assign Ambulance</DialogTitle>
                <DialogDescription>
                    Please select an available ambulance to assign to this request.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Ambulance</label>
                <select 
                    className="w-full p-2 border border-slate-300 rounded-md"
                    value={acceptAssignDialog.selectedAmbulanceId}
                    onChange={(e) => setAcceptAssignDialog(prev => ({ ...prev, selectedAmbulanceId: e.target.value }))}
                >
                    <option value="">-- Select Ambulance --</option>
                    {ambulances.map((amb) => (
                        <option key={amb.id} value={amb.id}>
                            {amb.id} - {amb.license_plate} ({amb.model})
                        </option>
                    ))}
                </select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setAcceptAssignDialog(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                <Button onClick={handleAcceptAssignConfirm} className="bg-emerald-600 hover:bg-emerald-700">Confirm & Assign</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <AlertDialog
          open={declineDialog.isOpen}
          onOpenChange={(isOpen) => setDeclineDialog(prev => ({ ...prev, isOpen }))}
      >
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Decline Emergency Request?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Are you sure you want to decline this request? The status will be marked as 'Cancelled' and the user will be notified. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeclineConfirm} className="bg-red-600 hover:bg-red-700 text-white">
                      Confirm Decline
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Request Details Dialog */}
      <Dialog
        open={detailsConfig.isOpen}
        onOpenChange={(isOpen) =>
          setDetailsConfig((prev) => ({ ...prev, isOpen }))
        }
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Emergency Request Details</DialogTitle>
          </DialogHeader>

          {detailsConfig.request && (
             <ManagerRequestDetails 
                request={detailsConfig.request} 
                ambulanceLoc={ambulanceLoc}
                setAmbulanceLoc={setAmbulanceLoc}
                routeCoords={routeCoords}
                fetchRoute={fetchRoute}
                confirmDecline={confirmDecline}
                openAcceptAssign={openAcceptAssign}
                setDetailsConfig={setDetailsConfig}
                client={client}
             />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Extracted Details Component for cleaner logic usage
const ManagerRequestDetails = ({ request, ambulanceLoc, setAmbulanceLoc, routeCoords, fetchRoute, confirmDecline, openAcceptAssign, setDetailsConfig, client }: any) => {
    
    // Local state for patient location (defaults to request data, updates via broadcast)
    const [patientLoc, setPatientLoc] = React.useState<{lat: number, lng: number}>({ 
        lat: request.latitude || 0, 
        lng: request.longitude || 0 
    });
    
    // Connectivity State
    // Connectivity State
    const ambulanceLastSeenRef = React.useRef<number>(Date.now());
    const patientLastSeenRef = React.useRef<number>(Date.now());
    const [isAmbulanceOnline, setIsAmbulanceOnline] = React.useState(true);
    const [isPatientOnline, setIsPatientOnline] = React.useState(true);
    
    // Heartbeat Check (Every 2s)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            // User requirement: > 5 seconds
            setIsAmbulanceOnline(now - ambulanceLastSeenRef.current < 5000); 
            setIsPatientOnline(now - patientLastSeenRef.current < 5000);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Realtime Tracking for Manager
    useEffect(() => {
        if (!request?.id) return;
        
        // Initial setup
        if (request.ambulance_lat && request.ambulance_lng) {
            setAmbulanceLoc({ lat: request.ambulance_lat, lng: request.ambulance_lng });
        }
        setPatientLoc({ lat: request.latitude, lng: request.longitude });

        const channel = client.channel(`tracking:${request.id}`)
          .on(
            "broadcast",
            { event: "ambulance-location" },
            (payload: any) => {
               if (payload.payload && payload.payload.lat && payload.payload.lng) {
                   setAmbulanceLoc({ lat: payload.payload.lat, lng: payload.payload.lng });
                   ambulanceLastSeenRef.current = Date.now();
                   setIsAmbulanceOnline(true);
               }
            }
          )
          .on(
            "broadcast",
            { event: "patient-location" },
            (payload: any) => {
                if (payload.payload && payload.payload.lat && payload.payload.lng) {
                    setPatientLoc({ lat: payload.payload.lat, lng: payload.payload.lng });
                    patientLastSeenRef.current = Date.now();
                    setIsPatientOnline(true);
                }
            }
          )
          .subscribe((status: string) => {
              if (status === 'SUBSCRIBED') {
                  channel.send({ type: 'broadcast', event: 'request-ambulance-location', payload: {} });
                  channel.send({ type: 'broadcast', event: 'request-patient-location', payload: {} });
              }
          });

        return () => {
            client.removeChannel(channel);
        };
    }, [request.id]);

    // Route Update (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (ambulanceLoc && patientLoc.lat && patientLoc.lng) {
                fetchRoute(ambulanceLoc.lat, ambulanceLoc.lng, patientLoc.lat, patientLoc.lng);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [ambulanceLoc, patientLoc]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Left Column: Map */}
              <div className="h-64 md:h-full min-h-[300px] w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                <LeafletMap
                  lat={patientLoc.lat || 6.9271}
                  lng={patientLoc.lng || 79.8612}
                  popupText={request.location || "User Location"}
                  className="w-full h-full"
                  ambulanceLat={ambulanceLoc?.lat}
                  ambulanceLng={ambulanceLoc?.lng}
                  routeCoordinates={routeCoords}
                />
                 {request.status === 'dispatched' && (
                       <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-[400]">
                           <div className={`px-2 py-1 rounded text-xs shadow font-bold backdrop-blur bg-white/90 ${isAmbulanceOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                               {isAmbulanceOnline ? '🚑 AMBULANCE LIVE' : '🚑 AMBULANCE OFFLINE'}
                           </div>
                           <div className={`px-2 py-1 rounded text-xs shadow font-bold backdrop-blur bg-white/90 ${isPatientOnline ? 'text-blue-600' : 'text-slate-400'}`}>
                               {isPatientOnline ? '👤 PATIENT LIVE' : '👤 PATIENT OFFLINE'}
                           </div>
                       </div>
                   )}
              </div>

              {/* Right Column: Details */}
              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <Image
                      src={request.user?.profilePicture || "/temp_user.webp"}
                      alt={request.user?.name || "User"}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {request.user?.name || "Unknown User"}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {request.userEmail}
                    </p>
                     <p className="text-slate-600 font-medium mt-1">
                      {request.mobileNumber || "No Mobile Number"}
                    </p>
                  </div>
                </div>

                {/* Request Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Location</label>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Lat: {request.latitude || "N/A"}, Lng: {request.longitude || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Note</label>
                    <p className="p-3 bg-amber-50 text-amber-900 rounded-md border border-amber-100 text-sm">
                      {request.note || "No additional notes provided."}
                    </p>
                  </div>

                  <div className="flex gap-4">
                     <div>
                        <label className="text-xs uppercase tracking-wide text-slate-400 font-semibold">Status</label>
                        <p className={`text-sm font-bold capitalize ${
                           request.status === 'pending' ? 'text-amber-600' :
                           request.status === 'assigned' ? 'text-emerald-600' : 
                           request.status === 'dispatched' ? 'text-blue-600' :
                           request.status === 'arrived' ? 'text-purple-600' :
                           request.status === 'completed' ? 'text-slate-600' :
                           'text-slate-600'
                        }`}>
                           {request.status}
                        </p>
                     </div>
                  </div>
                  
                  {request.ambulanceId && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
                          <p className="text-emerald-800 text-sm font-semibold">Assigned Ambulance: {request.ambulanceId}</p>
                      </div>
                  )}

                </div>

                {/* Action Buttons - Simplified */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex gap-2">
                        {request.status === "pending" && (
                            <>
                                <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => confirmDecline(request.id)}
                                >
                                    Decline
                                </Button>
                                 <Button 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                        setDetailsConfig((prev: any) => ({...prev, isOpen: false})); // Close details to open accept
                                        openAcceptAssign(request.id);
                                    }}
                                >
                                    Accept & Assign
                                </Button>
                            </>
                        )}
                         {request.status === "dispatched" && (
                            <Button className="w-full" variant="outline" onClick={()=>{
                                 window.open(`https://www.google.com/maps/dir/?api=1&origin=${ambulanceLoc?.lat},${ambulanceLoc?.lng}&destination=${request.latitude},${request.longitude}&travelmode=driving`, '_blank');
                            }}>
                                Open Live Route in Google Maps
                            </Button>
                         )}
                    </div>
                </div>
              </div>
        </div>
    )
}

export default EmergencyManagerDashboard;

