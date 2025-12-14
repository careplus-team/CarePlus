"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoadingUI from "@/lib/UI-helpers/loading-ui";

const supabase = createClient();

interface ChannelingItem {
  id: number;
  patientNumber: number;
  channel: {
    id: number;
    name: string;
    roomNumber: string;
    currentNumber: number;
    description: string;
    estimateWaitingTime: number;
  };
}


export default function OngoingChannelingsPage() {
  // State management for channeling data and UI states
  const [channelings, setChannelings] = useState<ChannelingItem[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch("/api/get-ongoing-channelings-api")
      .then((res) => res.json())
      .then((data) => {
        setChannelings(data);
      })
      .catch((error) => {
        console.error("Error fetching channelings:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  useEffect(() => {
    if (!channelings.length) return;

    console.log("Subscribing to realtime updates");

    const realtimeChannel = supabase
      .channel("realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "channel",
        },
        (payload) => {
          console.log("Realtime payload:", payload);

          setChannelings((prev) =>
            prev.map((item) =>
              item.channel.id === payload.new.id
                ? { ...item, channel: { ...item.channel, currentNumber: payload.new.currentNumber } }
                : item
            )
          );
        }
      )
      .subscribe((status) => console.log("Realtime status:", status));

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [channelings.length]);

  
  const getQueueStatus = (currentNumber: number, patientNumber: number): string => {
    if (patientNumber < currentNumber) return "Completed";
    if (patientNumber === currentNumber) return "Now Serving";
    return "Waiting";
  };

  

  // Loading state with professional skeleton
  if (loading) {
    return (
      <LoadingUI />
    );
  }

  // Empty state with call-to-action
  if (!channelings.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Ongoing Channelings
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have any active doctor channelings at the moment.
            Book an appointment to get started with your healthcare journey.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Book Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Ongoing Channelings
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track your position in doctor queues and get real-time updates on your appointments.
          </p>
        </div>

        {/* Channeling Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {channelings.map((item) => {
            const status = getQueueStatus(item.channel.currentNumber, item.patientNumber);
           
            const position = item.patientNumber - item.channel.currentNumber;

            return (
              <div
                key={`${item.channel.id}-${item.patientNumber}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.channel.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Room {item.channel.roomNumber}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      status === "Now Serving"
                        ? "bg-green-100 text-green-800"
                        : status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Current Number Display */}
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-600 mb-2">Currently Serving</div>
                    <div className="text-6xl font-bold text-gray-900 mb-2">
                      {item.channel.currentNumber}
                    </div>
                    <div className="text-sm text-gray-500">Patient Number</div>
                  </div>

                  {/* Patient Information Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">Your Number</div>
                      <div className="text-2xl font-bold text-gray-900">{item.patientNumber}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">Position</div>
                      <div className={`text-2xl font-bold ${
                        position <= 0 ? "text-green-600" :
                        position === 1 ? "text-orange-600" : "text-gray-900"
                      }`}>
                        {position <= 0 ? "Called" : position === 1 ? "Next" : `${position} ahead`}
                      </div>
                    </div>
                  </div>

                  {/* Queue Information */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Next Patient</span>
                      <span className="text-lg font-bold text-gray-900">
                        {item.channel.currentNumber + 1}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Estimated Wating Time</span>
                      <span className="text-lg font-bold text-gray-900">
                        {item.channel.estimateWaitingTime} mins
                      </span>
                    </div>
                  </div>

                  {/* Channel Description */}
                  {item.channel.description && (
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-600 mb-2">Description</div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {item.channel.description}
                      </p>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {status === "Waiting" && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Queue Progress</span>
                        <span>{Math.max(0, position)} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, ((item.channel.currentNumber / item.patientNumber) * 100))}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    {status === "Now Serving" && (
                      <div className="text-center">
                        <div className="text-green-600 font-semibold mb-1">It's your turn!</div>
                        <div className="text-sm text-gray-600">Please proceed to Room {item.channel.roomNumber}.</div>
                      </div>
                    )}
                    {status === "Waiting" && position === 1 && (
                      <div className="text-center">
                        <div className="text-orange-600 font-semibold mb-1">Almost your turn</div>
                        <div className="text-sm text-gray-600">Please be ready to be called to Room {item.channel.roomNumber}.</div>
                      </div>
                    )}
                   
                    {status === "Completed" && (
                      <div className="text-center">
                        <div className="text-blue-600 font-semibold mb-1">Consultation completed</div>
                        <div className="text-sm text-gray-600">Thank you for visiting us. Room {item.channel.roomNumber}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        

      </div>
    </div>
  );
}
