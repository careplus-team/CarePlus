"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";

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

import { Bell, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const ManageHealthTipsComponent = () => {
  const [isPending, startTransition] = useTransition();

  const [tips, setTips] = useState<any[]>([]);
  const [isPendingTips, startTransitionTips] = useTransition();

  const supabaseClient = createClient();

  useEffect(() => {
    // 1. Fetch initial tips

    startTransitionTips(async () => {
      const tipsData = await axios.get("/api/health-tip-get-api");
      if (tipsData.data.success) {
        setTips(tipsData.data.data || []);
      } else {
        toast.error("Error fetching tips");
        return;
      }
    });

    // 2. Subscribe for realtime updates
    const channel = supabaseClient
      .channel("realtime:notice")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "healthtip" },
        (payload) => {
          console.log("Realtime update:", payload);

          if (payload.eventType === "INSERT") {
            setTips((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setTips((prev) => prev.filter((n) => n.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setTips((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          }
        }
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const deleteTip = async (id: number) => {
    startTransition(async () => {
      const deletedTip = await axios.post("/api/health-tip-delete-api", { id });
      if (deletedTip.data.error) {
        toast.error("Error deleting health tip");
        return;
      } else {
        toast.success("Health tip deleted successfully");
      }
    });
  };

  const form = useForm({
    defaultValues: {
      content: "",
    },
  });

  const submitAction = (data: any) => {
    console.log(data);
    if (data.content.trim() === "") {
      toast.error("Health tip content cannot be empty");
      return;
    }
    startTransition(async () => {
      const createdData = await axios.post("/api/create-healthtip-api", data);
      if (!createdData.data.success) {
        toast.error("Error occurred while creating health tip");
        return;
      } else {
        toast.success("Health tip created successfully!");
      }

      form.reset();
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
              Health Tips Management Dashboard
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create and manage healthcare tips for your e-healthcare platform
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Create Notice Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                Create New Health Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(submitAction)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Health Tip
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter health tip "
                            className="h-11"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
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
                    Create Health Tip
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Manage Notices Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Manage Health Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Sample Notice Cards */}
                {isPendingTips ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-gray-600 text-sm font-medium">
                      Loading health tips...
                    </p>
                  </div>
                ) : (
                  tips.map((tip, index) => (
                    <div
                      key={`tip-${tip.id || index}`}
                      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold w-32 text-gray-900">
                              {tip.content}
                            </h3>
                          </div>

                          <p className="text-xs text-gray-500">
                            Created: {tip.date}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={() => deleteTip(tip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageHealthTipsComponent;
