"use client";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

const AmbulanceOperatorComponent = () => {
  const [addEmail, setAddEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [noOfAmbulanceOperators, setNoOfAmbulanceOperators] = useState(0);
  //set pending status of number of users and ambulance operators
  const [isPending, startTransition] = useTransition();
  //set pending status of API data fetching process
  const [isPendingProcess, startTransitionProcess] = useTransition();
  //diable/enable remove ambulance operator input filed and button when add ambulance operator input field has value and vice versa
  const [removeDisabled, setRemoveDisabled] = useState(false);
  //disable/enable add ambulance operator input filed and button when remove ambulance operator input field has value and vice versa
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
    //make API call to promote user to ambulance operator
    startTransitionProcess(async () => {
      const promotedAmbulanceOperator = await axios.post(
        "/api/ambulance-operator-registration-api",
        { email: addEmail }
      );
      if (promotedAmbulanceOperator.data.success) {
        setShowSuccess(true);
      } else if (!promotedAmbulanceOperator.data.success) {
        toast.error(promotedAmbulanceOperator.data.message);
      }
    });
  };
  //handle close success modal for promote ambulance operator
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
    //make API call to remove ambulance operator role from user
    startTransitionProcess(async () => {
      const removeAmbulanceOperatorData = await axios.post(
        "/api/ambulance-operator-remove-api",
        {
          email: removeEmail,
        }
      );
      if (removeAmbulanceOperatorData.data.success) {
        setShowRemoveSuccess(true);
      } else if (!removeAmbulanceOperatorData.data.success) {
        toast.error(removeAmbulanceOperatorData.data.message);
      }
    });
  };
  //handle close success modal for remove ambulance operator
  const handleCloseRemoveSuccess = () => {
    setShowRemoveSuccess(false);

    setRemoveEmail("");
    setRemoveDisabled(false);
    setAddDisabled(false);
  };
  // Fetch initial counts of  emergency managers (This update also execute when add / remove emergency manager process completed)
  useEffect(() => {
    startTransition(async () => {
      const count = await axios.get("/api/user-count-api");
      console.log(count);
      setNoOfAmbulanceOperators(count.data.noOfAmbulanceOperators || 0);
    });
  }, [showRemoveSuccess, showSuccess, showRemoveSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg
              width="64px"
              height="64px"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Siren Light */}
              <path d="M30 6H40V12H30V6Z" fill="#FF3B30" />

              {/* Ambulance Body Main Shape */}
              <path
                d="M2 20H24V48H2V20Z"
                fill="#F0F0F0"
                stroke="#2C3E50"
                strokeWidth="2"
              />
              <path
                d="M24 20H44L54 32V48H24V20Z"
                fill="#F0F0F0"
                stroke="#2C3E50"
                strokeWidth="2"
              />

              {/* Red Stripe */}
              <rect x="2" y="36" width="52" height="6" fill="#FF3B30" />

              {/* Medical Cross */}
              <rect x="8" y="24" width="10" height="4" rx="1" fill="#FF3B30" />
              <rect x="11" y="21" width="4" height="10" rx="1" fill="#FF3B30" />

              {/* Window & Operator Area */}
              <path d="M28 22H42L48 32H28V22Z" fill="#A4B0BE" />

              {/* Operator Silhouette */}
              <circle cx="38" cy="29" r="4" fill="#2C3E50" />

              {/* Headset - This caused your error */}
              <path
                d="M34 29C34 26 36 24 38 24C40 24 42 26 42 29"
                stroke="#E74C3C"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Mic */}
              <path d="M42 29H44" stroke="#E74C3C" strokeWidth="1.5" />

              {/* Wheels */}
              <circle
                cx="14"
                cy="48"
                r="6"
                fill="#2C3E50"
                stroke="#F0F0F0"
                strokeWidth="2"
              />
              <circle
                cx="44"
                cy="48"
                r="6"
                fill="#2C3E50"
                stroke="#F0F0F0"
                strokeWidth="2"
              />
              <circle cx="14" cy="48" r="2" fill="#7F8C8D" />
              <circle cx="44" cy="48" r="2" fill="#7F8C8D" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ambulance Operator Registration Portal
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Carefully manage ambulance operator accounts to ensure Respond to
            emergency calls promptly and ensure safe, reliable patient
            transport.
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
                Please wait while we update ambulance operator privileges. This
                may take a few seconds.
              </div>
            </div>
          ) : (
            <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Promote User to Ambulance Operator
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter the user&#39;s email to grant ambulance operator
                    privileges. This action requires careful consideration.
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
                        responsibility and understanding of system operations.
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
                  Review Ambulance Operator Promotion
                </Button>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Ambulance Operator Email Address
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
                  Remove Ambulance Operator Privileges
                </Button>
              </div>
            </Card>
          )}
          {/* Information Panel */}
          <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Ambulance Operator Responsibilities
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Emergency Response
                      </h4>
                      <p className="text-xs text-gray-600">
                        Respond promptly to incoming emergency requests and
                        ensure timely patient transport.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Ambulance State Management
                      </h4>
                      <p className="text-xs text-gray-600">
                        Update ambulance availability and operational status in
                        real time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Patient Tracking
                      </h4>
                      <p className="text-xs text-gray-600">
                        Monitor patient live location during transit to ensure
                        safe and efficient care
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Request Details:
                      </h4>
                      <p className="text-xs text-gray-600">
                        Review and manage emergency request information for
                        accurate coordination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Current Ambulance Operator Statistics
                </h4>
                <div className="flex items-center justify-center">
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
                        noOfAmbulanceOperators
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      Active Ambulance Operators
                    </div>
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
                  <li>• Provide ambulance operator training if needed</li>
                  <li>• Monitor initial ambulance operator activities</li>
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
                Confirm Ambulance Operator Promotion
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Granting ambulance operator access will give this user full
                control over the system, including:
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-1">
                <li>• Respond to Emergency Requests</li>
                <li>• Update Ambulance State</li>
                <li>• Track Patient Location</li>
                <li>• Review Request Details</li>
              </ul>
              <p className="text-gray-600 text-sm">
                This action cannot be undone. Are you sure you want to proceed?
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
                Confirm Ambulance Operator Removal
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Removing ambulance operator access will revoke this user's
                control over the system, including:
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-1">
                <li>• Respond to Emergency Requests</li>
                <li>• Update Ambulance State</li>
                <li>• Track Patient Location</li>
                <li>• Review Request Details</li>
              </ul>
              <p className="text-gray-600 text-sm">
                This action cannot be undone. Are you sure you want to proceed?
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
                Ambulance Operator Promotion Successful
              </h3>
              <p className="text-gray-600">
                User{" "}
                <span className="font-medium text-gray-900">{addEmail}</span>{" "}
                has been successfully promoted to ambulance operator.
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
                Ambulance Operator Removal Successful
              </h3>
              <p className="text-gray-600">
                User{" "}
                <span className="font-medium text-gray-900">{removeEmail}</span>{" "}
                has been successfully removed from ambulance operator.
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
  );
};

export default AmbulanceOperatorComponent;
