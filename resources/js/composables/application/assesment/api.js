// src/api/assessments.js

import generalAxiosRequest from "../generalAxiosRequest";

const BASE = `https://services.logifortech.com/api/v1`;

// --- shared gateway helper ---
const postViaGateway = async (url, data = {}) => {
    const payload = { url, data: JSON.stringify(data) };
    const { json_data } = await generalAxiosRequest("curl-requests/post", payload, false);
    return json_data?.value ?? [];
};

// --- general-queries helpers ---
const readData = (collection, attr, filterArray) =>
    postViaGateway(`${BASE}/general-queries/readData`, {
        collection,
        attr,
        filter_array: JSON.stringify(filterArray ?? []),
    });

const createData = (collection, dataObj) =>
    postViaGateway(`${BASE}/general-queries/addData`, {
        collection,
        data: JSON.stringify(dataObj ?? {}),
    });

const updateData = (collection, identifier, dataObj) =>
    postViaGateway(`${BASE}/general-queries/updateData`, {
        collection,
        identifier,
        data: JSON.stringify(dataObj ?? {}),
    });

// --- utils ---
const isObjectId = (v) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

// Try to normalize mongo _id across shapes: {_id: "..."} or {_id: {$oid:"..."}}
const pickId = (doc) =>
    doc?._id?.$oid || doc?._id || doc?.id || null;

// ======================= CLASSES =======================
export const ClassesAPI = {
    // Adjust attr/value if your classes don’t have a 'status' field.
    async list() {
        // common pattern we used elsewhere; change 'status' if needed
        const rows = await readData("classes");
        return Array.isArray(rows) ? rows : [];
    },

    async studentsByClass(classId) {
        const rows = await readData("class_has_students", "classId", [String(classId)]);
        return Array.isArray(rows) ? rows : [];
    },
};

// ======================== TESTS ========================
export const TestsAPI = {
    async listByClass(classId) {
        const rows = await readData("tests", "classId", [String(classId)]);
        return Array.isArray(rows) ? rows : [];
    },

    // Create a test with embedded marks array
    async create(payload) {
        const doc = {
            testId: payload.testId,
            className: payload.className,
            classId: String(payload.classId),
            title: String(payload.title || "").trim(),
            totalMarks: Number(payload.totalMarks) || 0,
            date: payload.date ? new Date(payload.date).toISOString() : new Date().toISOString(),
            marks: [], // important: embedded marks live here
        };
        const res = await createData("tests", doc);
        return res; // caller can dig out _id/testId as returned by your backend
    },

    // Accept either a MongoDB ObjectId string or a testId (business id)
    async get(idOrTestId) {
        const attr = isObjectId(idOrTestId) ? "_id" : "testId";
        const value = String(idOrTestId);
        const rows = await readData("tests", attr, [value]);
        return Array.isArray(rows) && rows.length ? rows[0] : null;
    },

    // Since marks are embedded, just read the test and return test.marks
    async getMarks(idOrTestId) {
        const test = await this.get(idOrTestId);
        return test?.marks ?? [];
    },

    // Overwrite/Upsert the marks array inside the same test document
    // rows = [{ studentId, marks, remark? }, ...]
    async saveMarks(idOrTestId, rows) {
        // Resolve the actual Mongo _id to use as 'identifier' for updateData
        const test = await this.get(idOrTestId);
        const identifier = pickId(test);
        if (!identifier) return [];

        const cleanRows = (Array.isArray(rows) ? rows : []).map((r) => ({
            studentId: String(r.studentId),
            marks: Number(r.marks ?? 0),
            remark: (r.remark ?? "").toString(),
        }));

        const res = await updateData("tests", identifier, { marks: cleanRows });
        return res ?? [];
    },
};
