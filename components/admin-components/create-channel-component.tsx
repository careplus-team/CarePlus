"use client";
import { createChannelSchema } from "@/lib/zod-schema/create-channel-schema";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import React, { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { z } from "zod";
import Image from "next/image";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  CalendarIcon,
  ChevronDown,
  ChevronDownIcon,
  Clock,
  Stethoscope,
} from "lucide-react";
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
import { spec } from "node:test/reporters";
import { profile } from "console";

const CreateChannelComponent = () => {
  const router = useRouter();
  const InputGroup = ({
    label,
    children,
    icon: Icon,
  }: {
    label: string;
    children: React.ReactNode;
    icon: any;
  }) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-emerald-500" />}
        {label}
      </label>
      {children}
    </div>
  );
  const [isPending, startTransition] = useTransition();
  const [doctorList, setDoctorList] = React.useState<any[]>([]);

  const fetchDoctorList = () => {
    startTransition(async () => {
      const response = await axios.post("/api/doctor-list-get-api", {
        command: "",
      });
      if (response.data.success) {
        setDoctorList(response.data.data);
      } else {
        toast.error("Failed to fetch doctor list: " + response.data.message);
      }
      console.log("Doctor List:", response.data);
    });
  };

  React.useEffect(() => {
    fetchDoctorList();
  }, []);

  const form = useForm<z.infer<typeof createChannelSchema>>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      description: "",

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
      if (createdChannelData.data.success === false) {
        toast.error("Error creating channel: " + createdChannelData.data.error);
        return;
      }
      console.log("Form Data", createdChannelData);
      toast.success("Channel created successfully", {
        className: "bg-green-600 text-white",
      });
      // Redirect to active sessions so the admin can see the channel immediately
      try {
        router.push("/admin/active-sessions");
      } catch (err) {
        console.warn("Failed to navigate to active sessions", err);
      }
    });

    form.reset();
  };
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50/50 p-4">
      <div className=" absolute top-4 left-4 ">
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500  to-green-500 font-bold  text-2xl">
          <a href="/">CarePlus</a>
        </p>
      </div>
      <div className="w-full mt-10 max-w-3xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  name="doctorEmail"
                  render={({ field }) => (
                    <InputGroup label="Select Doctor" icon={Stethoscope}>
                      <div className="relative group">
                        <select
                          className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-3 pr-10 transition-all outline-none cursor-pointer"
                          {...field}
                        >
                          <option value="" disabled>
                            Choose a OPD Doctor...
                          </option>
                          {doctorList.map((doc) => (
                            <option key={doc.email} value={doc.email}>
                              {doc.name} — {doc.specialization}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </InputGroup>
                  )}
                />
                {/* Doctor Card Preview */}
                <div
                  className={`p-4 rounded-xl border  border-slate-100 bg-white/50 transition-all duration-300 ${
                    form.watch("doctorEmail")
                      ? "opacity-100 translate-y-0"
                      : "opacity-50 grayscale translate-y-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                      <Image
                        className="rounded-full"
                        alt="Doctor Default Avatar"
                        width={100}
                        height={100}
                        src={
                          doctorList.find(
                            (d) => d.email === form.watch("doctorEmail")
                          )?.profilePicture || "/doctor-default-avatar.png"
                        }
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {form.watch("doctorEmail")
                          ? doctorList.find(
                              (d) => d.email === form.watch("doctorEmail")
                            )?.name
                          : "No Doctor Selected"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {form.watch("doctorEmail")
                          ? doctorList.find(
                              (d) => d.email === form.watch("doctorEmail")
                            )?.specialization
                          : "Please select a doctor"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <InputGroup label="Date" icon={CalendarIcon}>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                disabled={isPending}
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  new Date(field.value).toLocaleDateString()
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 text-slate-500 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent align="center" className="p-0">
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
                              className="rounded-md border shadow"
                              captionLayout="dropdown"
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </InputGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <InputGroup label="Time" icon={Clock}>
                        <FormControl>
                          <div className="relative">
                            <Input
                              disabled={isPending}
                              type="time"
                              className="w-full bg-slate-50 border-slate-200 text-slate-700 [color-scheme:light] hover:bg-white focus:bg-white transition-colors"
                              step="1"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </InputGroup>
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
