import React from "react";
import ChannelBookingComponent from "@/components/user-compoents/channel-book/channel-booking-component";

const ChannelBooking = async ({ params }: { params: Promise<any> }) => {
  // 1. Extract id from params (This is the new async method use to extract params)
  const { id } = await params;
  return <ChannelBookingComponent id={id} />;
};

export default ChannelBooking;
