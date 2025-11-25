"use client";
import { createChannelSchema } from "@/lib/zod-schema/create-channel-schema";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import React, { startTransition } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { CalendarIcon, ChevronDownIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils"; // Assuming you have a utils file for tailwind merge
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import axios from "axios";
import { toast } from "sonner";

const CreateChannelComponent = () => {
  const form = useForm<z.infer<typeof createChannelSchema>>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      description: "",
      doctorName: "",
      doctorEmail: "",
      date: "",
      time: "",
      totalSlots: 1,
      state: "inactive",
      roomNumber: 1,
      estimateWaitingTime: 1,
      remainingSlots: 0,
      currentNumber: 0,
    },
  });

  const submitHandler = (data: z.infer<typeof createChannelSchema>) => {
    startTransition(async () => {
      const updatedData = {
        ...data,
        remainingSlots: data.totalSlots,
      };

      console.log("Submitting Data:", updatedData);
      const createdChannelData = await axios.post(
        "/api/create-channel-api",
        updatedData
      );
      console.log("Form Data", createdChannelData);
    });

    toast.success("Channel created successfully", {
      className: "bg-green-600 text-white",
    });
    form.reset();
  };
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
          <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Create New Channel
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure the details for the new appointment channel.
          </p>
        </div>

        <div className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitHandler)}
              className="space-y-6"
            >
              {/* Section: Basic Info */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="e.g. General Consultation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Brief description of the channel..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section: Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="Dr. John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor Email</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          placeholder="doctor@careplus.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section: Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={isPending}
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                new Date(field.value).toLocaleDateString()
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="center">
                          <Calendar
                            disabled={isPending}
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(selectedDate) => {
                              field.onChange(selectedDate?.toISOString());
                              setOpen(false);
                            }}
                            captionLayout="dropdown"
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            disabled={isPending}
                            type="time"
                            className="w-full"
                            step="1"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section: Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="totalSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Slots</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          type="number"
                          placeholder="e.g. 20"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          type="number"
                          placeholder="e.g. 101"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimateWaitingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Wait Time (mins)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          type="number"
                          placeholder="e.g. 15"
                          value={field.value === 0 ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel State</FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={isPending}
                              variant="outline"
                              className="w-full justify-between font-normal"
                            >
                              {field.value
                                ? field.value.charAt(0).toUpperCase() +
                                  field.value.slice(1)
                                : "Select state"}
                              <ChevronDownIcon className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                          <DropdownMenuLabel>Select Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <DropdownMenuRadioItem value="active">
                              Active
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="inactive">
                              Inactive
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full md:w-auto md:px-8"
                >
                  Create Channel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelComponent;
