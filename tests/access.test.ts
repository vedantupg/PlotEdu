import { describe, expect, it } from "vitest";
import { decideNoteAccess, type ViewerContext } from "@/lib/access";

const B = "batch-nov";
const viewer = (over: Partial<ViewerContext> = {}): ViewerContext => ({
  signedIn: true,
  role: "student",
  enrollments: new Map(),
  staffBatchIds: new Set(),
  requirePayment: new Map([[B, true]]),
  ...over,
});
const paid = { access: "batch", batchIds: [B] } as const;

describe("decideNoteAccess", () => {
  it("public is open to signed-out visitors", () => {
    expect(decideNoteAccess({ access: "public", batchIds: [] }, viewer({ signedIn: false, role: null }))).toEqual({
      allowed: true,
    });
  });
  it("members needs sign-in", () => {
    expect(decideNoteAccess({ access: "members", batchIds: [] }, viewer({ signedIn: false, role: null }))).toEqual({
      allowed: false,
      reason: "sign_in",
    });
  });
  it("batch note: not enrolled -> enrol", () => {
    expect(decideNoteAccess(paid, viewer())).toEqual({ allowed: false, reason: "enrol" });
  });
  it("batch note: applied -> pending", () => {
    const enrollments = new Map([[B, { status: "applied", paymentStatus: "unpaid" }]] as const);
    expect(decideNoteAccess(paid, viewer({ enrollments }))).toEqual({ allowed: false, reason: "pending" });
  });
  it("batch note: approved but unpaid -> payment", () => {
    const enrollments = new Map([[B, { status: "approved", paymentStatus: "unpaid" }]] as const);
    expect(decideNoteAccess(paid, viewer({ enrollments }))).toEqual({ allowed: false, reason: "payment" });
  });
  it("batch note: approved and waived -> allowed", () => {
    const enrollments = new Map([[B, { status: "approved", paymentStatus: "waived" }]] as const);
    expect(decideNoteAccess(paid, viewer({ enrollments }))).toEqual({ allowed: true });
  });
  it("batch note: payment rule off -> approved is enough", () => {
    const enrollments = new Map([[B, { status: "approved", paymentStatus: "unpaid" }]] as const);
    expect(decideNoteAccess(paid, viewer({ enrollments, requirePayment: new Map([[B, false]]) }))).toEqual({
      allowed: true,
    });
  });
  it("batch note: assigned professor -> allowed", () => {
    expect(decideNoteAccess(paid, viewer({ role: "professor", staffBatchIds: new Set([B]) }))).toEqual({
      allowed: true,
    });
  });
  it("staff note blocks students", () => {
    expect(decideNoteAccess({ access: "staff", batchIds: [] }, viewer())).toEqual({
      allowed: false,
      reason: "staff_only",
    });
  });
  it("admin sees everything", () => {
    expect(decideNoteAccess({ access: "staff", batchIds: [] }, viewer({ role: "admin" }))).toEqual({ allowed: true });
  });
});
