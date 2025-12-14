"use client";
import React, { use } from "react";
import ChannelVisitedPatientUpdateComponent from "@/components/doctor-components/Channel-visited-patient-update/Channel-V-P-Update";

function ChannelVisitedPatientUpdate({ params }: { params: Promise<any> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  return (
    <div>
      <ChannelVisitedPatientUpdateComponent channelId={id} />
    </div>
  );
}

export default ChannelVisitedPatientUpdate;
