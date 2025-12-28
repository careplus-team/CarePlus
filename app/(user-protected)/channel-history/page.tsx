"use client";
import React from "react";
import ChannelHistoryComponent from "@/components/user-compoents/channel-history/channel-history-component";

export default function ChannelHistoryPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="absolute top-4 left-4">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 font-bold text-xl sm:text-2xl">
          <a href="/home">CarePlus</a>
        </p>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 mt-14">
        My Channeling History
      </h1>
      <ChannelHistoryComponent />
    </div>
  );
}
