"use client";
import { noticeSchema } from "@/lib/zod-schema/notice.schama";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Bell, Plus, Trash2, AlertTriangle, Info, Clock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const ManageNoticeComponent = () => {
  const [isPending, startTransition] = useTransition();
  const [notices, setNotices] = useState<any[]>([]);
  const [isPendingNotice, startTransitionNotice] = useTransition();

  const supabaseClient = createClient();

  useEffect(() => {
    startTransitionNotice(async () => {
      const noticeData = await axios.get("/api/notice-get-api");
      if (noticeData.data.success) {
        setNotices(noticeData.data.data || []);
      } else {
        toast.error("Error fetching notices");
      }
    });

    const channel = supabaseClient
      .channel("realtime:notice")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notice" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotices((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setNotices((prev) => prev.filter((n) => n.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setNotices((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const deleteNotice = async (id: number) => {
    startTransition(async () => {
      const deletedNotice = await axios.post("/api/notice-delete-api", { id });
      if (deletedNotice.data.error) {
        toast.error("Error deleting notice");
      } else {
        toast.success("Notice deleted successfully");
      }
    });
  };

  const form = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      piority: "",
    },
  });

  const submitAction = (data: z.infer<typeof noticeSchema>) => {
    startTransition(async () => {
      const createdData = await axios.post("/api/create-notice-api", data);
      if (!createdData.data.success) {
        toast.error("Error occurred while creating notice");
      } else {
        toast.success("Notice created successfully!");
        form.reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="p-3 bg-blue-600 rounded-full flex-shrink-0">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Notice Management Dashboard
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create and manage healthcare notices for your e-healthcare platform
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Create Notice Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-fit">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                Create New Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(submitAction)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Notice Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter notice title..." className="h-11" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Notice Content</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Enter notice content..."
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="piority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                          <FormControl>
                            <SelectTrigger className="w-full h-11">
                              <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                High Priority
                              </div>
                            </SelectItem>
                            <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                Medium Priority
                              </div>
                            </SelectItem>
                            <SelectItem value="low">
                              <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                Low Priority
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Notice
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Manage Notices Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Manage Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {isPendingNotice ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-gray-600 text-sm font-medium">Loading notices...</p>
                  </div>
                ) : (
                  notices.map((notice) => (
                    <div
                      key={notice.id}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                    >
                      <div className="flex flex-col items-start gap-4">
                        <div className="w-full space-y-3">
                          {/* Title and Badge Row */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-bold text-gray-900 text-lg break-words flex-1 min-w-[150px]">
                              {notice.title}
                            </h3>
                            <div
                              className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center shrink-0 ${
                                notice.piority === "high"
                                  ? "bg-red-100 text-red-700"
                                  : notice.piority === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {notice.piority === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {notice.piority === "medium" && <Clock className="h-3 w-3 mr-1" />}
                              {notice.piority === "low" && <Info className="h-3 w-3 mr-1" />}
                              <span className="capitalize">{notice.piority}</span>
                            </div>
                          </div>

                          {/* Updated Content section: removed line-clamp and added pre-wrap */}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                            {notice.content}
                          </p>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400">
                              Created: {notice.date}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-100 flex items-center justify-center gap-2 transition-colors"
                          onClick={() => deleteNotice(notice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Notice</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                {!isPendingNotice && notices.length === 0 && (
                   <p className="text-center text-gray-500 py-10">No notices found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageNoticeComponent;