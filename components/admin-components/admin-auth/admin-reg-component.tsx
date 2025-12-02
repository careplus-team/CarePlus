"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Card } from "../../ui/card";
import axios from "axios";
import { toast } from "sonner";
import AdminSecurity from "@/lib/security-walls/admin-security";
import { useRouter } from "next/navigation";

const AdminReg = () => {
  const [addEmail, setAddEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [noOfUsers, setNoOfUsers] = useState(0);
  const [noOfAdmins, setNoOfAdmins] = useState(0);
  //set pending status of number of users and admins
  const [isPending, startTransition] = useTransition();
  //set pending status of API data fetching process
  const [isPendingProcess, startTransitionProcess] = useTransition();
  //diable/enable remove admin input filed and button when add admin input field has value and vice versa
  const [removeDisabled, setRemoveDisabled] = useState(false);
  //disable/enable add admin input filed and button when remove admin input field has value and vice versa
  const [addDisabled, setAddDisabled] = useState(false);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [showRemoveSuccess, setShowRemoveSuccess] = useState(false);
  const router = useRouter();

  // Handle promote button click
  const handlePromote = () => {
    if (addEmail.trim()) {
      setShowWarning(true);
    }
  };
  // Handle confirm button click in the warning modal
  const handleConfirm = () => {
    setShowWarning(false);
    //make API call to promote user to admin
    startTransitionProcess(async () => {
      const promotedAdminData = await axios.post(
        "/api/admin-registration-api",
        { email: addEmail }
      );
      if (promotedAdminData.data.success) {
        setShowSuccess(true);
      } else if (!promotedAdminData.data.success) {
        toast.error(promotedAdminData.data.message);
      }
    });
  };
  //handle close success modal for promote admin
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setAddEmail("");
    setRemoveDisabled(false);
    setAddDisabled(false);
  };
  // Handle remove button click
  const handleRemove = () => {
    if (removeEmail.trim()) {
      setShowRemoveWarning(true);
    }
  };
  // Handle confirm button click in the warning modal
  const handleRemoveConfirm = () => {
    setShowRemoveWarning(false);
    //make API call to remove admin role from user
    startTransitionProcess(async () => {
      const removeAdminData = await axios.post("/api/admin-remove-api", {
        email: removeEmail,
      });
      if (removeAdminData.data.success) {
        setShowRemoveSuccess(true);
      } else if (!removeAdminData.data.success) {
        toast.error(removeAdminData.data.message);
      }
    });
  };
  //handle close success modal for remove admin
  const handleCloseRemoveSuccess = () => {
    setShowRemoveSuccess(false);
    window.location.reload();
    setRemoveEmail("");
    setRemoveDisabled(false);
    setAddDisabled(false);
  };
  // Fetch initial counts of users and admins (This update also execute when add / remove admin process completed)
  useEffect(() => {
    startTransition(async () => {
      const count = await axios.get("/api/user-count-api");
      console.log(count);
      setNoOfUsers(count.data.noOfUsers || 0);
      setNoOfAdmins(count.data.noOfAdmins || 0);
    });
  }, [showRemoveSuccess, showSuccess]);

  return (
    <AdminSecurity>
      {(adminDetails: any) => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Management Portal
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Carefully manage administrative access to ensure system security
                and proper governance. Admin privileges grant extensive control
                over the CarePlus platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Promotion Form */}
              {isPendingProcess ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg
                    className="animate-spin h-10 w-10 text-indigo-600 mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <div className="text-lg font-semibold text-indigo-700 mb-1">
                    Processing Request…
                  </div>
                  <div className="text-sm text-gray-500 text-center max-w-xs">
                    Please wait while we update admin privileges. This may take
                    a few seconds.
                  </div>
                </div>
              ) : (
                <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Promote User to Admin
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Enter the user&#39;s email to grant admin privileges.
                        This action requires careful consideration.
                      </p>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-amber-800 mb-1">
                            Important Notice
                          </h4>
                          <p className="text-xs text-amber-700">
                            Only promote trusted users who have demonstrated
                            responsibility and understanding of system
                            operations. Admin access cannot be easily revoked
                            and requires database intervention.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        User Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        disabled={addDisabled}
                        value={addEmail}
                        onChange={(e) => {
                          setAddEmail(e.target.value);
                          if (e.target.value) {
                            setRemoveDisabled(true);
                          } else {
                            setRemoveDisabled(false);
                          }
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Enter the exact email address of the user to be promoted
                      </p>
                    </div>

                    <Button
                      onClick={handlePromote}
                      disabled={!addEmail.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Review Admin Promotion
                    </Button>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Admin Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={removeEmail}
                        disabled={removeDisabled}
                        onChange={(e) => {
                          setRemoveEmail(e.target.value);
                          if (e.target.value) {
                            setAddDisabled(true);
                          } else {
                            setAddDisabled(false);
                          }
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Enter the exact email address of the user to be removed
                      </p>
                    </div>
                    <Button
                      onClick={handleRemove}
                      disabled={!removeEmail.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove Admin
                    </Button>
                  </div>
                </Card>
              )}
              {/* Information Panel */}
              <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Admin Responsibilities
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            System Governance
                          </h4>
                          <p className="text-xs text-gray-600">
                            Oversee platform operations and maintain system
                            integrity
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            User Management
                          </h4>
                          <p className="text-xs text-gray-600">
                            Manage user accounts, permissions, and access
                            controls
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Content Oversight
                          </h4>
                          <p className="text-xs text-gray-600">
                            Monitor reports, channelings, and emergency services
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Communication
                          </h4>
                          <p className="text-xs text-gray-600">
                            Update notices and maintain real-time status
                            information
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Current Admin Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {isPending ? (
                            <svg
                              className="animate-spin h-6 w-6 text-indigo-600 mx-auto"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                          ) : (
                            noOfAdmins
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          Active Admins
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {isPending ? (
                            <svg
                              className="animate-spin h-6 w-6 text-indigo-600 mx-auto"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                          ) : (
                            noOfUsers
                          )}
                        </div>
                        <div className="text-xs text-gray-600">Total Users</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Best Practices
                    </h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Verify user identity before promotion</li>
                      <li>• Document the promotion reason</li>
                      <li>• Provide admin training if needed</li>
                      <li>• Monitor initial admin activities</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Warning Modal */}
          {showWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Confirm Admin Promotion
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Granting admin access will give this user full control over
                    the system, including:
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• Add new admins</li>
                    <li>• Upload reports and manage them</li>
                    <li>• Manage channelings</li>
                    <li>• Manage emergency services</li>
                    <li>• Manage user accounts (suspend or unsuspend)</li>
                    <li>• Update realtime status</li>
                    <li>• Manage notice board</li>
                  </ul>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone. Are you sure you want to
                    proceed?
                  </p>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setShowWarning(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm Promotion
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Remove Warning Modal */}
          {showRemoveWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Confirm Admin Removal
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Removing admin access will revoke this user's control over
                    the system, including:
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• Add new admins</li>
                    <li>• Upload reports and manage them</li>
                    <li>• Manage channelings</li>
                    <li>• Manage emergency services</li>
                    <li>• Manage user accounts (suspend or unsuspend)</li>
                    <li>• Update realtime status</li>
                    <li>• Manage notice board</li>
                  </ul>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone. Are you sure you want to
                    proceed?
                  </p>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => setShowRemoveWarning(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRemoveConfirm}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm Removal
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Admin Promotion Successful
                  </h3>
                  <p className="text-gray-600">
                    User{" "}
                    <span className="font-medium text-gray-900">
                      {addEmail}
                    </span>{" "}
                    has been successfully promoted to admin.
                  </p>
                  <Button
                    onClick={handleCloseSuccess}
                    className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Remove Success Modal */}
          {showRemoveSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Admin Removal Successful
                  </h3>
                  <p className="text-gray-600">
                    User{" "}
                    <span className="font-medium text-gray-900">
                      {removeEmail}
                    </span>{" "}
                    has been successfully removed from admin.
                  </p>
                  <Button
                    onClick={handleCloseRemoveSuccess}
                    className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </AdminSecurity>
  );
};

export default AdminReg;
