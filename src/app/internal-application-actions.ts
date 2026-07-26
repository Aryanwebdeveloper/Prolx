"use server";

import {
  submitInternalApplication as submitInternalApplicationImpl,
  getInternalApplications as getInternalApplicationsImpl,
  getMyApplications as getMyApplicationsImpl,
  updateApplicationStatus as updateApplicationStatusImpl,
  addApplicationComment as addApplicationCommentImpl,
} from "./erp-actions";

export async function submitInternalApplication(payload: {
  type: string;
  subject: string;
  description: string;
  priority?: string;
  attachment_url?: string;
}) {
  return submitInternalApplicationImpl(payload);
}

export async function getInternalApplications(filter?: {
  userId?: string;
  type?: string;
  status?: string;
  limit?: number;
}) {
  return getInternalApplicationsImpl(filter);
}

export async function getMyApplications() {
  return getMyApplicationsImpl();
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "under_review" | "approved" | "rejected" | "on_hold",
  notes?: string
) {
  return updateApplicationStatusImpl(applicationId, status, notes);
}

export async function addApplicationComment(applicationId: string, comment: string, isInternal = false) {
  return addApplicationCommentImpl(applicationId, comment, isInternal);
}
