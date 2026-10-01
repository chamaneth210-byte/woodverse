import {
  getStoredList,
} from "../../lib/storage";
import { registrationApplicationsStorageKey } from "./storageKeys.js";

export function getRegistrationApprovals() {
  const applications = getStoredList(registrationApplicationsStorageKey);
  return applications.map((application) => ({
    id: application.id,
    initials: application.type === "Vendor" ? "VN" : "SP",
    name: application.name || `New ${application.type} Application`,
    email: application.email || "Registration details submitted",
    type: application.type,
    requested: application.submittedAt ? new Date(application.submittedAt).toLocaleString() : "Just now",
    status: application.status || "Pending",
    documents: application.documents || [],
  }));
}
